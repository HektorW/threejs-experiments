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
      float value = color.r;

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

    this.widthSegments = options.widthSegments || 40;
    this.heightSegments = options.heightSegments || 40;

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
        widthSegments = this.widthSegments,
        heightSegments = this.heightSegments,
        size = this.size,
        margin = this.margin,
        halfSize = size / 2;

    var pixelMeshes = this.pixelMeshes = new Array(this.widthSegments * this.heightSegments);

    var centerX = widthSegments / 2 * size + (widthSegments - 1) * margin * 0.5;
    var centerY = heightSegments / 2 * size + (heightSegments - 1) * margin * 0.5;

    for (var i = this.pixelMeshes.length; i--; ) {
      var xIndex = (i % widthSegments) + 1;
      var yIndex = Math.floor(i / widthSegments) + 1;

      var uvX = xIndex / widthSegments;
      var uvY = yIndex / heightSegments;

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

  DepthScreen.prototype.initGeometry = function() {
    var geometry = new THREE.BufferGeometry();

    var widthSegments = this.widthSegments,
        heightSegments = this.heightSegments,
        segmentsCount = widthSegments * heightSegments,
        size = 1,        
        halfSize = size / 2;


    var boxVertexCount = 8;
    var boxVertexPositionCount = boxVertexCount * 3;
    var boxVertexTexcoordCount = boxVertexCount * 2;
    var boxFaceCount = 12 * 3;

    var positions = new Float32Array(segmentsCount * boxVertexPositionCount);
    var texcoords = new Float32Array(segmentsCount * boxVertexTexcoordCount);
    var faces = new Float32Array(segmentsCount * boxFaceCount);


    var centerX = widthSegments / 2 * size + (widthSegments - 1);
    var centerY = heightSegments / 2 * size + (heightSegments - 1);


    var tempPositions = new Float32Array(boxVertexPositionCount);
    var tempFaces = new Float32Array(boxFaceCount);

    for (var i = 0; i < segmentsCount; ++i) {
      var xIndex = (i % widthSegments) + 1;
      var yIndex = Math.floor(i / widthSegments) + 1;

      var uvX = xIndex / widthSegments;
      var uvY = yIndex / heightSegments;

      var positionX = xIndex * size + ((xIndex - 1) * margin) - centerX;
      var positionY = yIndex * size + ((yIndex - 1) * margin) - centerY;

      this._boxVertices(tempPositions, tempFaces, positionX, positionY, halfSize);

      // Positions
      var j = boxVertexPositionCount;
      var startIndex = i * boxVertexPositionCount;
      for ( ; j--; ) {
        positions[startIndex + j] = tempPositions[j];
      }
      // Faces
      j = boxFaceCount;
      startIndex = i * boxFaceCount;
      for ( ; j--; ) {
        faces[startIndex + j] = tempFaces[j];
      }
      // Texcoords
      j = boxVertexCount;
      startIndex = i * boxVertexTexcoordCount;
      for ( ; j--; ) {
        texcoords[startIndex + j]     = uvX;
        texcoords[startIndex + j + 1] = uvY;
      }
    }

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('texcoord', new THREE.BufferAttribute(texcoords, 2));
    geometry.addAttribute('index',    new THREE.BufferAttribute(faces, 3));
  };

  DepthScreen.prototype._boxVertices = function(positions, faces, x, y, size) {
    /**
     *
     *         4----------5
     *     0----------1   |
     *     |   |      |   |
     *     |   |      |   |
     *     |   6------|---7
     *     2----------3
     */

     positions[0]  = x-size; positions[1]  = y+size; positions[2]  = +size; // 1
     positions[3]  = x+size; positions[4]  = y+size; positions[5]  = +size; // 2
     positions[6]  = x-size; positions[7]  = y-size; positions[8]  = +size; // 3
     positions[9]  = x+size; positions[10] = y-size; positions[11] = +size; // 4

     positions[12] = x-size; positions[13] = y+size; positions[14] = -size; // 5
     positions[15] = x+size; positions[16] = y+size; positions[17] = -size; // 6
     positions[18] = x-size; positions[19] = y-size; positions[20] = -size; // 7
     positions[21] = x+size; positions[22] = y-size; positions[23] = -size; // 8

     var fi = 0;
     // front
     faces[fi++] = 0; faces[fi++] = 1; faces[fi++] = 2;
     faces[fi++] = 1; faces[fi++] = 3; faces[fi++] = 2;

     // right
     faces[fi++] = 1; faces[fi++] = 5; faces[fi++] = 3;
     faces[fi++] = 5; faces[fi++] = 7; faces[fi++] = 3;

     // left
     faces[fi++] = 4; faces[fi++] = 0; faces[fi++] = 6;
     faces[fi++] = 0; faces[fi++] = 2; faces[fi++] = 6;

     // back
     faces[fi++] = 5; faces[fi++] = 4; faces[fi++] = 7;
     faces[fi++] = 4; faces[fi++] = 6; faces[fi++] = 7;

     // top
     faces[fi++] = 4; faces[fi++] = 5; faces[fi++] = 0;
     faces[fi++] = 5; faces[fi++] = 1; faces[fi++] = 0;

     // bottom
     faces[fi++] = 2; faces[fi++] = 3; faces[fi++] = 6;
     faces[fi++] = 3; faces[fi++] = 7; faces[fi++] = 6;
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