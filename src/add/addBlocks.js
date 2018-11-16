import { Mesh, MeshBasicMaterial, BoxBufferGeometry } from 'three'
import { scene } from './index'

export default function addBlocks() {
  var geometry = new BoxBufferGeometry(100, 100, 100);

  var objects = [];
  for (var i = 0; i < 5; i++) {

    var object = new Mesh(geometry, new MeshBasicMaterial({ color: Math.random() * 0xffffff, opacity: 0.5 }));
    object.position.x = Math.random() * 800 - 400;
    object.position.y = Math.random() * 800 - 400;
    object.position.z = Math.random() * 800 - 400;

    object.scale.x = Math.random() * 2 + 1;
    object.scale.y = Math.random() * 2 + 1;
    object.scale.z = Math.random() * 2 + 1;

    object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;
    object.rotation.z = Math.random() * 2 * Math.PI;

    scene.add(object);

    objects.push(object);

  }
}