import { useTexture } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier"; // Importez Physics, RigidBody, Collider
import { Delaunay } from "d3-delaunay";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

// Fonction utilitaire pour générer des couleurs aléatoires
const getRandomColor = () => new THREE.Color(Math.random(), Math.random(), Math.random());

// ---
// Composant pour une seule cellule extrudée de Voronoï (avec son propre Collider)
// ---
function VoronoiCellMesh({ cellData, thickness }) {
  const meshRef = useRef();
  const geometryRef = useRef();

  const texture = useTexture(`tex0${Math.round(Math.random() * 7)}.png`);
  texture.wrapS = THREE.ClampToEdgeWrapping; // Empêche la répétition horizontale
  texture.wrapT = THREE.ClampToEdgeWrapping;
  // texture.repeat.set(0.1, 0.1);

  // Important : assurez-vous que la texture se répète si le polygone est grand
  // texture.wrapS = THREE.RepeatWrapping;
  // texture.wrapT = THREE.RepeatWrapping;
  // texture.repeat.set(0.1, 0.1);

  // On génère ici les positions et indices pour la géométrie extrudée de cette cellule
  // Ces mêmes positions et indices seront utilisés pour le mesh visuel ET le collider
  const { positions, indices, uvs } = useMemo(() => {
    // cellData contient [x, z, y] pour les points du polygone de Voronoï
    const baseVertices = cellData.map((p) => [p[0], p[1], p[2]]).flat(); // [x, z, y] pour la surface supérieure

    const allVertices = [...baseVertices];
    const allIndices = [];

    const numTopVertices = baseVertices.length / 3;

    // Calculer le centre du polygone (pour le fan)
    let centerX = 0,
      centerZ = 0,
      centerY = 0;
    for (let i = 0; i < numTopVertices; i++) {
      centerX += baseVertices[i * 3]; // x
      centerZ += baseVertices[i * 3 + 1]; // z
      centerY += baseVertices[i * 3 + 2]; // y
    }
    centerX /= numTopVertices;
    centerZ /= numTopVertices;
    centerY /= numTopVertices;

    // Ajoute le centre comme dernier point pour la triangulation en "fan"
    allVertices.push(centerX, centerZ, centerY);
    const centerIndex = numTopVertices;

    // Triangulation en "fan" pour la surface supérieure
    for (let i = 0; i < numTopVertices; i++) {
      const nextI = (i + 1) % numTopVertices;
      allIndices.push(centerIndex, i, nextI); // Créer un triangle du centre vers deux sommets consécutifs
    }

    // --- Extrusion ---
    // Dupliquer les sommets pour la surface inférieure
    for (let i = 0; i < numTopVertices; i++) {
      allVertices.push(
        baseVertices[i * 3], // x
        baseVertices[i * 3 + 1], // z
        baseVertices[i * 3 + 2] - thickness // y décalé vers le bas
      );
    }
    // Dupliquer le centre pour la surface inférieure
    allVertices.push(centerX, centerZ, centerY - thickness);
    const centerIndexBottom = centerIndex + numTopVertices + 1;

    // Créer les faces latérales
    for (let i = 0; i < numTopVertices; i++) {
      const nextI = (i + 1) % numTopVertices;

      const v0_top = i;
      const v1_top = nextI;

      const v0_bottom = i + numTopVertices + 1;
      const v1_bottom = nextI + numTopVertices + 1;

      // Triangles du quad latéral (attention à l'ordre pour les normales)
      allIndices.push(v0_top, v0_bottom, v1_top); // Premier triangle
      allIndices.push(v1_top, v0_bottom, v1_bottom); // Deuxième triangle
    }

    // Créer la surface inférieure (triangulation en "fan" inversée)
    for (let i = 0; i < numTopVertices; i++) {
      const nextI = (i + 1) % numTopVertices;
      const b_center = centerIndexBottom;
      const b_i = i + numTopVertices + 1;
      const b_nextI = nextI + numTopVertices + 1;
      allIndices.push(b_center, b_nextI, b_i); // Inverser l'ordre
    }

    // Ajout des coordonnées UV (projection planaire sur XZ)
    const uvsArray = [];
    // Trouver les min/max de X et Z pour cette cellule spécifique
    let minX = Infinity,
      maxX = -Infinity,
      minZ = Infinity,
      maxZ = -Infinity;
    for (let i = 0; i < numTopVertices; i++) {
      minX = Math.min(minX, baseVertices[i * 3]); // x
      maxX = Math.max(maxX, baseVertices[i * 3]);
      minZ = Math.min(minZ, baseVertices[i * 3 + 1]); // z
      maxZ = Math.max(maxZ, baseVertices[i * 3 + 1]);
    }
    const rangeX = maxX - minX;
    const rangeZ = maxZ - minZ;

    // UVs pour la surface supérieure
    for (let i = 0; i < numTopVertices; i++) {
      // Normaliser les coordonnées X et Z entre 0 et 1 par rapport à la taille de la cellule
      // Utilisez || 0 pour gérer les cas où rangeX/Z pourrait être 0 (cellule très petite/linéaire)
      uvsArray.push(
        rangeX > 0 ? (baseVertices[i * 3] - minX) / rangeX : 0.5, // U
        rangeZ > 0 ? (baseVertices[i * 3 + 1] - minZ) / rangeZ : 0.5 // V
      );
    }
    // UVs pour le centre du haut
    uvsArray.push(rangeX > 0 ? (centerX - minX) / rangeX : 0.5, rangeZ > 0 ? (centerZ - minZ) / rangeZ : 0.5);

    // UVs pour les faces latérales et la surface inférieure
    // Pour l'étirement, les UVs des faces latérales et de la surface inférieure peuvent être les mêmes que le haut
    // ou générés différemment selon le rendu désiré pour les côtés.
    // Pour les faces latérales, une projection verticale peut être plus appropriée.
    // Cependant, pour la majorité des cas, les mêmes UVs que la surface supérieure sont acceptables
    // ou simplement utiliser une couleur unie pour les côtés.
    // Ici, nous allons simplement dupliquer les UVs pour les faces latérales et la surface inférieure.
    // Cela signifie que les textures seront étirées sur les côtés aussi, potentiellement de manière déformée.
    // Pour un sol, souvent seule la surface supérieure est texturée, les côtés sont une couleur unie.

    // Si vous voulez une texture étirée sur les côtés, dupliquez les UVs du haut
    // Pour cet exemple, nous allons considérer que la texture s'applique principalement au dessus
    // et que les côtés peuvent avoir des UVs basiques ou être une couleur unie.
    // Ici, je vais générer des UVs "simples" pour les côtés qui pourraient être étranges mais suffisent
    // pour que Three.js ait un attribut UV valide.

    // Simplification : les UVs des faces latérales et de la surface inférieure sont juste
    // une continuation des UVs de la surface supérieure pour avoir un attribut complet.
    // Pour des UVs précises sur les faces latérales, il faudrait une logique plus complexe.
    // Pour un sol, souvent, seules les UVs du dessus importent vraiment.
    for (let i = 0; i < numTopVertices; i++) {
      uvsArray.push(rangeX > 0 ? (baseVertices[i * 3] - minX) / rangeX : 0.5, rangeZ > 0 ? (baseVertices[i * 3 + 1] - minZ) / rangeZ : 0.5);
    }
    uvsArray.push(rangeX > 0 ? (centerX - minX) / rangeX : 0.5, rangeZ > 0 ? (centerZ - minZ) / rangeZ : 0.5);

    return {
      positions: new Float32Array(allVertices),
      indices: new Uint32Array(allIndices),
      uvs: new Float32Array(uvsArray), // ✨ Assurez-vous que 'uvsArray' est passé
    };
  }, [cellData, thickness]);

  const refVoro = useRef();
  const collisionEnter = (e) => {
    const currentTranslation = refVoro.current.translation();

    if (e.colliderObject.name === "ShotCube")
      refVoro.current.setNextKinematicTranslation({
        x: currentTranslation.x,
        y: Math.max(currentTranslation.y - 0.1, -2),
        z: currentTranslation.z,
      });
  };

  useLayoutEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.computeVertexNormals();
      geometryRef.current.computeBoundingBox(); // Important pour le Collider 'trimesh'
      geometryRef.current.computeBoundingSphere(); // Utile pour certaines optimisations
    }
  }, [positions, indices]);

  return (
    <>
      <RigidBody type="kinematicPosition" colliders="trimesh" friction={0} onCollisionEnter={collisionEnter} ref={refVoro}>
        <mesh ref={meshRef} castShadow receiveShadow position={[0, -1, 0]} rotation-x={Math.PI * 0.5} toneMapped={true}>
          <bufferGeometry attach="geometry" ref={geometryRef}>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="index" args={[indices, 1]} />
            <bufferAttribute attach="attributes-uv" args={[uvs, 2]} />
          </bufferGeometry>
          <meshStandardMaterial map={texture} />
        </mesh>
        {/* Chaque cellule a son propre Collider */}
        {/* Le RigidBody parent (ExtrudedVoronoiGround) est de type fixed, donc le collider sera aussi fixed */}
        {/* <Collider shape="trimesh" args={[positions, indices]} /> */}
      </RigidBody>
    </>
  );
}

// ---
// Composant du sol de Voronoï extrudé
// ---
export default function ExtrudedVoronoiGround({ numSites = 100, size = 20, elevationScale = 2, thickness = 1, edgeBuffer = 0.5 }) {
  const allCellsData = useMemo(() => {
    const sites = [];
    const siteElevations = []; // Stocke l'élévation Y de chaque site

    // Générer des points aléatoires à l'intérieur du carré (plan XZ)
    for (let i = 0; i < numSites; i++) {
      const x = Math.random() * size - size / 2;
      const z = Math.random() * size - size / 2; // Z est la nouvelle coordonnée horizontale

      const normalizedX = Math.abs(x) / (size / 2);
      const normalizedZ = Math.abs(z) / (size / 2); // Calcul sur Z
      const edgeInfluence = Math.max(normalizedX, normalizedZ);

      const y = (Math.random() - 0.5) * 2 * elevationScale * (1 - Math.pow(edgeInfluence, 3));

      sites.push([x, z]); // Delaunay travaille sur [x, z]
      siteElevations.push(y); // L'élévation est Y
    }

    // Ajouter des points directement sur les bords et les coins du carré (plan XZ)
    const numEdgePoints = Math.sqrt(numSites) * 2;
    const edgeY = 0; // Ces points auront une élévation Y de 0 pour des bords plats

    for (let i = 0; i < numEdgePoints; i++) {
      sites.push([Math.random() * size - size / 2, size / 2 - edgeBuffer]); // Bord Z positif
      siteElevations.push(edgeY);
      sites.push([Math.random() * size - size / 2, -size / 2 + edgeBuffer]); // Bord Z négatif
      siteElevations.push(edgeY);
      sites.push([-size / 2 + edgeBuffer, Math.random() * size - size / 2]); // Bord X négatif
      siteElevations.push(edgeY);
      sites.push([size / 2 - edgeBuffer, Math.random() * size - size / 2]); // Bord X positif
      siteElevations.push(edgeY);
    }
    const cornerY = 0;
    sites.push([-size / 2, -size / 2]);
    siteElevations.push(cornerY);
    sites.push([size / 2, -size / 2]);
    siteElevations.push(cornerY);
    sites.push([-size / 2, size / 2]);
    siteElevations.push(cornerY);
    sites.push([size / 2, size / 2]);
    siteElevations.push(cornerY);

    const delaunay = Delaunay.from(sites);

    const cellsData = [];
    for (let i = 0; i < sites.length; i++) {
      cellsData.push({
        site: sites[i],
        elevation: siteElevations[i],
        polygonPoints: [],
        color: getRandomColor(),
      });
    }

    // Limiter la zone de Voronoï au carré sur le plan XZ
    const voronoi = delaunay.voronoi([-size / 2, -size / 2, size / 2, size / 2]);

    for (let i = 0; i < sites.length; i++) {
      const polygon = voronoi.cellPolygon(i);
      if (polygon) {
        // Les points du polygone sont [x, z], on ajoute l'élévation Y
        cellsData[i].polygonPoints = polygon.map((p) => [p[0], p[1], siteElevations[i]]); // [x, z, y]
      }
    }

    return cellsData.filter((cell) => cell.polygonPoints.length > 0);
  }, [numSites, size, elevationScale, edgeBuffer]);

  return (
    // Un seul RigidBody parent de type fixed pour le sol.
    // Tous les colliders de cellules seront des enfants de ce RigidBody.
    <>
      {allCellsData.map((cell, index) => (
        <VoronoiCellMesh
          key={index} // Utilisez l'index si les cellules ne changent pas d'ordre
          cellData={cell.polygonPoints} // Contient [x, z, y]
          thickness={thickness}
          color={cell.color}
        />
      ))}
      {/* Pas de Collider global ici, car chaque VoronoiCellMesh gère le sien */}
    </>
  );
}
