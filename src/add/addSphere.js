import * as THREE from 'three'
import * as CANNON from 'cannon'

import { meshes, scene } from '../three'
import { world, bodies } from '../cannon'

export const addSphere = ({
  // defaults
  // http://schteppe.github.io/cannon.js/docs/classes/Body.html
  name = 'sphere',
  quantity = 1,
  position,
  radius,
  mass = 1,
  // damping, 0 is light, 1 is heavy
  angularDamping = 0.95, // default is 0.01 which just looks silly cos it spins for ages
  linearDamping = 0.01, // linear damping smooths out jitter
  color = 0x33ddee,
}) => {

  let objCount = 0
  
  for (let i = 0; i < quantity; i++) {
    const nameTmp = `${name}-${objCount}`
    const localRadius = radius || Math.random()    
    // const { r, w, h } = dimensions
    const geo = new THREE.SphereGeometry(localRadius, 25, 25) // sphere resolution
    const mat = new THREE.MeshPhongMaterial({ color, /*transparent: false, opacity: 1,*/ })
    const shape = new CANNON.Sphere(localRadius)
    
    // THREE
    const mesh = new THREE.Mesh(geo, mat)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.name = nameTmp
    meshes.push(mesh)
    scene.add(mesh)
    
    // CANNON
    const body = new CANNON.Body({ mass, angularDamping, linearDamping, shape })
    body.name = nameTmp
    body.position.set(Math.random() * 40, Math.random() * 40, Math.random() * 40)
    body.velocity.set(Math.random() * 10, Math.random() * 10, Math.random() * 10)
    world.add(body)
    bodies.push(body)

    objCount += 1
  }
}
