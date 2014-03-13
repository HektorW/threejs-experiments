var renderer, scene, camera;
var outEl;

var mousex=0, mousey=0;
var devor = {
  x: 0,
  y: 0,
  z: 0
};

var DEGTORAD = Math.PI / 180;

var rotationMatrix = new THREE.Matrix4();

var mx = new THREE.Matrix4();
var my = new THREE.Matrix4();
var mz = new THREE.Matrix4();

var cos = Math.cos;
var sin = Math.sin;

function init() {
  var geometry, material, mesh;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  var el = document.createElement('div');
  el.appendChild(renderer.domElement);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  el.style.height = '100%';
  document.body.appendChild(el);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);



  geometry = new THREE.BoxGeometry(100, 100, 100, 10, 10, 10);
  material = new THREE.MeshBasicMaterial({
    color: 0xff851b,
    side: THREE.BackSide,
    wireframe: true
  });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  //geometry = new THREE.SphereGeometry(500, 60, 40);
  //geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
  //mesh = new THREE.Mesh(
  //  geometry,
  //  new THREE.MeshBasicMaterial({
  //    map: THREE.ImageUtils.loadTexture('res/earth.png')
  //  })
  //);
  //mesh.rotation.x = 90 * DEGTORAD;
  //scene.add(mesh);


  // var imgsrc = 'res/';
  // var urls = [
  //   imgsrc + '0.jpg',
  //   imgsrc + '1.jpg',
  //   imgsrc + '2.jpg',
  //   imgsrc + '3.jpg',
  //   imgsrc + '4.jpg',
  //   imgsrc + '5.jpg',
  // ];

  geometry = new THREE.BoxGeometry(10, 10, 10, 1, 1, 1);
  material = new THREE.MeshFaceMaterial([
    new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('res/3x2048.jpg'),
      side: THREE.BackSide
    }),
    new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('res/1x2048.jpg'),
      side: THREE.BackSide
    }),
    new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('res/2x2048.jpg'),
      side: THREE.BackSide
    }),
    new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('res/0x2048.jpg'),
      side: THREE.BackSide
    }),
    new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('res/4x2048.jpg'),
      side: THREE.BackSide
    }),
    new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('res/5x2048.jpg'),
      side: THREE.BackSide
    })
  ]);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);




  window.addEventListener('mousemove', onmousemove, false);
  window.addEventListener('deviceorientation', ondeviceorientation, false);
  window.addEventListener('resize', onresize, false);
  outEl = document.getElementById('out');


  var lt = -1;
  window.addEventListener('click', function() {
    var t = performance.now();
    var e = t - lt;
    if(e <= 500) {
      toggleFullscreen();
    }
  }, false);
}

function onresize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
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
  
  // mx.identity();
  // my.identity();
  // mz.identity();


  // mx.makeRotationX(x);
  // my.makeRotationY(y);
  // mz.makeRotationZ(z);

  // rotationMatrix.identity();
  // rotationMatrix.multiply(mz);
  // rotationMatrix.multiply(mx);
  // rotationMatrix.multiply(my);
}

function render(t) {
  window.requestAnimationFrame(render);

  calcRotationMatrix();

  camera.quaternion.setFromRotationMatrix(rotationMatrix);

  renderer.render(scene, camera);
}

init();
render();