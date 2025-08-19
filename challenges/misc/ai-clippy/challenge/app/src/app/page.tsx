'use client'

import { useState, Suspense } from 'react'
import { useCompletion } from 'ai/react'
import { Canvas, useThree, useLoader, useFrame } from '@react-three/fiber'
// @ts-ignore
import { OrbitControls, Environment, Html } from '@react-three/drei'
import { TextureLoader } from 'three'
import { PREDEFINED_PROMPTS } from './story'
import Spaceship from './components/Spaceship'

function Background() {
  const { scene } = useThree()
  const texture = useLoader(TextureLoader, './background.jpg')
  
  scene.background = texture
  
  return null
}

// @ts-ignore
function CameraInfo() {
  const { camera } = useThree()
  const [cameraData, setCameraData] = useState({ position: [0, 0, 0], rotation: [0, 0, 0] })

  useFrame(() => {
    setCameraData({
      position: [
        Math.round(camera.position.x * 100) / 100,
        Math.round(camera.position.y * 100) / 100,
        Math.round(camera.position.z * 100) / 100
      ],
      rotation: [
        Math.round(camera.rotation.x * 100) / 100,
        Math.round(camera.rotation.y * 100) / 100,
        Math.round(camera.rotation.z * 100) / 100
      ]
    })
  })

  return (
    <Html
      position={[-4, 3, 0]}
      style={{
        pointerEvents: 'none',
        userSelect: 'none'
      }}
    >
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#00ff00',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        border: '1px solid #00ff00'
      }}>
        <div>Camera Position:</div>
        <div>X: {cameraData.position[0]}</div>
        <div>Y: {cameraData.position[1]}</div>
        <div>Z: {cameraData.position[2]}</div>
        <div style={{ marginTop: '10px' }}>Camera Rotation:</div>
        <div>X: {cameraData.rotation[0]}</div>
        <div>Y: {cameraData.rotation[1]}</div>
        <div>Z: {cameraData.rotation[2]}</div>
      </div>
    </Html>
  )
}

interface Screen1Props {
  mcpServer: string
  setMcpServer: (value: string) => void
  selectedPrompt: number | null
  setSelectedPrompt: (value: number) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}

interface Screen2Props {
  completion: string
  error: Error | undefined
}

export default function Home() {

  const [mcpServer, setMcpServer] = useState("http://insert-your-datacard-url-here/")
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null)

  const { completion, complete, isLoading, error } = useCompletion({
    api: '/api/prompt'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mcpServer || selectedPrompt === null) {
      alert('Please enter an MCP server URL and select a prompt')
      return
    }

    await complete("", {
      body: {
        mcpServer,
        promptIndex: selectedPrompt,
      }
    })
  }

  return (
    <div className="h-screen w-screen">
      <Canvas camera={{ position: [0.65, 2.48, 6.65], rotation: [-0.19,0.1,0.02], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Background />
          {/* <CameraInfo /> */}
          <Spaceship 
            screen1={
              <Screen1 
                mcpServer={mcpServer}
                setMcpServer={setMcpServer}
                selectedPrompt={selectedPrompt}
                setSelectedPrompt={setSelectedPrompt}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            } 
            screen2={
              <Screen2 
                completion={completion}
                error={error}
              />
            } 
          />
          <Environment preset="night" />
        </Suspense>
         <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} /> 
      </Canvas>
    </div>
  )
}



function Screen2({ completion, error }: Screen2Props) {
  return (
    <div className="terminal-screen">
      {error && (
        <div className="terminal-error">
          <div className="terminal-error-header">
            ERROR LOG
          </div>
          <p className="text-red-300 mt-2">[ERROR] {error.message}</p>
        </div>
      )}

      {completion && (
        <div className="terminal-success">
          <div className="terminal-success-header">
            SHIP COMPUTER
          </div>
          <div className="mt-2">
            <div className="terminal-content">
              {completion}
            </div>
          </div>
        </div>
      )}    
    </div>
  )
}


function Screen1({ mcpServer, setMcpServer, selectedPrompt, setSelectedPrompt, handleSubmit, isLoading }: Screen1Props) {
  return (
    <div className="terminal-screen">
      <form onSubmit={handleSubmit} className="terminal-container space-y-4 max-w-2xl">
        <div className="terminal-section">
          <div className="text-center mb-2">
            <div className="terminal-header">
              SPACE STATION TERMINAL
            </div>
          </div>
          <p className="text-green-300 mb-1">[SCAN] You find a space station Terminal that seems abandoned.</p>
          <p className="text-green-300 mb-2">[INFO] It has an encrypted datacard, and an empty slot. </p>
          <label htmlFor="mcpServer" className="block text-green-400 mb-1">
            {"> DATACARD TOOL URL:"}
          </label>
          <input
            type="url"
            id="mcpServer"
            value={mcpServer}
            onChange={(e) => setMcpServer(e.target.value)}
            placeholder="https://your-mcp-server.com"
            className="terminal-input"
            required
          />
        </div>

        <div className="terminal-section">
          <label className="block text-green-400 mb-2">
            {"> SELECT COMMAND PROMPT:"}
          </label>
          <div className="space-y-1">
            {PREDEFINED_PROMPTS.map((prompt) => (
              <label key={prompt.id} className="terminal-option">
                <input
                  type="radio"
                  name="prompt"
                  value={prompt.id}
                  checked={selectedPrompt === prompt.id}
                  onChange={() => setSelectedPrompt(prompt.id)}
                  className="terminal-radio"
                />
                <div className="flex-1">
                  <div className="text-green-400 font-mono">
                    [{prompt.id.toString().padStart(2, '0')}] {prompt.title}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="terminal-button"
        >
          {isLoading ? '[PROCESSING...]' : '[EXECUTE COMMAND]'}
        </button>
      </form>
    </div>
  )
}
