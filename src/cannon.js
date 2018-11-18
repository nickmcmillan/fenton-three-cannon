import * as CANNON from 'cannon'
import { GUI } from 'dat.gui'
// import { CannonDebugRenderer } from './helpers/cannonDebugRenderer'
import { meshes, /* scene */ } from './three'

export const world = new CANNON.World()
export const bodies = []
// export let cannonDebugRenderer

const gui = new GUI()
const timeStep = 1 / 60
const settings = {
  gx: 0,
  gy: -40,
  gz: 0,
  restitution: 0.5,
}

export const updatePhysics = function () {
  world.step(timeStep)
  for (var i = 0; i < meshes.length; i++) {
    const { x, y, z } = bodies[i].position
    // if the body falls below the ground
    const outY = y < -10 
    // if the body exceeds some made up boundaries
    const outX = x < -20 || x > 20
    const outZ = z < -20 || x > 20
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
  world.defaultContactMaterial.restitution = 0.5
  world.defaultContactMaterial.friction = 0.1  
  // world.defaultContactMaterial.contactEquationRegularizationTime = 3

  // add dat.gui bindings
  gui.add(settings, 'gx', -40, 40).onChange(function(val) {
    if (!isNaN(val)) world.gravity.set(val, settings.gy, settings.gz)
  })
  gui.add(settings, 'gy', -40, 1).onChange(function(val) {
    if (!isNaN(val)) world.gravity.set(settings.gx, val, settings.gz)
  })
  gui.add(settings, 'gz', -40, 40).onChange(function(val) {
    if (!isNaN(val)) world.gravity.set(settings.gx, settings.gy, val)
  })
  gui.add(settings, 'restitution', 0.5, 1).onChange(function(val) {
    if (!isNaN(val)) world.defaultContactMaterial.restitution = val
  })

  gui.close()
  
  world.gravity.set(settings.gx, settings.gy, settings.gz)
  world.broadphase = new CANNON.NaiveBroadphase()

  // cannonDebugRenderer = new CannonDebugRenderer(scene, world)
}
