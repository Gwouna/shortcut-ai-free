// Mise à jour GitHub Pages : vérifie version.json puis recharge les fichiers publiés.
const APP_VERSION='8.1'; // identifiant technique de transition pour les anciennes installations
const DISPLAY_VERSION='1.8';
const VERSION_LABEL='V'+DISPLAY_VERSION;
const updateButton=document.getElementById('updateApp');
const versionLabel=document.getElementById('appVersion');
if(versionLabel) versionLabel.textContent='VERSION '+DISPLAY_VERSION;
function compareVersions(a,b){
  const aa=String(a).split('.').map(n=>parseInt(n,10)||0),bb=String(b).split('.').map(n=>parseInt(n,10)||0);
  for(let i=0;i<Math.max(aa.length,bb.length);i++){const d=(aa[i]||0)-(bb[i]||0);if(d)return d>0?1:-1;}return 0;
}
if(updateButton){
  updateButton.addEventListener('click',async()=>{
    updateButton.disabled=true;
    const label=updateButton.querySelector('span');
    if(label)label.textContent='Vérification…';
    try{
      const response=await fetch('./version.json?check='+Date.now(),{cache:'no-store'});
      if(!response.ok)throw new Error('version-file-unavailable');
      const data=await response.json();
      const latest=String(data.version||APP_VERSION);
      if(compareVersions(latest,APP_VERSION)>0){
        if(label)label.textContent='Installation…';
        const target=new URL(window.location.href);
        target.searchParams.set('v',latest);
        target.searchParams.set('refresh',String(Date.now()));
        window.location.replace(target.toString());
        return;
      }
      if(label)label.textContent='Déjà à jour';
      updateButton.classList.add('is-updated');
      setTimeout(()=>{if(label)label.textContent='Mettre à jour';updateButton.classList.remove('is-updated');updateButton.disabled=false;},2200);
    }catch(error){
      if(label)label.textContent='Réessayer';
      updateButton.title='Impossible de vérifier la mise à jour. Vérifie ta connexion puis réessaie.';
      setTimeout(()=>{if(label)label.textContent='Mettre à jour';updateButton.disabled=false;},2500);
    }
  });
}

const $=id=>document.getElementById(id);const fileInput=$('file'),video=$('video');let fileUrl=null,recorder=null,chunks=[],chosenCandidates=[],transcriptSegments=[];
function setStatus(s){$('status').textContent=s}
function duration(){return Number.isFinite(video.duration)?video.duration:0}
function update(){const d=duration();$('start').max=d;$('end').max=d;if(d){$('end').value=Math.min(Number($('end').value)||30,d);$('hint').textContent=`Durée de la vidéo : ${d.toFixed(1)} secondes.`}}
fileInput.addEventListener('change',()=>{const f=fileInput.files?.[0];if(!f)return;if(!f.type.startsWith('video/')){setStatus('Choisis un fichier vidéo.');return}if(fileUrl)URL.revokeObjectURL(fileUrl);fileUrl=URL.createObjectURL(f);transcriptSegments=[];video.src=fileUrl;$('videoWrap').classList.remove('hidden');$('fileName').textContent=f.name;['setStart','setEnd','auto','transcribe','preview','export','clipLength'].forEach(id=>{if($(id))$(id).disabled=false});$('download').classList.add('hidden');setStatus('Vidéo chargée sur ton appareil.');video.onloadedmetadata=()=>{update();$('end').value=Math.min(30,duration())}});
$('setStart').onclick=()=>{$('start').value=video.currentTime.toFixed(1)};$('setEnd').onclick=()=>{$('end').value=video.currentTime.toFixed(1)};
$('preview').onclick=()=>{const s=Number($('start').value),e=Number($('end').value);if(!valid(s,e))return;video.currentTime=s;video.play();const stop=()=>{if(video.currentTime>=e){video.pause();video.removeEventListener('timeupdate',stop)}};video.addEventListener('timeupdate',stop)};
function valid(s,e){if(s<0||e<=s||e>duration()){setStatus('Vérifie le début et la fin du clip.');return false}if(e-s>90){setStatus('Pour cette version gratuite, limite le clip à 90 secondes.');return false}return true}
function percentile(values,p){
  const a=[...values].sort((x,y)=>x-y);if(!a.length)return 0;
  return a[Math.min(a.length-1,Math.max(0,Math.floor((a.length-1)*p)))];
}
function normalizeFeature(samples,key){
  const values=samples.map(x=>x[key]),lo=percentile(values,.1),hi=percentile(values,.9),range=Math.max(.0001,hi-lo);
  samples.forEach(x=>x[key+'N']=Math.max(0,Math.min(1,(x[key]-lo)/range)));
}
function makeReasons(item){
  const reasons=[];
  if(item.speech>.58)reasons.push('paroles à fort potentiel');
  if(item.motion>.55)reasons.push('mouvements soutenus');
  if(item.audio>.55)reasons.push('intensité audio élevée');
  if(item.cuts>.45)reasons.push('changements de plans');
  if(item.detail>.55)reasons.push('images riches en détails');
  if(!reasons.length)reasons.push('activité visuelle régulière');
  return reasons.slice(0,2).join(' · ');
}
// Score linguistique indicatif : il repère des signaux dans la transcription, sans prétendre comprendre le contexte comme un humain.
function scoreTranscriptWindow(start,end){
  const parts=transcriptSegments.filter(x=>x.end>=start&&x.start<=end&&x.text);
  if(!parts.length)return {score:0,text:'',available:false};
  const cues=/\b(incroyable|impossible|jamais|énorme|dingue|attends|regarde|pourquoi|comment|bravo|attention|incroyablement|surprise|surprenant|fou|folie|gagné|perdu|record|but|goal|wow|amazing|unbelievable|wait|look|why|how|never|crazy|insane|no way|let's go|oh my god|omg|winner|fail|win|lose|secret|best|worst)\b/giu;
  let total=0,weight=0;const texts=[];
  for(const part of parts){
    const text=part.text.trim();if(!text)continue;texts.push(text);
    const words=text.match(/[\p{L}\p{N}']+/gu)||[];if(!words.length)continue;
    const cueCount=(text.match(cues)||[]).length;
    const punctuation=(/[!?]{1,}/.test(text)?0.18:0)+(/[.!?]$/.test(text)?0.08:0);
    const reaction=/(\b(je|j'ai|on|nous|i|we)\b)/iu.test(text)?0.08:0;
    const density=Math.min(1,words.length/18);
    const score=Math.min(1,0.18+density*.22+Math.min(.42,cueCount*.14)+punctuation+reaction);
    const w=Math.max(1,words.length);total+=score*w;weight+=w;
  }
  return {score:weight?total/weight:0,text:texts.join(' ').slice(0,260),available:weight>0};
}
async function getAudioEnergy(){
  const file=fileInput.files?.[0];if(!file)return [];
  try{
    const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return [];
    const ac=new AudioCtx();const buffer=await ac.decodeAudioData(await file.arrayBuffer());
    const channelCount=buffer.numberOfChannels,sr=buffer.sampleRate,hop=Math.max(1,Math.floor(sr*.5)),out=[];
    const channels=Array.from({length:channelCount},(_,i)=>buffer.getChannelData(i));
    for(let start=0;start<buffer.length;start+=hop){let sum=0,count=0;const end=Math.min(buffer.length,start+hop);
      for(let i=start;i<end;i+=4){let sample=0;for(const ch of channels)sample+=ch[i]/channelCount;sum+=sample*sample;count++;}
      out.push({time:start/sr,rms:Math.sqrt(sum/Math.max(1,count))});
    }
    await ac.close();const vals=out.map(x=>x.rms),lo=percentile(vals,.15),hi=Math.max(lo+.00001,percentile(vals,.95));
    out.forEach(x=>x.score=Math.max(0,Math.min(1,(x.rms-lo)/(hi-lo))));return out;
  }catch(e){return []}
}
function getAudioWindowScore(audio,start,end){const values=audio.filter(x=>x.time>=start&&x.time<end).map(x=>x.score);if(!values.length)return 0;return Math.min(1,values.reduce((a,b)=>a+b,0)/values.length*.65+Math.max(...values)*.35)}
function detectSceneChanges(samples){
  const peaks=[];
  for(let i=1;i<samples.length-1;i++){
    const value=samples[i].cutN||0,prev=samples[i-1].cutN||0,next=samples[i+1].cutN||0;
    if(value>=.76&&value>=prev&&value>=next&&(peaks.length===0||samples[i].time-peaks[peaks.length-1]>=1.5))peaks.push(samples[i].time);
  }
  return peaks;
}
async function analyzeHighlights(){
  const d=duration();
  if(!d){setStatus('La durée de la vidéo est indisponible.');return}
  const button=$('auto');button.disabled=true;$('candidates').classList.add('hidden');$('candidates').innerHTML='';
  setStatus(`${VERSION_LABEL} : analyse des images, du son et des paroles disponibles…`);
  const audioEnergy=await getAudioEnergy();
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});canvas.width=72;canvas.height=40;
  const step=Math.max(.65,Math.min(1.25,d/180)),times=[];for(let t=0;t<d;t+=step)times.push(t);
  if(!times.length)times.push(0);
  const samples=[];let previous=null;const oldTime=video.currentTime;video.pause();
  const seek=t=>new Promise((resolve,reject)=>{let done=false;const finish=()=>{if(done)return;done=true;video.removeEventListener('seeked',finish);resolve()};video.addEventListener('seeked',finish,{once:true});video.currentTime=Math.min(t,Math.max(0,d-.05));setTimeout(()=>{if(!done){done=true;video.removeEventListener('seeked',finish);reject(new Error('seek-timeout'))}},6000)});
  try{
    for(let i=0;i<times.length;i++){
      await seek(times[i]);ctx.drawImage(video,0,0,72,40);const data=ctx.getImageData(0,0,72,40).data;
      let lum=0,lum2=0,edges=0,motion=0,px=0,edgeCount=0;
      const lums=new Float32Array(72*40);
      for(let p=0,k=0;p<data.length;p+=4,k++){
        const y=.2126*data[p]+.7152*data[p+1]+.0722*data[p+2];lums[k]=y;lum+=y;lum2+=y*y;
        if(previous){motion+=Math.abs(y-previous[k]);px++}
        if(k%72!==0){edges+=Math.abs(y-lums[k-1]);edgeCount++}
        if(k>=72){edges+=Math.abs(y-lums[k-72]);edgeCount++}
      }
      const count=lums.length,mean=lum/count,variance=Math.max(0,lum2/count-mean*mean);
      const motionScore=px?motion/(px*255):0;
      const edgeScore=edgeCount?edges/(edgeCount*255):0;
      const brightness=mean/255,contrast=Math.sqrt(variance)/128;
      const cutScore=previous?Math.min(1,motionScore*3.2):0;
      const exposure=Math.max(0,1-Math.abs(brightness-.48)/.52);
      samples.push({time:times[i],motion:motionScore,cut:cutScore,detail:Math.min(1,edgeScore*3.4+contrast*.25),exposure});
      previous=lums;
      if(i%5===0||i===times.length-1)setStatus(`${VERSION_LABEL} : analyse des images… ${Math.round((i+1)/times.length*100)} %`);
    }
    ['motion','cut','detail'].forEach(k=>normalizeFeature(samples,k));
    const sceneChanges=detectSceneChanges(samples);
    const requested=Number($('clipLength')?.value)||30;
    const clipLength=Math.min(requested,d),stride=Math.max(1,clipLength/5),windows=[];
    const starts=[];for(let s=0;s+clipLength<=d+.01;s+=stride)starts.push(s);
    if(d>clipLength&&(!starts.length||d-clipLength-starts[starts.length-1]>.5))starts.push(d-clipLength);
    if(!starts.length)starts.push(0);
    for(const start of starts){
      const end=Math.min(d,start+clipLength),v=samples.filter(x=>x.time>=start&&x.time<end);
      if(!v.length)continue;
      const avg=k=>v.reduce((sum,x)=>sum+x[k],0)/v.length;
      const peak=k=>Math.max(...v.map(x=>x[k]));
      const motion=avg('motionN'),cuts=avg('cutN'),detail=avg('detailN'),exposure=avg('exposure');
      const dynamic=Math.min(1,motion*.36+cuts*.34+detail*.30);
      const peakMoment=Math.max(peak('cutN'),peak('motionN'));
      const audioScore=getAudioWindowScore(audioEnergy,start,end);
      const speechData=scoreTranscriptWindow(start,end);
      const speechScore=speechData.score;
      const profile=$('contentProfile')?.value||'balanced';
      let visualWeight=.68,audioWeight=.32;
      if(profile==='reaction'){visualWeight=.48;audioWeight=.52}
      if(profile==='speech'){visualWeight=.38;audioWeight=.62}
      if(profile==='action'){visualWeight=.68;audioWeight=.32}
      if(profile==='story'){visualWeight=.82;audioWeight=.18}
      const visualScore=(dynamic*.78+peakMoment*.14+exposure*.08);
      const baseScore=audioEnergy.length?visualScore*visualWeight+audioScore*audioWeight:visualScore;
      const speechWeight=speechData.available?(profile==='speech'?.40:profile==='reaction'?.34:.28):0;
      const combined=baseScore*(1-speechWeight)+speechScore*speechWeight;
      const score=Math.max(0,Math.min(100,combined*100));
      const sceneCount=sceneChanges.filter(t=>t>=start&&t<=end).length;
      windows.push({start,end,score,motion,cuts,detail,exposure,audio:audioScore,speech:speechScore,transcript:speechData.text,sceneCount});
    }
    windows.sort((a,b)=>b.score-a.score);const chosen=[];
    for(const item of windows){
      if(chosen.every(x=>Math.abs(x.start-item.start)>=clipLength*.72))chosen.push(item);
      if(chosen.length===5)break;
    }
    if(!chosen.length){setStatus('Vidéo trop courte ou analyse impossible. Choisis les temps manuellement.');return}
    chosenCandidates=chosen;
    $('exportAll').disabled=false;
    $('batchResults').classList.add('hidden');$('batchResults').innerHTML='';
    const box=$('candidates');
    const intro=document.createElement('p');intro.className='hint';intro.textContent=transcriptSegments.length?`${VERSION_LABEL} : indices visuels, audio et linguistiques issus de la transcription Whisper. Les indices de langage aident au tri, mais ne garantissent pas qu’un passage soit drôle ou viral.`:audioEnergy.length?`${VERSION_LABEL} : activité visuelle + intensité audio. Pour ajouter les indices liés aux paroles, lance d’abord la transcription Whisper puis relance l’analyse.`:`${VERSION_LABEL} : activité visuelle. Analyse audio indisponible sur ce navigateur.`;box.append(intro);
    const sceneNote=document.createElement('p');sceneNote.className='scene-summary';sceneNote.textContent=`${sceneChanges.length} changement(s) de scène détecté(s) · les coupures sont estimées à partir des différences entre images.`;box.append(sceneNote);
    chosen.forEach((item,index)=>{
      const el=document.createElement('div');el.className='candidate';
      const info=document.createElement('div');info.className='candidate-info';
      const title=document.createElement('strong');title.textContent=`${index+1}. ${index===0?'Meilleur score visuel':'Passage proposé'}`;
      const detail=document.createElement('small');detail.textContent=`${item.start.toFixed(1)} s → ${item.end.toFixed(1)} s · ${Math.round(item.score)}/100 · ${makeReasons(item)}${item.transcript?' · transcription prise en compte':''} · ${item.sceneCount} changement(s) de scène`;
      const meter=document.createElement('div');meter.className='score-track';const fill=document.createElement('span');fill.style.width=`${item.score}%`;meter.append(fill);
      info.append(title,detail,meter);
      const apply=document.createElement('button');apply.className='btn secondary';apply.textContent='Choisir';
      apply.onclick=()=>{$('start').value=item.start.toFixed(1);$('end').value=item.end.toFixed(1);video.currentTime=item.start;setStatus(`Passage ${index+1} sélectionné. Prévisualise-le puis exporte ton Short.`);$('candidates').querySelectorAll('.candidate').forEach(x=>x.classList.remove('selected'));el.classList.add('selected')};
      el.append(info,apply);box.append(el);
    });
    box.classList.remove('hidden');const first=chosen[0];$('start').value=first.start.toFixed(1);$('end').value=first.end.toFixed(1);
    setStatus(`${chosen.length} moments classés. Vérifie le passage avant l’export.`);
  }catch(error){setStatus('L’analyse a rencontré un problème sur ce navigateur. Tu peux toujours découper la vidéo manuellement.');}
  finally{try{await seek(oldTime)}catch{}button.disabled=false}
}
async function transcribeVideo(){
  const file=fileInput.files?.[0];if(!file){setStatus('Importe une vidéo avant de lancer la transcription.');return}
  const btn=$('transcribe');btn.disabled=true;btn.textContent='Chargement du modèle…';
  const results=$('transcriptResults');results.classList.remove('hidden');results.innerHTML='<p class="hint">Préparation du modèle Whisper. Au premier lancement, le téléchargement peut prendre quelques minutes.</p>';
  try{
    const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
    env.allowLocalModels=false;env.useBrowserCache=true;
    const transcriber=await pipeline('automatic-speech-recognition','Xenova/whisper-tiny',{progress_callback:p=>{if(p.status==='progress'&&p.total)btn.textContent=`Modèle ${Math.round(p.progress||0)} %`;}});
    const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)throw new Error('Audio non pris en charge');
    const ac=new AudioCtx();const decoded=await ac.decodeAudioData(await file.arrayBuffer());
    if(decoded.duration>900)throw new Error('Pour préserver la mémoire du téléphone, limite la transcription à 15 minutes par vidéo.');
    const targetRate=16000,total=Math.ceil(decoded.duration*targetRate),mono=new Float32Array(total);
    for(let i=0;i<total;i++){
      const sourceIndex=i*decoded.sampleRate/targetRate,lo=Math.floor(sourceIndex),hi=Math.min(decoded.length-1,lo+1),frac=sourceIndex-lo;let sample=0;
      for(let c=0;c<decoded.numberOfChannels;c++){const ch=decoded.getChannelData(c);sample+=(ch[lo]*(1-frac)+ch[hi]*frac)/decoded.numberOfChannels;}mono[i]=sample;
    }
    await ac.close();const chunks=[];const chunkSize=30*targetRate;
    for(let offset=0;offset<mono.length;offset+=chunkSize){
      btn.textContent=`Transcription ${Math.min(100,Math.round(offset/mono.length*100))} %`;
      const part=mono.slice(offset,Math.min(mono.length,offset+chunkSize));
      const out=await transcriber(part,{sampling_rate:targetRate,return_timestamps:true});
      if(out.chunks?.length){for(const c of out.chunks){const ts=c.timestamp||[0,0];chunks.push({start:offset/targetRate+(ts[0]||0),end:offset/targetRate+(ts[1]||ts[0]||0),text:(c.text||'').trim()});}}
      else if(out.text)chunks.push({start:offset/targetRate,end:Math.min(decoded.duration,(offset+part.length)/targetRate),text:out.text.trim()});
    }
    const useful=chunks.filter(x=>x.text);transcriptSegments=useful;results.innerHTML='';
    const heading=document.createElement('strong');heading.textContent=`Transcription terminée · ${useful.length} segments`;results.append(heading);
    if(!useful.length){const p=document.createElement('p');p.textContent='Aucune parole détectée. Essaie avec une vidéo où les voix sont audibles.';results.append(p)}
    useful.forEach(seg=>{const row=document.createElement('div');row.className='transcript-row';const txt=document.createElement('span');txt.textContent=`${formatTime(seg.start)} · ${seg.text}`;const use=document.createElement('button');use.className='btn secondary';use.textContent='Créer un clip';use.onclick=()=>{const len=Number($('clipLength').value)||30;const start=Math.max(0,seg.start-len*.35),end=Math.min(duration(),start+len);$('start').value=start.toFixed(1);$('end').value=end.toFixed(1);video.currentTime=start;setStatus('Moment vocal sélectionné. Prévisualise puis exporte ton clip.');};row.append(txt,use);results.append(row)});
    setStatus(`Transcription locale terminée. Relance « Analyser » pour intégrer les paroles au classement V${DISPLAY_VERSION}.`);
  }catch(err){results.innerHTML='';const p=document.createElement('p');p.textContent=err.message||'La transcription IA n’a pas pu démarrer sur ce navigateur. Essaie sur un ordinateur ou un navigateur récent.';results.append(p);setStatus('Transcription indisponible. L’analyse visuelle et audio reste utilisable.');}
  finally{btn.disabled=false;btn.textContent='Transcrire avec l’IA'}
}
function formatTime(seconds){const s=Math.max(0,Math.floor(seconds||0));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
$('transcribe').onclick=transcribeVideo;
$('auto').onclick=analyzeHighlights;
async function renderClip(s,e,onProgress){
  if(!valid(s,e))throw new Error('Plage de clip invalide.');
  if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)throw new Error('Export vidéo non pris en charge par ce navigateur. Essaie Chrome ou Safari à jour.');
  const canvas=document.createElement('canvas');canvas.width=720;canvas.height=1280;
  const ctx=canvas.getContext('2d');const stream=canvas.captureStream(30);
  const trackingCanvas=document.createElement('canvas');trackingCanvas.width=160;trackingCanvas.height=90;
  const trackingCtx=trackingCanvas.getContext('2d',{willReadFrequently:true});
  let previousTrackFrame=null,trackedCenter=.5;
  let sourceStream=null;
  try{sourceStream=video.captureStream?video.captureStream():video.mozCaptureStream?.()}catch{}
  if(sourceStream){for(const track of sourceStream.getAudioTracks())stream.addTrack(track)}
  const mime=['video/mp4;codecs="avc1.42E01E"','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));
  if(!mime)throw new Error('Aucun format vidéo compatible avec cet appareil.');
  const parts=[];let rec;
  try{rec=new MediaRecorder(stream,{mimeType:mime})}catch(e){stream.getTracks().forEach(t=>t.stop());throw new Error('Impossible de démarrer l’export sur ce navigateur.')}
  const seekTo=()=>new Promise((resolve,reject)=>{
    if(Math.abs(video.currentTime-s)<.05){resolve();return}
    const timer=setTimeout(()=>{video.removeEventListener('seeked',done);reject(new Error('La vidéo ne répond pas au déplacement temporel.'))},8000);
    function done(){clearTimeout(timer);resolve()}
    video.addEventListener('seeked',done,{once:true});video.currentTime=s;
  });
  await seekTo();video.pause();
  const draw=()=>{
    const vw=video.videoWidth,vh=video.videoHeight;if(!vw||!vh)return;
    const target=9/16,ratio=vw/vh;let sw,sh,sx,sy;
    if(ratio>target){
      sh=vh;sw=vh*target;
      // Suivi de mouvement léger : le centre du recadrage suit la zone où l'image change.
      // Ce n'est pas une détection de personne ; le cadrage reste centré si le mouvement est faible.
      trackingCtx.drawImage(video,0,0,160,90);
      const frame=trackingCtx.getImageData(0,0,160,90).data;
      if(previousTrackFrame){
        const bins=new Float64Array(16);let total=0;
        for(let y=2;y<88;y+=2)for(let x=2;x<158;x+=2){
          const k=(y*160+x)*4,old=k;
          const lum=.2126*frame[k]+.7152*frame[k+1]+.0722*frame[k+2];
          const prev=.2126*previousTrackFrame[old]+.7152*previousTrackFrame[old+1]+.0722*previousTrackFrame[old+2];
          const delta=Math.max(0,Math.abs(lum-prev)-16);
          if(delta>0){const weight=delta;bins[Math.min(15,Math.floor(x/10))]+=weight;total+=weight;}
        }
        if(total>900){let weighted=0;for(let i=0;i<16;i++)weighted+=bins[i]*(i*10+5);const detected=weighted/total/160;trackedCenter=trackedCenter*.78+detected*.22;}
      }
      previousTrackFrame=new Uint8ClampedArray(frame);
      const maxCenter=1-(sw/vw)/2,minCenter=(sw/vw)/2;
      const center=Math.max(minCenter,Math.min(maxCenter,trackedCenter));
      sx=center*vw-sw/2;sy=0;
    }else{sw=vw;sh=vw/target;sx=0;sy=(vh-sh)/2}
    ctx.fillStyle='#000';ctx.fillRect(0,0,720,1280);ctx.drawImage(video,sx,sy,sw,sh,0,0,720,1280);
  };
  return await new Promise(async(resolve,reject)=>{
    let raf=0,stopped=false;
    const finish=(err)=>{
      if(stopped)return;stopped=true;cancelAnimationFrame(raf);video.pause();
      if(rec.state!=='inactive')rec.stop();
      if(err){stream.getTracks().forEach(t=>t.stop());reject(err)}
    };
    rec.ondataavailable=ev=>{if(ev.data?.size)parts.push(ev.data)};
    rec.onerror=()=>finish(new Error('Erreur pendant la création du clip.'));
    rec.onstop=()=>{
      stream.getTracks().forEach(t=>t.stop());
      if(!parts.length){reject(new Error('Le clip généré est vide.'));return}
      resolve({blob:new Blob(parts,{type:mime}),extension:mime.includes('mp4')?'mp4':'webm'});
    };
    const frame=()=>{
      draw();const progress=Math.min(100,Math.round((video.currentTime-s)/(e-s)*100));if(onProgress)onProgress(progress);
      if(video.currentTime>=e||video.ended){finish();return}
      raf=requestAnimationFrame(frame);
    };
    rec.start(400);
    try{await video.play();frame()}catch(err){finish(new Error('Impossible de lire la vidéo pour créer le clip.'))}
  });
}
$('export').onclick=async()=>{
  const s=Number($('start').value),e=Number($('end').value);if(!valid(s,e))return;
  $('export').disabled=true;
  try{
    setStatus('Création du clip vertical… garde cette page ouverte.');
    const result=await renderClip(s,e,p=>setStatus(`Export du clip… ${p}%`));
    const url=URL.createObjectURL(result.blob);const a=$('download');
    a.href=url;a.download=`shortcut-ai-clip.${result.extension}`;a.textContent='↓ Télécharger mon clip';a.classList.remove('hidden');
    setStatus('Clip terminé ! Tu peux le télécharger.');
  }catch(err){setStatus(err.message||'L’export a échoué.')}
  finally{$('export').disabled=false}
};
$('exportAll').onclick=async()=>{
  if(!chosenCandidates.length){setStatus('Lance d’abord l’analyse pour trouver les meilleurs moments.');return}
  const btn=$('exportAll'),out=$('batchResults');btn.disabled=true;
  out.classList.remove('hidden');out.innerHTML='';
  const heading=document.createElement('strong');heading.textContent=`Création de ${chosenCandidates.length} clips verticaux…`;out.append(heading);
  const list=document.createElement('div');list.className='batch-list';out.append(list);
  const results=[];
  try{
    for(let i=0;i<chosenCandidates.length;i++){
      const item=chosenCandidates[i];setStatus(`Création du Short ${i+1}/${chosenCandidates.length}…`);
      const result=await renderClip(item.start,item.end,p=>{heading.textContent=`Création du Short ${i+1}/${chosenCandidates.length} · ${p}%`});
      const url=URL.createObjectURL(result.blob);results.push(url);
      const row=document.createElement('div');row.className='batch-item';
      const label=document.createElement('span');label.textContent=`Short ${i+1} · ${item.start.toFixed(1)}–${item.end.toFixed(1)} s`;
      const link=document.createElement('a');link.href=url;link.download=`shortcut-ai-short-${i+1}.${result.extension}`;link.textContent='Télécharger';
      row.append(label,link);list.append(row);
    }
    heading.textContent=`${results.length} Shorts créés !`;
    setStatus(`${results.length} clips sont prêts. Télécharge-les un par un ci-dessous.`);
  }catch(err){heading.textContent='Création interrompue';setStatus(err.message||'La création automatique a échoué. Les clips déjà créés restent téléchargeables.')}
  finally{btn.disabled=false}
};

// YouTube: official embedded player only; no downloading or extraction.
let ytPlayer=null, ytReady=false, ytVideoId=null;
const ytStatus=$('ytStatus');
function ytMessage(message){ytStatus.textContent=message}
function parseYouTubeId(raw){
  try{
    const u=new URL(raw.trim());
    if(u.hostname==='youtu.be') return u.pathname.slice(1).split('/')[0]||null;
    if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com'].includes(u.hostname)){
      if(u.pathname==='/watch') return u.searchParams.get('v');
      const m=u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/);
      return m?m[1]:null;
    }
  }catch{}
  return null;
}
function enableYtControls(enabled){
  ['ytSetStart','ytSetEnd','ytSeekStart','ytSeekEnd','ytTransfer'].forEach(id=>$(id).disabled=!enabled);
}
window.onYouTubeIframeAPIReady=()=>{
  ytReady=true;
  if(ytVideoId) createYtPlayer(ytVideoId);
};
function createYtPlayer(id){
  $('youtubeWrap').classList.remove('hidden');
  if(ytPlayer && ytPlayer.destroy) ytPlayer.destroy();
  ytPlayer=new YT.Player('youtubePlayer',{
    width:'100%',height:'100%',videoId:id,
    playerVars:{playsinline:1,rel:0},
    events:{
      onReady:()=>{enableYtControls(true);ytMessage('Vidéo YouTube chargée. Lance-la et repère les passages à conserver.')},
      onError:e=>{enableYtControls(false);ytMessage('Lecture impossible (code '+e.data+'). La vidéo peut interdire l’intégration ou être indisponible.')}
    }
  });
}
$('loadYoutube').onclick=()=>{
  const id=parseYouTubeId($('youtubeUrl').value);
  if(!id){ytMessage('Lien non reconnu. Colle un lien YouTube classique, youtu.be, Shorts ou Live.');return}
  ytVideoId=id;enableYtControls(false);
  if(ytReady) createYtPlayer(id);
  else ytMessage('Chargement du lecteur YouTube…');
};
function ytCurrentTime(){return ytPlayer&&ytPlayer.getCurrentTime?ytPlayer.getCurrentTime():0}
$('ytSetStart').onclick=()=>{$('ytStart').value=Math.floor(ytCurrentTime());ytMessage('Début YouTube enregistré.')};
$('ytSetEnd').onclick=()=>{$('ytEnd').value=Math.floor(ytCurrentTime());ytMessage('Fin YouTube enregistrée.')};
$('ytSeekStart').onclick=()=>{const t=Math.max(0,Number($('ytStart').value)||0);ytPlayer.seekTo(t,true);ytPlayer.playVideo()};
$('ytSeekEnd').onclick=()=>{const t=Math.max(0,Number($('ytEnd').value)||0);ytPlayer.seekTo(t,true);ytPlayer.playVideo()};
$('ytTransfer').onclick=()=>{
  const s=Number($('ytStart').value),e=Number($('ytEnd').value);
  if(!Number.isFinite(s)||!Number.isFinite(e)||s<0||e<=s){ytMessage('Vérifie les temps : la fin doit être après le début.');return}
  $('start').value=s;$('end').value=e;
  ytMessage('Temps reportés dans le découpage. Importe maintenant le fichier original pour prévisualiser et exporter ce passage.');
  $('file').scrollIntoView({behavior:'smooth',block:'center'});
};
const ytApi=document.createElement('script');
ytApi.src='https://www.youtube.com/iframe_api';
document.head.appendChild(ytApi);
