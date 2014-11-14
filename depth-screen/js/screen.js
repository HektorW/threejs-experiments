(function(factory) {

  if (typeof define !== 'undefined' && define.amd) {
    define(['threejs'], factory);
  } else {
    factory(THREE);
  }

}(function(THREE) {

  var displace_vert = (function() {/*
    uniform sampler2D heightTexture;
    uniform float heightValue;

    varying vec2 vUv;

    vec4 grayscale(vec4 color) {
      float val = (color.r + color.g + color.b) / 3.0;
      return vec4(val, val, val, color.a);
    }


    vec4 luminosity(vec4 color) {
      float v = (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 3.0;
      return vec4(v, v, v, color.a);
    }

    void main() {
      vUv = uv;

      vec4 color = luminosity(texture2D(heightTexture, uv));
      vec3 pos = position;
      float value = color.r;

      pos.z = value * heightValue;

      gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    }
  */}).toString().split('\n').slice(1, -1).join('\n');



  /**
   * @constructor
   * @param {object} options Contains all options sent to screen
   */
  function DepthScreen(options) {
    if (!options.geometry) {
      throw new Error('Geometry is required as argument');
    }

    this.geometry = options.geometry;

    this.width_segments = options.width_segments || 40;
    this.height_segments = options.height_segments || 40;

    this.size = options.size || 20;
    this.margin = options.margin || 4;

    this.diffuse_texture = options.diffuse_texture;
    this.height_texture = options.height_texture;

    this.init();
  }

  DepthScreen.prototype.init = function() {
    var scene = this.scene = new THREE.Scene();

    var geometry = this.geometry,
        width_segments = this.width_segments,
        height_segments = this.height_segments,
        size = this.size,
        margin = this.margin,
        halfSize = size / 2;

    this.pixelMeshes = new Array(this.width_segments * this.height_segments);

    var offsetX = (width_segments / 2) * size + ((width_segments / 2) - 1) * margin;
    var offsetY = (height_segments / 2) * size + ((height_segments / 2) - 1) * margin;

    for (var i = this.pixelMeshes.length; i--; ) {

      var material = new THREE.ShaderMaterial({
        uniforms: {
          heightTexture: {
            type: 't',
            value: null
          },
          heightTextureUV: {
            type: 'v2',
            value: new THREE.Vector2()
          }
        },
        vertexShader: displace_vert,
        side: THREE.DoubleSide
      });

      var mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    }

    this._updateTextures();
  };

  DepthScreen.prototype.setHeightTexture = function(height_texture) {
    this.height_texture = height_texture;
    this._updateTextures();
  };
  DepthScreen.prototype.setDiffuseTexture = function(diffuse_texture) {
    this.diffuse_texture = diffuse_texture;
    this._updateTextures();
  };
  DepthScreen.prototype._updateTextures = function() {
    var height_texture = this.height_texture,
        diffuse_texture = this.diffuse_texture;

    if (!diffuse_texture || !height_texture) {
      return;
    }

    for (var i = this.pixelMeshes.length; i--; ) {
      var material = this.pixelMeshes[i].material;
      material.map = diffuse_texture;
      material.uniforms.heightTexture.value = heightTexture;
      material.needsUpdate = true;
    }
  };

  DepthScreen.prototype.draw = function(renderer, camera) {
    renderer.render(this.scene, camera);
  };

}));