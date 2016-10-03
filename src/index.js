'use strict'

/**
 * Module dependencies.
 */

const mat4 = require('gl-mat4')

/**
 * Creates a regl command that defines a model
 * uniform mat4. It also expose a transform
 * matrix that can be accepted as input to other
 * model draw commands. An exposed transform allows
 * for a hierarchy of transforms to be applied to models.
 *
 * @public
 * @param {Function} regl
 * @param {(Object)?} initialState
 * @return {Function}
 */

module.exports = createREGLModel
function createREGLModel(regl, initialState) {
  if ('function' != typeof regl) {
    throw new TypeError("Expecting regl to be a function.")
  }

  // global matrix
  const transform = mat4.identity([])
  initialState = initialState || {}

  // configurable properties
  const rotation = initialState.rotation || [0, 0, 0, 1]
  const position = initialState.position || [0, 0, 0]
  const scale = initialState.scale || []

  for (let i = 0; i < position.length; ++i) {
    if (null == scale[i]) {
      scale[i] = 1
    }
  }

  // init regl draw command
  const draw = regl({
    context: {
      transform: transform,
      rotation: rotation,
      position: position,
      scale: scale,
    },

    uniforms: {
      model(ctx, props) {
        props = props || {}
        const model = []
        mat4.identity(model)

        if ('rotation' in props) {
          rotation[0] = props.rotation[0] || 0
          rotation[1] = props.rotation[1] || 0
          rotation[2] = props.rotation[2] || 0
          rotation[3] = props.rotation[3] || 1
        }

        if ('position' in props) {
          position[0] = props.position[0] || 0
          position[1] = props.position[1] || 0
          ;(null != props.position[2]) && (position[2] = props.position[2] || 0)
        }

        if ('scale' in props) {
          scale[0] = props.scale[0] || 0
          scale[1] = props.scale[1] || 0
          ;(null != props.scale[2]) && (scale[2] = props.scale[2] || 0)
        }

        ;(3 == position.length) && mat4.translate(model, model, position)
        mat4.multiply(model, model, mat4.fromQuat([], rotation))
        ;(3 == scale.length) && mat4.scale(model, model, scale)
        ;('transform' in props) && mat4.multiply(model, props.transform, model)
        mat4.copy(transform, model)
        return model
      }
    }
  })

  return Object.assign(draw, {
    get transform() { return transform },
    get position() { return position },
    get rotation() { return rotation },
    get scale() { return scale },
  })
}
