<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { OrbitControls, interactivity } from '@threlte/extras';
  import { Spring } from 'svelte/motion';
  import * as THREE from 'three';

  interactivity()

  const orbit_base_rate = 0.0005;

  const planets = [
    { color: 'red', distance: 20, scale: new Spring(2), rate: Math.random() * orbit_base_rate + 0.001, group: undefined as THREE.Group | undefined },
    { color: 'yellow', distance: 30, scale: new Spring(2), rate: Math.random() * orbit_base_rate + 0.001, group: undefined as THREE.Group | undefined },
    { color: 'blue', distance: 45, scale: new Spring(2), rate: Math.random() * orbit_base_rate + 0.001, group: undefined as THREE.Group | undefined },
    { color: 'orange', distance: 55, scale: new Spring(2), rate: Math.random() * orbit_base_rate + 0.001, group: undefined as THREE.Group | undefined },
    { color: 'green', distance: 60, scale: new Spring(2), rate: Math.random() * orbit_base_rate + 0.001, group: undefined as THREE.Group | undefined },
    { color: 'purple', distance: 75, scale: new Spring(2), rate: Math.random() * orbit_base_rate + 0.001, group: undefined as THREE.Group | undefined },
  ];

  const createOrbit = (distance: number) => {
    const curve = new THREE.EllipseCurve(
      0, 0,
      distance, distance,
      0, 2 * Math.PI,
      false,
      0
    );
    const points = curve.getPoints(128);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  };

  useTask((delta) => {
    planets.forEach(planet => {
      if (planet.group) {
        planet.group.rotation.y += planet.rate * delta * 60; // normalize to 60fps
      }
    });
  });
</script>

<T.PerspectiveCamera makeDefault position={[0, 80, 120]} fov={45}>
    <OrbitControls enableZoom={true} />
</T.PerspectiveCamera>
<T.AmbientLight intensity={0.8} />
<T.PointLight position={[0, 0, 0]} intensity={1.5} />
<T.DirectionalLight position={[50, 50, 100]} intensity={1} />

<!-- Star -->
<T.Mesh>
    <T.SphereGeometry args={[10, 16, 16]} />
    <T.MeshStandardMaterial color="white" wireframe={true} transparent={true} opacity={0.9} />
</T.Mesh>

<!-- Planets and Orbits -->
{#each planets as planet, i}
  <!-- Orbit -->
  <T.Line geometry={createOrbit(planet.distance)} rotation.x={Math.PI / 2}>
    <T.LineDashedMaterial color="white" dashSize={0.5} gapSize={0.5} transparent={true} opacity={0.5} />
  </T.Line>

  <T.Group bind:ref={planets[i].group} rotation.y={Math.random() * 2 * Math.PI}>
  <!-- Planet -->
  <T.Mesh
    position.x={planet.distance}
    onpointerover={() => {
      planet.rate = 0;
      planet.scale.target = 3;
      }}
    onpointerleave={() => {
      planet.rate = Math.random() * orbit_base_rate + 0.001;
      planet.scale.target = 2;
    }}
  >
    <T.SphereGeometry args={[planet.scale.current, 8, 8]} />
    <T.MeshStandardMaterial color={planet.color} wireframe={true} transparent={true} opacity={0.9} />
  </T.Mesh>
  </T.Group>
{/each}