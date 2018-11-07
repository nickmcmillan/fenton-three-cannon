import * as THREE from 'three'
import * as CANNON from 'cannon'
import GLTFLoader from 'three-gltf-loader';
// import DracoDecoderModule from 'aadraco-decoder';
// import DRACOLoader from 'draco3dgltf';
import { meshes, scene, world, bodies } from '../index'
import { promisifyLoader } from '../utils/promisifyLoader'
// import { threeToCannon } from 'three-to-cannon';
// import DRACOLoader from 'aadraco-decoder'
// import DRACOLoader from 'threejs-ext/src/loaders/DRACOLoader';
// import cock from '../draco/draco_decoder'

export const loadG = async ({ name, gltf, quantity, position }) => {

  const loader = new GLTFLoader()

  // const loader = new DRACOLoader()
  // console.log(dracoL)
  // console.log(loader)

  // loader.decodeDracoFile(cock)
  
  

  // loader.setDRACOLoader(new DRACOLoader())

  // console.log(new DRACOLoader())
  
  

  // loader.setResourcePath(bin)


  const mtlPromiseLoader = promisifyLoader(loader)
  const object = await mtlPromiseLoader.load(gltf).then(gltf => gltf.scene)

  

  object.name = name

  // object.geometry.computeVertexNormals();

  object.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  
  // DRACOLoader.releaseDecoderModule();


  // get dimensions from three  
  const tempBox = new THREE.Box3().setFromObject(object)
  const { x, y, z } = tempBox.getSize()

  // apply dimensions to cannon
  const shape = new CANNON.Box(new CANNON.Vec3(x / 2, y / 2, z / 2))

  for (var i = 0; i < quantity; i++) {

    let clonedObj = object
    if (i !== 0) clonedObj = object.clone() // if its looping, start cloning

    // add to threejs
    meshes.push(clonedObj)
    scene.add(clonedObj)

    // add to cannon
    const body = new CANNON.Body({
      mass: 50,
      shape,
      // fixedRotation: true,
      // linearDamping: 0.5,
      angularDamping: 0.99,
    })

    body.name = name

    body.position.set(position.x, position.y, position.z)
    body.velocity.set(Math.random() * 20, Math.random() * 20, Math.random() * 20)

    world.add(body)
    bodies.push(body)

  }

  

}