import { Environment, Grid, KeyboardControls, Sparkles, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, CylinderCollider, Physics, RigidBody } from "@react-three/rapier";
import Ecctrl, { EcctrlAnimation } from "ecctrl";
import { useRef } from "react";
import * as THREE from "three";
import { Banane } from "./Banane.jsx";
import ExtrudedVoronoiGround from "./ExtrudedVoronoiGround.jsx";
import { Hero } from "./Hero.jsx";
import Lights from "./Lights.jsx";
import { Mechant } from "./Mechant.jsx";
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
    const quaternionRotation = new THREE.Quaternion();
    quaternionRotation.setFromEuler(new THREE.Euler(0, time * 0.1, 0));
    if (refBall.current) {
      refBall.current.setNextKinematicRotation(quaternionRotation);
    }
    if (refTree.current) {
      refTree.current.setNextKinematicRotation(quaternionRotation);
    }
    if (refBanane1.current) {
      quaternionRotation.setFromEuler(new THREE.Euler(0, time * 0.3, Math.PI / 2));
      refBanane1.current.setNextKinematicRotation(quaternionRotation);
      refBanane1.current.setNextKinematicTranslation({ x: (size - 3) / 2, y: Math.cos(time) * 0.5 + 0.5, z: (size - 3) / 2 });
    }
    if (refBanane2.current) {
      quaternionRotation.setFromEuler(new THREE.Euler(0, -time * 0.2, Math.PI / 2));
      refBanane2.current.setNextKinematicRotation(quaternionRotation);
      refBanane2.current.setNextKinematicTranslation({ x: -(size - 3) / 2, y: Math.cos(-time + 1) * 0.5 + 0.5, z: (size - 3) / 2 });
    }
    if (refBanane3.current) {
      quaternionRotation.setFromEuler(new THREE.Euler(0, time * 0.3, Math.PI / 2));
      refBanane3.current.setNextKinematicRotation(quaternionRotation);
      refBanane3.current.setNextKinematicTranslation({ x: -(size - 3) / 2, y: Math.cos(time + 2) * 0.5 + 0.5, z: -(size - 3) / 2 });
    }
    if (refBanane4.current) {
      quaternionRotation.setFromEuler(new THREE.Euler(0, -time * 0.25, Math.PI / 2));
      refBanane4.current.setNextKinematicRotation(quaternionRotation);
      refBanane4.current.setNextKinematicTranslation({ x: (size - 3) / 2, y: Math.cos(-time + 3) * 0.5 + 0.5, z: -(size - 3) / 2 });
    }
  });

  const collisionEnter = (e) => {
    if (e.colliderObject.name === "character-capsule-collider") {
      e.target.rigidBodyObject.visible = false;
    }
  };

  return (
    <>
      {/* <OrbitControls /> */}
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
      {/* <CameraShake maxYaw={0.01} maxPitch={0.01} maxRoll={0.01} yawFrequency={0.5} pitchFrequency={0.5} rollFrequency={0.4} /> */}
      <Sparkles size={6} scale={[4, 3, 4]} position-y={2.5} speed={1.2} count={30} />
      <Physics debug={false} timeStep="vary" gravity={[0, -9.81, 0]}>
        <KeyboardControls map={keyboardMap}>
          <Ecctrl
            animated
            springK={0}
            jumpVel={4}
            mode="FixedCamera"
            fixedCamRotMult={1}
            dragDampingC={0.08}
            capsuleRadius={0.3}
            camInitDis={-2.5} // Initial camera distance
            camMaxDis={-7} // Maximum camera distance
            camMinDis={-0.7} // Minimum camera distance
            characterInitDir={Math.PI}
            disableFollowCam={false}
            turnSpeed={10}
            sprintMult={1}
            capsuleHalfHeight={0.25}
            airDragMultiplier={2.2}
            floatHeight={0}
            position={[0, 50, 0]}
            autoBalanceSpringK={0.3}
            autoBalanceSpringOnY={0.5}
            camCollisionOffset={0.2}
          >
            <EcctrlAnimation
              characterURL={heroURL} // Must have property
              animationSet={animationSet} // Must have property
            >
              <Hero scale={0.2} position={[0, -0.55, 0]} />
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
        <RigidBody colliders={false} ref={refBanane1} type="kinematicPosition" scale={0.12} onCollisionEnter={collisionEnter}>
          <Banane />
          <CuboidCollider args={[5, 1.5, 10]} position={[0, -6, 0]} />
        </RigidBody>
        <RigidBody colliders={false} ref={refBanane2} type="kinematicPosition" scale={0.15} onCollisionEnter={collisionEnter}>
          <Banane />
          <CuboidCollider args={[5, 1.5, 10]} position={[0, -6, 0]} />
        </RigidBody>
        <RigidBody colliders={false} ref={refBanane3} type="kinematicPosition" scale={0.14} onCollisionEnter={collisionEnter}>
          <Banane />
          <CuboidCollider args={[5, 1.5, 10]} position={[0, -6, 0]} />
        </RigidBody>
        <RigidBody colliders={false} ref={refBanane4} type="kinematicPosition" scale={0.13} onCollisionEnter={collisionEnter}>
          <Banane />
          <CuboidCollider args={[5, 1.5, 10]} position={[0, -6, 0]} />
        </RigidBody>

        <Mechant />

        {/* <CuboidCollider /> */}

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
