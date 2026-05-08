'use client';

import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody, InstancedRigidBodies } from '@react-three/rapier';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Environment, Float, ContactShadows } from '@react-three/drei';

const foodColors = ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#8ecae6', '#386641', '#bc4749'];

function Jar({ position = [0, 0, 0], scale = 1, color = '#ffffff' }) {
  const wallCount = 16;
  const radius = 2;
  const height = 4.5;
  const thickness = 0.2;

  const walls = useMemo(() => {
    return Array.from({ length: wallCount }).map((_, i) => {
      const angle = (i / wallCount) * Math.PI * 2;
      const x = Math.cos(angle) * (radius - thickness / 2);
      const z = Math.sin(angle) * (radius - thickness / 2);
      return { position: [x, height / 2, z] as [number, number, number], rotation: [0, -angle, 0] as [number, number, number] };
    });
  }, [wallCount, radius, height]);

  return (
    <group position={position as [number, number, number]} scale={scale}>
      <RigidBody type="fixed" colliders="cuboid" friction={0.5}>
        <mesh position={[0, thickness / 2, 0]} receiveShadow>
          <cylinderGeometry args={[radius, radius, thickness, 32]} />
          <meshPhysicalMaterial
            transparent
            transmission={0.95}
            opacity={1}
            roughness={0.1}
            metalness={0.1}
            thickness={2}
            color={color}
          />
        </mesh>
      </RigidBody>
      
      {walls.map((wall, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={wall.position} rotation={wall.rotation} friction={0.5}>
          <mesh visible={false}>
            <boxGeometry args={[thickness * 1.5, height, (2 * Math.PI * radius) / wallCount]} />
            <meshBasicMaterial color="red" wireframe />
          </mesh>
        </RigidBody>
      ))}

      {/* Visual Glass Jar Wall */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, 32, 1, true]} />
        <meshPhysicalMaterial
          transparent
          transmission={0.95}
          opacity={1}
          roughness={0.05}
          metalness={0.1}
          thickness={0.5}
          side={THREE.DoubleSide}
          color={color}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Rim */}
      <mesh position={[0, height, 0]} castShadow receiveShadow>
        <torusGeometry args={[radius, 0.1, 16, 32]} />
        <meshPhysicalMaterial
          transparent
          transmission={0.95}
          roughness={0.1}
          metalness={0.2}
          color={color}
        />
      </mesh>
    </group>
  );
}

function Food({ count = 150, offsetItem = [0, 15, 0] }) {
  const instances = useRef(null);

  const instancesData = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      key: i,
      position: [
        offsetItem[0] + (Math.random() - 0.5) * 1.5,
        offsetItem[1] + i * 0.5 + Math.random(),
        offsetItem[2] + (Math.random() - 0.5) * 1.5
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ]
    }));
  }, [count, offsetItem]);

  const colors = useMemo(() => {
    return Float32Array.from(Array.from({ length: count }).flatMap(() => {
      const c = new THREE.Color(foodColors[Math.floor(Math.random() * foodColors.length)]);
      return [c.r, c.g, c.b];
    }));
  }, [count]);

  return (
    <InstancedRigidBodies
      instances={instancesData as any}
      colliders="ball"
      restitution={0.1}
      friction={0.8}
    >
      <instancedMesh ref={instances} args={[undefined, undefined, count]} castShadow receiveShadow>
        <sphereGeometry args={[0.35, 16, 16]}>
          <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
        </sphereGeometry>
        <meshStandardMaterial vertexColors roughness={0.6} metalness={0.1} />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}

function FoodBlocks({ count = 100, offsetItem = [0, 15, 0] }) {
    const instances = useRef(null);
  
    const instancesData = useMemo(() => {
      return Array.from({ length: count }).map((_, i) => ({
        key: i,
        position: [
          offsetItem[0] + (Math.random() - 0.5) * 1.5,
          offsetItem[1] + i * 0.6 + Math.random(),
          offsetItem[2] + (Math.random() - 0.5) * 1.5
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ]
      }));
    }, [count, offsetItem]);
  
    const colors = useMemo(() => {
      return Float32Array.from(Array.from({ length: count }).flatMap(() => {
        const c = new THREE.Color(foodColors[Math.floor(Math.random() * foodColors.length)]);
        return [c.r, c.g, c.b];
      }));
    }, [count]);
  
    return (
      <InstancedRigidBodies
        instances={instancesData as any}
        colliders="cuboid"
        restitution={0.1}
        friction={0.8}
      >
        <instancedMesh ref={instances} args={[undefined, undefined, count]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]}>
            <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
          </boxGeometry>
          <meshStandardMaterial vertexColors roughness={0.7} metalness={0.1} />
        </instancedMesh>
      </InstancedRigidBodies>
    );
  }

export default function Hero3DBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas shadows camera={{ position: [0, 8, 20], fov: 35 }}>
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <spotLight position={[-10, 15, 10]} intensity={1} angle={0.3} penumbra={1} castShadow />
        
        <Environment preset="city" />

        <Physics>
          {/* Main central jar */}
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.2, 0.2]}>
            <group position={[0, -2, 0]} rotation={[0.1, 0, 0]}>
              <Jar position={[0, 0, 0]} scale={1.2} />
              <Food count={120} offsetItem={[0, 15, 0]} />
              <FoodBlocks count={80} offsetItem={[0, 25, 0]} />
            </group>
          </Float>

          {/* Left background jar */}
          <Float speed={1} rotationIntensity={0.3} floatIntensity={0.4} floatingRange={[-0.3, 0.3]}>
            <group position={[-7, -3, -5]} rotation={[-0.1, 0.4, 0.1]}>
              <Jar position={[0, 0, 0]} scale={0.9} color="#e0f2fe" />
              <Food count={100} offsetItem={[0, 12, 0]} />
            </group>
          </Float>

          {/* Right background jar */}
          <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6} floatingRange={[-0.2, 0.4]}>
            <group position={[6, -4, -3]} rotation={[0.05, -0.2, -0.05]}>
              <Jar position={[0, 0, 0]} scale={1} color="#fef3c7" />
              <FoodBlocks count={90} offsetItem={[0, 14, 0]} />
            </group>
          </Float>

          {/* Invisible Ground to catch overflow */}
          <RigidBody type="fixed" position={[0, -10, 0]}>
            <mesh visible={false}>
              <boxGeometry args={[100, 1, 100]} />
              <meshBasicMaterial />
            </mesh>
          </RigidBody>
        </Physics>
      </Canvas>
    </div>
  );
}
