import * as THREE from 'three'
// import EffectComposer, { RenderPass, ShaderPass } from 'three-effectcomposer-es6'
// import { SMAAEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing'

import initCannon, { updatePhysics, cannonDebugRenderer } from './cannon'
import initThree, { camera, scene, renderer } from './three'
import addModels from './addModels'
import stats from './helpers/stats'

import updateDragPosition from './utils/updateDragPosition'


import './index.scss'

// const clock = new THREE.Clock()
// const composer = new EffectComposer(renderer)
// const effectPass = new EffectPass(camera, new SMAAEffect())
// effectPass.renderToScreen = true
// composer.addPass(new RenderPass(scene, camera))
// composer.addPass(effectPass)


let theta = 6
const radius = 20

const render = function () {
  theta += 0.06
  
  camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta))
  camera.position.y = THREE.Math.degToRad(360 * 2.5)
  camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta))
  camera.lookAt(scene.position)
  renderer.render(scene, camera)
  // composer.render(clock.getDelta())
  
  updateDragPosition() // keeps the drag position updated even when the camera moves
}

const loop = function () {
  stats.begin()
  updatePhysics()
  render()
  // cannonDebugRenderer.update()
  stats.end()
  requestAnimationFrame(loop)
}

initThree()
initCannon()
loop()
addModels()
