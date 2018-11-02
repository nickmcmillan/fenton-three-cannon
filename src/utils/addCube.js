import * as THREE from 'three'
import * as CANNON from 'cannon'

import { meshes, scene, world, bodies } from '../index'

export const addCube = ({
  // defaults
  name = 'cube',
  quantity = 1,
  dimensions = { x: 1, y: 1, z: 1 },
  position,
  mass = 50,
  angularDamping = 0.99,
  color = 0xbad455,
}) => {
  const { x, y, z } = dimensions
  const cubeGeo = new THREE.BoxGeometry(x, y, z)
  const shape = new CANNON.Box(new CANNON.Vec3(x/2, y/2, z/2))
  const cubeMaterial = new THREE.MeshPhongMaterial({ color })
  
  for (let i = 0; i < quantity; i++) {
    // THREE
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial)
    cubeMesh.castShadow = true
    cubeMesh.name = `cube-${i}`
    meshes.push(cubeMesh)
    scene.add(cubeMesh)
    // CANNON
    const boxBody = new CANNON.Body({ mass, angularDamping, shape })
    boxBody.name = `${name}-${i}`
    boxBody.position.set(Math.random() * 10, Math.random() * 2, Math.random() * 10)
    world.add(boxBody)
    bodies.push(boxBody)
  }
}
