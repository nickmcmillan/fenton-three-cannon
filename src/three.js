import * as THREE from 'three'
import { addGround } from './add/addGround'
import { handleMove, handleDown, handleUp } from './utils/handleInputs'
import handleResize from './utils/handleResize'
import debounce from './utils/debounce'

export const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
})


// renderer.setPixelRatio(window.devicePixelRatio * 0.5)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0xefefff) // bg color
// renderer.gammaInput = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap // shadowMapType options are BasicShadowMap | PCFShadowMap | PCFSoftShadowMap
renderer.gammaOutput = true
renderer.gammaFactor = 2.2



// FOV – We’re using 45 degrees for our field of view.
// Apsect – We’re simply dividing the browser width and height to get an aspect ratio.
// Near – This is the distance at which the camera will start rendering scene objects.
// Far – Anything beyond this distance will not be rendered. Perhaps more commonly known as the draw distance.
export const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 100)
// export const camera = new THREE.OrthographicCamera(window.innerWidth / - 50, window.innerWidth / 50, window.innerHeight / 50, window.innerHeight / - 50, 1, 1000);

export const scene = new THREE.Scene()
export const dragPlane = new THREE.Plane()
export const meshes = [] // Three

export default function () {

  // Camera
  scene.add(camera)

  // Lights
  // directional light to cast shadow
  const d = 20
  const lightDir = new THREE.DirectionalLight(0xffffff, 1.25)
  lightDir.position.set(d/2, d, d/2) // default is 0, 1, 0 - which is shining directly from top
  lightDir.castShadow = true
  lightDir.shadow.mapSize.width = 1024  // default is 512
  lightDir.shadow.mapSize.height = 1024  // default is 512
  lightDir.shadow.camera.near = 0.5 // default 0.5
  lightDir.shadow.camera.far = 3 * d // default 500
  lightDir.shadow.camera.left = -d
  lightDir.shadow.camera.right = d
  lightDir.shadow.camera.top = d
  lightDir.shadow.camera.bottom = -d
  scene.add(lightDir)
  
  // hemi light to add a little bit of colour
  const lightHemi = new THREE.HemisphereLight(0x404040, 'pink', 0.75)
  lightHemi.position.set(0, 1, 0)
  scene.add(lightHemi)
  
  // ambient light to illuminate the whole scene
  scene.add(new THREE.AmbientLight(0x404040)) 

  addGround()

  window.addEventListener('resize', debounce(handleResize, 150), false)
  window.addEventListener('mousedown', handleDown, false)
  window.addEventListener('mousemove', handleMove, false)
  window.addEventListener('mouseup', handleUp, false)
  window.addEventListener('touchstart', handleDown, false)
  window.addEventListener('touchmove', handleMove, { passive: false })
  window.addEventListener('touchend', handleUp, false)

}
