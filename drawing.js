// Fix JSON
$.ajaxSetup({beforeSend: function(xhr){
  if (xhr.overrideMimeType)
  {
    xhr.overrideMimeType("application/json");
  }
}
});
	
/* Fix transport variabile
		var Francesco;
		$.getJSON( "envelope.json", function(json){ $( '#test').html('<p> b[1]:' + json.b[12] + '</p>'); 
												Francesco = json;
													$( '#test').append('<p> Fra.b[12]:' + Francesco.b[12] + '</p>');});
*/	
	var scene = new THREE.Scene();
	var nFrames = 200;
	var group = [];
	var myJson;
	$.getJSON( "envelope.json", function(json){ myJson = json; });
	//var obj = JSON.parse("envelope.json"); // anche col fix da syntax error del file json
	
	
	
	var CANVAS_WIDTH = 640;
	var CANVAS_HEIGHT = 480;
	
	var container = document.getElementById( 'canvas' );
	document.body.appendChild( container );
	
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT);
	container.appendChild( renderer.domElement );
	
/* div canvas */
	
	
	;
	
	var camera = new THREE.PerspectiveCamera( 48, CANVAS_WIDTH / CANVAS_HEIGHT, 0.1, 1000 );
	camera.position.z = 500;
	camera.lookAt( scene.position );
			
		/*	window.addEventListener('resize', function() {
			var WIDTH = window.innerWidth,
				HEIGHT = window.innerHeight;
			renderer.setSize(WIDTH, HEIGHT);
			camera.aspect = WIDTH / HEIGHT;
			camera.updateProjectionMatrix();
			});
		*/
			/*oggetti 3D  
			var geometry = new THREE.BoxGeometry( CANVAS_WIDTH / nFrames, 0.1, 0.1 );
			var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			var cube = new THREE.Mesh( geometry, material );
			
			for (i=0; i < nFrames; i+=1) {
					mesh = cube.clone();
					mesh.position.set(i*(CANVAS_WIDTH/nFrames) - (CANVAS_WIDTH/2)+1,0,0);
					group[i] = mesh;
			scene.add( group[i]);
			}
			*/
			
			
/* Linee ma non viene bello..		*/
var material = new THREE.LineDashedMaterial({
	color: 0xffffff,
	dashSize: 1,
	gapSize: 0.5
});

var geometry = new THREE.Geometry();
geometry.vertices.push(
	new THREE.Vector3( 0, 1, 0 ),
	new THREE.Vector3( 0, 0, 0 )
);

var line = new THREE.Line( geometry, material );


for (i=0; i < nFrames; i+=1) {
					mesh = line.clone();
					mesh.position.set((i-nFrames/2)/10,0,0);
					group[i] = mesh;
			scene.add( group[i]);
			}

			
			
var states = [];
	for(i=0; i < nFrames; i++)
	{ states[i] = 0;}
var k = 0;		

/* Start - Stop animation
			
 // Boolean for start and restart
 var initAnim = true;
 var runAnim = false;

 // Buttons startButton and resetButton
 var startButton = document.getElementById( 'startButtonId' );
 var resetButton = document.getElementById( 'resetButtonId' );

 // Start Button
  startButton.onclick = function StartAnimation() {

  if (initAnim) {
    initAnim = false;
    runAnim = true;
    theta = 0;
  }
  // Start and Pause 
  if (runAnim) {
    startButton.innerHTML = 'Pause';
    runAnim = false;
    render();
    } else {
          startButton.innerHTML = 'Restart';
          runAnim = true;
    }
  }

 // Reset Button
   resetButton.onclick = function ResetParameters() {

   // Set StartButton to Start  
   startButton.innerHTML = 'Start';

   // Boolean for Stop Animation
   initAnim = true;
   runAnim = false;

   }
*/
	
	
animate();



function animate(){
	//if(!isPlay) return;
	
	setTimeout( function(){
	
	requestAnimationFrame( animate );
	}, 1000 / 100);
	render();

}			

function render() {
	

	// Generatore del movimento da seguire
	
	//states[nFrames-1] = (CANVAS_HEIGHT*5) * Math.sin(k*(180/Math.PI));
	
	states[nFrames-1] = (CANVAS_HEIGHT/100)  * myJson.b[k];
	
	//il movimento viene seguito dalle barre
	//group[nFrames-1].position.y += states[nFrames-1];
	group[nFrames-1].scale.y =  states[nFrames-1];
	
	for(i=0; i < nFrames-1; i++)
	{
		states[i] = states[i+1];
		//group[i].position.y += states[i];
		group[i].scale.y = states[i];
	}
	k +=1;
	//if ( k > myJson.b.length) k = 0;
	
	$('#test').html('<p> evento: ' + myJson.b[k] + ' </p>');
	geometry.needsUpdate = true;
	
	renderer.render( scene, camera );
}