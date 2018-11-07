import * as THREE from 'three'
import getCameraRay from './getCameraRay'
import { setClickMarker } from './handleClickMarker'
import { lastPos } from './handleInputs'
import { mouseConstraint, moveJointToPoint } from './handleJoints'
import { dragPlane } from '../index'

export default function() {
   
  if (mouseConstraint) {
    const ray = getCameraRay(new THREE.Vector2(lastPos.x, lastPos.y));

    const pos = dragPlane.intersectLine(
      new THREE.Line3(
        ray.origin,
        ray.origin.clone().add(ray.direction.clone().multiplyScalar(10000))
      )
    )

    setClickMarker(pos.x, pos.y, pos.z)
    moveJointToPoint(pos.x, pos.y, pos.z)
  }
}