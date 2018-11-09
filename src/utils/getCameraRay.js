// Cannon's own mousepicking example is buggy, (especially noticable with multiple objects)
// http://schteppe.github.io/cannon.js/examples/threejs_mousepick.html
// So instead this project uses the logic found in:
// http://toxicfork.github.io/react-three-renderer-example/#/webgl_physics_mousepick

import * as THREE from 'three'
import { camera } from '../three'

const raycaster = new THREE.Raycaster()
const tempVector2 = new THREE.Vector2()

const getRelativeMouseCoords = function (screenMouseCoords) {

  const relativeMouseCoords = screenMouseCoords
    .clone()
    .sub(tempVector2.set(0, 0))
    .divide(tempVector2.set(window.innerWidth, window.innerHeight))

  relativeMouseCoords.x = relativeMouseCoords.x * 2 - 1
  relativeMouseCoords.y = -relativeMouseCoords.y * 2 + 1

  return relativeMouseCoords
}

export default function (mouseCoords) {
  const relativeMouseCoords = getRelativeMouseCoords(mouseCoords)
  const originalRay = raycaster.ray.clone()

  raycaster.setFromCamera(relativeMouseCoords, camera)

  const resultRay = raycaster.ray.clone()
  raycaster.ray.copy(originalRay)

  return resultRay
}
