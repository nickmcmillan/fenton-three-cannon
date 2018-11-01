import * as THREE from 'three'
import { camera } from '../index'

const raycaster = new THREE.Raycaster()
const tempVector2 = new THREE.Vector2()

const _getRelativeMouseCoords = function (screenMouseCoords) {

  const relativeMouseCoords = screenMouseCoords.clone()
    .sub(tempVector2.set(0, 0))
    .divide(tempVector2.set(window.innerWidth, window.innerHeight))

  // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
  // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1

  relativeMouseCoords.x = relativeMouseCoords.x * 2 - 1
  relativeMouseCoords.y = -relativeMouseCoords.y * 2 + 1

  return relativeMouseCoords
}

export const getCameraRay = function (mouseCoords) {
  const relativeMouseCoords = _getRelativeMouseCoords(mouseCoords)

  const originalRay = raycaster.ray.clone()

  raycaster.setFromCamera(relativeMouseCoords, camera)

  const resultRay = raycaster.ray.clone()

  raycaster.ray.copy(originalRay)

  return resultRay
}