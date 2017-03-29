var container;
var scene;
var camera;
var cameraHome = { x: 0, y: -300, z: 300 };
var controls;
var renderer;
var projection;
var mapSize;
var mylocation = [ 0, 0 ];
var IPLOCATIONS = [];
var objectColor = "#f0e68c";	// khaki
var emissiveColor = "#d2b48c";	// tan
var landColor = 0x4682b4;	// steel blue
var backgroundColor = 0x001e43;	// midnight blue
var maxObjects = 50;	// pool size
var numAllocated = 0;
var circlePool = [];
var ballPool = [];
var ballIntervals = {};	// setInterval result
var circleIntervals = {};	// setInterval result
var feedTimeout;	// setTimeout result
var feedInterval;	// setInterval result
var arielTimeout;	// setTimeout result
// var isDemo = true;
var isDemo = false;
var tableName = "events";
var startFeedTime;	// per ariel search
var startRangeFeedTime;	// per ariel result range retrieve
var pollIntervalMinutes = 2;	// minutes
var feedNext;
var feedData = [];
var pollState;	// "NEW", "WAIT", "DATA", "NOP"
var searchId;
var searchResultCursor = 0;
var searchResultRange = 100;
var maxSearchResults;
var healthCounter = { feed: 0, draw: 0, geoip: 0, ariel: 0, circle: 0, ball: 0, scene: 0 };

 
function writeStatus( str ) {
	$("#status").text( str );
}

function writeConsole( str ) {
	var data = $("#console").val();
	var lines = data.split(/\r\n|\r|\n/);
	lines.push( str );
	var output = lines.slice(-5);
	$("#console").text( output.join("\r\n") );
	// console.log(output);
}
 
function init() {
	scene = new THREE.Scene();
	healthLog();
	drawWorld();
	
	var tableName = "events";
	pollState = "NEW";
	feedNext = true;

	dataFeed();
}

function healthLog() {
	healthCounter.scene = scene.children.length;
	console.log(healthCounter);
	setTimeout(function() { healthLog(); }, 60 * 1000);
}

function drawWorld() {
	d3.json("static/map/world.topojson", function(json) {
		var mesh;

		//initGeolocation();
		initMap(json);
		//initCircles();
		//initBalls();
		render();
		animate();

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

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	render();
}

function render() {
	renderer.render(scene, camera);
}

/*function initGeolocation(){
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			mylocation = [ position.coords.longitude, position.coords.latitude ];
		});
	}
	
	d3.json("configjson", function(error, json) {
		if (error) {
			console.error(error);
		}
		else {
			IPLOCATIONS = json;
		}
	});
}

function localizeGeoLon(lon) {
	if (lon === 999) return mylocation[0];
	else return lon;
}

function localizeGeoLat(lat) {
	if (lat === 999) return mylocation[1];
	else return lat;
}

function getLocalGeolocation (ip) {
	if (!ip) return;
	for ( var i = 0; i < IPLOCATIONS.length; i ++ ) {
		var re = new RegExp(IPLOCATIONS[ i ].regex, "i");
		if (ip.match(re))
			return [IPLOCATIONS[ i ].lon, IPLOCATIONS[ i ].lat];
	}
	return null;
}

function getGeoip ( ip, callback ) {	// callback([lon, lat])
	if (! ip || ! callback) return;
	healthCounter.geoip ++;
	var local = getLocalGeolocation( ip );
	if (local) {
		callback(local);
	}
	else {
		d3.json("geoip?ip=" + ip, function (error, data) {		
			if (error) {
				console.error(error);
				callback(mylocation);
			}
			else {
				callback([localizeGeoLon(data.longitude), localizeGeoLat(data.latitude)]);
			}
		});	
	}		
	healthCounter.geoip --;
}

function getGeoipPair ( ip1, ip2, callback ) {	// callback({from: [lon, lat], to: [lon, lat]})
	if (! ip1 || ! ip2 || ! callback) return;
	getGeoip( ip1, function (point1) {
		getGeoip( ip2, function (point2) {
			callback({from: point1, to: point2});
		});
	});
}

function drawGeoipVector ( ip1, ip2, name, duration ) {
	if (! ip1 || ! ip2 ) return;
	var name = name ? name : "";
	var duration = duration ? duration : 20;
	
	getGeoipPair ( ip1, ip2, function (data) {
		drawBall(data, name, duration);
		drawCircle(data.to, name, duration / 2, duration);
		name = null;
		duration = null;
	});
}	

function drawCircle( circle, name, duration, delay ) {
	if (! circle) return;
	var name = name ? name : "";
	var duration = duration ? duration : 10;	// frames
	var delay = delay ? delay : 20;	// frames
	var animationFrame = 0;

	if (circleIntervals [ name + "_circle" ]) {
		// console.log ("circle name is already used");
		return;
	}
	circleIntervals[ name + "_circle" ] = {};
	circleIntervals[ name + "_circle" ]["interval"] = setInterval(function() {
		healthCounter.circle ++;
		if( animationFrame > delay + duration ) {
			if (circleIntervals[ name + "_circle" ]["interval"]) {
				clearInterval( circleIntervals[ name + "_circle" ]["interval"]);
			}
			// var obj = getCircleByName( name + "_circle" );
			var obj = circleIntervals[ name + "_circle"]["obj"];
			if (obj) {
				obj.mesh.visible = false;
				freeCircle(obj);
				obj = null;
				delete circleIntervals[name + "_circle"];
			}
			healthCounter.circle --;
			return;
		}

		if ( animationFrame === delay ) {
			var point = fixPoint(projection( circle ));
			var cylinder = allocCircle(name + "_circle");
			if (cylinder) {
				cylinder.mesh.position.set( point[ 0 ], point[ 1 ], 2 );
				cylinder.mesh.visible = true;
				circleIntervals[name + "_circle"]["obj"] = cylinder;
			}
			else {
				console.log ("no more circles...");
				clearInterval( circleIntervals[ name + "_circle" ]["interval"]);
				delete circleIntervals[ name + "_circle" ];
			}
		}
		animationFrame ++;
		healthCounter.circle --;
	}, 50);
}

function drawBall( points, name, duration ) {
	if( ! points ) return;
	var name = name ? name : "";
	var duration = duration ? duration : 20;	// frames
	var height = mapSize / 4;
	var animationFrame = 0;

	if (ballIntervals [ name + "_ball" ]) {
		// console.log ("ball name is already used");
		return;
	}
	ballIntervals[ name + "_ball" ] = {};
	ballIntervals[ name + "_ball" ]["interval"] = setInterval(function() {
		healthCounter.ball ++;
		if( animationFrame > duration ) {
			if (ballIntervals[ name + "_ball" ]["interval"]) {
				clearInterval( ballIntervals[ name + "_ball" ]["interval"]);
			}
			// var obj = getBallByName( name + "_ball" );
			var obj = ballIntervals[ name + "_ball" ]["obj"];
			if (obj) {
				obj.mesh.visible = false;
				freeBall(obj);
				obj = null;
				delete ballIntervals[ name + "_ball" ];
			}
			healthCounter.ball --;
			return;
		}

		if( animationFrame === 0 ) {
			var point = fixPoint(projection( points.from ));
			var ball = allocBall(name + "_ball");
			if ( ball ) {
				ball.mesh.position.set( point[ 0 ], point[ 1 ], 2 );
				ball.mesh.visible = true;
				ballIntervals[name + "_ball"]["obj"] = ball;
			}
			else {
				console.log ("no more balls...");
				clearInterval( ballIntervals[ name + "_ball" ]["interval"]);
				delete ballIntervals[ name + "_ball" ];
			}
		}
		if( animationFrame > 0 && animationFrame <= duration ) {
			var curve = new THREE.QuadraticBezierCurve3();
			var from = fixPoint( projection(points.from));
			var to = fixPoint( projection(points.to));	
			curve.v0 = new THREE.Vector3(from[ 0 ], from[ 1 ], 2);
			curve.v1 = new THREE.Vector3((from[ 0 ] + to[ 0 ]) / 2, (from[ 1 ] + to[ 1 ]) / 2, height);
			curve.v2 = new THREE.Vector3(to[ 0 ], to[ 1 ], 2);
			// var ball = getBallByName(name + "_ball");
			var ball = ballIntervals[ name + "_ball" ]["obj"];
			if ( ball ) {
				var position = curve.getPoint( animationFrame / duration );
				ball.mesh.position.set(position.x, position.y, position.z);
			}
			else {
				console.log ("ball not found: " + name + "_ball");
				clearInterval( ballIntervals[ name + "_ball" ]["interval"]);
				delete ballIntervals[ name + "_ball" ];
			}
		}
		animationFrame ++;
		healthCounter.ball --;
	}, 50);
}*/

function fixPoint(point) {
	return [ point[ 0 ], -point[ 1 ] ];
}