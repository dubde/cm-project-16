
function rappresentazioni(tracks){						

//	Inizializzazione Canvas:
//	recupero del contesto e dell'elemento canvas dalla pagina
	var canvas = document.querySelector('canvas');
	var canvasCtx = canvas.getContext('2d');
	var larghezza = canvas.clientWidth;
	canvas.setAttribute('width', larghezza);
	var drawVisual;
	visualizer = new persVisualizer();
	var WIDTH = canvas.width;
	var HEIGHT = canvas.height;	
	var raggio;
	var color;
	
//	Variabili Audio per la visualizzazione
	var audio = document.getElementById("audio");
	var rappSelector = document.getElementById("selector");
	var songList = document.getElementById("songs");
	var infos = document.getElementById('info');
	
//  Boolean per start/stop
	var initAnim = true;
	var runAnim = false;
	var isPlay = false;

//	Dati per traccia
	var trackId = 0;
	var trackLength = 0;
	var track;
	var folder;

//	Preparazione Visualizzazione Personalizzata:
//	Creo un oggetto visualizzazione in modo da contenere
//	tutta la parte di ThreeJS al suo interno	
function persVisualizer(){
	this.scene;
	this.camera;
	this.renderer;
	this.controls;
	this.barreX = new Array();
	this.barreY = new Array();
	this.floorGeometry;
	this.floorMaterial;
	this.floor;
	this.suns = new Array();
	this.ambient;
	this.angle;
}

//	Inizializzazione del Renderer:
//	Per creare una visualizzazione devo definire un elemento renderer
//	con le caratteristiche del campo in cui andranno riprodotti gli
//	elementi 3D.
//	In questo caso, appendo il secondo render successivamente al primo,
//	sfrutto lo z-index per nascondere il renderer 3D sotto quello 2D: 
//	quando verrà selezionata la rappresentazione personalizzata si 
//	scambieranno le posizioni.

persVisualizer.prototype.initRenderer = function(){
	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setSize(canvas.width,canvas.height);
	this.renderer.domElement.style.position = "absolute";
	this.renderer.domElement.style.left = '9px'; // correzione da sistemare a seconda del browser
	this.renderer.domElement.style.zIndex = "-1";
	this.renderer.shadowMap.enabled = true;
	this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	
	canvas.parentNode.appendChild(this.renderer.domElement, canvas);
};

//	Inizializzazione del Visualizzatore:
//	Inizializzo la scena da riprodurre per cui, definisco gli elementi
//	Base che ne fanno parte: la scena in primis, la nebbia dei contorni, 
//	luci e la camera, ovvero da dove osserviamo la scena rappresentata.

persVisualizer.prototype.initialize = function() {
	
	this.scene = new THREE.Scene();
	this.scene.fog = new THREE.Fog( 0x3f3f3f, 5,45); 
	this.renderer.setClearColor(this.scene.fog.color,1);
	
	raggio = 8*chCount/10; // proporzionale al numero di barre rappresentate
	this.camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000); //FOV, a/r, near,far
	this.camera.position.set(0, 2, 5+raggio); 
	this.camera.lookAt( this.scene.position );
	
	//	Luci in movimento:
	//	ho posizionato due luci puntiformi in movimento a tempo
	//	con la musica. Sono identiche a posizioni diverse.
	for(var i = 0; i < 2; i++){
		var sun = new THREE.PointLight({
			color: 'hsl('+color+',100%,70%)' //0xffff00
			});
		sun.castShadow = true;
		sun.decay = 2;
		sun.intensity = 2;
		sun.distance = 2*raggio;
		sun.lookAt( 0,2 , - 2+raggio );
		sun.shadow.mapSize.width = 1024;
		sun.shadow.mapSize.height = 1024;
		sun.shadow.camera.near = 1;
		sun.shadow.camera.far = 20;
		sun.penumbra = 0.05;
		this.suns[i] = sun;
		this.suns[i].position.set( -chCount/2, 10, -1 );
		this.scene.add(this.suns[i]);
	}
	this.suns[1].position.set( chCount/2,10,-1);
	this.angle = 0;
	
	//	Luce ambientale
	this.ambient = new THREE.AmbientLight({
	color: 'hsl('+color+',100%,95%)'//0xffffff
	});
	this.scene.add(this.ambient);
};

//	Inizializzazione delle Geometrie:
//	In questo prototipo inizializzo le geometrie che compongono la scena,
//	quindi gli elementi in 3D.
//	Ogni elemento 3D è composto da una geometria matematica, da un 
//	materiale che ne descrive colore, diffusione e riflessione e da una posizione.
persVisualizer.prototype.createGeometry = function() {
	
	// Colori
	var R = 255 - color;
	var G = color;
	var B = color;
		
	
	//	Floor o Piano che si muoverà come un telo.
	this.floorGeometry = new THREE.PlaneGeometry(70, 4*raggio, 20, 20);
	this.floorMaterial = new THREE.MeshPhongMaterial({ 
			color: 'rgb('+R+','+G+',168)', //0x66ffff,
			side: THREE.DoubleSide
		});
	this.floorMaterial.opacity = 0.8 ;
	this.floorMaterial.transparent = true;
	this.floor = new THREE.Mesh(this.floorGeometry, this.floorMaterial);
	this.floor.rotation.x = Math.PI / 12 + Math.PI / -2;
	this.floor.position.z += -raggio/2;
	this.floor.receiveShadow = true;
	
	this.scene.add(this.floor);
	
	
	//	Barre del visualizzatore di spettro
	for (var i = 0; i < chCount; i++)
	{
		var barra = new THREE.BoxGeometry(1, 0.5, 1);
		console.log('g: '+G);
		G = ((G-i)*(G-i))%255;
		
		var materiale = new THREE.MeshPhongMaterial({
			color: 'rgb('+R+','+G+','+B+')', /*0xff6699*/ 
			specular: 0xffffff
		});
		this.barreX[i] = new THREE.Mesh(barra, materiale);
		this.barreY[i] = new THREE.Mesh(barra, materiale);
		this.barreX[i].castShadow = true;
		this.barreY[i].castShadow = true;
				
		this.barreX[i].position.set( -i-0.5, 0, 0);
		this.scene.add(this.barreX[i]);
		this.barreY[i].position.set( i+0.5, 0, 0);
		this.scene.add(this.barreY[i]);
		
	}
};

//	Avvio il programma di inizializzazione
	init();

//	Funzione di Inizializzazione:
//	Definita per costruire l'applicazione, dalla lettura dei files
//	alla rappresentazione musicale.
function init(){	
	
//  Lettura dati estratti delle Tracce 
	songs();
//	Inizializzazione Elementi 3D 
	visualizer.initRenderer();
	visualizer.initialize();
	visualizer.createGeometry();
	
//	Prima generazione grafica	
	visualize();

//	Sistema di controllo start/stop
	control();
}

//	Controlli di traccia (start/stop/select)
//	Per gestire l'esecuzione della traccia audio coordinata
//	alla rappresentazione visiva ho implementato dei comandi
//	di start/stop/pausa/reset e inserito il comportamento di
//	"end track" e "change track" come situazioni particolari.
//	Faccio affidamento delle variabili:
//	initAnim : definisce se deve iniziare l'animazione
//	runAnim : mi dice che l'animazione è in riproduzione
//	isPlay : riporta l'informazione che la traccia è stata avviata
//	Ogni volta che stoppo e riprendo l'esecuzione cancello il Frame 
//	di animazione così da pulire lo schermo.
function control() {
	
	// Pulsanti startButton e resetButton dal documento HTML:
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

	// Reset: ferma la canzone e la riporta all'inizio
    resetButton.onclick = function ResetParameters() {
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

	//	Select Song: cambio di canzone
	songList.addEventListener("click",function(e){
		selectSong(e.target.id);  
		startButton.innerHTML = 'Start';
		window.cancelAnimationFrame(drawVisual);
		
		visualizer.initialize();
		visualizer.createGeometry();
	    
		visualize();

		initAnim = true;
		runAnim = false;
		isPlay = false;
		audio.pause();
		audio.currentTime = 0;
	});

	//	End Song: Termine della canzone	
	audio.addEventListener("ended", function(){
		startButton.innerHTML = 'Start';
		// Boolean for Stop Animation
		initAnim = true;
		runAnim = false;
		isPlay = false;
		audio.pause();
		audio.currentTime = 0; // conviene specificare che l'audio riparte da 0 ond evitare possibili problemi
	});
}

//	Visualizzazione Grafica:
//	Animazione legata alla musica, grazie ai dati letti. A seconda 
//	della rappresentazione selezionata viene gestita un'animazione
//	differente, grazie a diversa definizione della funzione "draw"
function visualize() {	
	
	var rappresentazione = rappSelector.value;
	
	// trucchetto per spostare la rappresentazione 3D in primo piano o no.
	if (rappresentazione < 4) {
		visualizer.renderer.domElement.style.zIndex = "-1";
	} else {
		visualizer.renderer.domElement.style.zIndex = "1";
	}

	console.log('rapp selected:'+rappresentazione+' '+canvas.width); //debug
	
	// refresh
	canvasCtx.clearRect(0,0, WIDTH, HEIGHT);
	
	if( rappresentazione == 1){
//	Rappresentazione 1D: linea
		
		function draw(){
			drawVisual = requestAnimationFrame(draw);
			canvasCtx.fillStyle = 'rgb(248, 248,248)';
			canvasCtx.fillRect(0,0,WIDTH,HEIGHT);
		
			canvasCtx.lineWidth = 2;
			canvasCtx.strokeStyle = 'rgb(0,0,0)';
			canvasCtx.beginPath();
		
	//	Gestione del tempo di riproduzione
	var timeNow = (Math.trunc(audio.currentTime*100))/100;
	//	Campione attuale:
	//	sposto indietro di "Fs" in quanto poi vado a rappresentare gli Fs campioni
	//	successivi nel ciclo for. Se non faccio questa correzione, la rappresentazione
	//	grafica rimane 1 secondo indietro rispetto all'audio.
	var sampleNow = Math.round(timeNow * Fs) - Fs;
		
	//	La larghezza della sezione di riga da spostare è data dalla larghezza
	//	totale per una frazione pari alla lunghezza della Fs, numero di campioni 
			var sliceWidth = WIDTH * 1.0 / Fs; 
			var x = 0;
		
			for(var i = 0; i < Fs; i++) {
			
				if ( timeNow == 0) {
					var valore = 1; // situazione di attesa di riproduzione audio
				} else {
				var valore = parseFloat(track.env[i+sampleNow]); // a volte non interpreta correttamente e bisogna specificare FLOAT
				valore = (valore * -1) + 1; // a causa del sistema di coordinate, inverto i dati per renderli sensati visivamente.
				}
				var y = valore * HEIGHT;
				if(i === 0) {
					canvasCtx.moveTo(x, y);
				} else {
					canvasCtx.lineTo(x, y);
				}	
				x += sliceWidth;
			}
			canvasCtx.lineTo(canvas.width, y);
			canvasCtx.stroke();
		};
	
	} else if(rappresentazione==2){
//		Rappresentazione 2D planare
			//	Uso una frequenza di campionamento diversa per il filterbank,
			//	per poter gestire il numero di campioni e la dimensione del file
			var pxWidth = Math.trunc((WIDTH / ( trackLength * FsFb))*1000)/1000;
			var pxHeight = HEIGHT / chCount;
			var xNext = Math.trunc(audio.currentTime * FsFb) * pxWidth;
			canvasCtx.fillStyle = 'rgb(248,248,248)';
			canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
		
		function draw() {
			drawVisual = requestAnimationFrame(draw);

			//	Gestione del tempo di riproduzione
			var timeNow = (Math.trunc(audio.currentTime*100))/100;
			//	Campione attuale:
			var sampleNow = Math.round(timeNow * FsFb);
			var pxColor = 0;
			var xNow = xNext;
			xNext = sampleNow * pxWidth;
			
			var y = 0;
			for(var i = 0; i < chCount; i++) {
				if(timeNow == 0){
					// situazione iniziale, cavas pulito.
					canvasCtx.fillStyle = 'rgb(248,248,248)';
					canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
				} else {
					pxColor = Math.trunc(parseFloat(track.filterbank[sampleNow][i])*255);
				}
				//	colore in base all'intensità
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

			//	Tempo Attuale
			var timeNow = (Math.trunc(audio.currentTime*100))/100;
			//	Campione attuale:
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
					
				if(valueSample <= 0.500){ // da blu, valore basso, a verdino 
					var colorR = 0;
					var colorG = Math.trunc(valueSample*255)*2;
				} else { 
					var colorR = Math.trunc((valueSample-0.5)*255)*2;
					var colorG = 255;
				}
				var colorB = Math.trunc(255-valueSample*255); // scalo su tutto il blu indipendentemente.
				canvasCtx.fillStyle = 'rgb('+colorR+','+colorG+','+colorB+')';
				barHeight = valueSample * HEIGHT;
				canvasCtx.fillRect(x,HEIGHT - barHeight, barWidth , barHeight);
				x += barWidth + 1;
			}
		}
	} else if(rappresentazione==4){
//		Rappresentazione personalizzata
		function draw() {
			drawVisual = requestAnimationFrame(draw);
			
			var timeNow = (Math.trunc(audio.currentTime*100))/100;
		//	Campione di finestra attuale:
			var sampleFbNow = Math.round(timeNow * FsFb);
			var sampleEnvNow = Math.round(timeNow * Fs);
			
			visualizer.floorGeometry.dynamic = true;
			visualizer.floorGeometry.verticesNeedUpdate = true;
			visualizer.floorGeometry.normalsNeedUpdate = true;
			visualizer.floorGeometry.colorsNeedUpdate = true;
			visualizer.renderer.render(visualizer.scene, visualizer.camera);
	
		//	Spettrometro:
		//	Come nel caso 2D, animo le barre seguendo l'envelope del filterbank
			for (var i = 0; i < chCount && isPlay ; i++)
			{	
				var valore = 2 * parseFloat(track.filterbank[sampleFbNow][i]);
				
				if(valore <= 0){
					valore = 0.001;
				}
				
				visualizer.barreX[i].scale.y = 10  * valore;
				visualizer.barreY[i].scale.y = 10  * valore;
			}
			visualizer.floorMaterial.needsUpdate = true;
		
		//	onda sul telo / floor:
		//	Il piano è rappresentato come insieme di vertici, quindi 
		//	faccio scorrere i valori id ogni vertice in righe, così da spostarne
		//	la posizione. Viene modificata la coordinata z in quanto il piano viene 
		//	normalmente dichiarato in verticale, ruotato quindi di 90 gradi.
		//	La prima riga di vertici avrà il valore aggiornato con il campione attuale.
		//	I dati sono quelli dell'envelope principale della canzone.
			var valore = parseFloat(track.env[sampleEnvNow]);
			for(var i = 0; i < 21; i++)
			{
				visualizer.floorGeometry.vertices[i].z = 2*valore;
			}
			for(var i = visualizer.floorGeometry.vertices.length-1 ; i > 20; i--)
			{
				visualizer.floorGeometry.vertices[i].z = visualizer.floorGeometry.vertices[i-21].z;
			}
			
		//	Rotazione delle luci:
		//	Aggiorno il valore angolare di rotazione seguendo il tempo della canzone, 
		//	normalizzato a 120 bpm.
			visualizer.angle += 0.05 * track.tempo / 120;
			for(var i = 0; i < visualizer.suns.length && isPlay; i++){
				var sign = i%2 ? -1 : 1;
				visualizer.suns[i].position.x = chCount*Math.cos( visualizer.angle ) ;
				visualizer.suns[i].position.y = sign * raggio*Math.sin( visualizer.angle );
				visualizer.suns[i].position.z = sign * chCount*Math.cos( visualizer.angle );
			}			
		}
	}
	draw();
}


//	Cambio rappresentazione:
//	Al cambio di rappresentazione, pulisce lo schermo.
rappSelector.onchange = function(){
	window.cancelAnimationFrame(drawVisual);
	visualize();
}
	
// Informazioni del file da mostrare in tabella e log:
function info(){	
	infos.innerHTML = '<p> Traccia: '+ track.title + ', Fs: ' + Fs+', FsFb: '+FsFb+', Nch: '+chCount+', durata: ' + trackLength +'s</p>';
	console.log('info traccia selezionata: ' + track.title);
}

//	Caricamento delle canzoni:
//	Crea dal file la lista delle canzoni e il menu di selezione
function songs(){
	for(i=0; i < nTracks; i++)
	{
		var title = trackList[i].title;
		songList.insertAdjacentHTML('beforeend','<li id="'+ i +'" class="audio">' + title + '</li>' );
		audio.insertAdjacentHTML('beforeend','<source src="tests/'+ title + '">');
	}
	selectSong(0);
}

//	Selettore di canzone:
//	Dato l'indice di canzone lo seleziona dalla struttura dati
//	popola le variabili con i dati richiesti e aggiorna le informazioni a schermo.
function selectSong(newTrack)
{
	trackId = newTrack;
	track = tracks[trackId];
	audio.src = ''+audioDir+'/'+track.title;	
	console.log
	audio.load();
	Fs = parseInt(track.Fs);
	color = track.pitch;
	trackLength = track.env.length / Fs;
	chCount = parseInt(track.Nch);
	FsFb = parseInt(track.FsFb);
	info();
}

}
