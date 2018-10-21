import * as THREE from 'three'
import * as CANNON from 'cannon'
import { MTLLoader, OBJLoader } from 'three-obj-mtl-loader'
import OrbitControls from 'orbit-controls-es6';
import { CannonDebugRenderer } from './cannonDebugRenderer'
import { threeToCannon } from 'three-to-cannon';

import keyboardMtl from './materials/model.mtl'
import keyboardObj from './models/model.obj'

import guitarMtl from './materials/guitar.mtl'
import guitarObj from './models/guitar.obj'

import { addJointBody } from './utils/handleJoints'
import { onMouseMove, onMouseDown, onMouseUp } from './utils/handleInputs'

import './index.css'
const mtlLoader = new MTLLoader();
const objLoader = new OBJLoader();


let cannonDebugRenderer

export let world

const dt = 1 / 60;


// FOV – We’re using 45 degrees for our field of view.
// Apsect – We’re simply dividing the browser width and height to get an aspect ratio.
// Near – This is the distance at which the camera will start rendering scene objects.
// Far – Anything beyond this distance will not be rendered.Perhaps more commonly known as the draw distance.
var renderer;

export const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 100);
export const scene = new THREE.Scene()


var planeGeo = new THREE.PlaneGeometry(100, 100);
var invisoMaterial = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 });
export const gplane = new THREE.Mesh(planeGeo, invisoMaterial);

// stabalise
gplane.position.copy(0,0,0)
gplane.quaternion.copy(0,0,0)
// gplane.visible = false

var geometry, material, mesh;

const blockCount = 3;
const keyboardCount = 2

// To be synced
export const meshes = [] // threejs
export const bodies = [] // cannon

initCannon();
init();
animate();

async function init() {

  // scene
  
  scene.fog = new THREE.Fog(0xffffff, 30, 200);

  // camera
  
  camera.position.set(20, 60, 20);
  camera.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
  scene.add(camera);

  // lights

  scene.add(new THREE.AmbientLight(0x666666));
  scene.add(gplane);

  const light = new THREE.DirectionalLight(0xffffff, 1.25);
  var d = 20;

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

  // floor
  geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
  //geometry.applyMatrix( new THREE.Matrix4().makeRotationX( -Math.PI / 2 ) );
  material = new THREE.MeshLambertMaterial({ color: 0xffffff });
  
  // THREE.ColorUtils.adjustHSV( material.color, 0, 0, 0.9 );
  mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  mesh.receiveShadow = true;
  scene.add(mesh);

  // cubes
  const cubeGeo = new THREE.BoxGeometry(1, 1, 1, 10, 10);
  const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xbad455 });

  for (let i = 0; i < blockCount; i++) {

    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
    cubeMesh.castShadow = true;
    meshes.push(cubeMesh);
    scene.add(cubeMesh);
  }
  
  mtlLoader.load(keyboardMtl, materials => {
    
    materials.preload()
    objLoader.setMaterials(materials)

    objLoader.load(keyboardObj, (object) => {

      object.traverse(node => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true
          node.receiveShadow = true
        }
      })

      for (var i = 0; i < keyboardCount; i++) {
        const newObj = object.clone()       

        meshes.push(newObj)
        scene.add(newObj)
      }
    })
  })


  renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('canvas'),
    antialias: true,
  })

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(scene.fog.color);


  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.shadowMap.enabled = true;

  window.addEventListener('resize', onWindowResize, false);

  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mouseup", onMouseUp, false);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false;
  controls.maxDistance = 1500;
  controls.minDistance = 0;

  cannonDebugRenderer = new CannonDebugRenderer(scene, world);
  
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  //controls.handleResize();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


function animate() {
  //controls.update();
  updatePhysics();
  render();
  requestAnimationFrame(animate);
  cannonDebugRenderer.update();
}


function updatePhysics() {
  world.step(dt);
  for (var i = 0; i !== meshes.length; i++) {    
    meshes[i].position.copy(bodies[i].position);
    meshes[i].quaternion.copy(bodies[i].quaternion);
  }
}

let theta = 30
const radius = 20

function render() {
  theta += 0.1

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

const objectLoader = () => {
  
}

function initCannon() {
  // Setup our world
  world = new CANNON.World();
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;

  world.gravity.set(0, -16, 0);
  world.broadphase = new CANNON.NaiveBroadphase();

  // Create boxes
  const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  for (var i = 0; i < blockCount; i++) {
    const boxBody = new CANNON.Body({ mass: 5 });
    boxBody.addShape(boxShape);
    boxBody.position.set(Math.random() * 4, Math.random() * 2, Math.random() * 4);
    world.add(boxBody);
    bodies.push(boxBody);
  }

  objLoader.load(keyboardObj, (object) => {

    // const keyboardShapeold = new CANNON.Box(new CANNON.Vec3(5, 1, 9))
    
    const keyboardShape = threeToCannon(object);
    for (var i = 0; i < keyboardCount; i++) {
      const keyboardBody = new CANNON.Body({ mass: 0.5 })

  
      keyboardBody.addShape(keyboardShape);
      keyboardBody.position.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
  
      // keyboardBody.quaternion.setFromAxisAngle(new CANNON.Vec3(3, 4, 10), 1);
      world.add(keyboardBody);
      bodies.push(keyboardBody);
    }

  })


  // Create a plane
  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.add(groundBody);

  addJointBody()

}
