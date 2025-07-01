import { InstancedRigidBodies, RigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";

export default function Floor() {
  const cubesCount = 2;
  const cubesRef = useRef();
  const instances = useMemo(() => {
    const instances = [];

    for (let i = 0; i < cubesCount; i++) {
      instances.push({
        key: "instance_" + i,
        userData: { index: i },
        position: [i * 2, 0, -2],
      });
    }

    return instances;
  }, []);

  const collisionEnter = (e) => {
    const collidedInstanceRigidBody = e.target.rigidBodyObject;
    console.log(collidedInstanceRigidBody.userData);
    if (collidedInstanceRigidBody && collidedInstanceRigidBody.userData && typeof collidedInstanceRigidBody.userData.index === "number") {
      const instanceIndex = collidedInstanceRigidBody.userData.index;

      // Accéder au RigidBody de l'instance spécifique via cubesRef.current
      if (cubesRef.current && cubesRef.current[instanceIndex]) {
        const currentTranslation = cubesRef.current[instanceIndex].translation();

        // Appliquer la translation uniquement au cube touché
        cubesRef.current[instanceIndex].setNextKinematicTranslation({
          x: currentTranslation.x,
          y: currentTranslation.y - 0.5, // Descendre le cube de 0.5 unités
          z: currentTranslation.z,
        });

        // Optionnel: Changer la couleur du cube touché pour le visualiser
        // Pour cela, il faudrait gérer un attribut de couleur par instance sur le shader,
        // ou si vous avez des matériaux par instance.
        // Si vous utilisez un mesh unique avec instancedMesh, changer la couleur est plus complexe
        // car elle est partagée. Pour des variations de couleur, vous devriez soit :
        // 1. Utiliser un shader custom qui prend en compte des attributs par instance.
        // 2. Si le nombre d'instances est faible, ne pas utiliser d'instancing et avoir des RigidBodies séparés.
        // 3. Utiliser des propriétés d'instance comme `instanceColor` si votre `meshStandardMaterial` le supporte
        //    (ce qui n'est pas le cas par défaut pour `meshStandardMaterial`).
      }
    }
  };

  return (
    <>
      <InstancedRigidBodies type="kinematicPosition" instances={instances} ref={cubesRef} onCollisionEnter={collisionEnter}>
        <instancedMesh castShadow receiveShadow args={[null, null, cubesCount]}>
          <boxGeometry />
          <meshStandardMaterial color="tomato" />
        </instancedMesh>
      </InstancedRigidBodies>
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, -3.5, 0]}>
          <boxGeometry args={[300, 5, 300]} />
          <meshStandardMaterial color="black" transparent />
        </mesh>
      </RigidBody>
    </>
  );
}
