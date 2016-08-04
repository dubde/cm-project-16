			// Our Javascript will go here.
			var scene = new THREE.Scene();
			var nFrames = 200;
			var group = [];
			
			var renderer = new THREE.WebGLRenderer('glcanvas');
			
			var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
			renderer.setSize( window.innerWidth, window.innerHeight );
			document.body.appendChild( renderer.domElement );
			
		/*	window.addEventListener('resize', function() {
			var WIDTH = window.innerWidth,
				HEIGHT = window.innerHeight;
			renderer.setSize(WIDTH, HEIGHT);
			camera.aspect = WIDTH / HEIGHT;
			camera.updateProjectionMatrix();
			});
		*/
			//oggetti 3D 
			var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
			var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			var cube = new THREE.Mesh( geometry, material );
			
			for (i=0; i < nFrames; i+=1) {
					mesh = cube.clone();
					mesh.position.set((i-nFrames/2)/10,0,0);
					group[i] = mesh;
			scene.add( group[i]);
			}
			
			
			
/* Linee ma non viene bene..			
var material = new THREE.LineDashedMaterial({
	color: 0xffffff,
	dashSize: 1,
	gapSize: 0.5
});

var geometry = new THREE.Geometry();
geometry.vertices.push(
	new THREE.Vector3( 0, 5, 0 ),
	new THREE.Vector3( 0, -5, 0 )
);

var line = new THREE.Line( geometry, material );


for (i=0; i<20; i+=1){
	mesh = line.clone();
	mesh.position.set(i*0.1 - 1,0,0);
	
	group[i] = mesh;
	scene.add( group[i] );

}
*/
			
camera.position.z = 11;
			
var states = [];
	for(i=0; i < nFrames; i++)
	{ states[i] = 0;}
var k = 0;		
			
animate();


function animate(){

	requestAnimationFrame( animate );

	render();

}			

function render() {
	//cube.rotation.x += 0.1;
	//group.rotation.y += 0.1;
	// Generatore del movimento da seguire
	
	states[nFrames-1] = Math.sin(k*(180/Math.PI));
	
	//il movimento viene seguito dalle barre
	group[nFrames-1].scale.y += states[nFrames-1];
	for(i=0; i < nFrames-1; i++)
	{
		states[i] = states[i+1];
		group[i].scale.y += states[i];
	}
	k +=1;
	
	renderer.render( scene, camera );
}