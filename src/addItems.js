import delay from 'delay'

// Models
import hihat from './models/hihat.glb'
import snare from './models/snare.glb'
import kick from './models/kick.glb'
import jupiter from './models/jupiter.glb'
import op1 from './models/op2.glb'
import mustang from './models/mustang.glb'
import pedal from './models/pedal.glb'
import amp from './models/amp.glb'
import bass from './models/bass.glb'


// Adders
// import { addCube } from './add/addCube'
import { addSphere } from './add/addSphere'
import { addModel } from './add/addModel'


export default async function () {

  // addCube({
  //   quantity: 3
  // })

  await delay(200)

  addModel({
    gltf: kick,
    mass: 25,
    position: { x: 0, y: 25, z: 0, }
  })

  await delay(200)

  addModel({
    gltf: snare,
    mass: 8,
    quantity: 1,
    position: { x: -1, y: 35, z: 3, },
  })

  addModel({
    gltf: hihat,
    quantity: 1,
    mass: 8,
    position: { x: 4, y: 38, z: 2, },
  })

  await delay(2000)
  
  addModel({
    gltf: bass,
    mass: 8,
    quantity: 1,
    position: { x: 3, y: 36, z: 6, },
  })

  await delay(100)

  addModel({
    gltf: mustang,
    quantity: 1,
    mass: 5,
    position: { x: 3, y: 24, z: 3, },
  })

  await delay(2000)

  addModel({
    gltf: amp,
    quantity: 1,
    mass: 15,
    position: { x: 4, y: 33, z: 2, },
  })

  addModel({
    gltf: jupiter,
    mass: 7,
    quantity: 1,
    position: { x: -3, y: 13, z: 4, },
  })

  await delay(2000)

  addModel({
    gltf: pedal,
    mass: 1,
    quantity: 10,
    position: { x: -9, y: 11, z: -4, },
  })

  await delay(1500)

  addModel({
    gltf: op1,
    mass: 1,
    quantity: 1,
    position: { x: 7, y: 8, z: 1, },
  })

  await delay(1000)

  addSphere({
    quantity: 12,
    color: 'yellow',//'#' + Math.floor(Math.random() * 16777215).toString(16)
  })

  
}
