// Fix JSON: per lavorare senza server online e caricare i files JSON
	$.ajaxSetup({beforeSend: function(xhr){
		if (xhr.overrideMimeType)
			{
				xhr.overrideMimeType("application/json");
			}
		}
	});


//	Caricamento del file JSON di interesse
//	
	var loadJSON = "loader.json";
	var nTracks = 1; // dataJSON.length
	var Fs = 2048;
	var chCount = 20;
	var audioDir;
	var dirJSON = "json";
	var trackList;
	var tracksData = [];

$.getJSON( dirJSON + '/'+loadJSON, function(json){ loadJSON = json.tracks; 
						console.log("success");})
						.done(function() {
							audioDir = loadJSON.dir;
							nTracks = loadJSON.nTracks;
							trackList = loadJSON.tracce;
							console.log('files: '+nTracks+' audioDir: '+audioDir );
							var probl = loadTrack(0);
							if (probl < 0) console.log('error: '+probl);
						})
						.fail(function(){
							console.log("fallimento");
						});
						

/*
var request = new XMLHttpRequest();
request.overrideMimeType("applicatigon/json");
request.open("GET", "http://localhost/cm-project-16/" + fileJSON, true);
if( request.responseText == null) console.log("fail loading");
request.onreadystatechange = function () {
	console.log('rstate:'+request.readyState+' status:'+request.status);
	if ( request.readyState == 4 && request.status == "200")
	{
		dataJSON = JSON.parse(request.responseText);
		console.log("parsed: " + dataJSON.title);
		nTracks = dataJSON.length;
		console.log('file: '+ fileJSON +' tracce: ' + nTracks  + ' ');
		init();
	} 
};
request.send(null);*/
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



