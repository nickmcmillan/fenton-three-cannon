import * as THREE from 'three'
import * as CANNON from 'cannon'
import OrbitControls from 'orbit-controls-es6';
import { CannonDebugRenderer } from './cannonDebugRenderer'
// import { threeToCannon } from 'three-to-cannon';

import keyboardMtl from './materials/model.mtl'
import keyboardObj from './models/model.obj'

import guitarMtl from './materials/guitar.mtl'
import guitarObj from './models/guitar.obj'

import op1Gltf from './models/op1d.gltf'
import bunny from './models/bunny.drc'
// import op1Bin from './models/op1.bin'

import TelecasterMtl from './models/Telecaster.mtl'
import TelecasterObj from './models/Telecaster.obj'

import { addJointBody, mouseConstraint, moveJointToPoint } from './utils/handleJoints'
import { onMouseMove, onMouseDown, onMouseUp, lastPos  } from './utils/handleInputs'
import { onWindowResize } from './utils/handleResize'
import { loadModel } from './utils/loadModel'
import { loadG } from './utils/loadG'
import { addGround } from './add/addGround'
import { setClickMarker, initClickMarker } from './utils/handleClickMarker'

import { getCameraRay } from './utils/getCameraRay'

import './index.css'


let cannonDebugRenderer

export const world = new CANNON.World()

const timeStep = 1 / 60;


// FOV – We’re using 45 degrees for our field of view.
// Apsect – We’re simply dividing the browser width and height to get an aspect ratio.
// Near – This is the distance at which the camera will start rendering scene objects.
// Far – Anything beyond this distance will not be rendered.Perhaps more commonly known as the draw distance.
export const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
})

export const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 100);
export const scene = new THREE.Scene()


const planeGeo = new THREE.PlaneGeometry(100, 100);
const invisoMaterial = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, color: 'orange' });
// export const gplane = new THREE.Mesh(planeGeo, invisoMaterial);
export const backVector = new THREE.Vector3(0, 0, -1);
export const gplane = new THREE.Plane()
console.log(gplane)

gplane.name = 'gplane'
// gplane.depthWrite = false
// gplane.renderOrder = 1


// stabalise
// gplane.position.copy(0,0,0)
// gplane.quaternion.copy(0,0,0)
// gplane.visible = false



export const cubeCount = 1;
export const keyboardCount = 1

// To be synced
export const meshes = [] // threejs
export const bodies = [] // cannon



const init = function () {
  // camera
  camera.position.set(20, 60, 20);
  camera.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
  scene.add(camera)

  // scene
  scene.fog = new THREE.Fog(0xccffff, 30, 100)

  // lights
  scene.add(new THREE.AmbientLight(0x666666));
  

  const light = new THREE.DirectionalLight(0xffffff, 1.25);
  const d = 20

  light.position.set(d, d, d)

  light.castShadow = true;

  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;

  light.shadow.camera.far = 3 * d;

  scene.add(light)
  // scene.add(gplane)

  addGround()

  // cubes
  const cubeGeo = new THREE.BoxGeometry(1, 1, 1, 10, 10);
  const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xbad455 });

  for (let i = 0; i < cubeCount; i++) {
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial)
    cubeMesh.castShadow = true
    cubeMesh.name = `cube-${i}`
    meshes.push(cubeMesh)
    scene.add(cubeMesh)
  }

  loadModel({
    name: 'keyboard',
    mtl: keyboardMtl,
    obj: keyboardObj,
    quantity: keyboardCount,
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

  // loadG({
  //   name: 'op1',
  //   gltf: bunny,
  //   // bin: op1Bin,
  //   quantity: 1,
  //   offsets: {
  //     x: -0.75,
  //     y: -0.3,
  //     z: 0,
  //   },

  //   position: {
  //     x: Math.random() * 2,
  //     y: Math.random() * 60,
  //     z: Math.random() * 2,
  //   }
  // })
  
  loadModel({
    name: 'guitar',
    mtl: TelecasterMtl,
    obj: TelecasterObj,
    quantity: 1,
    offsets: {
      x: -0.2,
      y: -4.8,
      z: 0.1,
    },
    position: {
      x: Math.random() * 2,
      y: Math.random() * 60,
      z: Math.random() * 2,
    }
  })
  

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(scene.fog.color);


  // renderer.gammaInput = true;

  renderer.shadowMap.enabled = true;
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;


  window.addEventListener('resize', onWindowResize, false)

  window.addEventListener('mousemove', onMouseMove, false)
  window.addEventListener('mousedown', onMouseDown, false)
  window.addEventListener('mouseup', onMouseUp, false)

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false;
  controls.maxDistance = 1500;
  controls.minDistance = 0;

}


function animate() {
  //controls.update();
  updatePhysics();
  render();
  requestAnimationFrame(animate);
  cannonDebugRenderer.update();
}


function updatePhysics() {
  world.step(timeStep)
  for (var i = 0; i < meshes.length; i++) {
    meshes[i].position.copy(bodies[i].position)
    meshes[i].quaternion.copy(bodies[i].quaternion)
  }
}

let theta = 30
const radius = 20

const updateDragPosition = function() {
   
  if (mouseConstraint) {
    const ray = getCameraRay(new THREE.Vector2(lastPos.x, lastPos.y));

    const dragPos = gplane.intersectLine(
      new THREE.Line3(ray.origin, ray.origin
        .clone()
        .add(ray.direction
          .clone()
          .multiplyScalar(10000))));
    console.log(dragPos)
    setClickMarker(dragPos.x, dragPos.y, dragPos.z)
    moveJointToPoint(dragPos.x, dragPos.y, dragPos.z)
  }
}

function render() {
  theta += 0.04

  updateDragPosition() // could be expensive

  
  camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta))
  camera.position.y = THREE.Math.degToRad(360)
  camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta))
  camera.lookAt(scene.position)
  // gplane.quaternion.copy(camera.quaternion); // keep the gplane facing us
  renderer.render(scene, camera)
  
}


function initCannon() {
  // Setup our world
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;
  // world.solver.iterations = 2
  // console.log(world.defaultContactMaterial)
  world.defaultContactMaterial.contactEquationRelaxation = 3; // lower = ground is lava
  world.defaultContactMaterial.contactEquationStiffness = 1e8;
  world.defaultContactMaterial.restitution = 0.5
  // world.defaultContactMaterial.friction = 1
  
  
  // world.defaultContactMaterial.contactEquationRegularizationTime = 3;


  world.gravity.set(0, -30, 0);
  world.broadphase = new CANNON.NaiveBroadphase();

  // Create boxes
  const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  for (var i = 0; i < cubeCount; i++) {
    const boxBody = new CANNON.Body({ mass: 50 });
    boxBody.name = `cube-${i}`
    // console.log(boxBody)
    boxBody.angularDamping = 0.99
    // boxBody.linearDamping = 0.5

    
    boxBody.addShape(boxShape);
    boxBody.position.set(Math.random() * 4, Math.random() * 2, Math.random() * 4);
    world.add(boxBody);
    bodies.push(boxBody);
  }


  addJointBody()

  cannonDebugRenderer = new CannonDebugRenderer(scene, world)

}


init()
initCannon()
animate()
initClickMarker()