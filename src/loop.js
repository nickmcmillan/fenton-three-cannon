export default function loop() {
    updateOimoPhysics();
    raycaster.setFromCamera(mouse, camera);
  
    theta += 0.1;

    camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
    camera.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
    camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta));
    camera.lookAt(scene.position);
    renderer.render( scene, camera );
    requestAnimationFrame( loop );
}