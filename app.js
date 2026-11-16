const $=id=>document.getElementById(id);const fileInput=$('file'),video=$('video');let fileUrl=null,recorder=null,chunks=[];
function setStatus(s){$('status').textContent=s}
function duration(){return Number.isFinite(video.duration)?video.duration:0}
function update(){const d=duration();$('start').max=d;$('end').max=d;if(d){$('end').value=Math.min(Number($('end').value)||30,d);$('hint').textContent=`Durée de la vidéo : ${d.toFixed(1)} secondes.`}}
fileInput.addEventListener('change',()=>{const f=fileInput.files?.[0];if(!f)return;if(!f.type.startsWith('video/')){setStatus('Choisis un fichier vidéo.');return}if(fileUrl)URL.revokeObjectURL(fileUrl);fileUrl=URL.createObjectURL(f);video.src=fileUrl;$('videoWrap').classList.remove('hidden');$('fileName').textContent=f.name;['setStart','setEnd','auto','preview','export'].forEach(id=>$(id).disabled=false);$('download').classList.add('hidden');setStatus('Vidéo chargée sur ton appareil.');video.onloadedmetadata=()=>{update();$('end').value=Math.min(30,duration())}});
$('setStart').onclick=()=>{$('start').value=video.currentTime.toFixed(1)};$('setEnd').onclick=()=>{$('end').value=video.currentTime.toFixed(1)};
$('preview').onclick=()=>{const s=Number($('start').value),e=Number($('end').value);if(!valid(s,e))return;video.currentTime=s;video.play();const stop=()=>{if(video.currentTime>=e){video.pause();video.removeEventListener('timeupdate',stop)}};video.addEventListener('timeupdate',stop)};
function valid(s,e){if(s<0||e<=s||e>duration()){setStatus('Vérifie le début et la fin du clip.');return false}if(e-s>90){setStatus('Pour cette version gratuite, limite le clip à 90 secondes.');return false}return true}
async function analyzeHighlights(){
  const d=duration();
  if(!d){setStatus('La durée de la vidéo est indisponible.');return}
  const button=$('auto');button.disabled=true;$('candidates').classList.add('hidden');$('candidates').innerHTML='';
  setStatus('Analyse des images en cours…');
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});canvas.width=64;canvas.height=36;
  const step=Math.max(.75,d/150),times=[];for(let t=0;t<d;t+=step)times.push(t);
  const samples=[];let previous=null;const oldTime=video.currentTime;video.pause();
  const seek=t=>new Promise((resolve,reject)=>{let done=false;const finish=()=>{if(done)return;done=true;video.removeEventListener('seeked',finish);resolve()};video.addEventListener('seeked',finish,{once:true});video.currentTime=Math.min(t,Math.max(0,d-.05));setTimeout(()=>{if(!done){done=true;video.removeEventListener('seeked',finish);reject(new Error('seek-timeout'))}},5000)});
  try{
    for(let i=0;i<times.length;i++){
      await seek(times[i]);ctx.drawImage(video,0,0,64,36);const data=ctx.getImageData(0,0,64,36).data;let score=0;
      if(previous){let count=0;for(let j=0;j<data.length;j+=12){score+=Math.abs(data[j]-previous[j])+Math.abs(data[j+1]-previous[j+1])+Math.abs(data[j+2]-previous[j+2]);count+=3}score/=Math.max(1,count*3*255)}
      previous=data;samples.push({time:times[i],score});
      if(i%8===0)setStatus(`Analyse locale… ${Math.round((i+1)/times.length*100)} %`);
    }
    const clipLength=Math.min(30,Math.max(12,d));const stride=Math.max(2,clipLength/5);const windows=[];
    for(let start=0;start+clipLength<=d+.01;start+=stride){const values=samples.filter(x=>x.time>=start&&x.time<start+clipLength).map(x=>x.score);if(!values.length)continue;const avg=values.reduce((a,b)=>a+b,0)/values.length;const peak=Math.max(...values);windows.push({start,end:Math.min(d,start+clipLength),score:avg*.7+peak*.3})}
    windows.sort((a,b)=>b.score-a.score);const chosen=[];
    for(const item of windows){if(chosen.every(x=>Math.abs(x.start-item.start)>=clipLength*.7)){chosen.push(item);if(chosen.length===5)break}}
    chosen.sort((a,b)=>a.start-b.start);
    if(!chosen.length){setStatus('Vidéo trop courte ou analyse impossible. Choisis les temps manuellement.');return}
    const box=$('candidates');box.innerHTML='<p class="hint">Les séquences sont classées selon leur activité visuelle. Choisis celles qui t’intéressent : elles ne sont pas encore évaluées par compréhension du contenu.</p>';
    chosen.forEach((item,index)=>{const el=document.createElement('div');el.className='candidate';const info=document.createElement('div');const title=document.createElement('strong');title.textContent=`Séquence ${index+1}${index===0?' · activité la plus élevée':''}`;const detail=document.createElement('small');detail.textContent=`${item.start.toFixed(1)} s → ${item.end.toFixed(1)} s · ${Math.round(item.score*100)} points d’activité`;info.append(title,detail);const apply=document.createElement('button');apply.className='btn secondary';apply.textContent='Utiliser ce passage';apply.onclick=()=>{$('start').value=item.start.toFixed(1);$('end').value=item.end.toFixed(1);video.currentTime=item.start;setStatus(`Séquence ${index+1} sélectionnée. Tu peux prévisualiser puis exporter le clip.`);$('candidates').querySelectorAll('.candidate').forEach(x=>x.classList.remove('selected'));el.classList.add('selected')};el.append(info,apply);box.append(el)});
    box.classList.remove('hidden');const first=chosen[0];$('start').value=first.start.toFixed(1);$('end').value=first.end.toFixed(1);setStatus(`${chosen.length} séquences repérées. La première est pré-sélectionnée : choisis celle que tu préfères.`);
  }catch(error){setStatus('L’analyse a rencontré un problème sur ce navigateur. Tu peux toujours découper la vidéo manuellement.');}
  finally{try{await seek(oldTime)}catch{}button.disabled=false}
}
$('auto').onclick=analyzeHighlights;
$('export').onclick=async()=>{const s=Number($('start').value),e=Number($('end').value);if(!valid(s,e))return;const canvas=document.createElement('canvas');canvas.width=720;canvas.height=1280;const ctx=canvas.getContext('2d');const stream=canvas.captureStream(30);let sourceStream=null;try{sourceStream=video.captureStream?video.captureStream():video.mozCaptureStream?.()}catch{}if(sourceStream){for(const track of sourceStream.getAudioTracks())stream.addTrack(track)}const mime=['video/mp4;codecs="avc1.42E01E"','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));if(!mime){setStatus('Ton navigateur ne prend pas en charge l’export vidéo. Essaie Safari ou Chrome à jour.');return}chunks=[];try{recorder=new MediaRecorder(stream,{mimeType:mime})}catch{setStatus('Export non disponible sur ce navigateur.');return}recorder.ondataavailable=ev=>{if(ev.data.size)chunks.push(ev.data)};recorder.onstop=()=>{const blob=new Blob(chunks,{type:mime});const url=URL.createObjectURL(blob);$('download').href=url;$('download').download='shortcut-ai-clip.'+(mime.includes('mp4')?'mp4':'webm');$('download').textContent='↓ Télécharger mon clip';$('download').classList.remove('hidden');setStatus('Export terminé ! Ton clip est prêt.');stream.getTracks().forEach(t=>t.stop())};video.pause();video.currentTime=s;await new Promise(resolve=>video.onseeked=resolve);const draw=()=>{const vw=video.videoWidth,vh=video.videoHeight;if(!vw||!vh)return;const target=9/16,ratio=vw/vh;let sw,sh,sx,sy;if(ratio>target){sh=vh;sw=vh*target;sx=(vw-sw)/2;sy=0}else{sw=vw;sh=vw/target;sx=0;sy=(vh-sh)/2}ctx.fillStyle='#000';ctx.fillRect(0,0,720,1280);ctx.drawImage(video,sx,sy,sw,sh,0,0,720,1280)};recorder.start(500);setStatus('Export en cours… garde cette page ouverte.');let raf;const frame=()=>{draw();if(video.currentTime>=e||video.ended){video.pause();cancelAnimationFrame(raf);if(recorder.state!=='inactive')recorder.stop();return}raf=requestAnimationFrame(frame)};video.play().then(frame).catch(()=>{recorder.stop();setStatus('Impossible de démarrer la vidéo pour l’export.')})};


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
