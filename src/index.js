import { Math as MathThree } from 'three'
import { GUI } from 'dat.gui'
// import { SMAAEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing'

import initCannon, { updatePhysics, world /*cannonDebugRenderer*/ } from './cannon'
import initThree, { camera, scene, renderer } from './three'
import addItems from './addItems'
// import stats from './helpers/stats'

import updateDragPosition from './utils/updateDragPosition'


import './index.scss'
import * as serviceWorker from './serviceWorker';

const gui = new GUI()

// const clock = new Clock()
// const composer = new EffectComposer(renderer)
// const effectPass = new EffectPass(camera, new SMAAEffect())
// effectPass.renderToScreen = true
// composer.addPass(new RenderPass(scene, camera))
// composer.addPass(effectPass)

export const settings = {
  // physics
  gx: 0,
  gy: -40,
  gz: 0,
  restitution: 0.25,
  contactEquationStiffness: 1e7,
  // camera
  theta: 15,
  radius: 20,
  height: 2.5,
  autoRotate: true,
}

const render = function () {

  if (settings.autoRotate) {
    settings.theta += 0.06    
  }
  camera.position.x = settings.radius * Math.sin(MathThree.degToRad(settings.theta))
  camera.position.y = MathThree.degToRad(360 * settings.height)
  camera.position.z = settings.radius * Math.cos(MathThree.degToRad(settings.theta))
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

const initDatGui = function() {

  const folderCamera = gui.addFolder('camera')
  
  folderCamera.add(settings, 'theta', -180, 180).onChange(function (val) {
    if (!isNaN(val)) settings.theta = val
  })
  folderCamera.add(settings, 'radius', -40, 40).onChange(function (val) {
    if (!isNaN(val)) settings.radius = val
  })
  folderCamera.add(settings, 'height', 0, 10).onChange(function (val) {
    if (!isNaN(val)) settings.height = val
  })
  folderCamera.add(settings, 'autoRotate').onChange(function (val) {
    settings.autoRotate = val
  })

  const folderPhysics = gui.addFolder('physics')
  folderPhysics.add(settings, 'gx', -40, 40).onChange(function (val) {
    if (!isNaN(val)) world.gravity.set(val, settings.gy, settings.gz)
  })
  folderPhysics.add(settings, 'gy', -40, 1).onChange(function (val) {
    if (!isNaN(val)) world.gravity.set(settings.gx, val, settings.gz)
  })
  folderPhysics.add(settings, 'gz', -40, 40).onChange(function (val) {
    if (!isNaN(val)) world.gravity.set(settings.gx, settings.gy, val)
  })
  folderPhysics.add(settings, 'restitution', 0.5, 2).onChange(function (val) {
    if (!isNaN(val)) world.defaultContactMaterial.restitution = val
  })
  folderPhysics.add(settings, 'contactEquationStiffness', 1e3, 1e7).onChange(function (val) {
    if (!isNaN(val)) world.defaultContactMaterial.contactEquationStiffness = val
  })
  
  gui.close()
}


initThree()
initCannon()
loop()
addItems()
initDatGui()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();

