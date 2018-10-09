import * as THREE from 'three'
import * as OIMO from 'oimo'


import './index.css';

var isMobile = false
var antialias = true
var grd = null

const MAX = 10

var raycaster, mouse = { x: 0, y: 0 };



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
function init() {
    var n = navigator.userAgent;
    if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)){ isMobile = true;  antialias = false; }
    infos = document.getElementById("info");
    canvas = document.getElementById("canvas");
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 0, 160, 400 );
    //controls = new THREE.OrbitControls( camera, canvas );
    // controls.target.set(0, 20, 0);
    // controls.update();
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ canvas:canvas, precision: "mediump", antialias:antialias });
    renderer.setSize( window.innerWidth, window.innerHeight );

    raycaster = new THREE.Raycaster();
    renderer.domElement.addEventListener('click', raycast, false);



    var materialType = 'MeshBasicMaterial';
    
    if (!isMobile){
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
    // background
    var buffgeoBack = new THREE.BufferGeometry();
    buffgeoBack.fromGeometry( new THREE.IcosahedronGeometry(8000,1) );
    var back = new THREE.Mesh( buffgeoBack, new THREE.MeshBasicMaterial( { map:gradTexture([[1,0.75,0.5,0.25], ['#1B1D1E','#3D4143','#72797D', '#b0babf']]), side:THREE.BackSide, depthWrite: false }  ));
    back.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(15*ToRad));
    scene.add( back );
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
    matGround = new THREE[materialType]( { shininess: 10, color:0x3D4143, transparent:true, opacity:0.5 } );
    // events
    window.addEventListener( 'resize', onWindowResize, false );
    // physics
    initOimoPhysics();
}

function raycast(e) {
  
  // Step 2: Detect normal objects
  //1. sets the mouse position with a coordinate system where the center
  //   of the screen is the origin
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

  //2. set the picking ray from the camera position and mouse coordinates
  raycaster.setFromCamera(mouse, camera);

  //3. compute intersections (no 2nd parameter true anymore)
  var intersects = raycaster.intersectObjects(scene.children);

  for (var i = 0; i < intersects.length; i++) {
    console.log(intersects[i]);
    /*
        An intersection has the following properties :
            - object : intersected object (THREE.Mesh)
            - distance : distance from camera to intersection (number)
            - face : intersected face (THREE.Face3)
            - faceIndex : intersected face index (number)
            - point : intersection point (THREE.Vector3)
            - uv : intersection point in the object's UV coordinates (THREE.Vector2)
    */
  }

}

function loop() {
    updateOimoPhysics();
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

// function clearMesh() {
//     var i = meshs.length;
//     while (i--) scene.remove(meshs[ i ]);
//     i = grounds.length;
//     while (i--) scene.remove(grounds[ i ]);
//     grounds = [];
//     meshs = [];
// }
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
  var max = MAX
  var pos = [];
  // clearMesh();
  world.clear();
  
  bodies=[];
  var b;
  var ground = world.add({size:[100, 40, 390], pos:[0,-20,0], world:world});
  // var ground2 = world.add({size:[400, 40, 400], pos:[0,-60,0], world:world});
  
  // the floor
  addStaticBox([100, 40, 390], [0,-20,0], [0,0,0]);
  // addStaticBox([400, 40, 400], [0,-60,0], [0,0,0]);
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
        if (!body.sleeping){
            // apply physics mouvement
            mesh.position.copy(body.getPosition());
            mesh.quaternion.copy(body.getQuaternion());
            // change material
            if (mesh.material.name === 'sbox') mesh.material = matBox;
            if (mesh.material.name === 'ssph') mesh.material = matSphere; 
            // reset position
            
            if (mesh.position.y < -100){
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
    while(i--){ gradient.addColorStop(color[0][i],color[1][i]); }
    ct.fillStyle = gradient;
    ct.fillRect(0,0,16,256);
    var texture = new THREE.Texture(c);
    texture.needsUpdate = true;
    return texture;
}
function basicTexture(n){
    var canvas = document.createElement( 'canvas' );
    canvas.width = canvas.height = 64;
    var ctx = canvas.getContext( '2d' );
    var colors = [];
    if (n===0){ // sphere
        colors[0] = "#99999A";
        colors[1] = "#cccccD";
    }
    if (n===1){ // sphere sleep
        colors[0] = "#666667";
        colors[1] = "#99999A";
    }
    if (n===2){ // box
        colors[0] = "#AA8058";
        colors[1] = "#FFAA58";
    }
    if (n===3){ // box sleep
        colors[0] = "#383838";
        colors[1] = "#AA8038";
    }
    grd=ctx.createLinearGradient(0,0,0,64);
    grd.addColorStop(0,colors[1]);
    grd.addColorStop(1,colors[0]);

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 64, 64);
    var tx = new THREE.Texture(canvas);
    tx.needsUpdate = true;
    return tx;
}