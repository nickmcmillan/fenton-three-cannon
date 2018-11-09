import * as THREE from 'three'
// import EffectComposer, { RenderPass, ShaderPass } from 'three-effectcomposer-es6'
// import { SMAAEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing'

import initCannon, { updatePhysics, cannonDebugRenderer } from './cannon'
import initThree, { camera, scene, renderer } from './three'
import stats from './helpers/stats'

import updateDragPosition from './utils/updateDragPosition'

// Adders
import { addCube } from './add/addCube'
import { addSphere } from './add/addSphere'
import { loadG } from './add/loadG'

// Models
import hihat from './models/hihat.glb'
import snare from './models/snare.glb'
import kick from './models/kick.glb'
import jupiter from './models/jupiter.glb'
import op1 from './models/op2.glb'
import mustang from './models/mustang.glb'
import pedal from './models/pedal.glb'
// import amp from './models/amp.glb'
import bass from './models/bass.glb'


import './index.scss'

// const clock = new THREE.Clock();

// const composer = new EffectComposer(renderer);

// const effectPass = new EffectPass(camera, new SMAAEffect());
// effectPass.renderToScreen = true;

// composer.addPass(new RenderPass(scene, camera))
// composer.addPass(effectPass);


function loop() {
  stats.begin()
  updatePhysics()
  render()
  cannonDebugRenderer.update()
  stats.end()
  requestAnimationFrame(loop)
}



let theta = 6
const radius = 20

function render() {
  theta += 0.05

  updateDragPosition() // keeps the drag position updated even when the camera moves

  camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta))
  camera.position.y = THREE.Math.degToRad(360 * 2.5)
  camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta))
  camera.lookAt(scene.position)
  renderer.render(scene, camera);
  // composer.render(clock.getDelta());
}

initThree()
initCannon()
loop()


// and now we add stuff

addCube({
  name: 'cube',
  quantity: 3
})

addSphere({
  name: 'sphere',
  quantity: 25,
  // radius: Math.random(),
  color: 'yellow',//'#' + Math.floor(Math.random() * 16777215).toString(16)
})


loadG({
  name: 'op1',
  gltf: op1,
  mass: 1,
  quantity: 1,
  offsets: {
    x: -0.75,
    y: -0.3,
    z: 0,
  },

  position: {
    x: Math.random() * 2,
    y: Math.random() * 60,
    z: Math.random() * 2,
  }
})

loadG({
  name: 'mustang',
  gltf: mustang,
  quantity: 1,
  mass: 5,
  position: {
    x: Math.random() * 2,
    y: Math.random() * 30,
    z: Math.random() * 2,
  }
})

loadG({
  name: 'pedal',
  gltf: pedal,
  mass: 1,
  quantity: 10,
  position: {
    x: Math.random() * 20,
    y: Math.random() * 30,
    z: Math.random() * 20,
  }
})

// loadG({
//   name: 'amp',
//   gltf: amp,
//   quantity: 1,
//   position: {
//     x: Math.random() * 2,
//     y: Math.random() * 30,
//     z: Math.random() * 2,
//   }
// })

loadG({
  name: 'bass',
  gltf: bass,
  mass: 8,
  quantity: 1,
  position: {
    x: Math.random() * 15,
    y: Math.random() * 30,
    z: Math.random() * 15,
  }
})

loadG({
  name: 'hihat',
  gltf: hihat,
  quantity: 1,
  position: {
    x: Math.random() * 15,
    y: Math.random() * 30,
    z: Math.random() * 15,
  }
})

loadG({
  name: 'snare',
  gltf: snare,
  quantity: 1,
  position: {
    x: Math.random() * 15,
    y: Math.random() * 30,
    z: Math.random() * 15,
  }
})

loadG({
  name: 'kick',
  gltf: kick,
  mass: 20,
  quantity: 1,
  position: {
    x: Math.random() * 15,
    y: Math.random() * 30,
    z: Math.random() * 15,
  }
})

loadG({
  name: 'jupiter',
  gltf: jupiter,
  mass: 5,
  quantity: 1,
  position: {
    x: Math.random() * 15,
    y: Math.random() * 30,
    z: Math.random() * 15,
  }
})