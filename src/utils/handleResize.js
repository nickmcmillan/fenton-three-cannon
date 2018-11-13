import { camera, renderer } from '../three'

export const onWindowResize = function () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  //controls.handleResize()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
