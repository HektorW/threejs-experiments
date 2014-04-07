var renderer, scene, camera;

var buildingCount = 100;
var size = 100;

var maxHeight = 20;
var minHeight = 5;
var maxSize = 8;
var minSize = 3;

var camRot = 0.0;


function init() {
  initThree();
  initCity();
  initControls();
}

function initThree() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.position.y = 5.0;

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
  m = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
  o = new THREE.Mesh(g, m);
  o.rotateX(Math.PI / 2);

  scene.add(o);


  // buildings
  for(var i = buildingCount; i--; ) {
    s = rand(minSize, maxSize);
    h = rand(minHeight, maxHeight)
    g = new THREE.CubeGeometry(s, h, s);
    m = new THREE.MeshBasicMaterial({ color: 0xff4136, side: THREE.DoubleSide });
    o = new THREE.Mesh(g, m);
    o.position.x = rand(-size / 2, size / 2);
    o.position.y = h / 2.0;
    o.position.z = rand(-size / 2, size / 2);
    scene.add(o);
  }
}

function initControls() {
  window.addEventListener('keydown', function(ev) {
    switch (ev.keyCode) {
      case 65: camRot += 0.1; break;
      case 68: camRot -= 0.1; break;
      case 87: camera.position.z += 1; break;
      case 83: camera.position.z -= 1; break;
    }

    // camera.lookAt(Math.cos(camRot), 0.0, Math.sin(camRot));
    camera.lookAt(new THREE.Vector3(Math.cos(camRot), 0.0, Math.sin(camRot)));
  }, false);
}






function render(t) {
  window.requestAnimationFrame(render);

  renderer.render(scene, camera);
}

init();
render();













// utils
function rand(min, max) {
  return (Math.random() * (max-min)) + min;
}