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

//	Variabili Audio
	var context;
	var analyser;
	var audio = document.getElementById("audio");
	var songList = document.getElementById("songs");

	camera = new THREE.PerspectiveCamera( 90, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 1000 );
	
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0xf8f8f8, 1.0);
	renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT);
	
//  Boolean per start/stop
	var initAnim = true;
	var runAnim = false;
	var isPlay = false;
 
//	File con i dati estratti
	var fileJSON = "json/1-tracks.json";

//	Dati Traccia Statici 
	var nTracks = 1; // dataJSON.length
	var nFrames = 30; // dataJSON.sampling? posso fare 60 aggiornamenti al secondo ma devo avere dei dati sotto campionati
	var trackId = 0;
	var trackLength = 0;
	var trackFs = 200;
	var track;
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
//	console.log("linee: ok");

//	Audio Setup
	initAudio();
	
//	Camera posizione verso il centro della scena
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = CANVAS_WIDTH/3;
	camera.lookAt( scene.position );
//	console.log("camera: ok");
	
//	Aggiungo l'output all'elemento HTML
	var container = document.getElementById( 'canvas-1' );
	container.appendChild( renderer.domElement );
	//document.body.appendChild( container );
	
//	console.log("html:ok");
//  Tracce 
	songs();

//	Sistema di controllo start/stop
	control();
}
			
//	Init Audio

function initAudio(){
	try {
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();
  }
  catch(e) {
    alert('Web Audio API is not supported in this browser');
  }
  analyser = context.createAnalyser();
  var source = context.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(context.destination);
  
  // poi devo fare la requestAnimationFrame
  // ho bisogno della FFT size usata in matlab per far coincidere?!
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
	
	var drawVisual = requestAnimationFrame( animate );
	
	
	
	render();
}			


function render() {
	
	
	
	
	graphic();
	
	renderer.render( scene, camera );
}

//	Generazione del movimento delle barre

function graphic(){
//	Fine traccia fermati
	if (k > trackLength) 
	{
		isPlay = false;
		k=0;
	}
//	Se in pausa non cambi la rappresentazione
	if(!isPlay) return;
	
	k+=Math.round(trackFs/nFrames);
//	Fattore di scala
	var newPos = (CANVAS_HEIGHT/2) *track.awe[k];
	
	if ( newPos*newPos < 1) newPos = 1;
	
	for( var i = 0; i < CANVAS_WIDTH-1; i++)
	{
		var first = scene.getObjectByName('line'+i);
		var second = scene.getObjectByName('line'+(i+1));
		first.scale.y = second.scale.y;
	}
	second.scale.y = newPos;

	
}

// Info del File

function info(){
	$('#info').html('<p> File: '+ track.title + '  </p>');
	console.log('info traccia: ' + track.title);
	console.log('length data:' +  trackLength / trackFs);
	console.log('sampling: ' + trackFs);
	
}

function songs(){
	console.log('tracce: ' + nTracks);
	
	for(i=0; i < nTracks; i++)
	{
		var title = dataJSON[i].title ;
		songList.insertAdjacentHTML('beforeend','<li id="'+ i +'">' + title + '</li>' );
		audio.insertAdjacentHTML('beforeend','<source src="tests/'+ title + '">');
	}
	selectSong(0);
}

function selectSong(newTrack)
{
	//var oldTrack = trackId; 
	trackId = newTrack;
	track = dataJSON[trackId];
	audio.src = "tests/"+track.title;	
	audio.load();
	trackLength = track.awe.length;
	trackFs = track.Fs;
	info();
}
