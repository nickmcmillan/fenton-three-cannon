import { PlaneGeometry, MeshLambertMaterial, Mesh, Vector3 } from 'three'
import * as CANNON from 'cannon'

import { scene } from '../three'
import { world } from '../cannon'

export const addGround = function () {
  const groundSize = 10 // this element is just for show
  const bounds = 30 // if an object exceeds these bounds, it drops off the edge
  
  // THREE
  // https://stackoverflow.com/a/52726872/2255980
  const innerGeo = new PlaneGeometry(groundSize, groundSize)
  const innerMat = new MeshLambertMaterial({ color: 'blue' })
  const innerMesh = new Mesh(innerGeo, innerMat)
  innerMesh.quaternion.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)
  innerMesh.receiveShadow = true
  scene.add(innerMesh)

  const outerGeo = new PlaneGeometry(bounds, bounds)
  const outerMat = new MeshLambertMaterial({ color: 'white' })
  const outerMesh = new Mesh(outerGeo, outerMat)
  outerMesh.quaternion.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)
  outerMesh.position.y = -0.01
  outerMesh.receiveShadow = true
  scene.add(outerMesh)

  // CANNON
  // Create a plane
  // const shape = new CANNON.Plane() 
  const shape = new CANNON.Box(new CANNON.Vec3(bounds / 2, bounds / 2, 1))
  const body = new CANNON.Body({ mass: 0, shape }) // mass = 0 which makes it static
  body.position.set(0, -1, 0)
  body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
  world.add(body)
}
