import * as THREE from 'three'

import { addGround } from './add/addGround'
import { onMouseMove, onMouseDown, onMouseUp } from './utils/handleInputs'
import { onWindowResize } from './utils/handleResize'

export const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
})

// renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0xffffff)
// renderer.gammaInput = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap // shadowMapType options are THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
renderer.gammaOutput = true
renderer.gammaFactor = 2.2



// FOV – We’re using 45 degrees for our field of view.
// Apsect – We’re simply dividing the browser width and height to get an aspect ratio.
// Near – This is the distance at which the camera will start rendering scene objects.
// Far – Anything beyond this distance will not be rendered. Perhaps more commonly known as the draw distance.
export const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 60);
// export const camera = new THREE.OrthographicCamera(window.innerWidth / - 50, window.innerWidth / 50, window.innerHeight / 50, window.innerHeight / - 50, 1, 1000);

export const scene = new THREE.Scene()
export const dragPlane = new THREE.Plane()

// These are kept in sync
export const meshes = [] // Three


export default function () {

  // camera
  camera.position.set(20, 60, 20);
  camera.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
  scene.add(camera)

  // scene
  // scene.fog = new THREE.Fog(0xccffff, 30, 100)

  // Lights
  const d = 20
  const light = new THREE.DirectionalLight(0xffffff, 1.25);
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
  scene.add(new THREE.AmbientLight(0x777777));

  addGround()

  // TODO: debounce
  window.addEventListener('resize', onWindowResize, false)

  window.addEventListener('mousedown', onMouseDown, false)
  window.addEventListener('mousemove', onMouseMove, false)
  window.addEventListener('mouseup', onMouseUp, false)
  window.addEventListener('touchstart', onMouseDown, false)
  window.addEventListener('touchmove', onMouseMove, { passive: false })
  window.addEventListener('touchend', onMouseUp, false)

}