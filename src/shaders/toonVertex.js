export default `
precision highp float;
varying vec2 vUv;
varying vec3 vLightFront;

// 注入three.js中预定义的glsl片段
#include <common>
#include <lights_pars>
void main() {
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>
    #include <begin_vertex>
    #include <project_vertex>
    // 在lights_lambert_vertex这段代码中计算了vLightFront
    // https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/lights_lambert_vertex.glsl
    #include <lights_lambert_vertex>
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`
