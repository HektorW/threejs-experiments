(function(factory) {

  if (typeof define !== 'undefined' && define.amd) {
    define(['threejs'], factory);
  } else {
    window.DepthScreen = factory(THREE);
  }

}(function(THREE) {

  var vert = (function() {/*
    uniform sampler2D heightTexture;
    uniform float height;

    varying vec2 vUv;

    vec4 grayscale(vec4 color) {
      float val = (color.r + color.g + color.b) / 3.0;
      return vec4(val, val, val, color.a);
    }

    void main() {
      vUv = uv;

      float value = grayscale(texture2D(heightTexture, uv)).r;
      vec3 pos = position;
      pos.z *= value * height;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1);
    }
  */}).toString().split('\n').slice(1, -1).join('\n');
  var frag = (function() {/*
    uniform sampler2D diffuseTexture;
    uniform float opacity;

    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(diffuseTexture, vUv);
      gl_FragColor = vec4(color.r, color.g, color.b, opacity);
    }
  */}).toString().split('\n').slice(1, -1).join('\n');



  function DepthScreen(options) {
    this.geometry = options.geometry || new THREE.BoxGeometry(1, 1, 1);

    this.widthSegments = options.widthSegments || 40;
    this.heightSegments = options.heightSegments || 40;

    this.size = typeof options.size === 'number' ? options.size : 1;
    this.margin = typeof options.margin === 'number' ? options.margin : 0;
    this.height = typeof options.height === 'number' ? options.height : 10;
    this.opacity = typeof options.opacity === 'number' ? options.opacity : 1;

    this.texture = options.texture;

    this.init();
  }


  DepthScreen.prototype.init = function() {
    var scene = this.scene = new THREE.Scene();

    this.geometry = this.getScreenGeometry();
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        heightTexture: {
          type: 't',
          value: this.texture
        },
        height: {
          type: 'f',
          value: this.height
        },
        diffuseTexture: {
          type: 't',
          value: this.texture
        },
        opacity: {
          type: 'f',
          value: this.opacity
        }
      },
      vertexShader: vert,
      fragmentShader: frag,
      side: THREE.DoubleSide
    });
    this.material.transparent = true;

    this.screenMesh = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.screenMesh);
  };

  DepthScreen.prototype.getScreenGeometry = function() {
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
    var faces = new Uint16Array(segmentsCount * boxFaceCount);


    var offsetX = widthSegments * 0.5 * size;
    var offsetY = heightSegments * 0.5 * size;

    var tempPositions = new Float32Array(boxVertexPositionCount);
    var tempFaces = new Uint16Array(boxFaceCount);

    var faceIndex = 0;

    for (var i = 0; i < segmentsCount; ++i) {
      var xIndex = (i % widthSegments);
      var yIndex = Math.floor(i / widthSegments);

      var uvX = xIndex / (widthSegments - 1);
      var uvY = yIndex / (heightSegments - 1);

      var centerPositionX = (xIndex + 1) * size - offsetX - halfSize;
      var centerPositionY = (yIndex + 1) * size - offsetY - halfSize;

      this._boxVertices(tempPositions, tempFaces, centerPositionX, centerPositionY, halfSize, faceIndex);
      faceIndex += boxVertexCount;

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
        texcoords[startIndex + j * 2]     = uvX;
        texcoords[startIndex + j * 2 + 1] = uvY;
      }
    }

    geometry.addAttribute('uv', new THREE.BufferAttribute(texcoords, 2));
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('index',    new THREE.BufferAttribute(faces, 1));
    
    geometry.computeBoundingBox();

    return geometry;
  };

  DepthScreen.prototype._boxVertices = function(positions, faces, x, y, size, faceIndex) {
    /**
     *
     *         4----------5
     *     0----------1   |
     *     |   |      |   |
     *     |   |      |   |
     *     |   6------|---7
     *     2----------3
     */

     positions[0]  = x-size; positions[1]  = y+size; positions[2]  = +size; // 0
     positions[3]  = x+size; positions[4]  = y+size; positions[5]  = +size; // 1
     positions[6]  = x-size; positions[7]  = y-size; positions[8]  = +size; // 2
     positions[9]  = x+size; positions[10] = y-size; positions[11] = +size; // 3

     positions[12] = x-size; positions[13] = y+size; positions[14] = -size; // 4
     positions[15] = x+size; positions[16] = y+size; positions[17] = -size; // 5
     positions[18] = x-size; positions[19] = y-size; positions[20] = -size; // 6
     positions[21] = x+size; positions[22] = y-size; positions[23] = -size; // 7

     var fi = 0;
     // front
     faces[fi++] = faceIndex + 0; faces[fi++] = faceIndex + 1; faces[fi++] = faceIndex + 2;
     faces[fi++] = faceIndex + 1; faces[fi++] = faceIndex + 3; faces[fi++] = faceIndex + 2;

     // right
     faces[fi++] = faceIndex + 1; faces[fi++] = faceIndex + 5; faces[fi++] = faceIndex + 3;
     faces[fi++] = faceIndex + 5; faces[fi++] = faceIndex + 7; faces[fi++] = faceIndex + 3;

     // left
     faces[fi++] = faceIndex + 4; faces[fi++] = faceIndex + 0; faces[fi++] = faceIndex + 6;
     faces[fi++] = faceIndex + 0; faces[fi++] = faceIndex + 2; faces[fi++] = faceIndex + 6;

     // back
     faces[fi++] = faceIndex + 5; faces[fi++] = faceIndex + 4; faces[fi++] = faceIndex + 7;
     faces[fi++] = faceIndex + 4; faces[fi++] = faceIndex + 6; faces[fi++] = faceIndex + 7;

     // top
     faces[fi++] = faceIndex + 4; faces[fi++] = faceIndex + 5; faces[fi++] = faceIndex + 0;
     faces[fi++] = faceIndex + 5; faces[fi++] = faceIndex + 1; faces[fi++] = faceIndex + 0;

     // bottom
     faces[fi++] = faceIndex + 2; faces[fi++] = faceIndex + 3; faces[fi++] = faceIndex + 6;
     faces[fi++] = faceIndex + 3; faces[fi++] = faceIndex + 7; faces[fi++] = faceIndex + 6;
  };

  DepthScreen.prototype.setHeight = function(height) {
    this.height = height;
    this.material.uniforms.height.value = this.height;
  };

  DepthScreen.prototype.setOpacity = function(opacity) {
    this.opacity = opacity;
    this.material.uniforms.opacity.value = this.opacity;
  };

  DepthScreen.prototype.setTexture = function(texture) {
    this.texture = texture;
    
    this.material.uniforms.diffuseTexture.value = this.texture;
    this.material.uniforms.heightTexture.value = this.texture;
  };

  DepthScreen.prototype.draw = function(renderer, camera) {
    renderer.render(this.scene, camera);
  };

  return DepthScreen;

}));