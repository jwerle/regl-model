regl-model
==========

Generate a model matrix from position, scale, and rotation vectors.
This module will generate a regl command that will provide a
`uniform mat4 model` derived from input variables. The command will also
expose context variables

## Installation

```sh
$ npm install regl-model --save
```

See [demo here](https://jwerle.github.io/regl-model/example/)

## Example

```js
const quat = require('gl-quat')
const regl = require('regl')()
const model = require('regl-model')(regl)
const bunny = require('regl-primitive')(regl, require('bunny'))
const camera = require('regl-camera')(regl, {distance: 40})
const material = regl({
  vert: `
  precision mediump float;
  attribute vec3 position, normal;
  uniform mat4 projection, model, view;
  varying vec3 vnormal;
  void main () {
    vnormal = normal;
    gl_Position = projection * view * model * vec4(position, 1.0);
  }
  `,

  frag: `
  precision mediump float;
  varying vec3 vnormal;
  void main () {
    gl_FragColor = vec4(abs(vnormal), 1.0);
  }
  `,
})

const rotation = [0, 0, 0, 1]
regl.frame(({time}) => {
  regl.clear({color: [0, 0, 0, 1], depth: true})
  quat.identity(rotation)
  quat.rotateX(rotation, rotation, 0.8*time)
  quat.rotateY(rotation, rotation, 0.8*time)
  camera(() => {
    model({rotation}, () => {
      material(() => {
        bunny()
      })
    })
  })
})

```

## API

### Constructor

#### `const model = require('regl-model)(regl[, initialState])`

where `regl-model` expects the following arguments:

* `regl` - A handle to a regl instance
* `initialState` - Initial model state

where `initialState` can contain one of the following properties:

* `position` - Initial position vector (default: `[0, 0, 0]`)
* `scale` - Initial scale vector (default: `[1, 1, 1]`)
* `rotation` - Initial rotation quaternion (default: `[0, 0, 0, 1]`)

and `model` is now a function that accepts the same input as the
`initialState` object.


#### Usage

```js
regl.frame(() => {
  model({rotation, position, scale}, ({transform}) => {
    drawCommand()
  })
})
```

#### Input

The `model` function accepts following context variables:

* `transform` - Parent model transform that will be applied to model
  matrix
* `rotation` - Rotation quaternion
* `position` - Position vector
* `scale` - Scale vector

#### Context

The `model` function will expose the following context variables:

* `transform` - Local model transform that can be used as input to
  another `regl-model` command
* `rotation` - Rotation quaternion applied to model matrix
* `position` - Position vector applied to model matrix
* `scale` - Scale vector applied to model matrix

## License

API
