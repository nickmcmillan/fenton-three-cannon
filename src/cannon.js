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
  // Setup our world
  world.quatNormalizeSkip = 0
  world.quatNormalizeFast = false
  // world.solver.iterations = 2
  world.defaultContactMaterial.contactEquationRelaxation = 3
  world.defaultContactMaterial.contactEquationStiffness = 1e8
  world.defaultContactMaterial.restitution = settings.restitution
  world.defaultContactMaterial.friction = 0.1  
  // world.defaultContactMaterial.contactEquationRegularizationTime = 3

  
  world.gravity.set(settings.gx, settings.gy, settings.gz)
  world.broadphase = new CANNON.NaiveBroadphase()

  // cannonDebugRenderer = new CannonDebugRenderer(scene, world)
}
