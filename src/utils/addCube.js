import * as THREE from 'three'
import * as CANNON from 'cannon'

import { meshes, scene, world, bodies } from '../index'

let objCount = 0

export const addCube = ({
  // defaults
  // http://schteppe.github.io/cannon.js/docs/classes/Body.html
  name = 'cube',
  quantity = 1,
  dimensions = { x: 1, y: 1, z: 1 },
  position,
  mass = 50,
  // damping, 0 is light, 1 is heavy
  angularDamping = 0.99,
  linearDamping = 0.01, // linear damping smooths out jitter
  color = 0xbad455,
  material = 'MeshLambertMaterial'
}) => {
  const { x, y, z } = dimensions
  const geo = new THREE.BoxGeometry(x, y, z)
  const mat = new THREE[material]({ color })
  const shape = new CANNON.Box(new CANNON.Vec3(x/2, y/2, z/2))
  
  for (let i = 0; i < quantity; i++) {
    // THREE
    const mesh = new THREE.Mesh(geo, mat)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.name = `${name}-${objCount}`
    meshes.push(mesh)
    scene.add(mesh)
    // CANNON
    const body = new CANNON.Body({ mass, angularDamping, linearDamping, shape })
    body.name = `${name}-${objCount}`
    body.position.set(Math.random() * 10, Math.random() * 20, Math.random() * 10)
    world.add(body)
    bodies.push(body)
    objCount += 1
  }
}
