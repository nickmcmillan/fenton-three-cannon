import * as CANNON from 'cannon'

import { settings } from './index'
// import { CannonDebugRenderer } from './helpers/cannonDebugRenderer'
import { meshes, /* scene */ } from './three'

export const world = new CANNON.World()
export const bodies = []
// export let cannonDebugRenderer


const timeStep = 1 / 60
const resetBoundary = 40
export const updatePhysics = function () {
  world.step(timeStep)
  for (var i = 0; i < meshes.length; i++) {
    const { x, y, z } = bodies[i].position
    // if the body falls below the ground
    const outY = y < -10
    // if the body exceeds some made up boundaries
    const outX = x < -resetBoundary || x > resetBoundary
    const outZ = z < -resetBoundary || x > resetBoundary
    // if so, reset its velocity & position
    if (outY || outX || outZ) {
      bodies[i].velocity.set(Math.random(), Math.random(), Math.random())
      bodies[i].position.set(0, 34, 0)
      bodies[i].angularVelocity.set(0, 0, 0.5)
    }
    // get the Three mesh, and apply the Cannon body to it
    meshes[i].position.copy(bodies[i].position)
    meshes[i].quaternion.copy(bodies[i].quaternion)
  }
}


export default function () {

  // const conmat = new CANNON.Material('boob')
  // world.addMaterial(conmat)

  // const material = new CANNON.ContactMaterial(
  //   conmat, conmat,
  //   {
  //     // friction: 10,
  //     restitution: 100,
  //     contactEquationRelaxation: 1000,
  //     // contactEquationStiffness: 5,
  //     frictionEquationStiffness: 5,
  //   }
  // )

  // world.addContactMaterial(material)

  // Setup our world
  world.allowSleep = true
  world.solver.iterations = 5 // 10
  // world.defaultContactMaterial.contactEquationRegularizationTime = 3 // 3
  world.defaultContactMaterial.contactEquationRelaxation = 3 // 3
  world.defaultContactMaterial.contactEquationStiffness = settings.contactEquationStiffness // 1e7
  world.defaultContactMaterial.friction = 0.1 // 0.3
  // world.defaultContactMaterial.frictionEquationRelaxation = 3 // 3
  // world.defaultContactMaterial.frictionEquationStiffness = 10000000 // 10000000
  world.defaultContactMaterial.restitution = settings.restitution

  world.broadphase = new CANNON.NaiveBroadphase()
  world.gravity.set(settings.gx, settings.gy, settings.gz)

  // cannonDebugRenderer = new CannonDebugRenderer(scene, world)
}
