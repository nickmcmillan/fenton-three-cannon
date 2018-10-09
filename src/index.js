import * as THREE from 'three'
import * as OIMO from 'oimo'


import './index.css';

var isMobile = false
var antialias = true

var paddel = new THREE.Object3D();

const max = 1

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2()

const dotGeometry = new THREE.SphereGeometry(5, 32, 32)
const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })

const dot = new THREE.Mesh(dotGeometry, dotMaterial)
// three var
var camera, scene, light, renderer, canvas, controls;
var meshs = [];
var grounds = [];
var geoBox, geoCyl, buffgeoSphere, buffgeoBox;
var matBox, matSphere, matBoxSleep, matSphereSleep, matGround;
var types, sizes, positions, chairGeometry;
var ToRad = Math.PI / 180;

var world = null;
var bodies = null;
var infos;
init();
loop();



function addBlocks() {
  var geometry = new THREE.BoxBufferGeometry(100, 100, 100);

  var objects = [];
  for (var i = 0; i < 5; i++) {

    var object = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, opacity: 0.5 }));
    object.position.x = Math.random() * 800 - 400;
    object.position.y = Math.random() * 800 - 400;
    object.position.z = Math.random() * 800 - 400;

    object.scale.x = Math.random() * 2 + 1;
    object.scale.y = Math.random() * 2 + 1;
    object.scale.z = Math.random() * 2 + 1;

    object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;
    object.rotation.z = Math.random() * 2 * Math.PI;

    scene.add(object);

    objects.push(object);

  }
}

function init() {
  var n = navigator.userAgent;
  if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)) { isMobile = true;  antialias = false; }
  infos = document.getElementById("info");
  canvas = document.getElementById("canvas");
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set(0, 300, 500);
  //controls = new THREE.OrbitControls( camera, canvas );
  // controls.target.set(0, 20, 0);
  // controls.update();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);


  
  // scene.add(new THREE.AmbientLight(0x444444))

  renderer = new THREE.WebGLRenderer({ canvas:canvas, precision: "mediump", antialias:antialias });
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio(window.devicePixelRatio);

  // addBlocks()
  
  var materialType = 'MeshBasicMaterial';
  
  if (!isMobile) {
    scene.add( new THREE.AmbientLight( 0x3D4143 ) );
    light = new THREE.DirectionalLight( 0xffffff , 1);
    light.position.set( 300, 1000, 500 );
    light.target.position.set( 0, 0, 0 );
    light.castShadow = true;
    var d = 300;
    light.shadow.camera = new THREE.OrthographicCamera( -d, d, d, -d,  500, 1600 );
    light.shadow.bias = 0.0001;
    light.shadow.mapSize.width = light.shadow.mapSize.height = 1024;
    scene.add( light );
    materialType = 'MeshPhongMaterial';
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;//THREE.BasicShadowMap;
  }
  
  geoBox = new THREE.BoxGeometry( 1, 1, 1 );
  geoCyl = new THREE.CylinderGeometry( 0.5, 0.5, 1, 6, 1 );
  buffgeoSphere = new THREE.BufferGeometry();
  buffgeoSphere.fromGeometry( new THREE.SphereGeometry( 1 , 20, 10 ) );
  buffgeoBox = new THREE.BufferGeometry();
  buffgeoBox.fromGeometry( new THREE.BoxGeometry( 1, 1, 1 ) );
  matSphere = new THREE[materialType]( { map: basicTexture(0), name:'sph' ,specular: 0xFFFFFF, shininess: 120, transparent: true, opacity: 0.9 } );
  matBox = new THREE[materialType]( {  map: basicTexture(2), name:'box' } );
  matSphereSleep = new THREE[materialType]( { map: basicTexture(1), name:'ssph', specular: 0xFFFFFF, shininess: 120 , transparent: true, opacity: 0.7} );
  matBoxSleep = new THREE[materialType]( {  map: basicTexture(3), name:'sbox' } );
  matGround = new THREE[materialType]( { shininess: 10, color:'pink', transparent: false, opacity:0.5 } );
  
  
  // events
  window.addEventListener( 'resize', onWindowResize, false );
  renderer.domElement.addEventListener('mousedown', handleMouseDown, false);
  renderer.domElement.addEventListener('mouseup', handleMouseUp, false);
  renderer.domElement.addEventListener('mousemove', handleMouseMove, false);
  
  // physics
  initOimoPhysics()
}

let isDragging = false

function handleMouseUp(e) {
  isDragging = false
}

function handleMouseDown(e) {
  
  e.preventDefault();
  mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children, true);

  isDragging = true
  if (intersects.length) {

    dot.position.copy(intersects[0].point)

    // const geometry = new THREE.SphereGeometry(5, 32, 32)
    // const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })

    // const particle = new THREE.Mesh(geometry, material)
    // particle.position.copy(intersects[0].point)
    // scene.add(particle)

    
    
    // intersects[0].object.material.color.setHex(Math.random() * 0xffffff);



  }
}

function handleMouseMove(e) {
  e.preventDefault()
  
  mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length) {
    document.body.classList.add('cursor-grab')

    if (isDragging) {
      // console.log(intersects[0])
      const { x, y, z } = intersects[0].point

      console.log(intersects[0], dot)
      

      var joint = world.add({
        type: 'jointHinge', // type of joint : jointDistance, jointHinge, jointPrisme, jointSlide, jointWheel
        body1: intersects[0], // name or id of attach rigidbody
        body2: dot, // name or id of attach rigidbody
      });

      //  intersects[0].object.position.set(x, y, z) 

      
      dot.position.copy(intersects[0].point)
      

    }

  } else {
    document.body.classList.remove('cursor-grab')
  }

}


var theta = 0
var radius = 600;

function loop() {
    updateOimoPhysics();
    raycaster.setFromCamera(mouse, camera);
  
    theta += 0.1;

    camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
    camera.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
    camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta));
    camera.lookAt(scene.position);
    renderer.render( scene, camera );
    requestAnimationFrame( loop );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function addFloor(size, position, rotation) {
  var mesh = new THREE.Mesh( buffgeoBox, matGround );
  mesh.scale.set( size[0], size[1], size[2] );
  mesh.position.set( position[0], position[1], position[2] );
  mesh.rotation.set( rotation[0]*ToRad, rotation[1]*ToRad, rotation[2]*ToRad );
  scene.add( mesh );
  grounds.push(mesh);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

function initChairGeometry() {
  types = [ 'box', 'box', 'box', 'box', 'box', 'box', 'box', 'box' ];
  sizes = [ 30,5,30,  4,30,4,  4,30,4,  4,30,4,  4,30,4,  4,30,4,  4,30,4,  23,10,3 ];
  positions = [ 0,0,0,  12,-16,12,  -12,-16,12,  12,-16,-12,  -12,-16,-12,  12,16,-12,  -12,16,-12,  0,25,-12 ];
  var g = new THREE.Geometry();
  var n, m;
  for (var i = 0; i < types.length; i++) {
    n = i * 3
    m = new THREE.Matrix4().makeTranslation( positions[n+0], positions[n+1], positions[n+2] )
    m.scale(new THREE.Vector3(sizes[n + 0], sizes[n + 1], sizes[n + 2]))
    
    if ( i === 1 || i === 2 || i === 3 || i === 4 || i === 5 || i === 6 ) {
      g.merge(geoCyl, m)
    } else {
      g.merge(geoBox, m)
    }
  }

  chairGeometry = new THREE.BufferGeometry()
  chairGeometry.fromGeometry(g)
}

//----------------------------------
//  OIMO PHYSICS
//----------------------------------
function initOimoPhysics() {
  world = new OIMO.World({
    info: false,
    worldscale: 100,
    timestep: 1 / 60,
    iterations: 3,
    broadphase: 1, // 1 brute force, 2 sweep and prune, 3 volume tree
    // random: true,  // randomize sample
    //info: false,   // calculate statistic or not
    gravity: [0, -9.8, 0] 
  })
  initChairGeometry();
  populate();
}

function populate() {
  var pos = []
  world.clear()
  
  bodies = [];
  
  // the floor physics
  world.add({
    world,
    size: [100, 40, 390],
    pos: [0, -20, 0],
  });
  
  // the floor appearance
  addFloor([140, 10, 390], [0,-20,0], [0,0,0]);

  scene.add(dot)

  world.add({
    world,
    type: 'sphere',
    name: 'dot',
    id: 'dot',
    pos: [0, 0, 0], // start position in degree
    rot: [0, 0, 90], // start rotation in degree
    move: false,
    size: [5, 32, 32],
  });

  var i = max;
  while (i--) {
    pos[0] = 0;
    pos[1] = 100 + (i * 160);
    pos[2] = 0;

    bodies[i] = world.add({
      world,
      pos,
      type: types,
      size: sizes,
      posShape: positions,
      move: true, 
      name: 'box' + i, 
      config: [0.2, 0.4, 0.1]
    })

    var j = Math.round(Math.random()*1);

    if (j === 1) {
      meshs[i] = new THREE.Mesh(chairGeometry, matBox);
    } else {
      meshs[i] = new THREE.Mesh(chairGeometry, matSphere);
    }
    meshs[i].castShadow = true;
    meshs[i].receiveShadow = true;
    scene.add(meshs[i]);
  }
}

function updateOimoPhysics() {
  if (world === null) return;
  // update world
  world.step();

  // paddel.lookAt(new THREE.Vector3(100, paddel.position.y, 0));
  // paddel.rotation.y += 90 * ToRad;


  // apply new rotation on last rigidbody
  // bodies[bodies.length - 1].setQuaternion(paddel.quaternion);

  var x, y, z, mesh, body, i = bodies.length;
  
  while (i--) {
  
    body = bodies[i];
    mesh = meshs[i];
    if (!body.sleeping) {
      // apply physics mouvement
      mesh.position.copy(body.getPosition())
      mesh.quaternion.copy(body.getQuaternion())
      // change material
      if (mesh.material.name === 'sbox') mesh.material = matBox;
      if (mesh.material.name === 'ssph') mesh.material = matSphere; 
      // reset position
      
      if (mesh.position.y < -100) {
        x = -100 + Math.random() * 200
        z = -100 + Math.random() * 200
        y = 100 + Math.random() * 1000
        body.resetPosition(x,y,z);
      }
    } else {
      if (mesh.material.name === 'box') mesh.material = matBoxSleep;
      if (mesh.material.name === 'sph') mesh.material = matSphereSleep;
    }
  }
  // infos.innerHTML = world.getInfo();
    
}
//----------------------------------
//  TEXTURES
//----------------------------------
function gradTexture(color) {
  var c = document.createElement("canvas");
  var ct = c.getContext("2d");
  c.width = 16; c.height = 256;
  var gradient = ct.createLinearGradient(0,0,0,256);
  var i = color[0].length;
  while(i--) { gradient.addColorStop(color[0][i],color[1][i]); }
  ct.fillStyle = gradient;
  ct.fillRect(0,0,16,256);
  var texture = new THREE.Texture(c);
  texture.needsUpdate = true;
  return texture;
}

function basicTexture(n) {
  var canvas = document.createElement( 'canvas' );
  canvas.width = canvas.height = 64;
  var ctx = canvas.getContext( '2d' );
  var colors = [];
  if (n===0) { // sphere
      colors[0] = "#99999A";
      colors[1] = "#cccccD";
  }
  if (n===1) { // sphere sleep
      colors[0] = "#666667";
      colors[1] = "#99999A";
  }
  if (n===2) { // box
      colors[0] = "#AA8058";
      colors[1] = "#FFAA58";
  }
  if (n===3) { // box sleep
      colors[0] = "#383838";
      colors[1] = "#AA8038";
  }
  var grd = null
  grd = ctx.createLinearGradient(0, 0, 0, 64);
  grd.addColorStop(0, colors[1]);
  grd.addColorStop(1, colors[0]);

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 64, 64);
  var tx = new THREE.Texture(canvas);
  tx.needsUpdate = true;
  return tx;
}