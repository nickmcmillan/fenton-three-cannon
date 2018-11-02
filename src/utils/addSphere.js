import * as THREE from 'three'
import * as CANNON from 'cannon'

import { meshes, scene, world, bodies } from '../index'

let objCount = 0

export const addSphere = ({
  // defaults
  // http://schteppe.github.io/cannon.js/docs/classes/Body.html
  name = 'sphere',
  quantity = 1,
  // dimensions = { r: 0.4, w: 25, h: 25 },
  position,
  radius = 0.4,
  mass = 3,
  // damping, 0 is light, 1 is heavy
  angularDamping = 0.95, // default is 0.01 which just looks silly cos it spins for ages
  linearDamping = 0.01, // linear damping smooths out jitter
  color = 0x33ddee,
}) => {
  // const { r, w, h } = dimensions
  const geo = new THREE.SphereGeometry(radius, 25, 25)
  const mat = new THREE.MeshPhongMaterial({ color })
  const shape = new CANNON.Sphere(radius)
  
  for (let i = 0; i < quantity; i++) {
    // THREE
    const mesh = new THREE.Mesh(geo, mat)
    mesh.castShadow = true
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
