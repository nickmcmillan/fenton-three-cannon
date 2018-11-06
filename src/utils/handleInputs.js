import * as THREE from 'three'
import { camera, meshes, bodies, gplane, } from '../index'
import { addMouseConstraint, moveJointToPoint, removeJointConstraint, mouseConstraint } from './handleJoints'
import { setClickMarker, removeClickMarker } from './handleClickMarker'
import { getCameraRay } from './getCameraRay'

const backVector = new THREE.Vector3(0, 0, -1)
const raycaster = new THREE.Raycaster()
const mouse3D = new THREE.Vector3()

let draggedItem

export const lastPos = {
  x: 0,
  y: 0
}

export const onMouseDown = function (e) {

  // handle whether its touch or mouse
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  
  // Find mesh from a ray
  mouse3D.x =  (clientX / window.innerWidth) * 2 - 1
  mouse3D.y = -(clientY / window.innerHeight) * 2 + 1
  mouse3D.z = 0.5

  lastPos.x = clientX
  lastPos.y = clientY

  raycaster.setFromCamera(mouse3D, camera)

  // calculate objects intersecting the picking ray
  // meshes or scene.children
  // true makes it recursive so it enters into grouped objects
  const intersects = raycaster.intersectObjects(meshes, true) 

  if (!intersects.length) return
  
  draggedItem = intersects[0]
  const pos = draggedItem.point

  if (!pos) return

  // Set marker on contact point
  setClickMarker(pos.x, pos.y, pos.z)

  gplane.setFromNormalAndCoplanarPoint(backVector.clone().applyQuaternion(camera.quaternion), pos)

  // grouped objects are risky. 
  console.log(draggedItem)
  
  const name = draggedItem.object.parent.name || draggedItem.object.name
  const constrainedBody = bodies.find(x => x.name === name)
  if (!constrainedBody) return // in case we hit an unhandle nested object

  addMouseConstraint(pos.x, pos.y, pos.z, constrainedBody)
}

export const onMouseMove = function (e) {

  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  

  // Move and project on the plane
  
  if (mouseConstraint) {

    lastPos.x = clientX
    lastPos.y = clientY


    const ray = getCameraRay(new THREE.Vector2(clientX, clientY))
    
    const pos = gplane.intersectLine(
      new THREE.Line3(ray.origin, ray.origin
        .clone()
        .add(ray.direction
          .clone()
          .multiplyScalar(10000))))


    if (pos) {
      setClickMarker(pos.x, pos.y, pos.z)
      moveJointToPoint(pos.x, pos.y, pos.z)
    }
  }
}

export const onMouseUp = function (e) {
  
  if (!draggedItem) return
  // Send the remove mouse joint to server
  removeJointConstraint()
  
  // remove the marker
  draggedItem = null
  removeClickMarker()
}
