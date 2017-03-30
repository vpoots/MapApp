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
//var BASE_URL = document.getElementById('url-info').getAttribute('base-url');
//var DATA = document.getElementById('data').getAttribute('sourceIp-data');

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
	//scene = new THREE.Scene();
	//healthLog();
	drawWorld();
}

function drawWorld() {
	//d3.json("static/map/world.topojson", function(json) {
		//var mesh;

		//find location
		getSourceIp();
		initMap();
		//display sourceip
		//display desintationip
		//render();
		//animate();


		//window.addEventListener('resize', function() {
			// renderer.setSize(window.innerWidth, window.innerHeight);
			// camera.aspect = window.innerWidth / window.innerHeight;
			//renderer.setSize(container.clientWidth, container.clientHeight);
			//camera.aspect = container.clientWidth / container.clientHeight;
		//	camera.updateProjectionMatrix();
	//	}, false );
	//});
}

function initMap(response){
	//var mymap = L.map('map').setView([51.505, -0.09], 13);
	var mymap = L.map('map', {
		center: [51, 1],
		zoom: 2.3
	});

	L.tileLayer('https://api.mapbox.com/styles/v1/vpoots/cj0trsbn900w92rt8m0pe4nml/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidnBvb3RzIiwiYSI6ImNqMHRueDB0ZDAwMjUycXFseG9wcmJvZXYifQ.D1OlD9G6iR5AkjlzQ0pQFw', {
attribution:"MapBox"
//mapbox://styles/vpoots/cj0trsbn900w92rt8m0pe4nml /v1/mapbox/light-v9/tiles/256/
}).addTo(mymap);

var sourceIP = document.getElementById('data').getAttribute('sourceIp-data');
response = JSON.parse(sourceIP);
for (var i = 0, len = response.length; i < len; i++)
	{
		var circle = L.circle([response[i].sourceLocationData.latitude, response[i].sourceLocationData.longitude], {
				color: 'red',
				fillColor: '#f03',
				fillOpacity: 0.5,
				radius: 500
		}).addTo(mymap);
	}

var destinationIP = document.getElementById('destinationData').getAttribute('destinationIp-data');
destResponse = JSON.parse(destinationIP);
for (var i = 0, len = destResponse.length; i < len; i++)
	{
		var circle = L.circle([destResponse[i].destinationLocationData.latitude, destResponse[i].destinationLocationData.longitude], {
				color: 'blue',
				fillColor: '#f03',
				fillOpacity: 0.5,
				radius: 500
		}).addTo(mymap);
	}
}
		//var latitude = response[i].sourceLocationData.latitude;
	//	var longitude = response[i].sourceLocationData.longitude;
	//	console.log(latitude);
	//	console.log(longitude);




 //var latitude = response[0].sourceLocationData.latitude
//console.log(latitude);


	/*mapboxgl.accessToken = 'pk.eyJ1IjoidnBvb3RzIiwiYSI6ImNqMHRueDB0ZDAwMjUycXFseG9wcmJvZXYifQ.D1OlD9G6iR5AkjlzQ0pQFw';
	var map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/dark-v9'
	});*/

/*function initMap(json) {
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
}*/

function getSourceIp(response) {
	/*$.ajax({
					type: 'GET',
					url: document.getElementById('url-info').getAttribute('base-url') + "/index",
					//url: BASE_URL + "/index",
					//url: "http://localhost:5000/index",
					//data: DATA,
					dataType: 'json',
					context: "application/json; charset=utf-8",
					//global: false,
					//async:false,
					success: function(data) {
						//sourceip = $(DATA).text().trim();
						sourceipresult = data.getSourceIp;
						return sourceipresult;
						console.log(sourceipresult);
					}
				});
				//console.log(DATA);
	}*/
	/*function getSourceIp(){
	      $.getJSON({
	        type: "GET",
	        url: url_status_feed,
	        cache: false,
	        contentType: "application/json; charset=utf-8",
	        success: function(result) {
	            var row_html = '';
	            var infos = result.status_feed;
	            infos.forEach( function(row) { row_html += "<tr><td>"+row+"</td></tr>"; });
	            for (i = infos.length; i < 11; i++) {
	                row_html += "<tr><td>&nbsp;</td></tr>";
	                }
	            $('#status_feed tbody').html(row_html);

	        }
	      });
	}*/

	var sourceIP = document.getElementById('data').getAttribute('sourceIp-data');
	//console.log(sourceIP);
	response = JSON.parse(sourceIP);
	/*for (var i = 0, len = response.length; i < len; i++)
	{
		var latitude = response[i].sourceLocationData.latitude;
		var longitude = response[i].sourceLocationData.longitude;
		console.log(latitude);
		console.log(longitude);
	}*/
	return response
	console.log(response);

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
