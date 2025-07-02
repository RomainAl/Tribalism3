import { Bvh, PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EcctrlJoystick } from "ecctrl";
import { Perf } from "r3f-perf";
import { Suspense, useState } from "react";
import Experience from "./Experience";

export default function App() {
  const [dpr, setDpr] = useState(2);
  console.log("🚀 ~ App ~ dpr:", dpr);
  return (
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
        <PerformanceMonitor onIncline={() => setDpr(2)} onDecline={() => setDpr(1)}>
          <Suspense fallback={null}>
            <Bvh firstHitOnly>
              <Experience />
            </Bvh>
          </Suspense>
          <Perf position="top-left" />
        </PerformanceMonitor>
      </Canvas>
    </>
  );
}
