import * as THREE from 'three'
import * as CANNON from 'cannon'

import { scene, world } from '../index'

export const addGround = function () {
  // THREE
  const geo = new THREE.PlaneGeometry(15, 15)
  const mat = new THREE.MeshLambertMaterial({ color: 'blue' })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
  mesh.receiveShadow = true
  scene.add(mesh)

  const geo2 = new THREE.PlaneGeometry(100, 100)
  const mat2 = new THREE.MeshLambertMaterial({ color: 'white' })
  const mesh2 = new THREE.Mesh(geo2, mat2)
  mesh2.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
  mesh2.position.y = -0.1
  mesh2.receiveShadow = true
  scene.add(mesh2)


  // CANNON
  // Create a plane
  const shape = new CANNON.Plane()
  const body = new CANNON.Body({ mass: 0, shape }) // mass = 0 which makes it static
  body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
  world.add(body)
}
