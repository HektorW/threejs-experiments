
var App = (function() {

  var DepthScreen = window.DepthScreen;

  function App() {
    this.init();
    this.update();
  }


  App.prototype.init = function() {
    this.update = this.update.bind(this);
    this.resize = this.resize.bind(this);
    this.mouseMove = this.mouseMove.bind(this);

    this.initDOM();
    this.initTHREE();

    this.resize();
  };

  App.prototype.initDOM = function() {
    this.el = document.body.appendChild(document.createElement('div'));

    this.mouseX = this.mouseY = 0;

    window.addEventListener('resize', this.resize, false);
    window.addEventListener('mousemove', this.mouseMove, false);
  };
  App.prototype.initTHREE = function() {

    this.depthScreen = new DepthScreen({
      height_texture: THREE.ImageUtils.loadTexture('/depth-screen/res/dt_beyonce.png'),
      diffuse_texture: THREE.ImageUtils.loadTexture('/depth-screen/res/dt_beyonce.png'),
      width_segments: 40,
      height_segments: 40,
      size: 0.5,
      margin: 0.0
    });

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000.0);
    this.camera.position.z = Math.max(this.depthScreen.width_segments, this.depthScreen.height_segments) * (this.depthScreen.size + this.depthScreen.margin);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xeeeeee, 1);
    this.el.appendChild(this.renderer.domElement);
  };


  App.prototype.resize = function() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
  };

  App.prototype.mouseMove = function(event) {
    this.mouseX = event.pageX;
    this.mouseY = event.pageY;
  };


  App.prototype.update = function() {
    requestAnimationFrame(this.update);
    var now = performance.now();
    

    this.draw(now);
  };

  App.prototype.draw = function(time) {
    // this.camera.position.x = Math.cos( time * 0.001 );

    this.camera.position.x += ((this.mouseX - (window.innerWidth / 2)) - this.camera.position.x) * 0.0005;
    if (this.camera.position.x < -50) this.camera.position.x = -50;
    if (this.camera.position.x > 50) this.camera.position.x = 50;

    this.camera.lookAt(this.depthScreen.scene.position);


    this.depthScreen.draw(this.renderer, this.camera);
  };


  return App;
}());



app = new App();