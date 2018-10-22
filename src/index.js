import * as THREE from 'three'
import * as CANNON from 'cannon'
import OrbitControls from 'orbit-controls-es6';
import { CannonDebugRenderer } from './cannonDebugRenderer'
import { threeToCannon } from 'three-to-cannon';

import keyboardMtl from './materials/model.mtl'
import keyboardObj from './models/model.obj'

import guitarMtl from './materials/guitar.mtl'
import guitarObj from './models/guitar.obj'

import TelecasterMtl from './models/Telecaster.mtl'
import TelecasterObj from './models/Telecaster.obj'

import { addJointBody } from './utils/handleJoints'
import { onMouseMove, onMouseDown, onMouseUp } from './utils/handleInputs'
import { onWindowResize } from './utils/handleResize'
import { loadModel } from './utils/loadModel'

import './index.css'


let cannonDebugRenderer

export let world

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


var planeGeo = new THREE.PlaneGeometry(100, 100);
var invisoMaterial = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, color: 'orange' });
export const gplane = new THREE.Mesh(planeGeo, invisoMaterial);
gplane.name = 'gplane'
// gplane.depthWrite = false
// gplane.renderOrder = 1


// stabalise
gplane.position.copy(0,0,0)
gplane.quaternion.copy(0,0,0)
// gplane.visible = false

var geometry, material, mesh;

export const blockCount = 3;
export const keyboardCount = 2

// To be synced
export const meshes = [] // threejs
export const bodies = [] // cannon



const init = function () {
  // camera
  camera.position.set(20, 60, 20);
  camera.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

  // scene
  scene.fog = new THREE.Fog(0xffffff, 30, 200)
  scene.add(camera)

  // lights
  scene.add(new THREE.AmbientLight(0x666666));
  

  const light = new THREE.DirectionalLight(0xffffff, 1.25);
  const d = 20

  light.position.set(d, d, d);

  light.castShadow = true;

  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;

  light.shadow.camera.far = 3 * d;

  scene.add(light);
  scene.add(gplane)

  // ground
  geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
  //geometry.applyMatrix( new THREE.Matrix4().makeRotationX( -Math.PI / 2 ) );
  material = new THREE.MeshLambertMaterial({ color: 'pink' });
  
  // THREE.ColorUtils.adjustHSV( material.color, 0, 0, 0.9 );
  mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  mesh.receiveShadow = true
  scene.add(mesh);

  // cubes
  const cubeGeo = new THREE.BoxGeometry(1, 1, 1, 10, 10);
  const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xbad455 });

  for (let i = 0; i < blockCount; i++) {
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial)
    cubeMesh.castShadow = true
    meshes.push(cubeMesh)
    scene.add(cubeMesh)
  }

  // loadModel({
  //   name: 'keyboard',
  //   mtl: keyboardMtl,
  //   obj: keyboardObj,
  //   quantity: 2,
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
  
  // loadModel({
  //   name: 'guitar',
  //   mtl: TelecasterMtl,
  //   obj: TelecasterObj,
  //   quantity: 2,
  //   offsets: {
  //     x: -0.2,
  //     y: -4.8,
  //     z: 0.1,
  //   },
  //   position: {
  //     x: Math.random() * 2,
  //     y: Math.random() * 60,
  //     z: Math.random() * 2,
  //   }
  // })
  

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(scene.fog.color);


  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.shadowMap.enabled = true;

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

function render() {
  theta += 0.04

  // if (draggedItem) {
  //   const pos = draggedItem.point

  //   console.log(pos)
    
    
    
  
  //   if (pos) {
  //     setClickMarker(pos.x, pos.y, pos.z)
  //     moveJointToPoint(pos.x, pos.y, pos.z)
  //   }

  // }

  gplane.quaternion.copy(camera.quaternion); // keep the gplane facing us
  
  camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta))
  camera.position.y = THREE.Math.degToRad(360)
  camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta))
  camera.lookAt(scene.position)
  renderer.render(scene, camera)
  
}


function initCannon() {
  // Setup our world
  world = new CANNON.World();
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;
  world.solver.iterations = 2
  console.log(world.defaultContactMaterial)
  world.defaultContactMaterial.contactEquationRelaxation = 3; // lower = ground is lava
  world.defaultContactMaterial.contactEquationStiffness = 1e8;
  world.defaultContactMaterial.restitution = 0.5
  // world.defaultContactMaterial.friction = 1
  
  
  // world.defaultContactMaterial.contactEquationRegularizationTime = 3;


  world.gravity.set(0, -30, 0);
  world.broadphase = new CANNON.NaiveBroadphase();

  // Create boxes
  const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  for (var i = 0; i < blockCount; i++) {
    const boxBody = new CANNON.Body({ mass: 50 });
    console.log(boxBody)
    boxBody.angularDamping = 0.99
    // boxBody.linearDamping = 0.5

    
    boxBody.addShape(boxShape);
    boxBody.position.set(Math.random() * 4, Math.random() * 2, Math.random() * 4);
    world.add(boxBody);
    bodies.push(boxBody);
  }

  // Create a plane
  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({ mass: 0 }) // ground has mass = 0 which makes it static
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.add(groundBody);

  addJointBody()

  cannonDebugRenderer = new CannonDebugRenderer(scene, world);

}


init()
initCannon()
animate()