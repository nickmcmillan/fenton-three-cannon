import { SphereGeometry, MeshBasicMaterial, Mesh } from 'three'
import { scene } from '../index'


const shape = new SphereGeometry(0.2, 16, 16)
const markerMaterial = new MeshBasicMaterial({ color: 0x0000ff })
const clickMarker = new Mesh(shape, markerMaterial)
clickMarker.visible = false

export const initClickMarker = function () {
  scene.add(clickMarker)
}
export const setClickMarker = function (x, y, z) {
  clickMarker.visible = true
  clickMarker.position.set(x, y, z)
}

export const removeClickMarker = function () {
  clickMarker.visible = false
}