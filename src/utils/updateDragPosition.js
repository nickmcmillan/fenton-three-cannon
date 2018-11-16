import { Vector3, Vector2, Line3 } from 'three'
import getCameraRay from './getCameraRay'
import { lastPos } from './handleInputs'
import { mouseConstraint, moveJointToPoint } from './handleJoints'
import { dragPlane } from '../three'

const vec3 = new Vector3()

export default function() {
  if (mouseConstraint) {
    const ray = getCameraRay(new Vector2(lastPos.x, lastPos.y))
    
    const { x, y, z } = dragPlane.intersectLine(
      new Line3(
        ray.origin,
        ray.origin.clone().add(ray.direction.clone().multiplyScalar(10000))
      ),
      // THREE now requires a target
      // https://github.com/mrdoob/three.js/issues/12231
      // We create it once (above) outside this function
      vec3
    )

    moveJointToPoint(x, y, z)
  }
}
