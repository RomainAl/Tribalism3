import { Bvh } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EcctrlJoystick } from "ecctrl";
import { Perf } from "r3f-perf";
import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import Experience from "./Experience";
import "./index.css";

const root = createRoot(document.querySelector("#root"));

root.render(
  <>
    <EcctrlJoystick />
    <Canvas
      dpr={2}
      gl={{ antialias: true }}
      shadows
      camera={{
        fov: 120,
        near: 0.1,
        far: 1000,
      }}
      // eventSource={document.getElementById("root")}
      // onPointerDown={(e) => {
      //   if (e.pointerType === "mouse") {
      //     e.target.requestPointerLock();
      //   }
      // }}
    >
      <color args={["black"]} attach="background" />
      {/* <OrbitControls /> */}
      <Suspense fallback={null}>
        <Bvh firstHitOnly>
          <Experience />
        </Bvh>
      </Suspense>
      <Perf position="top-left" />
    </Canvas>
  </>
);
