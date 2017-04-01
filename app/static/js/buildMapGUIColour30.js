var container;
var scene;
var camera;
var cameraHome = { x: 0, y: -300, z: 300 };
var controls;
var renderer;
var projection;
var mapSize;
var landColor = 0xe0e0e0 //grey //0x4682b4;	// steel blue
var backgroundColor =  0x001e43;	// midnight blue

/*function writeStatus( str ) {
	$("#status").text( str );
}

function writeConsole( str ) {
	var data = $("#console").val();
	var lines = data.split(/\r\n|\r|\n/);
	lines.push( str );
	var output = lines.slice(-5);
	$("#console").text( output.join("\r\n") );
	// console.log(output);
}*/

function init() {
	scene = new THREE.Scene();
	//healthLog();
	drawWorld();
}

function drawWorld() {
	d3.json("static/map/world.topojson", function(json) {
		var mesh;

		//find location
		initMap(json);
		//display sourceip
		//display desintationip
		render();
		animate();
		getSourceIp();

		window.addEventListener('resize', function() {
			// renderer.setSize(window.innerWidth, window.innerHeight);
			// camera.aspect = window.innerWidth / window.innerHeight;
			renderer.setSize(container.clientWidth, container.clientHeight);
			camera.aspect = container.clientWidth / container.clientHeight;
			camera.updateProjectionMatrix();
		}, false );
	});
}

function initMap(json) {
	container = document.getElementById('map');
	var width = container.clientWidth;
	var height = container.clientHeight;
	// var width = window.innerWidth;
	// var height = window.innerHeight;
	mapSize = (width < height ? width : height);
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);
	renderer.setClearColor(backgroundColor, 1);
	container.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
	camera.position.set( cameraHome.x, cameraHome.y, cameraHome.z );
	camera.up.set(0, 0, 1);

	// controls = new THREE.TrackballControls(camera);
	controls = new THREE.OrbitControls(camera);
	controls.autoRotateSpeed = 0.5;
	scene.add(camera);

	var light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.set(mapSize, mapSize, mapSize);
	scene.add(light);

	// decode topojson to geojson
	var geodata = topojson.feature(json, json.objects.world).features;
	projection = d3.geo.mercator().translate([ -90, 50 ]);
	var path = d3.geo.path().projection(projection);

	// converts geojson to mesh
	var countries = [];
	for (i = 0 ; i < geodata.length ; i++) {
		var geomesh = transformSVGPathExposed(path(geodata[ i ]));
		for ( j = 0 ; j < geomesh.length ; j ++ ) {
			countries.push(geomesh[ j ]);
		}
	}

	var mergedGeometry = new THREE.Geometry();
	for ( i = 0; i < countries.length; i ++ ) {
		var geometry = countries[ i ].extrude({
			amount: 1,
			bevelEnabled: false,
		});
		mergedGeometry.merge(geometry);
	}
	var material = new THREE.MeshPhongMaterial({
		color: landColor
	});
	var mesh = new THREE.Mesh(mergedGeometry, material);
	mesh.rotation.x = Math.PI / 2 * 10;
	scene.add(mesh);
}

function getSourceIp(response) {
	//{% for item in data %}
	//    {{ item }}
		//	console.log({{item}})
	//{% endfor %}
	//response = JSON.parse(response);
	//console.log(response);
	//success(response)
	//alert(JSON.stringify(response));
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	render();
}

function render() {
	renderer.render(scene, camera);
}
