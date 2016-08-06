%% Project Computer Music 2016 
%  
%  Analisi delle features dei brani musicali ed esportazione in json delle
%  matrici così create. Estrazione delle Features attraverso Mirtoolbox,
%  esportazione in json con JSONlab.
%  JSONlab mi permette di salvare una struttura matlab in un file json, che
%  siano array, celle, matrici o strutture vengono convertite in json.
%  Questo mi facilita molto dato che il metodo mirfeatures di MIRToolBox mi
%  crea una struttura con una serie di features estratte dal singolo file
%  audio, volendo una cartella intiera. 

clc
clear all
close all

% mirfeatures mi calcola tutte le features per singolo file audio. Il
% problema è la lunghezza di calcolo, ma dato che sono offline posso pure
% calcolare tutte quelle che voglio e usare solo quelle interessanti. Se
% uso il segnaposto 'Folder' mi guarda tutti i file audio nella cartella
% corrente, ma dato che mi da problemi ( doubble to struct) ho implementato
% la mia ricerca all'interno della cartella. Dato che non posso crearmi un
% array di struct (almeno secondo quanto ho capito, matlab mi da un errore
% double to struct conversion ma ho risolto con un workaround.

files = dir('*.wav');
for file = 1:length(files)
temp_s = mirfeatures(files(file).name);
songs(file) = temp_s;
end

% per estrarre i valori numerici devo usare mirgetdata
ave = mirgetdata( songs(1).
% una volta estratti in numerico posso convertirli in JSON

%% Esempio conversione Json
% A = [1 2; 3 4];
% savejson('A',A,'matriceA')

