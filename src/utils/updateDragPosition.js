import * as THREE from 'three'
import getCameraRay from './getCameraRay'
// import { setClickMarker } from './handleClickMarker'
import { lastPos } from './handleInputs'
import { mouseConstraint, moveJointToPoint } from './handleJoints'
import { dragPlane } from '../index'

const tempVec3 = new THREE.Vector3()

export default function() {
   
  if (mouseConstraint) {
    const ray = getCameraRay(new THREE.Vector2(lastPos.x, lastPos.y));

    const pos = dragPlane.intersectLine(
      new THREE.Line3(
        ray.origin,
        ray.origin.clone().add(ray.direction.clone().multiplyScalar(10000))
      ),
      // THREE now requires a target
      // https://github.com/mrdoob/three.js/issues/12231
      // We create it once (above) outside this function
      tempVec3
    )

    // setClickMarker(pos.x, pos.y, pos.z)
    moveJointToPoint(pos.x, pos.y, pos.z)
  }
}