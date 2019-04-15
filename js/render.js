var camera, scene, renderer, mesh, sun, earth, orbitalPositions, orbitalRing, orbitalGeometry;

var clock = new THREE.Clock();

var timeScale = 1/15000;
var numPoints = 300;
var positions = [];

var a = 100;
var e = 0.8;
var mass = 5.972e24;

var inc = 0;
var w = 0;
var omega = 0;

orbitalPositions = parameterizeOrbit(a,e,inc,w,omega,mass, numPoints);

init();
animate();

var eccSlider = document.getElementById("eccentricity-input");
var incSlider = document.getElementById("inclination-input");
var argOfPeriapsisSlider = document.getElementById("argument-of-periapsis-input");
var longOfAscNodeSlider = document.getElementById("long-of-asc-node-input");

eccSlider.oninput = function() {
  e = this.value/100;
  updateOrbitRing();
}

incSlider.oninput = function() {
  inc = toRadians(this.value);
  updateOrbitRing();
}

argOfPeriapsisSlider.oninput = function() {
  w = toRadians(this.value);
  updateOrbitRing();
}

longOfAscNodeSlider.oninput = function() {
  omega = toRadians(this.value);
  updateOrbitRing();
}

function updateOrbitRing() {
  orbitalPositions = parameterizeOrbit(a,e,inc,w,omega,mass,numPoints);

  for (var j = 0; j < orbitalPositions.length; j++) {
    orbitalGeometry.attributes.position.setXYZ( j, orbitalPositions[j][0], orbitalPositions[j][1], orbitalPositions[j][2] || 0);
  }

  orbitalGeometry.attributes.position.needsUpdate = true;
}

function init() {
  // Setup scene
  scene = new THREE.Scene();

  // Setup lights
  pointLight = new THREE.PointLight( 0xffffff, 2 );
  pointLight.position.set(0, 0, 0);

  scene.add( pointLight );

  // Setup camera
  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
  camera.position.z = -400;

  // Setup orbital ring
  orbitalGeometry = new THREE.BufferGeometry();

  orbitalGeometry.dynamic = true;

  var orbitalMaterial = new THREE.LineBasicMaterial( { color: 0x00ff00 , linewidth: 1} );

  var colors = [];

  colors.push(255,255,0);

  for (var i = 0; i < orbitalPositions.length; i++) {
    positions.push(orbitalPositions[i][0],orbitalPositions[i][1],orbitalPositions[i][2] || 0);
  }

  orbitalGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
  orbitalGeometry.addAttribute( 'colors', new THREE.Float32BufferAttribute( colors, 3 ) );

  orbitalGeometry.attributes.position.dynamic = true;

  orbitalRing = new THREE.Line( orbitalGeometry, orbitalMaterial );
  orbitalRing.geometry.dynamic = true;


  // Setup sun
  var sunGeometry = new THREE.SphereGeometry( 10, 50, 50 );
  var sunTexture = new THREE.TextureLoader().load( 'textures/sun_8k.jpg' );
  var sunMesh = new THREE.MeshBasicMaterial( {map: sunTexture} );

  sun = new THREE.Mesh( sunGeometry, sunMesh );
  sun.position.set(0, 0, 0);

  // Setup earth
  var earthGeometry = new THREE.SphereGeometry(2.5, 50, 50 );
  var earthTexture = new THREE.TextureLoader().load( 'textures/earth.jpg' );
  var earthMesh = new THREE.MeshBasicMaterial( {map: earthTexture} );

  earth = new THREE.Mesh( earthGeometry, earthMesh );

  // Orient camera towards object
  camera.lookAt(sun.position);

  // Add sun
  scene.add( orbitalRing );
  scene.add(sun);
  scene.add(earth);
  scene.add(camera);


  var canvas=document.getElementById("canvas");
  renderer = new THREE.WebGLRenderer({canvas:canvas});

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function distanceBetween( v1, v2 ) {
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}

function toDegrees(radians) {
  return radians * (180/Math.PI);
}

function toRadians(degrees) {
  return degrees * (Math.PI/180);
}

function animate() {
  updateLabels();
  render();

  requestAnimationFrame( animate );
}

function render() {
  var delta = clock.getDelta();
  var elapsed = clock.getElapsedTime();

  var pos = position(a,e,inc,w,omega,mass,elapsed * timeScale);

  earth.position.x = pos[0];
  earth.position.y = pos[1];
  earth.position.z = pos[2];

  renderer.render( scene, camera );
}

function updateLabels() {
  var eccLabel = document.getElementById("eccentricity-label");
  var semiMajorLabel = document.getElementById("semi-major-label");
  var massLabel = document.getElementById("mass-label");
  var incLabel = document.getElementById("inclination-label");
  var argumentOfPeriapsisLabel = document.getElementById("argument-of-periapsis-label");
  var longOfAscNodeLabel = document.getElementById("long-of-asc-node-label");

  eccLabel.innerHTML = e;
  semiMajorLabel.innerHTML = a;
  massLabel.innerHTML = mass;

  incLabel.innerHTML = toDegrees(inc).toFixed(3);
  argumentOfPeriapsisLabel.innerHTML = toDegrees(w).toFixed(3);
  longOfAscNodeLabel.innerHTML = toDegrees(omega).toFixed(3);
}
