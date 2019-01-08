import { GUI } from 'dat.gui'
import initCannon, { updatePhysics, world /*cannonDebugRenderer*/ } from './cannon'

const gui = new GUI()

export const settings = {
  // physics
  gx: 0,
  gy: -40,
  gz: 0,
  restitution: 0.25,
  contactEquationStiffness: 1e7,
  // camera
  theta: 15,
  radius: 20,
  height: 2.5,
  autoRotate: true,
}

export default function() {

  const folderCamera = gui.addFolder('camera')
  
  folderCamera.add(settings, 'theta', -180, 180).onChange(function (val) {
    if (!isNaN(val)) settings.theta = val
  })
  folderCamera.add(settings, 'radius', -40, 40).onChange(function (val) {
    if (!isNaN(val)) settings.radius = val
  })
  folderCamera.add(settings, 'height', 0, 10).onChange(function (val) {
    if (!isNaN(val)) settings.height = val
  })
  folderCamera.add(settings, 'autoRotate').onChange(function (val) {
    settings.autoRotate = val
  })

  const folderPhysics = gui.addFolder('physics')
  folderPhysics.add(settings, 'gx', -40, 40).onChange(function (val) {
    if (!isNaN(val)) world.gravity.set(val, settings.gy, settings.gz)
  })
  folderPhysics.add(settings, 'gy', -40, 1).onChange(function (val) {
    if (!isNaN(val)) world.gravity.set(settings.gx, val, settings.gz)
  })
  folderPhysics.add(settings, 'gz', -40, 40).onChange(function (val) {
    if (!isNaN(val)) world.gravity.set(settings.gx, settings.gy, val)
  })
  folderPhysics.add(settings, 'restitution', 0.5, 2).onChange(function (val) {
    if (!isNaN(val)) world.defaultContactMaterial.restitution = val
  })
  folderPhysics.add(settings, 'contactEquationStiffness', 1e3, 1e7).onChange(function (val) {
    if (!isNaN(val)) world.defaultContactMaterial.contactEquationStiffness = val
  })
  
  gui.close()
}