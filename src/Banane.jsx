/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Author: ReCo_3D (https://sketchfab.com/ReCo_3D)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/banana-ed0537c2201d4ad7b8ddb8368d844174
Title: Banana
*/

import { useGLTF } from "@react-three/drei";

export function Banane(props) {
  const { nodes, materials } = useGLTF("./banana.glb");
  return (
    <group {...props} dispose={null}>
      <group position={[-0.57, -7.725, -0.752]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Banana_Banana_0.geometry}
            material={materials.Banana}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("./banana.glb");
