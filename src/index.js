import * as THREE from 'three'
// import EffectComposer, { RenderPass, ShaderPass } from 'three-effectcomposer-es6'
// import { SMAAEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing'
import * as CANNON from 'cannon'

// import OrbitControls from 'orbit-controls-es6';
import { CannonDebugRenderer } from './cannonDebugRenderer'

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

import { onMouseMove, onMouseDown, onMouseUp  } from './utils/handleInputs'
import { onWindowResize } from './utils/handleResize'
import updateDragPosition from './utils/updateDragPosition'
// import { loadModel } from './utils/loadModel'
import { loadG } from './add/loadG'
import { addGround } from './add/addGround'
import { initClickMarker } from './utils/handleClickMarker'

import stats from './helpers/stats'

// import { addCube } from './utils/addCube';
import { addSphere } from './add/addSphere';


import './index.css'


let cannonDebugRenderer

export const world = new CANNON.World()

const timeStep = 1 / 60;


export const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
})


// renderer.setPixelRatio(window.devicePixelRatio )
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);


// renderer.gammaInput = true;

renderer.shadowMap.enabled = true;
// shadowMapType options are THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
renderer.shadowMapType = THREE.PCFSoftShadowMap;


renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;



// FOV – We’re using 45 degrees for our field of view.
// Apsect – We’re simply dividing the browser width and height to get an aspect ratio.
// Near – This is the distance at which the camera will start rendering scene objects.
// Far – Anything beyond this distance will not be rendered. Perhaps more commonly known as the draw distance.
export const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 60);
export const scene = new THREE.Scene()

export const dragPlane = new THREE.Plane()
dragPlane.name = 'dragPlane'

// These are kept in sync
export const meshes = [] // Three
export const bodies = [] // Cannon

// const clock = new THREE.Clock();

// const composer = new EffectComposer(renderer);

// const effectPass = new EffectPass(camera, new SMAAEffect());
// effectPass.renderToScreen = true;

// composer.addPass(new RenderPass(scene, camera))
// composer.addPass(effectPass);



const init = function () {
  // camera
  camera.position.set(20, 60, 20);
  camera.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
  scene.add(camera)

  // scene
  // scene.fog = new THREE.Fog(0xccffff, 30, 100)

  // lights
  scene.add(new THREE.AmbientLight(0x666666));
  

  const light = new THREE.DirectionalLight(0xffffff, 1.25);
  const d = 20

  light.position.set(d, d, d)

  light.castShadow = true;

  light.shadow.mapSize.width = 1024  // default is 512
  light.shadow.mapSize.height = 1024  // default is 512

  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;

  light.shadow.camera.far = 3 * d;

  scene.add(light)

  addGround()

  loadG({
    name: 'op1',
    gltf: op1,
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
    position: {
      x: Math.random() * 2,
      y: Math.random() * 30,
      z: Math.random() * 2,
    }
  })
  
  loadG({
    name: 'pedal',
    gltf: pedal,
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
    quantity: 1,
    position: {
      x: Math.random() * 15,
      y: Math.random() * 30,
      z: Math.random() * 15,
    }
  })
  

  // addCube({
  //   name: 'cube',
  //   quantity: 5
  // })

  addSphere({
    name: 'sphere',
    quantity: 25,
    // radius: Math.random(),
    color: 'yellow',//'#' + Math.floor(Math.random() * 16777215).toString(16)
  })
  

  window.addEventListener('resize', onWindowResize, false)

  window.addEventListener('mousedown', onMouseDown, false)
  window.addEventListener('mousemove', onMouseMove, false)
  window.addEventListener('mouseup', onMouseUp, false)
  window.addEventListener('touchstart', onMouseDown, false)
  window.addEventListener('touchmove', onMouseMove, { passive: false })
  window.addEventListener('touchend', onMouseUp, false)

  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.enabled = false;
  // controls.maxDistance = 1500;
  // controls.minDistance = 0;


}


function animate() {
  stats.begin()
  //controls.update()
  updatePhysics()
  render()
  // cannonDebugRenderer.update()
  stats.end()
  requestAnimationFrame(animate)
}

function updatePhysics() {
  world.step(timeStep)
  for (var i = 0; i < meshes.length; i++) {
    // check if the body falls below the ground
    const outY = bodies[i].position.y < -10
    // if so, reset its velocity & position
    if (outY) {
      bodies[i].velocity.set(Math.random(), Math.random(), Math.random())
      bodies[i].position.set(0, 20, 0)
    }
    // get the Three mesh, and apply the Cannon body to it
    meshes[i].position.copy(bodies[i].position)
    meshes[i].quaternion.copy(bodies[i].quaternion)
  }
}

let theta = 6
const radius = 20



function render() {
  theta += 0.05

  updateDragPosition() // could be expensive

  camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta))
  camera.position.y = THREE.Math.degToRad(360 * 2.5)
  camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta))
  camera.lookAt(scene.position)
  renderer.render(scene, camera);

  // composer.render(clock.getDelta());
  
}


function initCannon() {
  // Setup our world
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;
  // world.solver.iterations = 2
  world.defaultContactMaterial.contactEquationRelaxation = 3; // lower = ground is lava
  world.defaultContactMaterial.contactEquationStiffness = 1e8;
  world.defaultContactMaterial.restitution = 0.5
  world.defaultContactMaterial.friction = 0.1  
  // world.defaultContactMaterial.contactEquationRegularizationTime = 3;

  world.gravity.set(0, -40, 0);
  world.broadphase = new CANNON.NaiveBroadphase();

  // addJointBody()
  cannonDebugRenderer = new CannonDebugRenderer(scene, world)
}


init()
initCannon()
animate()
initClickMarker()