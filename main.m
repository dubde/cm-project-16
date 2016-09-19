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

%% Estrazione delle Features

%% Sampling e infos
% ho bisogno di informazioni precise e legate anche all'esecuzione. DEVO
% ricampionare in quanto otterrei dei valori troppo precisi per la
% riproduzione grafica, diciamo che 2048 campioni al secondo mi basteranno.
Fs = 2048;
FsFb = 2048;
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
            tracks(nFile) = struct('title', files(file).name);
            
            temp_a = miraudio(files(file).name,'Normal','Label',0);

%% Informazioni da Estrarre
%   
% Estraggo pitch e tempo con la frequenza di campionamento più alta in modo
% da avere un risultato preciso.
            temp_pitch = mirpitch(temp_a,'Mono');
            temp_time = mirtempo(temp_a);
            
 % Per l'estrazione dei valori dell'envelope, picchi e filterbank, sotto
 % campiono il segnale in ingresso così da avere meno valori in uscita.
 % Questo per un problema di dimensioni dei file in uscita e gestione da
 % parte del browser.
 
            temp_env = mirenvelope(temp_a,'Sampling',Fs);
            temp_peaks = mirpeaks(temp_env,'NoBegin','NoEnd','Order','Amplitude','Total',20);
            temp_fb = mirfilterbank(temp_a,'NbChannels',Nch);
            temp_fbenv = mirenvelope(temp_fb,'Sampling',FsFb);
            
            
            
%% Get Data & Normalization
% per ottenere i dati salvati negli oggetti mirtoolbox devo usare
% mirgetdata.
% Vado a normalizzare i valori attorno a 1, arrotondarli alle prime 4 cifre
% significative. Potrei farlo anche da Javascript ma aggiungerebbe
% complessità allo script, meglio farlo offline.

% Envelope
            env_norm = mirgetdata(temp_env);
            env_norm = round(env_norm/max(abs(env_norm)),4);

% Filter Bank
            clear('fb_norm');
            fb_anorm = mirgetdata(temp_fbenv);
            fb_norm(:,:) = fb_anorm(:,1,:);
            for i = 1:Nch
                fb_max = max(fb_norm(:,i));
                fb_norm(:,i) = round(fb_norm(:,i)./fb_max,4);
            end
            
% Pitch          
% Normalizzo il pitch in un intervallo tra 0 e 255 così che sia comodo per
% andare a gestire i valori dei colori. Normalizzo in base 440hz
            pitch = mirgetdata(temp_pitch);
            pitch = mean(pitch); % se ho più pitch diversi ne ho uno medio
            while(pitch > 440) 
                pitch = pitch - 440;
            end
            pitch = round((pitch/440)*255);
            
% Tempo            
            tempo = mirgetdata(temp_time);
            
% Picchi
% Salvo solo i picchi con una certa intensità sul totale
            peaks = mirgetdata(temp_peaks);
            
% Salvo nella struttura dati tutto l'utile.
            temp_s = struct('title', get(temp_a,'Label'),'Folder',directory{1},'Fs',Fs,'FsFb',FsFb,'pitch',pitch,'tempo',tempo,'Nch',Nch,'peaks',peaks,'env',env_norm,'filterbank',fb_norm);
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

%% Loader 
% Ulteriore file che indirizza lo script verso i file json da caricare per
% le tracce.

cd('json');
temp_load = struct('dir',directory,'nTracks',nFile,'tracce',tracks);
savejson('tracks',temp_load,'loader.json');
cd('../');
disp('End of Analysis');