var root, renderer, camera, scene, geometry, sprite, material, particles, stats, output;

var mouseX = 0,
	mouseY = 0;

window.onerror = function() {
	alert(arguments[0], arguments[1], arguments[2]);
};


var numParticles = 2000;

init();
render();

function init() {
	root = document.getElementById('root');
	output = document.getElementById('output');
	renderer = new THREE.WebGLRenderer({
		clearAlhpa: 1
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	root.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 2, 4000);
	camera.position.z = 1000;
	scene = new THREE.Scene();

	setupParticles();

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	root.appendChild(stats.domElement);

	window.addEventListener('mousemove', onMouseMove);
	window.addEventListener('resize', onResize);
	window.addEventListener('deviceorientation', onOrientation);
	window.addEventListener('click', onClick);
	// window.addEventListener('touchmove', onTouchMove);
}

function setupParticles() {
	if (particles)
		scene.remove(particles);

	geometry = new THREE.Geometry();
	sprite = THREE.ImageUtils.loadTexture("../res/disc.png");

	for (var i = numParticles; i--;) {
		var v = new THREE.Vector3(
			2000 * Math.random() - 1000,
			2000 * Math.random() - 1000,
			2000 * Math.random() - 1000
		);

		geometry.vertices.push(v);
	}


	material = new THREE.ParticleSystemMaterial({
		size: 35,
		sizeAttentuation: false,
		map: sprite,
		transparent: true
	});
	material.color.setHSL(1.0, 0.3, 0.7);

	particles = new THREE.ParticleSystem(geometry, material);
	particles.sortParticles = true;
	scene.add(particles);

	output.innerHTML = numParticles;
}


function onTouchMove(ev) {
	numParticles += 5;
	ev.preventDefault();
	setupParticles();
}

function onClick() {
	numParticles += 1000;
	setupParticles();
}

function onOrientation(event) {
	mouseX = event.gamma * 10.0;
	mouseY = event.beta * 10.0;
}

function onMouseMove(ev) {
	mouseX = ev.pageX;
	mouseY = ev.pageY;
}

function onResize() {
	renderer.setSize(window.innerWidth, window.innerHeight);
}


function render(time) {
	requestAnimationFrame(render);

	camera.position.x += (mouseX - camera.position.x) * 0.05;
	camera.position.y += (mouseY - camera.position.y) * 0.05;

	camera.lookAt(scene.position);

	var h = (360 * (1.0 + time * 0.00005) % 360) / 360;
	material.color.setHSL(h, 0.5, 0.5);

	stats.update();
	renderer.render(scene, camera);
}