import * as THREE from 'three'
import * as CANNON from 'cannon'

import './index.css';

var cubeMesh
var boxBody

var raycaster = new THREE.Raycaster();

var world;
var dt = 1 / 60;
var entity

// FOV – We’re using 45 degrees for our field of view.
// Apsect – We’re simply dividing the browser width and height to get an aspect ratio.
// Near – This is the distance at which the camera will start rendering scene objects.
// Far – Anything beyond this distance will not be rendered.Perhaps more commonly known as the draw distance.
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 100);
var scene, renderer;

var planeGeo = new THREE.PlaneGeometry(100, 100);
var invisomaterial = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 });
var gplane = new THREE.Mesh(planeGeo, invisomaterial);

// stabalise
gplane.position.copy(0,0,0)
gplane.quaternion.copy(0,0,0)
// gplane.visible = false


var markerMaterial = new THREE.MeshLambertMaterial({ color: 0x00cc00 });
var clickMarker = false

var geometry, material, mesh;

var jointBody, constrainedBody, mouseConstraint;

var blockCount = 10;

var container = document.createElement('div');

// To be synced
var meshes = [], bodies = [];

// var planeGeo = new THREE.PlaneGeometry(100, 100);
// var plane = gplane = new THREE.Mesh(planeGeo, material);
// plane.visible = false; // Hide it..


initCannon();
init();
animate();

function init() {
  document.body.appendChild(container);

  // scene
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 500, 10000);

  // camera
  
  camera.position.set(10, 2, 0);
  camera.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
  scene.add(camera);

  // lights
  var light;
  scene.add(new THREE.AmbientLight(0x666666));
  scene.add(gplane);

  light = new THREE.DirectionalLight(0xffffff, 1.75);
  var d = 20;

  light.position.set(d, d, d);

  light.castShadow = true;
  //light.shadowCameraVisible = true;

  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;

  light.shadow.camera.far = 3 * d;
  light.shadow.camera.near = d;
  // light.shadow.camera./arkness = 0.5;

  scene.add(light);

  // floor
  geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
  //geometry.applyMatrix( new THREE.Matrix4().makeRotationX( -Math.PI / 2 ) );
  material = new THREE.MeshLambertMaterial({ color: 0x777777 });
  
  //THREE.ColorUtils.adjustHSV( material.color, 0, 0, 0.9 );
  mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  mesh.receiveShadow = true;
  scene.add(mesh);

  // cubes
  var cubeGeo = new THREE.BoxGeometry(1, 1, 1, 10, 10);
  var cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
  for (var i = 0; i < blockCount; i++) {
    cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
    cubeMesh.castShadow = true;
    meshes.push(cubeMesh);
    scene.add(cubeMesh);
  }

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(scene.fog.color);

  container.appendChild(renderer.domElement);

  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.shadowMap.enabled = true;

  window.addEventListener('resize', onWindowResize, false);

  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mouseup", onMouseUp, false);
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
    
    var intersects = raycaster.intersectObjects([gplane]);     // gplane, not chidlren

    console.log(gplane)

    if (!intersects.length) return
    
    entity = intersects[0]

    var pos = entity.point;

    
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
  var intersects = raycaster.intersectObjects(meshes); // or scene.children
  
  entity = intersects[0]
  
  if (!intersects.length) return
  var pos = entity.point;

  if (pos && entity.object.geometry instanceof THREE.BoxGeometry) {
    setClickMarker(pos.x, pos.y, pos.z);
    
    // Set marker on contact point

    // Set the movement plane
    setScreenPerpCenter(pos);

    var idx = meshes.indexOf(entity.object);
    if (idx !== -1) {
      addMouseConstraint(pos.x, pos.y, pos.z, bodies[idx]);
    }
  }
}

// This function creates a virtual movement plane for the mouseJoint to move in
function setScreenPerpCenter(point) {
  // Center at mouse position
  gplane.position.copy(point);

  // Make it face toward the camera
  gplane.quaternion.copy(camera.quaternion);
}

function onMouseUp(e) {
  // Send the remove mouse joint to server
  removeJointConstraint();
  
  if (!entity) return
  // remove the marker
  removeClickMarker();
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
}


function updatePhysics() {
  world.step(dt);
  for (var i = 0; i !== meshes.length; i++) {
    meshes[i].position.copy(bodies[i].position);
    meshes[i].quaternion.copy(bodies[i].quaternion);
  }
}

let theta = 9.4
const radius = 50;

function render() {
  theta += 0.1;
  camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
  camera.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
  camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta));
  camera.lookAt(scene.position)
  renderer.render(scene, camera);
}

function initCannon() {
  // Setup our world
  world = new CANNON.World();
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;

  world.gravity.set(0, -10, 0);
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

  // Create a plane
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.add(groundBody);

  // Joint body
  var shape = new CANNON.Sphere(0.1);
  jointBody = new CANNON.Body({ mass: 0 });
  jointBody.addShape(shape);
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
