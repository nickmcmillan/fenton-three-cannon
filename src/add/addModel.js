import * as THREE from 'three'
import * as CANNON from 'cannon'
import GLTFLoader from 'three-gltf-loader';
// import DracoDecoderModule from 'aadraco-decoder';
// import DRACOLoader from 'draco3dgltf';
import { meshes, scene } from '../three'
import { world, bodies } from '../cannon'
import { promisifyLoader } from '../utils/promisifyLoader'
import randomInRange from '../utils/randomInRange'
// import { threeToCannon } from 'three-to-cannon';
// import DRACOLoader from 'aadraco-decoder'
// import DRACOLoader from 'threejs-ext/src/loaders/DRACOLoader';
// import dracoDecoder from '../draco/draco_decoder'

THREE.Cache.enabled = true // so Three doesn't reload the glb file if quantity > 1

const vec3 = new THREE.Vector3()

export const addModel = async ({
  gltf,
  position,
  rotation = { x: 0, y: 0, z: 0,},
  mass = 5,
  quantity = 1, // damping, 0 is light, 1 is heavy
  angularDamping = 0.99, // default is 0.01 which just looks silly cos it spins for ages
  linearDamping = 0.01, // linear damping smooths out jitter
  angularVelocity = { x: 0, y: 0.5, z: 0.5, }, // modifying it a little so the items don't just drop perfectly (which looks unnatural)
}) => {

  // const loader = new DRACOLoader()
  // console.log(dracoL)
  // console.log(loader)

  // loader.decodeDracoFile(dracoDecoder)
  
  

  // loader.setDRACOLoader(new DRACOLoader())

  // console.log(new DRACOLoader())


  // loader.setResourcePath(bin)
  for (var i = 0; i < quantity; i++) {
    const loader = new GLTFLoader()
    const mtlPromiseLoader = promisifyLoader(loader)
    const mesh = await mtlPromiseLoader.load(gltf).then(gltf => gltf.scene)
    // console.log(mesh)
    

    mesh.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.name = mesh.uuid
        // child.rotation.setFromVector3(new Vector3(0, Math.PI /2, Math.PI / 2));    
      }
    })

    // mesh.rotation.setFromVector3(new Vector3(0, Math.PI /2, Math.PI / 2));
    
    // DRACOLoader.releaseDecoderModule();


    // get dimensions from three  
    const tempBox = new THREE.Box3().setFromObject(mesh)
    const { x, y, z } = tempBox.getSize(vec3)

    // apply dimensions to cannon (but halve them)
    const shape = new CANNON.Box(new CANNON.Vec3(x / 2, y / 2, z / 2))
    // const physicsMaterial = new CANNON.Material('physicsMaterial')

  
    // let clonedObj = mesh
    // if (i !== 0) clonedObj = mesh.clone() // if its looping, start cloning

    // add to threejs
    mesh.name = mesh.uuid
    meshes.push(mesh)
    scene.add(mesh)    

    
    // const material = new CANNON.ContactMaterial(
    //   physicsMaterial,
    //   {
    //     // friction: 10,
    //     restitution: 2.5,
    //     // contactEquationRelaxation: 1,
    //     // contactEquationStiffness: 5,
    //     frictionEquationStiffness: 5,
    //   }
    // )
    
    // add to cannon
    const body = new CANNON.Body({ mass, shape, angularDamping, linearDamping, angularVelocity, /*material*/ })



    // console.log(body)
    
    body.name = mesh.uuid
    body.position.set(position.x, position.y, position.z)
    body.velocity.set(randomInRange(-1, 1), randomInRange(-20, 20), randomInRange(-1, 1))
    world.add(body)
    bodies.push(body)
  }
}