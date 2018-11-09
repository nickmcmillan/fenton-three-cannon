import * as CANNON from 'cannon'
import { world } from '../cannon'

const jointBody = new CANNON.Body({ 
  mass: 0,
  angularDamping: 0.01,
  // shape: new CANNON.Sphere(0.1),
  collisionFilterGroup: 0,
  collisionFilterMask: 0,
})


export let mouseConstraint

export const addMouseConstraint = function (x, y, z, constrainedBody) {
  
  
  // constrainedBody = The cannon body constrained by the mouse joint

  // Vector to the clicked point, relative to the body
  const v1 = new CANNON.Vec3(x, y, z).vsub(constrainedBody.position)

  // Apply anti-quaternion to vector to tranform it into the local body coordinate system
  const antiRot = constrainedBody.quaternion.inverse()  
  const pivot = antiRot.vmult(v1) // pivot is not in local body coordinates
  
  // Move the cannon click marker particle to the click position
  jointBody.position.set(x, y, z)

  // Create a new constraint
  // The pivot for the jointBody is zero
  mouseConstraint = new CANNON.PointToPointConstraint(constrainedBody, pivot, jointBody, new CANNON.Vec3(0, 0, 0))  

  // Add the constriant to world
  world.addConstraint(mouseConstraint)
}


// This functions moves the transparent joint body to a new postion in space
export const moveJointToPoint = function (x, y, z) {
  
  // Move the joint body to a new position
  jointBody.position.set(x, y, z)
  mouseConstraint.update()
}

export const removeJointConstraint = function () {
  // Remove constriant from world
  world.removeConstraint(mouseConstraint)
  mouseConstraint = false
}

// export const addJointBody = function() {
//   world.add(jointBody)
// }