import * as THREE from 'three'

// import { SMAAEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing'

import initCannon, { updatePhysics /*cannonDebugRenderer*/ } from './cannon'
import initThree, { camera, scene, renderer } from './three'
import addItems from './addItems'
import datgui, { settings } from './datgui'
// import stats from './helpers/stats'

import updateDragPosition from './utils/updateDragPosition'


import './index.scss'
import * as serviceWorker from './serviceWorker';

// const clock = new Clock()
// const composer = new EffectComposer(renderer)
// const effectPass = new EffectPass(camera, new SMAAEffect())
// effectPass.renderToScreen = true
// composer.addPass(new RenderPass(scene, camera))
// composer.addPass(effectPass)

const render = function () {

  renderer.render(scene, camera)
  // composer.render(clock.getDelta())
  
  
}

const update = function () {
  if (settings.autoRotate) settings.theta += 0.06
  camera.position.x = settings.radius * Math.sin(THREE.Math.degToRad(settings.theta))
  camera.position.y = THREE.Math.degToRad(360 * settings.height)
  camera.position.z = settings.radius * Math.cos(THREE.Math.degToRad(settings.theta))
  camera.lookAt(scene.position)
  updateDragPosition() // keeps the drag position updated even when the camera moves
}


initThree()
initCannon()
addItems()
datgui()


renderer.setAnimationLoop(function () {
  // stats.begin()
  updatePhysics()
  update()
  render()
  // cannonDebugRenderer.update()
  // stats.end()
})


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();

