
function rappresentazioni(tracks){						

//	Inizializzazione Canvas
	var canvas = document.querySelector('canvas');
	var canvasCtx = canvas.getContext('2d');
	
//	var larghezza = document.querySelector('.display').clientWidth;
	var larghezza = canvas.clientWidth;
	canvas.setAttribute('width', larghezza);
	var drawVisual;
	visualizer = new persVisualizer();
	var WIDTH = canvas.width;
	var HEIGHT = canvas.height;	
//	Variabili Audio per riproduzione e Analisi
	
	var audio = document.getElementById("audio");
	var rappSelector = document.getElementById("selector");
	var songList = document.getElementById("songs");
	var infos = document.getElementById('info');
	
//  Boolean per start/stop
	var initAnim = true;
	var runAnim = false;
	var isPlay = false;

//	Controlli del mousemove
	var mouseX = 0;
	var mouseY = 0;

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
	this.luci = new Array();
	this.floorGeometry;
	this.floorMaterial
	this.floor;
	this.materiale;
}

persVisualizer.prototype.initRenderer = function(){
	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setSize(canvas.width,canvas.height);
	this.renderer.setClearColor(this.scene.fog.color,1);
	this.renderer.domElement.style.position = "absolute";
	this.renderer.domElement.style.left = '6px'; // correzione da sistemare a seconda del browser
	this.renderer.domElement.style.zIndex = "-1";
	canvas.parentNode.appendChild(this.renderer.domElement, canvas);
	
};

persVisualizer.prototype.initialize = function() {
	
	this.scene = new THREE.Scene();
	this.scene.fog = new THREE.Fog( 0x3f3f3f, 1,45); 
	
	this.camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000); //FOV, a/r, near,far
	this.camera.position.set(0, 2, 8*chCount/10);
	this.camera.lookAt( this.scene.position );
	
//	this.scene.add(this.camera);
	/*	
	var light = new THREE.PointLight(0xffff00);
	light.position.set(0, 10, -5);
	this.scene.add(light);
	*/
	var light = new THREE.AmbientLight(0xffffff);
	this.scene.add(light);
};

persVisualizer.prototype.createGeometry = function() {
	// creazione degli elementi rappresentati.
		
	this.floorGeometry = new THREE.PlaneGeometry(70, 60, chCount/8, 1);
	this.floorMaterial = new THREE.MeshPhongMaterial({ color: 0x66ffff, side: THREE.DoubleSide });
	this.floorMaterial.opacity = 0.8 ;
	this.floorMaterial.transparent = true;
	this.floor = new THREE.Mesh(this.floorGeometry, this.floorMaterial);
	this.floor.rotation.x = Math.PI / -2;
	// primo round?
	
	this.scene.add(this.floor);
	
	
	
	for (var i = 0; i < chCount; i++)
	{
		var barra = new THREE.BoxGeometry(1, 0.5, 0.1);
		
		materiale = new THREE.MeshPhongMaterial({
			color: 0xff6699,
			specular: 0xffffff
		});
		this.barreX[i] = new THREE.Mesh(barra, materiale);
		this.barreY[i] = new THREE.Mesh(barra, materiale);
		
		this.barreX[i].position.set( -i-0.5, 0, 0);
		this.scene.add(this.barreX[i]);
		this.barreY[i].position.set( i+0.5, 0, 0);
		this.scene.add(this.barreY[i]);
		
		// light associata
		this.luci[i] = new THREE.PointLight(0xff00ff,0xffff00, 4, 2,1);
		this.luci[i].position.set( -i-0.5, 1, 2);
		this.scene.add(this.luci[i]);
		
		this.luci[chCount + i] = new THREE.PointLight(0xffff00, 4, 2,1);
		this.luci[chCount + i].position.set( i+0.5, 1, 2);
		this.scene.add(this.luci[chCount + i]);
	}
};

/*
function onDocumentMouseMove(event){
	mouseX = event.clientX - WIDTH/2;
	mouseY = event.clientY - HEIGHT/2;
}

/*
function waveupdate(sample){
	for(var i = 0; i < visualizer.floorGeometry.vertices.length; i++)
	{
		var v = visualizer.floorGeometry.vertices[i];
		v.z 
	}
}
*/
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
	//document.addEventListener('mousemove', onDocumentMouseMove, false);
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
			var pxWidth = Math.trunc((WIDTH / ( trackLength * FsFb))*1000)/1000;
			var pxHeight = HEIGHT / chCount;
			var xNext = Math.trunc(audio.currentTime * FsFb) * pxWidth;
			canvasCtx.fillStyle = 'rgb(248,248,248)';
			canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

		
		function draw() {
			drawVisual = requestAnimationFrame(draw);

			//	Gestione delle tempistiche imprecisa ma ci accontentiamo
			var timeNow = (Math.trunc(audio.currentTime*100))/100;
			//	Campione di finestra attuale:
			var sampleNow = Math.round(timeNow * FsFb);
			// 	Quante rappresentazioni ci stanno nello schermo attuale
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
					valueSample = 0.0; // valore minimo in entrata
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
				canvasCtx.fillRect(x,HEIGHT - barHeight, barWidth , barHeight);
				x += barWidth + 1;
			}
		}
	} else if(rappresentazione==4){
//		Rappresentazione personalizzata
		// raggio di rotazione
		
		function draw() {
			drawVisual = requestAnimationFrame(draw);
			
			console.log("presonalizzata");
			
			var timeNow = (Math.trunc(audio.currentTime*100))/100;
		//	Campione di finestra attuale:
			var nVert = visualizer.floorGeometry.vertices.lentgh;
			var sampleFbNow = Math.round(timeNow * FsFb);
			var sampleEnvNow = Math.round(timeNow * nVert);
			
			// rotazione della camera attorno all'origine
			if(isPlay){
			//	visualizer.camera.position.x += (mouseX - visualizer.camera.x) * 10;
			//	visualizer.camera.position.z += (mouseY - visualizer.camera.z) * 10;
				visualizer.camera.position.x += 0.01*Math.cos(0.1*timeNow*Math.PI);
				//visualizer.camera.position.z = 18 + 0.5*Math.sin(timeNow*Math.PI);
				visualizer.camera.lookAt( visualizer.scene.position);
			}
			
			
			visualizer.renderer.render(visualizer.scene, visualizer.camera);
	
		// animazione in base ai dati
			for (var i = 0; i < chCount && isPlay; i++)
			{
				var valore = 2 * parseFloat(track.filterbank[sampleFbNow][i]);
				visualizer.barreX[i].scale.y = 10  * valore;
				visualizer.barreY[i].scale.y = 10  * valore;
				
				visualizer.luci[i].power = 5* valore;
				visualizer.luci[chCount + i].power = 5*valore;
				
			}
			visualizer.floorMaterial.needsUpdate = true;
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
	infos.innerHTML = '<p> Traccia: '+ track.title + ', Fs: ' + Fs+', FsFb: '+FsFb+', Nch: '+chCount+', durata: ' + trackLength +'s</p>';
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
