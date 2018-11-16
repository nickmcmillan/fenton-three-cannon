// import * as THREE from 'three'
// import * as CANNON from 'cannon'
// import { MTLLoader, OBJLoader } from 'three-obj-mtl-loader'

// import { meshes, scene, world, bodies } from '../index'
// // import { threeToCannon } from 'three-to-cannon';


// function promisifyLoader(loader, onProgress) {
//   function promiseLoader(url) {

//     return new Promise((resolve, reject) => {
//       loader.load(url, resolve, onProgress, reject)
//     })
//   }

//   return {
//     originalLoader: loader,
//     load: promiseLoader,
//   }
// }


// export const loadModel = async ({name, mtl, obj, quantity, position, offsets}) => {

//   const mtlLoader = new MTLLoader()
//   const objLoader = new OBJLoader()

//   const mtlPromiseLoader = promisifyLoader(mtlLoader)
//   const materials = await mtlPromiseLoader.load(mtl).then(mtl => mtl)

//   materials.preload()
//   objLoader.setMaterials(materials)

//   const objPromiseLoader = promisifyLoader(objLoader)
//   const object = await objPromiseLoader.load(obj).then(obj => obj)

//   object.name = name
  
//   object.traverse(child => {
//     child.position.x = offsets.x || 0
//     child.position.y = offsets.y || 0
//     child.position.z = offsets.z || 0
//     if (child instanceof THREE.Mesh) {
//       child.castShadow = true
//       child.receiveShadow = true
//     }
//   })

//   // get dimensions from three  
//   const tempBox = new THREE.Box3().setFromObject(object)
//   const { x, y, z } = tempBox.getSize()
  
//   // apply dimensions to cannon
//   const shape = new CANNON.Box(new CANNON.Vec3(x/2, y/2, z/2))
  
//   for (var i = 0; i < quantity; i++) {
    
//     let clonedObj = object
//     if (i !== 0) clonedObj = object.clone() // if its looping, start cloning
    
//     // add to threejs
//     meshes.push(clonedObj)
//     scene.add(clonedObj)
    
//     // add to cannon
//     const body = new CANNON.Body({
//       mass: 500,
//       shape,
//       // fixedRotation: true,
//       // linearDamping: 0.5,
//       angularDamping: 0.99,
//     })
    
//     body.name = name

//     body.position.set(position.x, position.y, position.z )

//     world.add(body)
//     bodies.push(body)

//   }
// }