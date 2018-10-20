import * as THREE from 'three'
import * as CANNON from 'cannon'
import './index.css';
import { MTLLoader, OBJLoader } from 'three-obj-mtl-loader'
import OrbitControls from 'orbit-controls-es6';
import { CannonDebugRenderer } from './cannonDebugRenderer'
import { threeToCannon } from 'three-to-cannon';

import keyboardMtl from './materials/model.mtl'
import keyboardObj from './models/model.obj'

import guitarMtl from './materials/guitar.mtl'
import guitarObj from './models/guitar.obj'

const mtlLoader = new MTLLoader();
const objLoader = new OBJLoader();


let cannonDebugRenderer

// var cubeMesh

const raycaster = new THREE.Raycaster();

let world;
const dt = 1 / 60;
var entity

// FOV – We’re using 45 degrees for our field of view.
// Apsect – We’re simply dividing the browser width and height to get an aspect ratio.
// Near – This is the distance at which the camera will start rendering scene objects.
// Far – Anything beyond this distance will not be rendered.Perhaps more commonly known as the draw distance.
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 100);
var scene, renderer;

var planeGeo = new THREE.PlaneGeometry(100, 100);
var invisoMaterial = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 });
var gplane = new THREE.Mesh(planeGeo, invisoMaterial);

// stabalise
gplane.position.copy(0,0,0)
gplane.quaternion.copy(0,0,0)
// gplane.visible = false


var markerMaterial = new THREE.MeshLambertMaterial({ color: 0x00cc00 });
var clickMarker = null

var geometry, material, mesh;

var jointBody, constrainedBody, mouseConstraint;

const blockCount = 3;
const keyboardCount = 2

// To be synced
const meshes = [] // threejs
const bodies = [] // cannon

initCannon();
init();
animate();

function init() {

  // scene
  scene = new THREE.Scene();
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

    for (var i = 0; i < keyboardCount; i++) {

      objLoader.load(keyboardObj, (object) => {

        object.traverse(node => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true
            node.receiveShadow = true
          }
        })

        meshes.push(object)
        scene.add(object)
      })
    }
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

function setClickMarker(x, y, z) {
  
  if (!clickMarker) {
    var shape = new THREE.SphereGeometry(0.2, 8, 8);
    clickMarker = new THREE.Mesh(shape, markerMaterial);
    scene.add(clickMarker);
  }
  clickMarker.visible = true;
  clickMarker.position.set(x, y, z);
}

function removeClickMarker() {
  clickMarker.visible = false;
}

function onMouseMove(e) {
  // Move and project on the plane


  if (mouseConstraint) {

    var mouse3D = new THREE.Vector3();

    mouse3D.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse3D.y = - (e.clientY / window.innerHeight) * 2 + 1;
    mouse3D.z = 0.5;

    raycaster.setFromCamera(mouse3D, camera);
    
    var intersects = raycaster.intersectObject(gplane, true);     // gplane, not chidlren

    if (!intersects.length) return
    
    entity = intersects[0]

    const pos = entity.point;

    
    if (pos) {
      setClickMarker(pos.x, pos.y, pos.z);
      moveJointToPoint(pos.x, pos.y, pos.z);
    }
  }
}

function onMouseDown(e) {
  // Find mesh from a ray

  var mouse3D = new THREE.Vector3();

  mouse3D.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse3D.y = - (e.clientY / window.innerHeight) * 2 + 1;
  mouse3D.z = 0.5;

  raycaster.setFromCamera(mouse3D, camera);

  
  // calculate objects intersecting the picking ray

  var intersects = raycaster.intersectObjects(meshes, true); // or scene.children

  entity = intersects[0]
  
  if (!intersects.length) return
  
  const pos = entity.point;
  // console.log(entity.object)
  

  
  // if (pos && entity.object.geometry instanceof THREE.BoxGeometry) {
  if (pos) {
    
    // Set marker on contact point
    setClickMarker(pos.x, pos.y, pos.z);
    
    // Set the movement plane
    setScreenPerpCenter(pos);


    
    var idx = meshes.indexOf(entity.object);
    if (idx !== -1) {
      
      addMouseConstraint(pos.x, pos.y, pos.z, bodies[idx]);
    } else if (entity.object.parent.type === 'Group') {
      var idx2 = meshes.indexOf(entity.object.parent);

      addMouseConstraint(pos.x, pos.y, pos.z, bodies[idx2]);
      
    
    }
  }
}

function onMouseUp(e) {
  // Send the remove mouse joint to server
  removeJointConstraint();

  if (!entity) return
  // remove the marker
  removeClickMarker();
}

// This function creates a virtual movement plane for the mouseJoint to move in
function setScreenPerpCenter(point) {
  // Center at mouse position
  gplane.position.copy(point);

  // Make it face toward the camera
  gplane.quaternion.copy(camera.quaternion);
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
  theta += 0.3
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

  // Joint body
  const jointShape = new CANNON.Sphere(0.1);
  jointBody = new CANNON.Body({ mass: 0 });
  jointBody.addShape(jointShape);
  jointBody.collisionFilterGroup = 0;
  jointBody.collisionFilterMask = 0;
  world.add(jointBody)


}

function addMouseConstraint(x, y, z, body) {
  // The cannon body constrained by the mouse joint
  constrainedBody = body;

  // Vector to the clicked point, relative to the body
  var v1 = new CANNON.Vec3(x, y, z).vsub(constrainedBody.position);

  // Apply anti-quaternion to vector to tranform it into the local body coordinate system
  var antiRot = constrainedBody.quaternion.inverse();
  var pivot = antiRot.vmult(v1); // pivot is not in local body coordinates

  // Move the cannon click marker particle to the click position
  jointBody.position.set(x, y, z);

  // Create a new constraint
  // The pivot for the jointBody is zero
  mouseConstraint = new CANNON.PointToPointConstraint(constrainedBody, pivot, jointBody, new CANNON.Vec3(0, 0, 0));

  // Add the constriant to world
  world.addConstraint(mouseConstraint);
}

// This functions moves the transparent joint body to a new postion in space
function moveJointToPoint(x, y, z) {
  // Move the joint body to a new position
  jointBody.position.set(x, y, z);
  mouseConstraint.update();
}

function removeJointConstraint() {
  // Remove constriant from world
  world.removeConstraint(mouseConstraint);
  mouseConstraint = false;
}
