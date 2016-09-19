// Fix JSON: per lavorare senza server online e caricare i files JSON
	$.ajaxSetup({beforeSend: function(xhr){
		if (xhr.overrideMimeType)
			{
				xhr.overrideMimeType("application/json");
			}
		}
	});

	var loadJSON = "loader.json";
	var nTracks = 1; // dataJSON.length
	var Fs = 2048;
	var chCount = 20;
	var audioDir;
	var dirJSON = "json";
	var trackList;
	var tracksData = [];


//	Caricamento del file JSON con le informazioni dei files da caricare
//	
$.getJSON( dirJSON + '/'+loadJSON, function(json){ loadJSON = json.tracks; 
						/*console.log("success");*/})
						.done(function() {
							audioDir = loadJSON.dir;
							nTracks = loadJSON.nTracks;
							trackList = loadJSON.tracce;
							console.log('files: '+nTracks+' audioDir: '+audioDir );
							var probl = loadTrack(0);
							if (probl < 0) console.log('errore: '+probl);
						})
						.fail(function(){
							console.log("caricamento dei dati: fallito");
						});
						
//	Caricamento delle tracce in memoria: dai dati nel loader.json carico le canzoni
//	dalle corrispettive cartelle.

function loadTrack(index){
	if(index >= nTracks) {
		rappresentazioni(tracksData);
		return 0;
	}
	$.getJSON( dirJSON + '/'+trackList[index].title+'.json', function(json){ 
						tracksData.push(json.track);})
						.done(function() {
							console.log('traccia '+index+': '+ tracksData[index].title );
							return loadTrack(index+1);
						})
						.fail(function(){
							console.log('error loading track'+index);
							return -1;
						});			
}



