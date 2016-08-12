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
	var CANVAS_WIDTH = 300;
	var CANVAS_HEIGHT = 200;
	var audio = document.getElementById("audio");
	var songList = document.getElementById("songs");

	//scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera( 90, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 1000 );
	
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0xf8f8f8, 1.0);
	renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT);
	
 // Boolean per start/stop
 var initAnim = true;
 var runAnim = false;
 var isPlay = false;
 
 var fileJSON = "json/1-tracks.json";

 
	var nTracks = 1; // dataJSON.length
	var nFrames = 60; // dataJSON.sampling? posso fare 60 aggiornamenti al secondo ma devo avere dei dati sotto campionati
	var trackId = 0;
	var k = 0;
 
//	Caricamento del file JSON di interesse
$.getJSON( fileJSON, function(json){ dataJSON = json.tracks; 
						console.log("success");})
						.done(function() {
							nTracks = dataJSON.length;
							console.log('file: '+ fileJSON +' tracce: ' + nTracks  + ' ');
							init();
						})
						.fail(function(){
							console.log("fallimento");
						})
						.always(function(){
							console.log("completato");
						});
	
//	Inizializzazione della scena
	
function init(){	
	
//	Setup del sistema particellare
	setupLinesSystem(CANVAS_WIDTH,CANVAS_HEIGHT);
	console.log("linee: ok");
	
//	Camera posizione verso il centro della scena
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = CANVAS_WIDTH/3;
	camera.lookAt( scene.position );
	console.log("camera: ok");
	
//	Aggiungo l'output all'elemento HTML
	var container = document.getElementById( 'canvas-1' );
	container.appendChild( renderer.domElement );
	//document.body.appendChild( container );
	
	console.log("html:ok");
//  Tracce 
	songs();

	
//	Info File
	info();
	
//	Sistema di controllo start/stop
	control();
}
			
			
//	Start/Stop e traccia
			
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
    audio.play();
	animate();
	} else {
          startButton.innerHTML = 'Restart';
          runAnim = true;
		  isPlay = false;
	audio.pause();
    }
	
  }

 // Reset Button
   resetButton.onclick = function ResetParameters() {

   // Set StartButton to Start  
   startButton.innerHTML = 'Start';
   
   // sistema le linee a offline
	setupLinesSystem(CANVAS_WIDTH,CANVAS_HEIGHT);
   // Boolean for Stop Animatio
    initAnim = true;
    runAnim = false;
	isPlay = false;
	k = 0;
	audio.pause();
	audio.currentTime = 0;
	}

//	Select Song
	songList.addEventListener("click",function(e){
		selectSong(e.target.id);
		// Set StartButton to Start  
   startButton.innerHTML = 'Start';
   
   // sistema le linee a offline
	setupLinesSystem(CANVAS_WIDTH,CANVAS_HEIGHT);
   // Boolean for Stop Animatio
    initAnim = true;
    runAnim = false;
	isPlay = false;
	k = 0;
	audio.pause();
	audio.currentTime = 0;
	});
}

//	Creo i punti del grafico
function setupLinesSystem(width, height) {	
	
		scene = new THREE.Scene();
		
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
	animate();
}

function animate(){
	
	setTimeout( function(){
	
	requestAnimationFrame( animate );
	}, 1000 / nFrames);
	render();
}			


function render() {
	graphic();
	
	renderer.render( scene, camera );
}

//	Generazione del movimento delle barre

function graphic(){
	//var newPos = (CANVAS_HEIGHT/3) * Math.sin(k*(180/Math.PI));
	
	if (k + 1 > dataJSON[trackId].awe.length) 
	{
		isPlay = false;
		k=0;

	}
	
	if(!isPlay) return;
	
	k++;
	
	var newPos = (CANVAS_HEIGHT)* 150 * dataJSON[trackId].awe[k];
	if (Math.abs(newPos) < 1) newPos = 1;
	for( var i = 0; i < CANVAS_WIDTH-1; i++){
	var first = scene.getObjectByName('line'+i);
	var f = i+1;
	var second = scene.getObjectByName('line'+f);
	first.scale.y = second.scale.y;
	}
	second.scale.y = newPos;

	//$('#test').html('<p>j['+ k + '] = '+ dataJSON[trackId].awe[k] +' => ' + newPos + ' </p>');
}

// Info del File

function info(){
	$('#info').html('<p> File: '+ dataJSON[trackId].title + '  </p>');
	console.log('info traccia: ' + dataJSON[trackId].title);
	console.log('length data:' + dataJSON[trackId].awe.length / 60);
}

function songs(){
	console.log('tracce: ' + nTracks);
	
	for(i=0; i < nTracks; i++)
	{
		var title = dataJSON[i].title ;
		songList.insertAdjacentHTML('beforeend','<li id="'+ i +'">' + title + '</li>' );
		audio.insertAdjacentHTML('beforeend','<source src="tests/'+ title + '">');
	}
	audio.load();
}

function selectSong(newTrack)
{
	var oldTrack = trackId;
	audio.src = "tests/"+dataJSON[newTrack].title;	
	audio.load();
	trackId = newTrack;
	info();
}
