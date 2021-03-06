/**
 * TODO:
 * DepthScreen
 *   [done] not individual shaders but attributes in objects
 *   switch between black/white height output
 *   [done] animate height
 *   split into multiple buffers when vertex count is larger than 65k
 * Resize dropped images
 *   - keep aspect of image (fill with transparent)
 * Camera movement
 * Test in some different browsers
 * Use webcam
 * Find luminosity of image
 * More advanced depth calculation
 * Gallery, slideshow
 *   - animate between images
 */


var App = (function() {

  var DepthScreen = window.DepthScreen;
  var FileHandler = window.FileHandler;

  function App() {
    this.init();
    this.previousNow = performance.now();
    this.update();
  }


  App.prototype.init = function() {
    this.update = this.update.bind(this);
    this.resize = this.resize.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.onImageData = this.onImageData.bind(this);


    this.columnHeight = 10;
    this.columnHeightAnimationTime = this.columnHeightAnimationTimeMax = 1.0;


    this.initDOM();
    this.initTHREE();
    this.initFileHandler();

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
      texture: THREE.ImageUtils.loadTexture('/depth-screen/res/profile-image.jpg'),
      widthSegments: 90,
      heightSegments: 90,
      height: 20,
      opacity: 0.9
    });

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000.0);
    this.camera.position.z = Math.max(this.depthScreen.widthSegments, this.depthScreen.heightSegments);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0x000000, 1);
    this.el.appendChild(this.renderer.domElement);
  };

  App.prototype.initFileHandler = function() {
    this.fileHandler = new FileHandler();

    this.fileHandler.on('imagedata', this.onImageData);
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
    var time = {
      now: now,
      elapsed: (now - this.previousNow) / 1000.0
    };
    this.previousNow = now;

    this.draw(time);
  };

  App.prototype.draw = function(time) {
    // this.camera.position.x = Math.cos( time * 0.001 );

    this.camera.position.x += ((this.mouseX - (window.innerWidth / 2)) - this.camera.position.x) * 0.05 * time.elapsed;
    if (this.camera.position.x < -50) this.camera.position.x = -50;
    if (this.camera.position.x > 50) this.camera.position.x = 50;

    this.camera.lookAt(this.depthScreen.scene.position);

    this.columnHeightAnimationTime -= time.elapsed;
    if (this.columnHeightAnimationTime < 0.0) this.columnHeightAnimationTime = 0.0;

    this.depthScreen.setHeight(this.columnHeight * ((this.columnHeightAnimationTimeMax - this.columnHeightAnimationTime) / this.columnHeightAnimationTimeMax));

    this.depthScreen.draw(this.renderer, this.camera);
  };




  App.prototype.onImageData = function(imageData) {
    this.columnHeightAnimationTime = this.columnHeightAnimationTimeMax;
    this.depthScreen.setTexture(THREE.ImageUtils.loadTexture(imageData.data));
  };

  return App;
}());



app = new App();