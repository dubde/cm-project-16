// Fix JSON: per lavorare senza server online e caricare i files JSON
	$.ajaxSetup({beforeSend: function(xhr){
		if (xhr.overrideMimeType)
			{
				xhr.overrideMimeType("application/json");
			}
		}
	});

window.onload = primoEsempio;

function primoEsempio(){						

//	Caricamento del file JSON di interesse
//	
	var fileJSON = "json/1-tracks.json";
	var dataJSON;

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


//	Analisi Online - Offline
	var isOnline = false;

//	Inizializzazione Canvas
	var canvas = document.querySelector('.primo');
	var canvasCtx = canvas.getContext("2d");
	
	var larghezza = document.querySelector('.primo').clientWidth;
	canvas.setAttribute('width', larghezza);
	var drawVisual;
	
//	Variabili Audio per riproduzione e Analisi
	var context = new (window.AudioContext || window.webkitAudioContext)();
	var analyser = context.createAnalyser();
	var audio = document.getElementById("audio");
	var songList = document.getElementById("songs");
	var source;
	
//  Boolean per start/stop
	var initAnim = true;
	var runAnim = false;
	var isPlay = false;
 

//	Dati Traccia Statici 
	var nTracks = 1; // dataJSON.length
	var trackId = 0;
	var trackLength = 0;
	var Fs = 2048;
	var track; 
	
	
function init(){	
	
//  Lettura dati estratti delle Tracce 
	songs();

//	Caricamento del file Audio
	decode();

//	Prima generazione grafica	
	visualize();

//	Sistema di controllo start/stop
	control();
}
			
//	Init Audio Analysis
function decode(){
	source = context.createMediaElementSource(audio);
	source.connect(analyser);
	analyser.connect(context.destination);
}

//	Controlli di traccia (start/stop/select)
function control() {
	
// Buttons startButton and resetButton
	var startButton = document.getElementById( 'startButtonId' );
	var resetButton = document.getElementById( 'resetButtonId' );
	var stop = 0;
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
    window.cancelAnimationFrame(drawVisual);
    // Boolean for Stop Animatio
	initAnim = true;
    runAnim = false;
	isPlay = false;
	audio.pause();
	audio.currentTime = 0;
	}

//	Select Song
	songList.addEventListener("click",function(e){
		selectSong(e.target.id);
	// Set StartButton to Start  
	ResetParameters();
	});
	
	audio.addEventListener("ended", ResetParameters);
	visualize();
}

//	Creo i punti del grafico
function visualize() {	
	
	var WIDTH = canvas.width;
	var HEIGHT = canvas.height;
	
	analyser.fftSize = Fs;
	var bufferLength = analyser.fftSize;
	var dataArray = new Uint8Array(bufferLength);
	canvasCtx.clearRect(0,0, WIDTH, HEIGHT);
	
	function draw(){
		//console.log('play:' + context.currentTime);
		drawVisual = requestAnimationFrame(draw);
		
		analyser.getByteTimeDomainData(dataArray); // da cambiare con il passaggio di elementi
		
		canvasCtx.fillStyle = 'rgb(248, 248,248)';
		canvasCtx.fillRect(0,0,WIDTH,HEIGHT);
		
		canvasCtx.lineWidth = 2;
		canvasCtx.strokeStyle = 'rgb(0,0,0)';
		canvasCtx.beginPath();
//		La larghezza della sezione di riga da spostare è data dalla larghezza
//		totale per una frazione pari alla lunghezza del buffer (da capire se in secondi o bit)
		var sliceWidth = WIDTH * 1.0 / bufferLength; 
		var x = 0;
	//	Gestione delle tempistiche imprecisa ma ci accontentiamo
		var timeNow = (Math.trunc(audio.currentTime*100))/100;
	//	Campione di finestra attuale: base da cui far andare i 2048 successivi, sapendo che son Fs al secondo
		var sampleNow = Math.round(timeNow * Fs);
		
		for(var i = 0; i < bufferLength; i++) {
			if( !isOnline){ // isOnline per scegliere se usare i dati ricavati da matlab o generati sul momento
					var v = parseFloat(track.env[i+sampleNow]);
					v = (v * -2) + 2;
			} else {
				var v = dataArray[i] / 128.0;
			}
			var y = v * HEIGHT/2;
			if(i === 0) {
				canvasCtx.moveTo(x, y);
			} else {
				canvasCtx.lineTo(x, y);
			}	

			x += sliceWidth;
		}
		canvasCtx.lineTo(canvas.width, canvas.height/2);
		canvasCtx.stroke();
    };

draw();
	
}

// Info del File
function info(){
//	$('#info').html('<p> v: '+ track.title + '  </p>');
	console.log('info traccia: ' + track.title);
	console.log('length data:' +  trackLength / Fs);
	console.log('sampling: ' + Fs);
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
	trackId = newTrack;
	track = dataJSON[trackId];
	audio.src = "tests/"+track.title;	
	audio.load();
	trackLength = track.env.length;
	Fs = track.Fs;
	info();
}

}