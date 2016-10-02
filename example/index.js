'use strict'

/**
 * Module dependencies.
 */

const Primitive = require('regl-primitive')
const control = require('control-panel')
const Camera = require('regl-camera')
const Model = require('../')
const Cube = require('primitive-cube')
const regl = require('multi-regl')()
const quat = require('gl-quat')
const vec3 = require('gl-vec3')

// vertex shader
const vert = `
precision mediump float;
attribute vec3 position, normal;
uniform mat4 projection, model, view;
varying vec3 vnormal;
void main () {
  vnormal = normal;
  gl_Position = projection * view * model * vec4(position, 1.0);
}
`

// fragment shader
const frag = `
precision mediump float;
varying vec3 vnormal;
void main () {
  gl_FragColor = vec4(abs(vnormal), 1.0);
}
`

// model orientation
const rotation = [0, 0, 0, 1]
const position = [0, 0, 0]
const scale = [1, 1, 1]
const x = [0, 0, 0, 1]
const y = [0, 0, 0, 1]
const z = [0, 0, 0, 1]

// camera angles
let theta = 0
let phi = 0
let dx = 0.001333
let dy = 0.004532

// dom query helper
const dom = (s) => document.querySelector(s)

// regl objects
const ctx = regl(dom('#model'))
const geometry = Cube()
const camera = Camera(ctx, {mouse: false, distance: 40, center: [0, 0, -4]})
const model = Model(ctx)
const group = Model(ctx)
const cube = Primitive(ctx, geometry, {vert, frag})

// model count
let count = 8

// control panel
const panel = control([
  {type: 'range', label: 'count', min: 0, max: 100, initial: count},

  // position setters
  {type: 'range', label: 'position.x', min: -10, max: 10, initial: 0},
  {type: 'range', label: 'position.y', min: -10, max: 10, initial: 0},
  {type: 'range', label: 'position.z', min: -10, max: 10, initial: 0},

  // rotation setters
  {type: 'range', label: 'rotation.x', min: 0, max: Math.PI, initial: 0},
  {type: 'range', label: 'rotation.y', min: 0, max: Math.PI, initial: 0},
  {type: 'range', label: 'rotation.z', min: 0, max: Math.PI, initial: 0},

  // scale setters
  {type: 'range', label: 'scale.x', min: 1, max: 5, initial: 1},
  {type: 'range', label: 'scale.y', min: 1, max: 5, initial: 1},
  {type: 'range', label: 'scale.z', min: 1, max: 5, initial: 1},
], {
  position: 'bottom-right',
  title: "Model Properties",
  theme: 'dark',
  root: dom('#controls'),
}).on('input', (state) => {
  count = state.count

  position[0] = state['position.x']
  position[1] = state['position.y']
  position[2] = state['position.z']

  scale[0] = state['scale.x']
  scale[1] = state['scale.y']
  scale[2] = state['scale.z']

  quat.setAxisAngle(x, [1, 0, 0], state['rotation.x'])
  quat.setAxisAngle(y, [0, 1, 0], state['rotation.y'])
  quat.setAxisAngle(z, [0, 0, 1], state['rotation.z'])

  quat.multiply(rotation, quat.multiply([], x, y), z)
})

// export for console usage
Object.assign(window, {
  geometry,
  camera,
  model,
  panel,
  ctx,
  cube,
  dom,
})

// render loop !
ctx.frame(({time}) => {
  ctx.clear({color: [0, 0, 0, 0], depth: true})

  if (phi < -0.49*Math.PI) {
    dx *= +1.0
  } else if (phi > 0.49*Math.PI) {
    dx *= -1.0
  }

  if (theta < Math.PI) {
    dy *= +1.0
  } else if (theta > 2*Math.PI) {
    dy *= -1.0
  }

  phi += dx
  theta += dy

  camera({theta, phi}, () => {
    group({rotation, position, scale}, ({transform}) => {
      const models = Array(count)

      let j = 1
      for (let i = 0; i < count; ++i) {
        let p = []

        switch (i % 8) {
          case 0: p = [+j, +j, +j]; break
          case 1: p = [-j, +j, +j]; break
          case 2: p = [-j, -j, +j]; break
          case 3: p = [+j, -j, +j]; break
          case 4: p = [+j, +j, -j]; break
          case 5: p = [-j, +j, -j]; break
          case 6: p = [-j, -j, -j]; break
          case 7: p = [+j, -j, -j]; // falls through to default
          default: void ++j
        }

        model({ transform: transform, position: p }, () => cube())
      }
    })
  })
})
