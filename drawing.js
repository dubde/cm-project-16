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
	var dataJSON;
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

//	Caricamento del file JSON di interesse
	$.getJSON( "envelope.json", function(json){ dataJSON = json.b; });
	
//	Inizializzazione della scena
	
function init(){
	

	
	
//	Camera posizione verso il centro della scena
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = CANVAS_WIDTH/3;
	camera.lookAt( scene.position );
	
//	Setup del sistema particellare
	setupLinesSystem(CANVAS_WIDTH,CANVAS_HEIGHT);
	
	
//	Aggiungo l'output all'elemento HTML
	var container = document.getElementById( 'canvas' );
	container.appendChild( renderer.domElement );
	document.body.appendChild( container );
	
//	Info File
	info();
	
//	Sistema di controllo start/stop
	control();
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
	k = 0;
	render();
   }
}

//	Creo i punti del grafico
function setupLinesSystem(width, height) {	
	for (var i = 0; i < width; i++){
		var lineGeometry = new THREE.Geometry();
		lineGeometry.vertices.push(new THREE.Vector3( i-width/2, 0, 0));
		lineGeometry.vertices.push(new THREE.Vector3( i-width/2, 1, 0));
		var lineMaterial = new THREE.LineBasicMaterial( {color: 0x000000, linewidth: 1, linecap: 'square' } );
		var line = new THREE.Line( lineGeometry, lineMaterial );
		line.name = 'line'+i;
		lineGeometry.needsUpdate = true;
		scene.add( line );
	}
}

function animate(){
	if(!isPlay) return;
	
	setTimeout( function(){
	
	requestAnimationFrame( animate );
	}, 1000 / 200);
	render();
}			


function render() {
	//$('#test').html('<p> evento: ' + dataJSON.b[1] + ' </p>');
	
	graphic();
	k++;
	
	if (isNaN(dataJSON[k])) 
	{
		$('#info').html('<p> length file: '+ k + '  </p>');
		ResetParameters();
	}
	renderer.render( scene, camera );
}

//	Generazione del movimento delle barre

function graphic(){
	//var newPos = (CANVAS_HEIGHT/3) * Math.sin(k*(180/Math.PI));
	var newPos = (CANVAS_HEIGHT) * dataJSON[k];
	
	for( var i = 0; i < CANVAS_WIDTH-1; i++){
	var first = scene.getObjectByName('line'+i);
	var f = i+1;
	var second = scene.getObjectByName('line'+f);
	first.scale.y = second.scale.y;
	}
	second.scale.y = newPos;

	$('#test').html('<p> newVal: ' + newPos + ' </p>');
}

// Info del File

function info(){

	
}

window.onload = init;
