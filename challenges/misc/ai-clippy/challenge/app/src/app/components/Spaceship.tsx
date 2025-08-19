'use client'

import { useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Mesh } from 'three'

export default function Spaceship(props: {screen1: React.ReactNode, screen2: React.ReactNode}) {
  const meshRef = useRef<Mesh>(null!)
  const gltf = useLoader(GLTFLoader, '/spaceship.glb')
  
  return (
    <primitive
      ref={meshRef}
      object={gltf.scene} 
      scale={[1, 1, 1]}
      position={[0, 0, 0]}
	    rotation={[0, 3 * Math.PI / 2, 0]}
    >
      <Html scale={0.14} rotation={[0, Math.PI / 2, 0]} position={[-1.2, 1.5, 1.32]} transform occlude>
        {props.screen1}
      </Html>
      <Html scale={0.14} rotation={[0, Math.PI / 2, 0]} position={[-1.2, 1.5, -1.32]} transform occlude> 
        {props.screen2}
      </Html>
    </primitive>
  )
}
