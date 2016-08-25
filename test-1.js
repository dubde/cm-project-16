
function rappresentazioni(tracks){						

	console.log('esempio');
//	Inizializzazione Canvas
	var canvas = document.querySelector('.display');
	var canvasCtx = canvas.getContext("2d");
	
//	var larghezza = document.querySelector('.display').clientWidth;
	var larghezza = canvas.clientWidth;
	canvas.setAttribute('width', larghezza);
	var drawVisual;
	
//	Variabili Audio per riproduzione e Analisi
	
	var audio = document.getElementById("audio");
	var rappSelector = document.getElementById("selector");
	var songList = document.getElementById("songs");
	var infos = document.getElementById('info');
	
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
	var startButton = document.getElementById( 'startButton' );
	var resetButton = document.getElementById( 'resetButton' );
	var stop = 0;
// Start Button
  startButton.onclick = function StartAnimation() {

  if (initAnim) {
    initAnim = false;
    runAnim = true;
	audio.currentTime = 0;
    window.cancelAnimationFrame(drawVisual);
	visualize();
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
	visualize();
	}

//	Select Song
//	Farebbe comodo poter usare la ResetParameters() già dichiarata ma non posso..
	songList.addEventListener("click",function(e){
		selectSong(e.target.id);  
		startButton.innerHTML = 'Start';
		// pulizia della schermata
		window.cancelAnimationFrame(drawVisual);
		visualize();
		// Boolean for Stop Animatio
		initAnim = true;
		runAnim = false;
		isPlay = false;
		audio.pause();
		audio.currentTime = 0;
	});

//	Termine della canzone	
	audio.addEventListener("ended", function(){
		startButton.innerHTML = 'Start';
		// Boolean for Stop Animation
		initAnim = true;
		runAnim = false;
		isPlay = false;
		audio.pause();
		//audio.currentTime = 0;
	});
}

//	Creo i punti del grafico
function visualize() {	
	
	var WIDTH = canvas.width;
	var HEIGHT = canvas.height;	
	
	var rappresentazione = rappSelector.value;
	console.log('selected:'+rappresentazione);
	canvasCtx.clearRect(0,0, WIDTH, HEIGHT);
	
	if( rappresentazione == 1){
//	Rappresentazione 1D linea
		function draw(){
			drawVisual = requestAnimationFrame(draw);
			canvasCtx.fillStyle = 'rgb(248, 248,248)';
			canvasCtx.fillRect(0,0,WIDTH,HEIGHT);
		
			canvasCtx.lineWidth = 2;
			canvasCtx.strokeStyle = 'rgb(0,0,0)';
			canvasCtx.beginPath();
		
		//	Gestione delle tempistiche imprecisa ma ci accontentiamo
	var timeNow = (Math.trunc(audio.currentTime*100))/100;
	//	Campione di finestra attuale:
	var sampleNow = Math.round(timeNow * Fs) - Fs;
		
	//	La larghezza della sezione di riga da spostare è data dalla larghezza
	//	totale per una frazione pari alla lunghezza della Fs, numero di campioni 
			var sliceWidth = WIDTH * 1.0 / parseInt(Fs); 
			var x = 0;
		
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
	
	} else if(rappresentazione==2){
//		Rappresentazione 2D planare
			//canvasCtx.fillStyle = 'rgb(248, 248,248)';
			//canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
			var xNext = 0;
			
		function draw() {
			drawVisual = requestAnimationFrame(draw);

			//	Gestione delle tempistiche imprecisa ma ci accontentiamo
			var timeNow = (Math.trunc(audio.currentTime*100))/100;
			//	Campione di finestra attuale:
			var sampleNow = Math.round(timeNow * FsFb);
			// 	Quante rappresentazioni ci stanno nello schermo attuale
			var pxWidth = Math.trunc((WIDTH / ( trackLength * FsFb))*1000)/1000;
			var pxHeight = HEIGHT / chCount;
			var pxColor = 0;
			var xNow = xNext;
			xNext = sampleNow * pxWidth;
			
			var y = 0;
			for(var i = 0; i < chCount; i++) {
				if(timeNow == 0){
					canvasCtx.fillStyle = 'rgb(248,248,248)';
					canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
				} else {
					pxColor = Math.trunc(parseFloat(track.filterbank[sampleNow][i])*255);
				}
				canvasCtx.fillStyle = 'rgb('+pxColor+','+pxColor+',255)';
				canvasCtx.fillRect(xNow, y, xNext-xNow, pxHeight);
				y += pxHeight;
			}
		}
	} else if(rappresentazione==3){
//		Rappresentazione barre delle frequenze

		function draw() {
			drawVisual = requestAnimationFrame(draw);

			canvasCtx.fillStyle = 'rgb(248, 248,248)';
			canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

			//	Gestione delle tempistiche imprecisa ma ci accontentiamo
			var timeNow = (Math.trunc(audio.currentTime*100))/100;
			//	Campione di finestra attuale:
			var sampleNow = Math.round(timeNow * FsFb);
	
			var barWidth = (WIDTH / chCount) - 1;
			var barHeight;
			var x = 0;
			for(var i = 0; i < chCount; i++) {
				if(timeNow == 0){
					barHeight = HEIGHT/2;
				} else {
					barHeight = parseFloat(track.filterbank[sampleNow][i]);
					barHeight = barHeight * HEIGHT;
				}
				canvasCtx.fillStyle = 'rgb(100,0,0)';
				canvasCtx.fillRect(x,HEIGHT - barHeight, barWidth ,HEIGHT);
				x += barWidth + 1;
			}
		}
	} else if(rappresentazione==4){
//		Rappresentazione personalizzata
		function draw(){
			console.log("presonalizzata");
		}
	}
	draw();
}

//	Cambio rappresentazione
rappSelector.onchange = function(){
	window.cancelAnimationFrame(drawVisual);
	visualize();
}
	
function persVisualizer(){
	this.schene;
	this.camera;
	this.renderer;
//	this.controls;
}

persVisualizer.prototype.initialize = function() {
	
	this.scene = new THREE.Scene();
	
}

// Info del File
function info(){	
	infos.innerHTML = '<p> Traccia: '+ track.title + ', Fs: ' + Fs+', Nch: '+chCount+', durata: ' + trackLength +'s</p>';
	console.log('info traccia: ' + track.title);
	console.log('sampling: ' + Fs);
}

function songs(){
	console.log('tracce: ' + nTracks);
	for(i=0; i < nTracks; i++)
	{
		var title = trackList[i];
		songList.insertAdjacentHTML('beforeend','<li id="'+ i +'" class="audio">' + title + '</li>' );
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
	Fs = parseInt(track.Fs);
	trackLength = track.env.length / Fs;
	chCount = parseInt(track.Nch);
	FsFb = parseInt(track.FsFb);
	info();
}

}