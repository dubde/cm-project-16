// Fix JSON per lavorare senza server online e caricare i files JSON
	$.ajaxSetup({beforeSend: function(xhr){
		if (xhr.overrideMimeType)
			{
				xhr.overrideMimeType("application/json");
			}
		}
	});
	
//	Variabili globali
	
	var renderer;
	var scene;
	var camera;
	var myJson;
	var renderer;
	
	scene = new THREE.Scene();
	var nFrames = 200;
	
//	Palette cromatica
	var scale = chroma.scale(['orange','red','white']).domain([0,255]);
	
	var CANVAS_WIDTH = 300;
	var CANVAS_HEIGHT = 200;

	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera( 45, CANVAS_WIDTH / CANVAS_HEIGHT, 0.1, 1000 );
	
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0xf8f8f8, 1.0);
	renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT);
	
 // Boolean per start/stop
 var initAnim = true;
 var runAnim = false;
 var isPlay = false;

	
//	Inizializzazione della scena
	
function init(){
	

	//	Caricamento del file JSON di interesse
	$.getJSON( "envelope.json", function(json){ myJson = json; });

//	Camera posizione verso il centro della scena
	camera.position.x = 15;
	camera.position.y = 8;
	camera.position.z = 15;
	camera.lookAt( scene.position );
	
//	Setup del sistema particellare
	setupPointsSystem(CANVAS_WIDTH,CANVAS_HEIGHT);
	
	
//	Aggiungo l'output all'elemento HTML
	var container = document.getElementById( 'canvas' );
	container.appendChild( renderer.domElement );
	document.body.appendChild( container );
	
//	Sistema di controllo start/stop
	control();
	
//	Grafico
	
	//setupGraphic();
}
			

			
//	Start/Stop
			
function control() {
	
 // Buttons startButton and resetButton
 var startButton = document.getElementById( 'startButtonId' );
 var resetButton = document.getElementById( 'resetButtonId' );

 // Start Button
  startButton.onclick = function StartAnimation() {

  if (initAnim) {
    initAnim = false;
    runAnim = true; 
  }
  
  // Start and Pause 
  if (runAnim) {
    startButton.innerHTML = 'Pause';
    runAnim = false;
    isPlay = true;
	animate();
    } else {
          startButton.innerHTML = 'Restart';
          runAnim = true;
		  isPlay = false;
    }
  }

 // Reset Button
   resetButton.onclick = function ResetParameters() {

   // Set StartButton to Start  
   startButton.innerHTML = 'Start';

   // Boolean for Stop Animation
   initAnim = true;
   runAnim = false;
	isPlay = false;
	render();
   }
}

//	Creo i punti del grafico
function setupPointsSystem(width, height) {
	var dots;
	
	var dotGeometry = new THREE.Geometry();
	dotGeometry.vertices.push(new THREE.Vector3( 0, 0, 0));
	var dotMaterial = new THREE.PointsMaterial( { size: 100, sizeAttenuation: false } );
	var dot = new THREE.Points( dotGeometry, dotMaterial );
	dot.name = 'dot';
	dotGeometry.needsUpdate = true;
	scene.add( dot );
}

var vis = false;

function animate(){
	if(!isPlay) return;
	
	setTimeout( function(){
	
	requestAnimationFrame( animate );
	}, 1000 / 1);
	render();
}			

function render() {
	var dt = scene.getObjectByName('dot');
	$('#test').html('<p> evento: ' + myJson.b[1] + ' </p>');
	
	dt.position.y = Math.random();
	renderer.render( scene, camera );
}

//	Generazione del movimento delle barre
// Generatore del movimento da seguire
	/*
	//states[nFrames-1] = (CANVAS_HEIGHT*5) * Math.sin(k*(180/Math.PI));
	
	//states[nFrames-1] = (CANVAS_HEIGHT/100)  * myJson.b[k];
	
	//il movimento viene seguito dalle barre
	
	//group[nFrames-1].scale.y =  states[nFrames-1];
	
	for(i=0; i < nFrames-1; i++)
	{
		states[i] = states[i+1];
		//group[i].position.y += states[i];
		group[i].scale.y = states[i];
	}
	k +=1;
	if ( k > myJson.b.length) k = 0;
	*/
function setupGraphic(){
	var geom = ps.geometry;
	var ps = scene.getObjectByName('ps');
	
	for(var i = 0; i < myJson.b.length ; i++){
		if (geom.vertices[i]){
			geom.vertices[i].y = myJson.b[i] * 1000;
			geom.colors[i] = new THREE.Color(scale(myJson.b[i]).hex());
		}
	}
	ps.sortParticles = true;
	geom.verticesNeedUpdate = true;
}

window.onload = init;
