var renderer, scene, camera;
var socket;

var pointLight;

var buildings;
var buildingCount = 300;
var size = 300;

var maxHeight = 20;
var minHeight = 5;
var maxSize = 8;
var minSize = 3;

var camRot = 0.0;

var moving = false;

var devor = {
  x: 0,
  y: 0,
  z: 0
};
var DEGTORAD = Math.PI / 180;
var cos = Math.cos;
var sin = Math.sin;

var rotationMatrix = new THREE.Matrix4();


function init() {
  initThree();
  initCity();
  initControls();
  initConnection();
}

function initThree() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.position.y = 10.0;

  scene.add(new THREE.AmbientLight(0x404040));

  var dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(1, 1, 1);
  // scene.add(dirLight);

  pointLight = new THREE.PointLight(0xffffff, 2.0, 20.0);
  scene.add(pointLight);

  scene.fog = new THREE.Fog(0xaaaaaa, 1.0, 100.0);

  var el = document.createElement('div');
  el.appendChild(renderer.domElement);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  el.style.height = '100%';
  document.body.appendChild(el);
}

function initCity() {
  var g, m, o, s, h;


  // floor
  g = new THREE.PlaneGeometry(size, size);
  m = new THREE.MeshBasicMaterial({
    color: 0x001f3f,
    side: THREE.DoubleSide
  });
  o = new THREE.Mesh(g, m);
  o.rotateX(Math.PI / 2);

  scene.add(o);


  // buildings
  buildings = [];
  for (var i = buildingCount; i--;) {
    s = rand(minSize, maxSize);
    h = rand(minHeight, maxHeight);
    g = new THREE.CubeGeometry(s, h, s);
    m = new THREE.MeshPhongMaterial({
      ambient: 0xff4136,
      color: 0xff4136,
      // specualar: 0xff4136,
      side: THREE.DoubleSide
    });
    o = new THREE.Mesh(g, m);
    o.position.x = rand(-size / 2, size / 2);
    o.position.y = h / 2.0;
    o.position.z = rand(-size / 2, size / 2);
    scene.add(o);
    buildings.push(o);
  }


  g = new THREE.CubeGeometry(size, size, size);
  m = new THREE.MeshBasicMaterial({
    color: 0xaaaaaa,
    side: THREE.DoubleSide
  });
  scene.add(new THREE.Mesh(g, m));
}

function initControls() {
  window.addEventListener('keydown', function(ev) {
    switch (ev.keyCode) {
      case 65:
        camera.position.x += 1;
        break;
      case 68:
        camera.position.x -= 1;
        break;
      case 87:
        camera.position.z += 1;
        break;
      case 83:
        camera.position.z -= 1;
        break;
    }

    camera.lookAt(new THREE.Vector3(0, 0, 0));
    pointLight.position.copy(camera.position);
  }, false);
}

function initConnection() {
  socket = io.connect(':8090');

  socket.on('connect', function() {
    socket.emit('role', 'client');
    console.log('connected');
  });
  socket.on('orientation', function(data) {
    // var p = camera.position;
    // var l = new THREE.Vector3(data.x, data.y, data.z);
    // var v = new THREE.Vector3();
    // v.copy(p);
    // v.add(l);
    // camera.lookAt(v);

    devor.x = data.x;
    devor.y = data.y;
    devor.z = data.z;

    document.getElementById('out').innerHTML = '[ ' + data.x + ', ' + data.y + ', ' + data.z + ' ]';
  });
  socket.on('move:start', function(data) {
    moving = true;
  });
  socket.on('move:end', function(data) {
    moving = false;
  });
}

function calcRotationMatrix() {
  var x = (devor.x || 0) * DEGTORAD;
  var y = (devor.y || 0) * DEGTORAD;
  var z = (devor.z || 0) * DEGTORAD;


  var cosx = cos(x);
  var sinx = sin(x);
  var cosy = cos(y);
  var siny = sin(y);
  var cosz = cos(z);
  var sinz = sin(z);


  var m11 = cosy * cosz - sinx * siny * sinz;
  var m12 = -cosx * sinz;
  var m13 = cosz * siny + cosy * sinx * sinz;

  var m21 = cosz * sinx * siny + cosy * sinz;
  var m22 = cosx * cosz;
  var m23 = siny * sinz - cosy * cosz * sinx;

  var m31 = -cosx * siny;
  var m32 = sinx;
  var m33 = cosx * cosy;

  rotationMatrix.set(
    m11, m12, m13, 0,
    m21, m22, m23, 0,
    m31, m32, m33, 0,
    0, 0, 0, 1
  );
}



function render(t) {
  window.requestAnimationFrame(render);

  var elapsed = (t - lasttime) / 1000.0;
  lasttime = t;

  calcRotationMatrix();
  camera.quaternion.setFromRotationMatrix(rotationMatrix);

  if (moving) {
    camera.position.x += camera.rotation.x * 10 * elapsed;
    camera.position.y += camera.rotation.y * 10 * elapsed;
    camera.position.z += camera.rotation.z * 10 * elapsed;
  }

  renderer.render(scene, camera);
}

init();
var lasttime = performance.now();
render();



// utils
function rand(min, max) {
  return (Math.random() * (max - min)) + min;
}