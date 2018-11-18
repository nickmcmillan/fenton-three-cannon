import { Math as MathThree } from 'three'

// import { SMAAEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing'

import initCannon, { updatePhysics, /*cannonDebugRenderer*/ } from './cannon'
import initThree, { camera, scene, renderer } from './three'
import addItems from './addItems'
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


let theta = 15
const radius = 20

const render = function () {
  theta += 0.06
  
  camera.position.x = radius * Math.sin(MathThree.degToRad(theta))
  camera.position.y = MathThree.degToRad(360 * 2.5)
  camera.position.z = radius * Math.cos(MathThree.degToRad(theta))
  camera.lookAt(scene.position)
  renderer.render(scene, camera)
  // composer.render(clock.getDelta())
  
  updateDragPosition() // keeps the drag position updated even when the camera moves
}

const loop = function () {
  // stats.begin()
  updatePhysics()
  render()
  // cannonDebugRenderer.update()
  // stats.end()
  requestAnimationFrame(loop)
}

initThree()
initCannon()
loop()
addItems()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();

