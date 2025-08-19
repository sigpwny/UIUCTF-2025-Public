import { NextRequest } from 'next/server'
import { LangChainAdapter } from 'ai'
import { createReadableStreamFromGenerator, MCPAgent, MCPClient, streamEventsToAISDK, StreamEvent } from 'mcp-use'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatBedrockConverse } from '@langchain/aws'
import { AzureChatOpenAI } from "@langchain/openai"
import { makePrompt, PREDEFINED_PROMPTS, SYSTEM_PROMPT } from '@/app/story'
import { DynamicStructuredTool } from '@langchain/core/tools'

type LLMProvider = 'bedrock' | 'claude' | 'azure';
const SELECTED_PROVIDER: LLMProvider = 'azure';

function getLLM() {
  switch (SELECTED_PROVIDER) {
    case 'bedrock':
      return new ChatBedrockConverse({
        region: process.env.BEDROCK_AWS_REGION ?? "us-east-1",
        temperature: 0.0,
        credentials: {
          secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY ?? "",
          accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID ?? "",
        },
      });

    case 'claude':
      return new ChatAnthropic({
        maxTokens: 1000,
        model: "anthropic.claude-3-7-sonnet-20250219-v1:0",
        anthropicApiKey: process.env.ANTHROPIC_API_KEY
      });

    case 'azure':
      return new AzureChatOpenAI({
        azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
        azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
        azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
        azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
        azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
        model: process.env.AZURE_OPENAI_MODEL_NAME,
        maxTokens: 1000,
      });

    default:
      throw new Error(`Unsupported LLM provider: ${SELECTED_PROVIDER}`);
  }
}

const BUILT_IN_MCP_SERVER = './built-in-mcp-server/stdio-server.js'

async function* debugStream(stream: AsyncGenerator<StreamEvent, void, void>): AsyncGenerator<StreamEvent, void, void> {
  for await (const event of stream) {
    yield event;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { mcpServer, promptIndex } = await request.json()

    if (!mcpServer || promptIndex === undefined) {
      return new Response(JSON.stringify({ error: 'Missing mcpServer or promptIndex' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (promptIndex < 0 || promptIndex >= PREDEFINED_PROMPTS.length) {
      return new Response(JSON.stringify({ error: 'Invalid prompt index' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const selectedPrompt = makePrompt(promptIndex)
    const config = { systemPrompt: SYSTEM_PROMPT }
    const client = new MCPClient(config)

    client.addServer('builtInServer', {
      command: 'node',
      args: [BUILT_IN_MCP_SERVER]
    })

    try {
      const serverUrl = new URL(mcpServer)
      if (['http:', 'https:'].includes(serverUrl.protocol)) {
        client.addServer('userServer', {
          url: `${mcpServer}/sse`
        })
      }
    } catch (error) {
    }

    const llm = getLLM()
    const agent = new MCPAgent({ llm: llm as any, client, maxSteps: 5 })

    await agent.initialize()


    for (const tool of (agent as unknown as { tools: DynamicStructuredTool[] }).tools) {
      if (!sanityCheckTool(tool)) {
        return new Response(JSON.stringify({ error: `Tool ${tool.name} not valid` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }


    const streamEvents = agent.streamEvents(selectedPrompt)
    const aiSDKStream = streamEventsToAISDK(debugStream(streamEvents))
    const readableStream = createReadableStreamFromGenerator(aiSDKStream)

    return LangChainAdapter.toDataStreamResponse(readableStream)

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

function sanityCheckTool(tool: DynamicStructuredTool) {
  if (tool.name.length > 50) {
    return false
  }
  if (tool.description.length > 150) {
    return false
  }

  return true
}
