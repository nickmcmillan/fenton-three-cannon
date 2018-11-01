import * as THREE from 'three'
import { camera, meshes, bodies, gplane, scene, backVector } from '../index'
import { addMouseConstraint, moveJointToPoint, removeJointConstraint, addJointBody, mouseConstraint } from './handleJoints'
import { setClickMarker, removeClickMarker } from './handleClickMarker'

const raycaster = new THREE.Raycaster()
const mouse3D = new THREE.Vector3()
const tempVector2 = new THREE.Vector2();

let draggedItem

const _getRelativeMouseCoords = function (screenMouseCoords) {

  const relativeMouseCoords = screenMouseCoords.clone()
    .sub(tempVector2.set(0, 0))
    .divide(tempVector2.set(window.innerWidth, window.innerHeight));

  // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  relativeMouseCoords.x = relativeMouseCoords.x * 2 - 1;
  relativeMouseCoords.y = -relativeMouseCoords.y * 2 + 1;

  return relativeMouseCoords;
}

const getCameraRay = function (mouseCoords) {
  const relativeMouseCoords = _getRelativeMouseCoords(mouseCoords);

  const originalRay = raycaster.ray.clone();

  raycaster.setFromCamera(relativeMouseCoords, camera);

  const resultRay = raycaster.ray.clone();

  raycaster.ray.copy(originalRay);

  return resultRay;
}

export const onMouseDown = function (e) {
  
  // Find mesh from a ray
  mouse3D.x =  (e.clientX / window.innerWidth) * 2 - 1
  mouse3D.y = -(e.clientY / window.innerHeight) * 2 + 1
  mouse3D.z = 0.5

  raycaster.setFromCamera(mouse3D, camera)

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(meshes, true) // or scene.children

  if (!intersects.length) return
  
  
  draggedItem = intersects[0]

  const pos = draggedItem.point

  // if (pos && draggedItem.object.geometry instanceof THREE.BoxGeometry) {
  if (!pos) return


  // Set marker on contact point
  setClickMarker(pos.x, pos.y, pos.z)

  // Set the movement gplane
  // setScreenPerpCenter(pos)

  const name = draggedItem.object.parent.name || draggedItem.object.name

  console.log(bodies)
  console.log(name)
  console.log(bodies.find(x => x.name === name))
  
  
  

  

  const targetBody = bodies.find(x => x.name === name)
  

  // console.log(targetBody)

  gplane.setFromNormalAndCoplanarPoint(backVector.clone()
    .applyQuaternion(camera.quaternion), pos);

    
  addMouseConstraint(pos.x, pos.y, pos.z, targetBody)
  
  // if (idx !== -1) {
  // } else if (draggedItem.object.parent.type === 'Group') { // TODO: make this better
  //   const idx2 = meshes.indexOf(draggedItem.object.parent)
  //   addMouseConstraint(pos.x, pos.y, pos.z, bodies[idx2])
  // }

}

export const onMouseMove = function (e) {

  // Move and project on the plane
  
  if (mouseConstraint) {

    mouse3D.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse3D.y = - (e.clientY / window.innerHeight) * 2 + 1
    mouse3D.z = 0.5

    const ray = getCameraRay(new THREE.Vector2(e.clientX, e.clientY));
    
    const pos = gplane.intersectLine(
      new THREE.Line3(ray.origin, ray.origin
        .clone()
        .add(ray.direction
          .clone()
          .multiplyScalar(10000))));

    
    // raycaster.setFromCamera(mouse3D, camera)
    


    
    
    // const pos = gplane.intersectLine(
    //   new THREE.Line3(ray.origin, ray.origin.clone()
    //     .add(ray.direction.clone().multiplyScalar(10000))));
    
        // const intersects = raycaster.intersectObject(gplane) // gplane, not chidlren
    
    

    
          
    // if (!intersects.length) return
    
    
    // draggedItem = intersects[0]

    // const pos = draggedItem.point

    if (pos) {
      setClickMarker(pos.x, pos.y, pos.z)
      moveJointToPoint(pos.x, pos.y, pos.z)
    }
  }
}



export const onMouseUp = function (e) {
  
  if (!draggedItem) return
  // Send the remove mouse joint to server
  removeJointConstraint();
  
  // remove the marker
  draggedItem = null
  removeClickMarker();
}

// This function creates a virtual movement plane for the mouseJoint to move in
const setScreenPerpCenter = function (point) {
  // Center at mouse position
  gplane.position.copy(point)
  gplane.scale.y = 0.5
  gplane.scale.x = 0.5
  gplane.scale.z = 0.5
  

  // Make it face toward the camera
  gplane.quaternion.copy(camera.quaternion);
}