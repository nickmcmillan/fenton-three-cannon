import * as THREE from 'three'
import * as CANNON from 'cannon'

import { meshes, scene, world, bodies } from '../index'

export const addBall = ({
  // defaults
  name = 'ball',
  quantity = 1,
  dimensions = { r: 1, w: 4, h: 4 },
  position,
  mass = 50,
  angularDamping = 0.99,
  color = 0x00ffff,
}) => {
  const { r, w, h } = dimensions
  const sphereGeo = new THREE.SphereGeometry(r, w, h)
  const sphereShape = new CANNON.Sphere(r)
  const sphereMaterial = new THREE.MeshPhongMaterial({ color })
  
  for (let i = 0; i < quantity; i++) {
    // THREE
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMaterial)
    sphereMesh.castShadow = true
    sphereMesh.name = `sphere-${i}`
    meshes.push(sphereMesh)
    scene.add(sphereMesh)
    // CANNON
    const sphereBody = new CANNON.Body({ mass, angularDamping, shape: sphereShape })
    sphereBody.name = `${name}-${i}`
    sphereBody.position.set(Math.random() * 10, Math.random() * 2, Math.random() * 10)
    world.add(sphereBody)
    bodies.push(sphereBody)
  }
}
