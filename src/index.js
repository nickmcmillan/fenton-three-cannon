import * as THREE from 'three'
import * as OIMO from 'oimo'


import './index.css';

var isMobile = false
var antialias = true


const max = 1
var PI2 = Math.PI * 2;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2()

// var particleMaterial = new THREE.SpriteCanvasMaterial({

//   color: 0x000000,
//   program: function (context) {

//     context.beginPath();
//     context.arc(0, 0, 0.5, 0, PI2, true);
//     context.fill();

//   }

// });


// three var
var camera, scene, light, renderer, canvas, controls;
var meshs = [];
var grounds = [];
var geoBox, geoCyl, buffgeoSphere, buffgeoBox;
var matBox, matSphere, matBoxSleep, matSphereSleep, matGround;
var types, sizes, positions, chairGeometry;
var ToRad = Math.PI / 180;

//oimo var
var world = null;
var bodies = null;
var infos;
// var type=1;
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
  scene.fog = new THREE.Fog(0x050505, 2000, 3500)
  
  // scene.add(new THREE.AmbientLight(0x444444))

  renderer = new THREE.WebGLRenderer({ canvas:canvas, precision: "mediump", antialias:antialias });
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio(window.devicePixelRatio);

  addBlocks()
  

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
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  renderer.domElement.addEventListener('click', raycast2, false);
  
  // physics
  initOimoPhysics();
}
function onDocumentMouseMove(event) {

  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

}

function raycast2(event) {

  event.preventDefault();

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {

    intersects[0].object.material.color.setHex(Math.random() * 0xffffff);

    const geometry = new THREE.SphereGeometry(5, 32, 32)
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })

    const particle = new THREE.Mesh(geometry, material)
    particle.position.copy(intersects[0].point)
    scene.add(particle)
  }

}


var theta = 0
var radius = 600;

function loop() {
    updateOimoPhysics();
    raycaster.setFromCamera(mouse, camera);
    // var intersects = raycaster.intersectObject();

    // if (intersects.length > 0) {

    //   var intersect = intersects[0];
    //   var face = intersect.face;

    //   console.log(face)
      

    // } else {
      

    // }
      
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

function addStaticBox(size, position, rotation) {
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
    var mesh, n, m;
    for (var i = 0; i < types.length; i++) {
        n = i*3;
        m = new THREE.Matrix4().makeTranslation( positions[n+0], positions[n+1], positions[n+2] );
        m.scale(new THREE.Vector3(sizes[n+0], sizes[n+1], sizes[n+2]));
        
        if (i===1 || i===2 || i===3 || i===4 || i===5 || i===6) g.merge(geoCyl, m);
        else g.merge(geoBox,m);
    }
    chairGeometry = new THREE.BufferGeometry();
    chairGeometry.fromGeometry( g );
}

//----------------------------------
//  OIMO PHYSICS
//----------------------------------
function initOimoPhysics() {
  world = new OIMO.World( {info:true, worldscale: 100} );
  world.gravity = new OIMO.Vec3(0, -7, 0);
  initChairGeometry();
  populate();
}

function populate() {
  var pos = [];
  world.clear();
  
  bodies = [];
  var b;
  // the floor physics
  world.add({size:[100, 40, 390], pos:[0,-20,0], world:world});
  
  // the floor appearance
  addStaticBox([100, 40, 390], [0,-20,0], [0,0,0]);
  var i = max;
  var j;
  while (i--) {
    pos[1] = 100 + (i * 160);
    pos[0] = 0;
    pos[2] = 0;

    bodies[i] = world.add({
        type: types,
        size: sizes,
        pos: pos,
        posShape: positions,
        move: true, 
        world: world, 
        name: 'box' + i, 
        config: [0.2, 0.4, 0.1]
    });
    j = Math.round(Math.random()*1);
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
    var x, y, z, mesh, body, i = bodies.length;
    
    while (i--) {
        body = bodies[i];
        mesh = meshs[i];
        if (!body.sleeping) {
            // apply physics mouvement
            mesh.position.copy(body.getPosition());
            mesh.quaternion.copy(body.getQuaternion());
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
    infos.innerHTML = world.getInfo();
    
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