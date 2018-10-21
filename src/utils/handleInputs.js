import * as THREE from 'three'
import { camera, meshes, bodies, gplane } from '../index'
import { addMouseConstraint, moveJointToPoint, removeJointConstraint, addJointBody, mouseConstraint } from './handleJoints'
import { setClickMarker, removeClickMarker } from './handleClickMarker'


const raycaster = new THREE.Raycaster();
const mouse3D = new THREE.Vector3()
let draggedItem

export const onMouseMove = function (e) {
  // Move and project on the plane

  if (mouseConstraint) {

    mouse3D.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse3D.y = - (e.clientY / window.innerHeight) * 2 + 1
    mouse3D.z = 0.5

    raycaster.setFromCamera(mouse3D, camera)
    
    const intersects = raycaster.intersectObject(gplane, true) // gplane, not chidlren

    if (!intersects.length) return
    
    draggedItem = intersects[0]

    const pos = draggedItem.point

    if (pos) {
      setClickMarker(pos.x, pos.y, pos.z)
      moveJointToPoint(pos.x, pos.y, pos.z)
    }
  }
}

export const onMouseDown = function (e) {
  // Find mesh from a ray

  // var mouse3D = new THREE.Vector3();

  mouse3D.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse3D.y = - (e.clientY / window.innerHeight) * 2 + 1;
  mouse3D.z = 0.5;

  raycaster.setFromCamera(mouse3D, camera);

  
  // calculate objects intersecting the picking ray

  const intersects = raycaster.intersectObjects(meshes, true); // or scene.children

  draggedItem = intersects[0]
  
  if (!intersects.length) return
  
  const pos = draggedItem.point;
  // console.log(draggedItem.object)
  

  
  // if (pos && draggedItem.object.geometry instanceof THREE.BoxGeometry) {
  if (pos) {
    
    // Set marker on contact point
    setClickMarker(pos.x, pos.y, pos.z);
    
    // Set the movement plane
    setScreenPerpCenter(pos);


    
    var idx = meshes.indexOf(draggedItem.object);
    if (idx !== -1) {
      
      addMouseConstraint(pos.x, pos.y, pos.z, bodies[idx]);
    } else if (draggedItem.object.parent.type === 'Group') {
      var idx2 = meshes.indexOf(draggedItem.object.parent);

      addMouseConstraint(pos.x, pos.y, pos.z, bodies[idx2]);
      
    
    }
  }
}

export const onMouseUp = function (e) {
  // Send the remove mouse joint to server
  removeJointConstraint();

  if (!draggedItem) return
  // remove the marker
  draggedItem = null
  removeClickMarker();
}

// This function creates a virtual movement plane for the mouseJoint to move in
const setScreenPerpCenter = function (point) {
  // Center at mouse position
  gplane.position.copy(point);

  // Make it face toward the camera
  gplane.quaternion.copy(camera.quaternion);
}