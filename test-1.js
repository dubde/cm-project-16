
function primoEsempio(tracks){						

	console.log('primo esempio');
//	Inizializzazione Canvas
	var canvas = document.querySelector('.primo');
	var canvasCtx = canvas.getContext("2d");
	
	var larghezza = document.querySelector('.primo').clientWidth;
	canvas.setAttribute('width', larghezza);
	var drawVisual;
	
//	Variabili Audio per riproduzione e Analisi
//	var context = new (window.AudioContext || window.webkitAudioContext)();
//	var analyser = context.createAnalyser();
	var audio = document.getElementById("audio");
	var songList = document.getElementById("songs-1");
	
//  Boolean per start/stop
	var initAnim = true;
	var runAnim = false;
	var isPlay = false;
 

//	Dati Traccia Statici 
	var trackId = 0;
	var trackLength = 0;
	var track; 
	
	init();
	
function init(){	
	
//  Lettura dati estratti delle Tracce 
	songs();

//	Prima generazione grafica	
	visualize();

//	Sistema di controllo start/stop
	control();
}

//	Controlli di traccia (start/stop/select)
function control() {
	
// Buttons startButton and resetButton
	var startButton = document.getElementById( 'startButton1' );
	var resetButton = document.getElementById( 'resetButton1' );
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
//	Farebbe comodo poter usare la ResetParameters() già dichiarata ma non posso..
	songList.addEventListener("click",function(e){
		selectSong(e.target.id);
	// Set StartButton to Start  
    startButton.innerHTML = 'Start';
    window.cancelAnimationFrame(drawVisual);
    // Boolean for Stop Animatio
	initAnim = true;
    runAnim = false;
	isPlay = false;
	audio.pause();
	audio.currentTime = 0;
	visualize();
	});
	
	audio.addEventListener("ended", function(){
		startButton.innerHTML = 'Start';
    window.cancelAnimationFrame(drawVisual);
    // Boolean for Stop Animation
	initAnim = true;
    runAnim = false;
	isPlay = false;
	audio.pause();
	audio.currentTime = 0;
	});
	visualize();
}

//	Creo i punti del grafico
function visualize() {	
	
	var WIDTH = canvas.width;
	var HEIGHT = canvas.height;
	var sampleNow = 0;
		
	var bufferLength = Fs;
	canvasCtx.clearRect(0,0, WIDTH, HEIGHT);
	
	function draw(){
		drawVisual = requestAnimationFrame(draw);
		
		canvasCtx.fillStyle = 'rgb(248, 248,248)';
		canvasCtx.fillRect(0,0,WIDTH,HEIGHT);
		
		canvasCtx.lineWidth = 2;
		canvasCtx.strokeStyle = 'rgb(0,0,0)';
		canvasCtx.beginPath();
		
//		La larghezza della sezione di riga da spostare è data dalla larghezza
//		totale per una frazione pari alla lunghezza della Fs, numero di campioni 
		var sliceWidth = WIDTH * 1.0 / parseInt(Fs); 
		var x = 0;
	//	Gestione delle tempistiche imprecisa ma ci accontentiamo
		var timeNow = (Math.trunc(audio.currentTime*100))/100;
	//	Campione di finestra attuale:
		
		sampleNow = Math.round(timeNow * Fs) - Fs;
		
		for(var i = 0; i < Fs; i++) {
			
			if ( timeNow == 0) {
				var v = 2;
			} else {
			var v = parseFloat(track.env[i+sampleNow]);
			v = (v * -2) + 2;	
			}
			var y = v * HEIGHT/2;
			if(i === 0) {
				canvasCtx.moveTo(x, y);
			} else {
				canvasCtx.lineTo(x, y);
			}	
			x += sliceWidth;
		}
		canvasCtx.lineTo(canvas.width, y); //canvas.height
		canvasCtx.stroke();
    };

draw();
	
}

// Info del File
function info(){
	var infos = document.getElementById('info-1');
	infos.innerHTML = '<p> Traccia in esecuzione: '+ track.title + ', Fs: ' + Fs+', durata: ' + trackLength / Fs +'s</p>';
	console.log('info traccia: ' + track.title);
	console.log('length data:' +  trackLength);
	console.log('sampling: ' + Fs);
}

function songs(){
	console.log('tracce: ' + nTracks);
	for(i=0; i < nTracks; i++)
	{
		var title = trackList[i];
		songList.insertAdjacentHTML('beforeend','<li id="'+ i +'">' + title + '</li>' );
		audio.insertAdjacentHTML('beforeend','<source src="tests/'+ title + '">');
	}
	selectSong(0);
}

function selectSong(newTrack)
{
	trackId = newTrack;
	track = tracks[trackId];
	audio.src = ''+audioDir+'/'+track.title;	
	console.log
	audio.load();
	trackLength = track.env.length;
	Fs = track.Fs;
	info();
}

}