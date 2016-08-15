%% Project Computer Music 2016 
%  
%  Analisi delle features dei brani musicali ed esportazione in json delle
%  matrici cos� create. Estrazione delle Features attraverso Mirtoolbox,
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

%% Test - 1

cd('tests');
%cd('audio');

files = dir('*.wav');
%files = dir('*.mp3');

%% Sampling e infos
% ho bisogno di informazioni precise e legate anche all'esecuzione. DEVO
% ricampionare in quanto otterrei dei valori troppo precisi per la
% riproduzione grafica, diciamo che 100 campioni al secondo mi basteranno.
Fs = 200;

for file = 1:length(files)


     temp_a = miraudio(files(file).name,'Normal','Mono','Label',0,'Sampling',Fs);
    
%% Informazioni da Estrarre
% posso estrarre l'audiowave(miraudio), lo spettro (mirspectrum),
% autocorrelazione (mirautocor), mirpeaks per i picchi (PeakPos indice nei
% campioni dei picchi detettati), il valore di rms per scalare bene
% (mirrms), mironsets mi dice gli attacchi dei colpi magari da usare con i
% picchi per capire cassa/rullante effetti grafici. mirtempo(?),
% mirzerocross(?), mirrolloff mi dice la frequenza massima sotto la quale
% c'� il tot dell'energia, potrei usarla per discriminare eventi a
% frequenze oltre l'utile. mirpitch mi da la frequenza di base di fondo del
% pezzo.
    
    
    %temp_pitch = mirpitch(temp_a);
    %temp_rms = mirrms(temp_a);
    %temp_rolloff = mirrolloff(temp_a);
    %temp_time = mirtempo(temp_a);
    
 % avere i dati a 44100 � troppo pesante per il browser da gestire come
 % numero di campioni, quindi sottocampiono a 60.
    %temp_a = miraudio(temp_a,'Sampling',60);
    %temp_spec = mirspectrum(temp_a,'Min',20,'Max',18000);
    %temp_peaks = mirpeaks(temp_a);
    %temp_onset = mironsets(temp_a);
    
%% Get Data
% per ottenere i dati salvati negli oggetti mirtoolbox devo usare o
% mirgetdata che mi estrae direttamente tutto in un array o get che estrae
% i singoli elementi? Lo salvo in una struct temporanea.
% Title = mi dice cos'�
% Length = lunghezza in campioni?
% Name = il nome del file
% ave = mirgetdata();

% non mi servono tutti questi per il primo test, ogni test ha il suo JSON,
% struttura pi� leggera.

%% Normalization and Semplification
% vado a normalizzare i valori attorno a 1, arrotondarli alle prime 4 cifre
% significative.
awe_norm = mirgetdata(temp_a);
awe_norm = round(awe_norm/max(abs(awe_norm)),4);


%temp_s = struct('title', get(temp_a,'Label'),'awe', mirgetdata(temp_a),'spectrum', mirgetdata(temp_spec),'peaks', mirgetdata(temp_peaks),'rms', mirgetdata(temp_rms),'onsets', mirgetdata(temp_onset),'rolloff', mirgetdata(temp_rolloff),'tempo', mirgetdata(temp_time),'pitch', mirgetdata(temp_pitch));
temp_s = struct('title', get(temp_a,'Label'),'Fs',200,'awe',awe_norm);
tracks(file) = temp_s;
end
cd('../');
cd('json');

%% Esempio conversione Json
% A = [1 2; 3 4];
% savejson('A',A,'matriceA')

savejson('tracks',tracks,'1-tracks.json');

cd('../');

%% Test - 2

%% Test - 3

%% Test - 4

disp('End of Analysis');