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

% Se uso il segnaposto 'Folder' mi guarda tutti i file audio nella cartella
% corrente, ma dato che mi da problemi ( doubble to struct) ho implementato
% la mia ricerca all'interno della cartella. 


cd('tests');
%cd('audio');

files = dir('*.wav');
%files = dir('*.mp3');
for file = 1:length(files)
%% Sampling e infos
% ho bisogno di informazioni precise e legate anche all'esecuzione. DEVO
% ricampionare in quanto otterrei dei valori troppo precisi per la
% riproduzione grafica, diciamo che 100 campioni al secondo mi basteranno.
    
    temp_a = miraudio(files(file).name,'Center','Normal','Label',0);
    
%% Informazioni da Estrarre
% posso estrarre l'audiowave(miraudio), lo spettro (mirspectrum),
% autocorrelazione (mirautocor), mirpeaks per i picchi (PeakPos indice nei
% campioni dei picchi detettati), il valore di rms per scalare bene
% (mirrms), mironsets mi dice gli attacchi dei colpi magari da usare con i
% picchi per capire cassa/rullante effetti grafici. mirtempo(?),
% mirzerocross(?), mirrolloff mi dice la frequenza massima sotto la quale
% c'è il tot dell'energia, potrei usarla per discriminare eventi a
% frequenze oltre l'utile. mirpitch mi da la frequenza di base di fondo del
% pezzo.
    
    
    temp_pitch = mirpitch(temp_a);
    temp_rms = mirrms(temp_a);
    temp_rolloff = mirrolloff(temp_a);
    temp_time = mirtempo(temp_a);
    temp_a = miraudio(temp_a,'Sampling',200);
    temp_spec = mirspectrum(temp_a,'Min',20,'Max',18000);
    temp_peaks = mirpeaks(temp_a);
    temp_onset = mironsets(temp_a);
    
%% Get Data
% per ottenere i dati salvati negli oggetti mirtoolbox devo usare o
% mirgetdata che mi estrae direttamente tutto in un array o get che estrae
% i singoli elementi? Lo salvo in una struct temporanea.
% Title = mi dice cos'è
% Length = lunghezza in campioni?
% Name = il nome del file
% ave = mirgetdata();

temp_s = struct('title', get(temp_a,'Label'),'awe', mirgetdata(temp_a),'spectrum', mirgetdata(temp_spec),'peaks', mirgetdata(temp_peaks),'rms', mirgetdata(temp_rms),'onsets', mirgetdata(temp_onset),'rolloff', mirgetdata(temp_rolloff),'tempo', mirgetdata(temp_time),'pitch', mirgetdata(temp_pitch));

tracks(file) = temp_s;
end
cd('../');
cd('json');

%% Esempio conversione Json
% A = [1 2; 3 4];
% savejson('A',A,'matriceA')

savejson('tracks',tracks,'tracks.json');

cd('../');
disp('End of Analysis');