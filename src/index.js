import * as THREE from 'three'
import EffectComposer, { RenderPass, ShaderPass } from 'three-effectcomposer-es6'

import * as CANNON from 'cannon'
// import OrbitControls from 'orbit-controls-es6';
import { CannonDebugRenderer } from './cannonDebugRenderer'
// import { threeToCannon } from 'three-to-cannon';

import hihat from './models/hihat.glb'
import snare from './models/snare.glb'
import kick from './models/kick.glb'
// import fullkit from './models/fullkit.glb'
import jupiter from './models/jupiter.glb'
import op1 from './models/op2.glb'
import mustang from './models/mustang.glb'
// import bunny from './models/bunny.drc'

import { mouseConstraint, moveJointToPoint } from './utils/handleJoints'
import { onMouseMove, onMouseDown, onMouseUp, lastPos  } from './utils/handleInputs'
import { onWindowResize } from './utils/handleResize'
// import { loadModel } from './utils/loadModel'
import { loadG } from './utils/loadG'
import { addGround } from './add/addGround'
import { setClickMarker, initClickMarker } from './utils/handleClickMarker'

import { getCameraRay } from './utils/getCameraRay'

// import { addCube } from './utils/addCube';
import { addSphere } from './utils/addSphere';

import './index.css'

const VERTEX = `
    varying vec2 vUv;

    void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
        gl_Position = projectionMatrix * mvPosition;
        vUv = uv;
    }
`;

const FRAGMENT = `
    uniform sampler2D tDiffuse;
    uniform sampler2D tShadow;
    uniform vec2 iResolution;

    varying vec2 vUv;



    #define Sensitivity (vec2(0.3, 1.5) * iResolution.y / 400.0)

    float checkSame(vec4 center, vec4 samplef)
    {
        vec2 centerNormal = center.xy;
        float centerDepth = center.z;
        vec2 sampleNormal = samplef.xy;
        float sampleDepth = samplef.z;

        vec2 diffNormal = abs(centerNormal - sampleNormal) * Sensitivity.x;
        bool isSameNormal = (diffNormal.x + diffNormal.y) < 0.1;
        float diffDepth = abs(centerDepth - sampleDepth) * Sensitivity.y;
        bool isSameDepth = diffDepth < 0.1;

        return (isSameNormal && isSameDepth) ? 1.0 : 0.0;
    }

    void main( )
    {
        vec4 sample0 = texture2D(tDiffuse, vUv);
        vec4 sample1 = texture2D(tDiffuse, vUv + (vec2(1.0, 1.0) / iResolution.xy));
        vec4 sample2 = texture2D(tDiffuse, vUv + (vec2(-1.0, -1.0) / iResolution.xy));
        vec4 sample3 = texture2D(tDiffuse, vUv + (vec2(-1.0, 1.0) / iResolution.xy));
        vec4 sample4 = texture2D(tDiffuse, vUv + (vec2(1.0, -1.0) / iResolution.xy));

        float edge = checkSame(sample1, sample2) * checkSame(sample3, sample4);

        // gl_FragColor = vec4(edge, sample0.w, 1.0, 1.0);
        float shadow = texture2D(tShadow, vUv).x;
        gl_FragColor = vec4(edge, shadow, 1.0, 1.0);

    }
`;

const FRAGMENT_FINAL = `
  uniform sampler2D tDiffuse;
  uniform sampler2D tNoise;
  uniform float iTime;

  varying vec2 vUv;

  #define EdgeColor vec4(0.2, 0.2, 0.15, 1.0)
  #define BackgroundColor vec4(1.0,1.0,1.0,1)
  #define NoiseAmount 0.01
  #define ErrorPeriod 30.0
  #define ErrorRange 0.003

  // Reference: https://www.shadertoy.com/view/MsSGD1
  float triangle(float x)
  {
      return abs(1.0 - mod(abs(x), 2.0)) * 2.0 - 1.0;
  }

  float rand(float x)
  {
      return fract(sin(x) * 43758.5453);
  }

  void main()
  {
      float time = floor(iTime * 16.0) / 16.0;
      vec2 uv = vUv;
      // uv += vec2(triangle(uv.y * rand(time) * 1.0) * rand(time * 1.9) * 0.005,
      //         triangle(uv.x * rand(time * 3.4) * 1.0) * rand(time * 2.1) * 0.005);

      float noise = (texture2D(tNoise, uv * 0.5).r - 0.5) * NoiseAmount;
      vec2 uvs[3];
      uvs[0] = uv + vec2(ErrorRange * sin(ErrorPeriod * uv.y + 0.0) + noise, ErrorRange * sin(ErrorPeriod * uv.x + 0.0) + noise);
      uvs[1] = uv + vec2(ErrorRange * sin(ErrorPeriod * uv.y + 1.047) + noise, ErrorRange * sin(ErrorPeriod * uv.x + 3.142) + noise);
      uvs[2] = uv + vec2(ErrorRange * sin(ErrorPeriod * uv.y + 2.094) + noise, ErrorRange * sin(ErrorPeriod * uv.x + 1.571) + noise);

      float edge = texture2D(tDiffuse, uvs[0]).r * texture2D(tDiffuse, uvs[1]).r * texture2D(tDiffuse, uvs[2]).r;
      float diffuse = texture2D(tDiffuse, uv).g;

      float w = fwidth(diffuse) * 2.0;
      vec4 mCol = mix(BackgroundColor * 1., BackgroundColor, mix(1.0, 1.0, smoothstep(-w, w, diffuse - 0.1)));
      gl_FragColor = mix(EdgeColor, mCol, edge);
  }
`;


const PARAMETERS = {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBFormat,
  stencilBuffer: false
};




let cannonDebugRenderer

export const world = new CANNON.World()

const timeStep = 1 / 60;


export const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
})


// FOV – We’re using 45 degrees for our field of view.
// Apsect – We’re simply dividing the browser width and height to get an aspect ratio.
// Near – This is the distance at which the camera will start rendering scene objects.
// Far – Anything beyond this distance will not be rendered. Perhaps more commonly known as the draw distance.
export const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 100);
export const scene = new THREE.Scene()

export const gplane = new THREE.Plane()

gplane.name = 'gplane'

export const cubeCount = 1;
export const keyboardCount = 1

// To be synced
export const meshes = [] // threejs
export const bodies = [] // cannon


const shadowBuffer = new THREE.WebGLRenderTarget(1, 1, PARAMETERS);

const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight)

const drawShader = {
  uniforms: {
    tDiffuse: { type: 't', value: null },
    tShadow: { type: 't', value: null },
    iResolution: { type: 'v2', value: resolution },
  },
  vertexShader: VERTEX,
  fragmentShader: FRAGMENT,
};

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const pass = new ShaderPass(drawShader)
composer.addPass(pass);

const finalShader = {
  uniforms: {
    tDiffuse: { type: 't', value: null },
    iTime: { type: 'f', value: 0.0 },
    tNoise: { type: 't', value: new THREE.TextureLoader().load('noise.png') }
  },
  vertexShader: VERTEX,
  fragmentShader: FRAGMENT_FINAL
};

const passFinal = new ShaderPass(finalShader);
passFinal.renderToScreen = true;
passFinal.material.extensions.derivatives = true;
composer.addPass(passFinal)


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

  // scene.add(gplane)

  addGround()

  // loadModel({
  //   name: 'keyboard',
  //   mtl: keyboardMtl,
  //   obj: keyboardObj,
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

  loadG({
    name: 'op1',
    gltf: op1,
    // bin: op1Bin,
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
    name: 'hihat',
    gltf: hihat,
    quantity: 1,
    position: {
      x: Math.random() * 2,
      y: Math.random() * 30,
      z: Math.random() * 2,
    }
  })
  
  loadG({
    name: 'snare',
    gltf: snare,
    quantity: 1,
    position: {
      x: Math.random() * 2,
      y: Math.random() * 30,
      z: Math.random() * 2,
    }
  })
  
  loadG({
    name: 'kick',
    gltf: kick,
    quantity: 1,
    position: {
      x: Math.random() * 2,
      y: Math.random() * 30,
      z: Math.random() * 2,
    }
  })
  
  loadG({
    name: 'jupiter',
    gltf: jupiter,
    quantity: 1,
    position: {
      x: Math.random() * 2,
      y: Math.random() * 30,
      z: Math.random() * 2,
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
  
  renderer.setPixelRatio(window.devicePixelRatio )
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff);


  // renderer.gammaInput = true;

  renderer.shadowMap.enabled = true;
   // options are THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
  renderer.shadowMapType = THREE.PCFSoftShadowMap;

  
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;


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
  //controls.update();
  updatePhysics()
  render()
  requestAnimationFrame(animate)
  // cannonDebugRenderer.update()
}


function updatePhysics() {
  world.step(timeStep)
  for (var i = 0; i < meshes.length; i++) {
    // check if bodies are too far from view,
    const outX = bodies[i].position.x > 20 || bodies[i].position.x < -20
    const outZ = bodies[i].position.z > 20 || bodies[i].position.z < -20
    // if so, reset their velocity & position
    if (outX || outZ) {
      bodies[i].velocity.set(0, 0, 0)
      bodies[i].position.set(0, 20, 0)
    }

    meshes[i].position.copy(bodies[i].position)
    meshes[i].quaternion.copy(bodies[i].quaternion)    
  }
}

let theta = 6
const radius = 20

const updateDragPosition = function() {
   
  if (mouseConstraint) {
    const ray = getCameraRay(new THREE.Vector2(lastPos.x, lastPos.y));

    const dragPos = gplane.intersectLine(
      new THREE.Line3(ray.origin, ray.origin
        .clone()
        .add(ray.direction
          .clone()
          .multiplyScalar(10000))))

    setClickMarker(dragPos.x, dragPos.y, dragPos.z)
    moveJointToPoint(dragPos.x, dragPos.y, dragPos.z)
  }
}

function render() {
  theta += 0.05

  updateDragPosition() // could be expensive

  
  camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta))
  camera.position.y = THREE.Math.degToRad(360)
  camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta))
  camera.lookAt(scene.position)
  renderer.render(scene, camera);
  pass.uniforms.tShadow.value = shadowBuffer.texture;
  // composer.render();
  
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