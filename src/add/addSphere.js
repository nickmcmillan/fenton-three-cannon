import * as THREE from 'three'
import * as CANNON from 'cannon'
import randomInRange from '../utils/randomInRange'
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
  angularVelocity = { x: 0, y: 0, z: 0.5, }, // modifying it a little so the items don't just drop perfectly (which looks unnatural)
  color = 0x33ddee,
}) => {

  for (let i = 0; i < quantity; i++) {
    const localRadius = randomInRange(1, 2) / 3

    // const { r, w, h } = dimensions
    const geo = new THREE.SphereBufferGeometry(localRadius, 25, 25) // sphere resolution
    const mat = new THREE.MeshPhongMaterial({ color, /*transparent: false, opacity: 1,*/ })
    const shape = new CANNON.Sphere(localRadius)

    // THREE
    const mesh = new THREE.Mesh(geo, mat)

    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.name = mesh.uuid
    meshes.push(mesh)
    scene.add(mesh)

    // CANNON
    const body = new CANNON.Body({ mass, angularDamping, linearDamping, angularVelocity, shape })
    body.name = mesh.uuid
    body.position.set(randomInRange(-1, 1), randomInRange(60, 140), randomInRange(-1, 1))
    body.velocity.set(randomInRange(0, 5), randomInRange(0, 5), randomInRange(0, 5))
    world.add(body)
    bodies.push(body)
    
  }

  

}
