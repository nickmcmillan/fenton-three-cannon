import * as THREE from 'three'
import * as CANNON from 'cannon'

import { scene, world } from '../index'

export const addGround = function () {
  // THREEJS
  const geometry = new THREE.PlaneGeometry(100, 100, 1, 1)
  //geometry.applyMatrix( new THREE.Matrix4().makeRotationX( -Math.PI / 2 ) )
  const material = new THREE.MeshLambertMaterial({ color: '#fff' })

  // THREE.ColorUtils.adjustHSV( material.color, 0, 0, 0.9 )
  const mesh = new THREE.Mesh(geometry, material)
  // mesh.castShadow = true

  mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
  mesh.receiveShadow = true
  scene.add(mesh)


  // CANNON
  // Create a plane
  const groundShape = new CANNON.Plane()
  console.log(groundShape)
  
  const groundBody = new CANNON.Body({ mass: 0 }) // ground has mass = 0 which makes it static
  groundBody.addShape(groundShape)
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
  world.add(groundBody)

}