import { Environment, Grid, KeyboardControls, useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CylinderCollider, Physics, RigidBody } from "@react-three/rapier";
import Ecctrl, { EcctrlAnimation } from "ecctrl";
import { useRef } from "react";
import * as THREE from "three";
import { Banane } from "./Banane.jsx";
import ExtrudedVoronoiGround from "./ExtrudedVoronoiGround.jsx";
import { Hero } from "./Hero.jsx";
import Lights from "./Lights.jsx";
import ShotCube from "./ShotCube.jsx";
import { Tree } from "./Tree.jsx";

const size = 30;
const ShotCubeNb = 10;
const voroNb = 5;

export default function Experience() {
  const heroURL = "./Monkey06.glb";
  const texture = useTexture("./grayNoiseMedium.png");
  texture.wrapS = texture.wrapT = "RepeatWrapping";

  const keyboardMap = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "backward", keys: ["ArrowDown", "KeyS"] },
    { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
    { name: "rightward", keys: ["ArrowRight", "KeyD"] },
    { name: "jump", keys: ["Space"] },
    { name: "run", keys: ["Shift"] },
  ];

  // Prepare and rename your character animations here
  // Note: idle, walk, run, jump, jumpIdle, jumpLand and fall names are essential
  // Missing any of these names might result in an error: "cannot read properties of undifined (reading 'reset')"
  const animationSet = {
    idle: "Idle",
    walk: "Walk",
    run: "Run",
    jump: "Jump",
    jumpIdle: "Jump",
    jumpLand: "Jump",
    fall: "Jump1", // This is for falling from high sky
  };

  const refBall = useRef();
  const refTree = useRef();
  const refBanane1 = useRef();
  const refBanane2 = useRef();
  const refBanane3 = useRef();
  const refBanane4 = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const eulerRotation = new THREE.Euler(0, time * 0.1, 0);
    const quaternionRotation = new THREE.Quaternion();
    quaternionRotation.setFromEuler(eulerRotation);
    if (refBall.current) refBall.current.setNextKinematicRotation(quaternionRotation);
    if (refTree.current) refTree.current.setNextKinematicRotation(quaternionRotation);
    if (refBanane1.current) refBanane1.current.setNextKinematicRotation(quaternionRotation);
    if (refBanane2.current) refBanane2.current.setNextKinematicRotation(quaternionRotation);
    if (refBanane3.current) refBanane3.current.setNextKinematicRotation(quaternionRotation);
    if (refBanane4.current) refBanane4.current.setNextKinematicRotation(quaternionRotation);
  });

  const collisionEnter = (e) => {
    if (e.colliderObject.name === "character-capsule-collider") {
      e.target.rigidBodyObject.visible = false;
    }
  };

  return (
    <>
      <Grid
        args={[size, size]}
        sectionColor={"lightgray"}
        cellColor={"gray"}
        position={[0, -0.99, 0]}
        userData={{ camExcludeCollision: true }} // this won't be collide by camera ray
        // fadeDistance={10}
      />
      <Environment
        preset={null}
        background
        backgroundIntensity={1}
        environmentIntensity={3}
        files={["./env01.png", "./env01.png", "./env01.png", "./env01.png", "./env00.png", "./env01.png"]}
      />
      <Lights />

      <Physics debug={false} timeStep="vary">
        <KeyboardControls map={keyboardMap}>
          <Ecctrl animated springK={0} jumpVel={4} mode="FixedCamera" fixedCamRotMult={2} position={[0, 50, 0]}>
            <EcctrlAnimation
              characterURL={heroURL} // Must have property
              animationSet={animationSet} // Must have property
            >
              <Hero scale={0.2} position={[0, -0.6, 0]} />
              {/* <primitive object={hero.scene} scale={0.2} position={[0, -0.6, 0]} /> */}
            </EcctrlAnimation>
          </Ecctrl>
        </KeyboardControls>

        <RigidBody ref={refBall} type="kinematicPosition" colliders="ball">
          <mesh castShadow receiveShadow scale={3} position={[0, -2.9, 0]}>
            <sphereGeometry />
            <meshStandardMaterial map={texture} toneMapped={true} />
          </mesh>
        </RigidBody>

        <RigidBody ref={refTree} colliders={false} type="kinematicPosition" scale={0.1}>
          <Tree />
          <CylinderCollider args={[20.5, 3.5]} position={[0, 13, 0]} />
        </RigidBody>

        <RigidBody
          ref={refBanane1}
          type="kinematicPosition"
          scale={0.1}
          position={[(size - 3) / 2, 0, (size - 3) / 2]}
          onCollisionEnter={collisionEnter}
        >
          <Banane rotation-z={Math.PI / 2} />
        </RigidBody>
        <RigidBody
          ref={refBanane2}
          type="kinematicPosition"
          scale={0.1}
          position={[-(size - 3) / 2, 0, (size - 3) / 2]}
          onCollisionEnter={collisionEnter}
        >
          <Banane rotation-z={Math.PI / 2} />
        </RigidBody>
        <RigidBody
          ref={refBanane3}
          type="kinematicPosition"
          scale={0.1}
          position={[(size - 3) / 2, 0, -(size - 3) / 2]}
          onCollisionEnter={collisionEnter}
        >
          <Banane rotation-z={Math.PI / 2} />
        </RigidBody>
        <RigidBody
          ref={refBanane4}
          type="kinematicPosition"
          scale={0.1}
          position={[-(size - 3) / 2, 0, -(size - 3) / 2]}
          onCollisionEnter={collisionEnter}
        >
          <Banane rotation-z={Math.PI / 2} />
        </RigidBody>
        <ExtrudedVoronoiGround
          size={size}
          numSites={voroNb} // Plus de sites = plus de cellules (attention à la performance)
          elevationScale={0}
          thickness={0.1}
          edgeBuffer={0.5}
        />
        <ShotCube size={size} ShotCubeNb={ShotCubeNb} />
      </Physics>
    </>
  );
}
