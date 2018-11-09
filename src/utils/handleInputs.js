import * as THREE from 'three'
import { camera, meshes, dragPlane, } from '../three'
import { bodies } from '../cannon'
import { addMouseConstraint, removeJointConstraint } from './handleJoints'
// import { setClickMarker, removeClickMarker } from './handleClickMarker'
import updateDragPosition from './updateDragPosition'

const backVector = new THREE.Vector3(0, 0, -1)
const raycaster = new THREE.Raycaster()
const mouse3D = new THREE.Vector3()
const docBody = document.body

let draggedItem

export const lastPos = { x: 0, y: 0 }

// TODO: does this function smell?
const checkIntersects = function (e) {
  // handle whether its touch or mouse
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY

  // Find mesh from a ray
  mouse3D.x = (clientX / window.innerWidth) * 2 - 1
  mouse3D.y = -(clientY / window.innerHeight) * 2 + 1
  mouse3D.z = 0.5

  lastPos.x = clientX
  lastPos.y = clientY

  raycaster.setFromCamera(mouse3D, camera)

  // calculate objects intersecting the picking ray
  // meshes or scene.children
  // true makes it recursive so it enters into grouped objects
  return raycaster.intersectObjects(meshes, true) 
}

export const onMouseDown = function (e) {

  const intersects = checkIntersects(e)

  if (!intersects.length) return
  docBody.classList.add('cursor-grabbing')
  
  draggedItem = intersects[0]
  const pos = draggedItem.point

  if (!pos) return

  // Set marker on contact point
  // setClickMarker(pos.x, pos.y, pos.z)

  dragPlane.setFromNormalAndCoplanarPoint(backVector.clone().applyQuaternion(camera.quaternion), pos)

  const name = draggedItem.object.name
  const constrainedBody = bodies.find(x => x.name === name)

  // grouped objects are risky (dependent on layer names of the imported object)
  // return in case we hit an unhandled nested object
  if (!constrainedBody) return

  addMouseConstraint(pos.x, pos.y, pos.z, constrainedBody)
}

export const onMouseMove = function (e) {

  const intersects = checkIntersects(e)
  if (intersects.length) {
    docBody.classList.add('cursor-grab')
  } else {
    docBody.classList.remove('cursor-grab')
  }

  updateDragPosition()
}

export const onMouseUp = function (e) {
  
  if (!draggedItem) return
  docBody.classList.remove('cursor-grabbing')

  // Send the remove mouse joint to server
  removeJointConstraint()
  
  // remove the marker
  draggedItem = null
  // removeClickMarker()
}
