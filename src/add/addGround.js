import * as THREE from 'three'
import * as CANNON from 'cannon'

import { scene } from '../three'
import { world } from '../cannon'

export const addGround = function () {
  const size = 22
  
  // THREE
  const geo = new THREE.PlaneGeometry(size, size)
  const mat = new THREE.MeshLambertMaterial({ color: 'white' })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
  mesh.position.y = -0.01
  mesh.receiveShadow = true
  scene.add(mesh)

  // CANNON
  // Create a plane
  // const shape = new CANNON.Plane() 
  const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, 1))
  // const groundMaterial = new CANNON.Material('groundMaterial')
  // const material = new CANNON.ContactMaterial(
  //   groundMaterial,
  //   {
  //     // friction: 10,
  //     restitution: 2.5,
  //     // contactEquationRelaxation: 11,
  //     // contactEquationStiffness: 500,
  //     // frictionEquationStiffness: 5,
  //   }
  // )
  const body = new CANNON.Body({ mass: 0, shape, /*material*/ }) // mass = 0 which makes it static
  body.position.set(0, -1, 0)
  body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
  world.add(body)
}
