const $=id=>document.getElementById(id);const fileInput=$('file'),video=$('video');let fileUrl=null,recorder=null,chunks=[];
function setStatus(s){$('status').textContent=s}
function duration(){return Number.isFinite(video.duration)?video.duration:0}
function update(){const d=duration();$('start').max=d;$('end').max=d;if(d){$('end').value=Math.min(Number($('end').value)||30,d);$('hint').textContent=`Durée de la vidéo : ${d.toFixed(1)} secondes.`}}
fileInput.addEventListener('change',()=>{const f=fileInput.files?.[0];if(!f)return;if(!f.type.startsWith('video/')){setStatus('Choisis un fichier vidéo.');return}if(fileUrl)URL.revokeObjectURL(fileUrl);fileUrl=URL.createObjectURL(f);video.src=fileUrl;$('videoWrap').classList.remove('hidden');$('fileName').textContent=f.name;['setStart','setEnd','auto','preview','export'].forEach(id=>$(id).disabled=false);$('download').classList.add('hidden');setStatus('Vidéo chargée sur ton appareil.');video.onloadedmetadata=()=>{update();$('end').value=Math.min(30,duration())}});
$('setStart').onclick=()=>{$('start').value=video.currentTime.toFixed(1)};$('setEnd').onclick=()=>{$('end').value=video.currentTime.toFixed(1)};
$('preview').onclick=()=>{const s=Number($('start').value),e=Number($('end').value);if(!valid(s,e))return;video.currentTime=s;video.play();const stop=()=>{if(video.currentTime>=e){video.pause();video.removeEventListener('timeupdate',stop)}};video.addEventListener('timeupdate',stop)};
function valid(s,e){if(s<0||e<=s||e>duration()){setStatus('Vérifie le début et la fin du clip.');return false}if(e-s>90){setStatus('Pour cette version gratuite, limite le clip à 90 secondes.');return false}return true}
$('auto').onclick=()=>{setStatus('Analyse locale des images…');const c=document.createElement('canvas'),ctx=c.getContext('2d',{willReadFrequently:true});c.width=64;c.height=36;const samples=[],d=duration(),step=Math.max(1,d/80);let t=0,last=null;const probe=()=>{if(t>d){const ranked=samples.sort((a,b)=>b.score-a.score).slice(0,3).sort((a,b)=>a.time-b.time);if(!ranked.length){setStatus('Aucun passage détecté. Choisis le début et la fin manuellement.');return}const best=ranked[0];$('start').value=Math.max(0,best.time-7).toFixed(1);$('end').value=Math.min(d,best.time+23).toFixed(1);setStatus('Suggestion créée à partir des changements visuels. Ajuste les secondes si besoin.');return}video.currentTime=t;video.onseeked=()=>{ctx.drawImage(video,0,0,64,36);const data=ctx.getImageData(0,0,64,36).data;let score=0;if(last){for(let i=0;i<data.length;i+=16)score+=Math.abs(data[i]-last[i])+Math.abs(data[i+1]-last[i+1])+Math.abs(data[i+2]-last[i+2]);}last=data; if(score)samples.push({time:t,score});t+=step;probe()}};video.pause();probe()};
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
