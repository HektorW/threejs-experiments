(function(factory) {

  if (typeof define !== 'undefined' && define.amd) {
    define(['threejs'], factory);
  } else {
    window.DepthScreen = factory(THREE);
  }

}(function(THREE) {

  var displace_vert = (function() {/*
    uniform sampler2D heightTexture;
    uniform vec2 heightTextureUV;

    uniform float heightValue;

    varying vec2 vUv;

    vec4 grayscale(vec4 color) {
      float val = (color.r + color.g + color.b) / 3.0;
      return vec4(val, val, val, color.a);
    }

    void main() {
      vUv = uv;

      vec4 color = grayscale(texture2D(heightTexture, heightTextureUV));
      vec3 pos = position;
      float value = 1.0 - color.r;

      pos.z *= value * heightValue;
      //if (pos.z < 0.0) pos.z = 0.0;

      gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    }
  */}).toString().split('\n').slice(1, -1).join('\n');

  var displace_frag = (function() {/*
    uniform sampler2D diffuseTexture;
    uniform vec2 heightTextureUV;

    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(diffuseTexture, heightTextureUV);

      gl_FragColor = vec4(color.r, color.g, color.b, {opacity});
    }
  */}).toString().split('\n').slice(1, -1).join('\n');



  function DepthScreen(options) {
    this.geometry = options.geometry || new THREE.BoxGeometry(1, 1, 1);

    this.width_segments = options.width_segments || 40;
    this.height_segments = options.height_segments || 40;

    this.size = typeof options.size === 'number' ? options.size : 20;
    this.margin = typeof options.margin === 'number' ? options.margin : 4;
    this.height = typeof options.height === 'number' ? options.height : 10;
    this.opacity = typeof options.opacity === 'number' ? options.opacity : 1;

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

    var pixelMeshes = this.pixelMeshes = new Array(this.width_segments * this.height_segments);

    var centerX = width_segments / 2 * size + (width_segments - 1) * margin * 0.5;
    var centerY = height_segments / 2 * size + (height_segments - 1) * margin * 0.5;

    for (var i = this.pixelMeshes.length; i--; ) {
      var xIndex = (i % width_segments) + 1;
      var yIndex = Math.floor(i / width_segments) + 1;

      var uvX = xIndex / width_segments;
      var uvY = yIndex / height_segments;

      var material = new THREE.ShaderMaterial({
        uniforms: {
          heightTexture: {
            type: 't',
            value: null
          },
          diffuseTexture: {
            type: 't',
            value: null
          },
          heightValue: {
            type: 'f',
            value: this.height
          },
          heightTextureUV: {
            type: 'v2',
            value: new THREE.Vector2(uvX, uvY)
          }
        },
        vertexShader: displace_vert,
        fragmentShader: displace_frag.replace('{opacity}', this.opacity),
        side: THREE.DoubleSide
      });

      material.transparent = true;

      var mesh = new THREE.Mesh(geometry, material);

      var positionX = xIndex * size + ((xIndex - 1) * margin) - centerX;
      var positionY = yIndex * size + ((yIndex - 1) * margin) - centerY;

      mesh.scale.set(size, size, size);
      mesh.position.set(positionX, positionY, 0);

      pixelMeshes[i] = mesh;
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
    var height_texture = this.diffuse_texture, // Uses diffuse textures black/white as height texture
        diffuse_texture = this.diffuse_texture;

    if (!diffuse_texture || !height_texture) {
      return;
    }

    for (var i = this.pixelMeshes.length; i--; ) {
      var material = this.pixelMeshes[i].material;
      material.uniforms.diffuseTexture.value = diffuse_texture;
      material.uniforms.heightTexture.value = height_texture;
    }
  };

  DepthScreen.prototype.draw = function(renderer, camera) {
    renderer.render(this.scene, camera);
  };

  return DepthScreen;

}));