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

%% Estrazione delle Features

%% Sampling e infos
% ho bisogno di informazioni precise e legate anche all'esecuzione. DEVO
% ricampionare in quanto otterrei dei valori troppo precisi per la
% riproduzione grafica, diciamo che 2048 campioni al secondo mi basteranno.
Fs = 2048;
FsFb = 256;
% numero di canali del filterbank: default 10.
Nch = 20;
nFile = 0;

folders = [{'tests'}];
formats = [{'*.wav'},{'*.mp3'}];
%directory = 'audio';

for directory = folders
    cd(directory{1});
    for type = formats;
    files = dir(type{1});
%%      Inizio analisi per file
        for file = 1:length(files)
            nFile = nFile + 1;
% per fixare il caricamento di nomi di diversa lunghezza devo pre caricare
% tracks metti con 100 caratteri?
            %tracks(nFile) = zeros(256,1);
            %tracks(nFile,:) = sprintf('%s',files(file).name);
            tracks(nFile) = struct('title', files(file).name);
            temp_a = miraudio(files(file).name,'Normal','Label',0);

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
    
 % avere i dati a 44100 � troppo pesante come numero di campioni per il browser da gestire come
 % numero di campioni, quindi sottocampiono a 60.
            temp_env = mirenvelope(temp_a,'Sampling',Fs);
    
            temp_a = miraudio(temp_a,'Sampling',FsFb);
            temp_fb = mirfilterbank(temp_a,'NbChannels',Nch);
    
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
            env_norm = mirgetdata(temp_env);
            env_norm = round(env_norm/max(abs(env_norm)),4);

% uso scala logaritmica altrimenti son troppo piccoli
            clear('fb_norm');
            fb_anorm = mirgetdata(temp_fb);
            fb_norm(:,:) = fb_anorm(:,1,:);
            fb_max = max(max(abs(fb_norm)));
            fb_n = min(min(fb_norm))/fb_max;
            
            fb_norm(:) = round((round(fb_norm(:)./fb_max,4)-fb_n)/2,4);
           
            temp_s = struct('title', get(temp_a,'Label'),'Fs',Fs,'env',env_norm,'FsFb',FsFb,'Nch',Nch,'filterbank',fb_norm);
            %temp_name = sprintf('%s.json', tracks(nFile,:));
            temp_name = sprintf('%s.json', tracks(nFile).title);
            
            cd('../');
            cd('json');
            savejson('track',temp_s,temp_name);
            cd('../');
            cd(directory{1});
        end
    end
    cd('../');
end


cd('json');
temp_load = struct('dir',directory,'nTracks',nFile,'tracce',tracks);
savejson('tracks',temp_load,'loader.json');
cd('../');
disp('End of Analysis');