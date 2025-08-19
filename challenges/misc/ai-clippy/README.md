users provide a MCP server as a URL, laterally extracting flag from a server

status: initial components are sketched out, but not yet polished
- DONE frontend webapp works
- DONE `hardcoded_mvp_server` works
- DONE write a solution mvp server
- DONE make sure it returns the flag out
- DONE azure deployment

running it: `npm run dev`

needs `azure api key` in `challenge/app/.env.local`

[discord conversation in this thread](https://discord.com/channels/485104508175646751/1388656017734111242/1396778923466952816)

[google doc with sketch](https://docs.google.com/document/d/1ONc4dRf4KLGlqW8fQurhzxvpbVHaTbXTnN6ltNfKZGw/edit?tab=t.0)

---

### prompt

Create an application using the vercel ai sdk.

The application should be a single page, there should be a form field to input a http mcp server and a way to select from a list of predefined prompts.

Upon submission, there should be an enpoint that takes the prompt (just the index, the prompt should be in the backend for security) and the mcp server and do a prompt to the llm with the mcp server that the user specified as well as one that is hardcoded on the server.

It should use antrhopic for the LLM


ok now create two mcp servers:

1. stdio server, one tool called: getEntryCode, that retuns the following json: {
    destination: "uiuctf{blahblah}"
}

