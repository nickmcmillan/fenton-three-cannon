import * as CANNON from 'cannon'
import { CannonDebugRenderer } from './helpers/cannonDebugRenderer'
import { meshes, scene } from './three'

export const world = new CANNON.World()
export const bodies = []
export let cannonDebugRenderer

const timeStep = 1 / 60
export const updatePhysics = function () {
  world.step(timeStep)
  for (var i = 0; i < meshes.length; i++) {
    // check if the body falls below the ground
    // if so, reset its velocity & position
    const outY = bodies[i].position.y < -10
    if (outY) {
      bodies[i].velocity.set(Math.random(), Math.random(), Math.random())
      bodies[i].position.set(0, 20, 0)
      bodies[i].angularVelocity.set(0, 0, 0.5)
    }
    // get the Three mesh, and apply the Cannon body to it
    meshes[i].position.copy(bodies[i].position)
    meshes[i].quaternion.copy(bodies[i].quaternion)
  }
}

export default function () {
  // Setup our world
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;
  // world.solver.iterations = 2
  world.defaultContactMaterial.contactEquationRelaxation = 3; // lower = ground is lava
  world.defaultContactMaterial.contactEquationStiffness = 1e8;
  world.defaultContactMaterial.restitution = 0.5
  world.defaultContactMaterial.friction = 0.1  
  // world.defaultContactMaterial.contactEquationRegularizationTime = 3;

  world.gravity.set(0, -40, 0);
  world.broadphase = new CANNON.NaiveBroadphase();

  cannonDebugRenderer = new CannonDebugRenderer(scene, world)
  // addJointBody()
}
