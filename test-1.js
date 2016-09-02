
function rappresentazioni(tracks){						

//	Inizializzazione Canvas
	var canvas = document.querySelector('canvas');
	var canvasCtx = canvas.getContext('2d');
	
//	var larghezza = document.querySelector('.display').clientWidth;
	var larghezza = canvas.clientWidth;
	canvas.setAttribute('width', larghezza);
	var drawVisual;
	
	visualizer = new persVisualizer();
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
	
	
function persVisualizer(){
	this.schene;
	this.camera;
	this.renderer;
	this.controls;
	this.barreX = new Array();
	this.barreY = new Array();
}

persVisualizer.prototype.initRenderer = function(){
	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setSize(canvas.width,canvas.height);
	this.renderer.setClearColor(this.scene.fog.color,1);
	this.renderer.domElement.style.position = "absolute";
	this.renderer.domElement.style.left = '6px';
	this.renderer.domElement.style.zIndex = "-1";
	canvas.parentNode.appendChild(this.renderer.domElement, canvas);
	
};

persVisualizer.prototype.initialize = function() {
	
	this.scene = new THREE.Scene();
	this.scene.fog = new THREE.FogExp2( 0xf8f8f8, 0.002);
	
	var WIDTH = canvas.width;
	var HEIGHT = canvas.height;
	
	this.camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 0.1, 1000); //FOV, a/r, near,far
	this.camera.position.set(5, 5, 5);
	this.camera.lookAt( this.scene.position );
	
//	this.scene.add(this.camera);
		
	var light = new THREE.PointLight(0xffffcc);
	light.position.set(-100, 200, 100);
	this.scene.add(light);
	
	var light = new THREE.AmbientLight(0xffffff);
	this.scene.add(light);
};

persVisualizer.prototype.createGeometry = function() {
	// creazione degli elementi rappresentati.
	for (var i = 0; i < chCount; i++)
	{
		var barra = new THREE.BoxGeometry(0.5, 0.5, 0.5);
		
		var materiale = new THREE.MeshPhongMaterial({
			color: 0xff6699,
			specular: 0xffffff
		});
		this.barreX[i] = new THREE.Mesh(barra, materiale);
		this.barreY[i] = new THREE.Mesh(barra, materiale);
		this.barreX[i].position.set(i - chCount/2, 0,0);
		this.scene.add(this.barreX[i]);
		this.barreY[i].position.set(0, i - chCount/2,0);
		this.scene.add(this.barreY[i]);
	}
};


	init();

function init(){	
	
//  Lettura dati estratti delle Tracce 
	songs();
	
//	Inizializzazione Elementi 3D 
	visualizer.initialize();
	visualizer.createGeometry();
	visualizer.initRenderer();
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
		audio.currentTime = 0;
	});
}

//	Creo i punti del grafico
function visualize() {	
	
	var WIDTH = canvas.width;
	var HEIGHT = canvas.height;	
	
	
	var rappresentazione = rappSelector.value;
	
	// trucchetto per spostare la rappresentazione THREEJS in evidenza o no.
	if (rappresentazione < 4) {
		visualizer.renderer.domElement.style.zIndex = "-1";
	} else {
		visualizer.renderer.domElement.style.zIndex = "1";
	}
	
	console.log('rapp selected:'+rappresentazione+' '+canvas.width);
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
			var sliceWidth = WIDTH * 1.0 / Fs; 
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
				//	colore in base all'intensità
				//canvasCtx.fillStyle = 'rgb('+pxColor+','+pxColor+',255)';
				if(pxColor <= 128){
					var colorR = 0;
					var colorG = pxColor*2;
				} else {
					var colorR = (pxColor-127)*2;
					var colorG = 255;
				}
				var colorB = 255 - pxColor;
				canvasCtx.fillStyle = 'rgb('+colorR+','+colorG+','+colorB+')';
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
			var sampleNow = Math.trunc(timeNow * FsFb);
	
			var barWidth = (WIDTH / chCount) - 1;
			var barHeight;
			var valueSample;
			var x = 0;
			for(var i = 0; i < chCount; i++) {
				if(timeNow == 0){
					valueSample = 0.001; // valore minimo in entrata
				} else {
					valueSample = parseFloat(track.filterbank[sampleNow][i]);
				}
				
			//	colore in base all'intensità
			//	canvasCtx.fillStyle = 'rgb(100,0,0)';
				
				if(valueSample <= 0.500){ // da blu, valore basso, a verdino 
					var colorR = 0;
					var colorG = Math.trunc(valueSample*255)*2;
				} else { 
					var colorR = Math.trunc((valueSample-0.5)*255)*2;
					var colorG = 255;
				}
				var colorB = Math.trunc(255-valueSample*255); // scalo su tutto il blu indipendentemente.
				canvasCtx.fillStyle = 'rgb('+colorR+','+colorG+','+colorB+')';
				//console.log('vS:'+valueSample+' colorsRGB: '+colorR+colorR+colorB+canvasCtx.fillStyle);
				//canvasCtx.fillStyle = 'rgb(255,0,255)';
				barHeight = valueSample * HEIGHT;
				infos.innerHTML = '<p> Traccia: '+ track.title + ', barHeight: ' + barHeight+', valueSample: '+valueSample+', sampleNow: '+sampleNow+'</p>';
				canvasCtx.fillRect(x,HEIGHT - barHeight, barWidth ,HEIGHT);
				x += barWidth + 1;
			}
		}
	} else if(rappresentazione==4){
//		Rappresentazione personalizzata
		// raggio di rotazione
		var raggio = 10;
		function draw() {
			drawVisual = requestAnimationFrame(draw);
			
			console.log("presonalizzata");
			
			var timeNow = (Math.trunc(audio.currentTime*100))/100;
		//	Campione di finestra attuale:
			var sampleFbNow = Math.round(timeNow * FsFb);
			var sampleEnvNow = Math.round(timeNow * Fs);
			
			// rotazione della camera attorno all'origine
			if(isPlay){
				visualizer.camera.position.x = visualizer.scene.position.x + raggio * Math.cos(0.5*timeNow);
				visualizer.camera.position.z = visualizer.scene.position.z + raggio * Math.sin(0.5*timeNow);
				visualizer.camera.position.y = visualizer.scene.position.y + raggio * Math.sin(0.5*timeNow);
				visualizer.camera.lookAt( visualizer.scene.position);
			}
			
			visualizer.renderer.render(visualizer.scene, visualizer.camera);
	
		// animazione in base ai dati
			for (var i = 0; i < chCount; i++)
			{
				var valore = 2*raggio * parseFloat(track.filterbank[sampleFbNow][i]);
				visualizer.barreX[i].scale.z = valore;
				visualizer.barreY[i].scale.z = valore;
			}	
		}
	}
	draw();
}

//	Cambio rappresentazione
rappSelector.onchange = function(){
	window.cancelAnimationFrame(drawVisual);
	visualize();
}
	
// Info del File
function info(){	
	//infos.innerHTML = '<p> Traccia: '+ track.title + ', Fs: ' + Fs+', FsFb: '+FsFb+', Nch: '+chCount+', durata: ' + trackLength +'s</p>';
	console.log('info traccia: ' + track.title);
	console.log('sampling: ' + Fs);
}

function songs(){
	console.log('tracce: ' + nTracks);
	for(i=0; i < nTracks; i++)
	{
		var title = trackList[i].title;
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
