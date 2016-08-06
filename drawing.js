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
	var k = 0;
	
	scene = new THREE.Scene();
	var nFrames = 200;
	
//	Palette cromatica
	var scale = chroma.scale(['orange','red','white']).domain([0,255]);
	
	var CANVAS_WIDTH = 300;
	var CANVAS_HEIGHT = 200;

	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera( 90, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 1000 );
	
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
	//var nSamples = myJson.b.size();
	
//	Camera posizione verso il centro della scena
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = CANVAS_WIDTH/3;
	camera.lookAt( scene.position );
	
//	Setup del sistema particellare
	setupPointsSystem(CANVAS_WIDTH,CANVAS_HEIGHT);
	
	
//	Aggiungo l'output all'elemento HTML
	var container = document.getElementById( 'canvas' );
	container.appendChild( renderer.domElement );
	document.body.appendChild( container );
	
//	Sistema di controllo start/stop
	control();
	
	//graphic();
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
	
	for (var i = 0; i < width; i++){
	
	var dotGeometry = new THREE.Geometry();
	dotGeometry.vertices.push(new THREE.Vector3( i-width/2, 0, 0));
	var dotMaterial = new THREE.PointsMaterial( {color: 0x000000, size: 1, sizeAttenuation: false } );
	var dot = new THREE.Points( dotGeometry, dotMaterial );
	dot.name = 'dot'+i;
	dotGeometry.needsUpdate = true;
	scene.add( dot );
	}
}

function animate(){
	if(!isPlay) return;
	
	setTimeout( function(){
	
	requestAnimationFrame( animate );
	}, 1000 / 30);
	render();
}			


function render() {
	//$('#test').html('<p> evento: ' + myJson.b[1] + ' </p>');
	
	graphic();
	k++;
	renderer.render( scene, camera );
}

//	Generazione del movimento delle barre

function graphic(){
	//var newPos = (CANVAS_HEIGHT/3) * Math.sin(k*(180/Math.PI));
	var newPos = (CANVAS_HEIGHT) * myJson.b[k+nSamples/44100];
	
	for( var i = 0; i < CANVAS_WIDTH-1; i++){
	var first = scene.getObjectByName('dot'+i);
	var f = i+1;
	var second = scene.getObjectByName('dot'+f);
	$('#test').html('<p> oggetto: ' + first.name + ' </p>');
	first.position.y = second.position.y;
	}
	second.position.y = newPos;
	$('#test').html('<p> newPos: ' + newPos + ' </p>');
	/*
	for(var i = 0; i < myJson.b.length ; i++){
		if (geom.vertices[i]){
			geom.colors[i] = new THREE.Color(scale(myJson.b[i]).hex());
		}
	}
	ps.sortParticles = true;
	*/
	//geom.verticesNeedUpdate = true;
}

window.onload = init;
