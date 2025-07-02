import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";

export default function ShotCube({ size, ShotCubeNb }) {
  const [cubeMesh, setCubeMesh] = useState([]);
  const cubeRef = useRef();
  const cubeMeshLength = cubeMesh.length;

  useEffect(() => {
    if (cubeMeshLength < ShotCubeNb) {
      setTimeout(() => {
        const xz = Math.random() * size - size / 2;
        const newMesh = (
          <mesh
            position={[xz, 10, xz]}
            rotation={[Math.PI * Math.random(), Math.PI * Math.random(), Math.PI * Math.random()]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#faa706" attach="material-0" />
            <meshStandardMaterial color="#160f99" attach="material-1" />
            <meshStandardMaterial color="#f80058" attach="material-2" />
            <meshStandardMaterial color="#faa706" attach="material-3" />
            <meshStandardMaterial color="#160f99" attach="material-4" />
            <meshStandardMaterial color="#f80058" attach="material-5" />
          </mesh>
        );
        setCubeMesh((prevMeshes) => [...prevMeshes, newMesh]);
      }, 5000 + Math.random() * 10000);
    }
  }, [cubeMesh, size, cubeMeshLength, ShotCubeNb]);

  return (
    <>
      {cubeMesh.map((item, i) => {
        return (
          <RigidBody
            key={`ShotCube_${i}`}
            mass={0.2}
            ref={cubeRef}
            name="ShotCube"
            // rotation={[Math.PI * Math.random(), Math.PI * Math.random(), Math.PI * Math.random()]}
          >
            {item}
          </RigidBody>
        );
      })}
    </>
  );
}
