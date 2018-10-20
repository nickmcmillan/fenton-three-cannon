import * as THREE from 'three'
import { scene } from '../index'

const shape = new THREE.SphereGeometry(0.2, 8, 8)
const markerMaterial = new THREE.MeshLambertMaterial({ color: 0x00ccdd })
const clickMarker = new THREE.Mesh(shape, markerMaterial)
clickMarker.visible = false

export const setClickMarker = function (x, y, z) {
  if (!clickMarker.visible) scene.add(clickMarker)
  clickMarker.visible = true
  clickMarker.position.set(x, y, z)
}

export const removeClickMarker = function () {
  clickMarker.visible = false
}