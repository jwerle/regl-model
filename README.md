regl-model
==========

Generate a model matrix from position, scale, and rotation vectors.

## Installation

```sh
$ npm install regl-model --save
```

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
  quat.rotateX(rotation, rotation, 0.5*time)
  camera(() =>
    model({rotation}, () =>
      material(() =>
        bunny()
      )
    )
  )
})

```

## API

## License

API
