import * as CANNON from 'cannon'
import { CannonDebugRenderer } from './helpers/cannonDebugRenderer'
import { scene } from './index'

export const world = new CANNON.World()

export let cannonDebugRenderer

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

  // addJointBody()

  cannonDebugRenderer = new CannonDebugRenderer(scene, world)
  
}