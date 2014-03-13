var renderer, scene, camera;
var outEl;

var mousex=0, mousey=0;
var devor = {
  x: 0,
  y: 0,
  z: 0
};
var rotationMatrix = new THREE.Matrix4();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  var el = document.createElement('div');
  el.appendChild(renderer.domElement);
  document.body.appendChild(el);

  scene = new THREE.Scene();
  camera = new THREE.Camera(60, window.innerWidth / window.innerHeight, 1, 10000);

  var imgsrc = 'res/';
  var urls = [
    imgsrc + 'posx.jpg',
    imgsrc + 'negx.jpg',
    imgsrc + 'posy.jpg',
    imgsrc + 'negy.jpg',
    imgsrc + 'posz.jpg',
    imgsrc + 'negz.jpg',
  ];
  var txtcube = THREE.ImageUtils.loadTextureCube(urls);

  var shader = THREE.ShaderLib.cube;
  var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
  uniforms.tCube.texture = txtcube;

  var material = new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: uniforms
  });

  var skybox = new THREE.Mesh(
    new THREE.CubeGeometry(1000, 1000, 1000, 1, 1, 1, null, true),
    material
  );
  scene.add(skybox);

  window.addEventListener('mousemove', onmousemove, false);
  window.addEventListener('deviceorientation', ondeviceorientation, false);

  outEl = document.getElementById('out');
}

function onmousemove(event) {
  mousex = event.pageX;
  mousey = event.pageY;
}

function ondeviceorientation(event) {
  
  devor.x = event.beta;
  devor.y = event.gamma;
  devor.z = event.alpha;
}

function calcRotationMatrix() {
  var mx = new THREE.Matrix4();
  var my = new THREE.Matrix4();
  var mz = new THREE.Matrix4();

  mx.makeRotationX(devor.x || 0);
  my.makeRotationY(devor.y || 0);
  mz.makeRotationZ(devor.z || 0);

  var mr = new THREE.Matrix4();
  mr.multiply(mz);
  mr.multiply(mx);
  mr.multiply(my);

  rotationMatrix.copy(mr);
}

var e = 0;
function render(t) {
  window.requestAnimationFrame(render);

  calcRotationMatrix();

  // camera.rotation.setRotationFromMatrix(rotationMatrix);
  // camera.quaternion.setFromRotationMatrix(rotationMatrix);

  renderer.render(scene, camera);
}

init();
render();