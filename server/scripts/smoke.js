import 'dotenv/config';
import {normalizeAudio,stt,tts} from '../src/services/gnani.js';
const base=process.env.SMOKE_URL||'http://localhost:5000';
if(!process.env.DEMO_USERNAME||!process.env.DEMO_PASSWORD)throw new Error('Set demo credentials in .env');
let cookie='';
async function req(path,opts={}){const r=await fetch(base+path,{...opts,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(opts.headers||{})}});const set=r.headers.get('set-cookie');if(set)cookie=set.split(';')[0];const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(`${path}: ${r.status} ${data.error?.message||''}`);return data;}
const sentence='Namaste, yeh Munshi ka audio test hai.';
const speech=await tts(sentence);
if(!speech?.buffer)throw new Error(`Gnani TTS check failed: ${speech?.errorCode||'no audio'}`);
const ext=speech.mime==='audio/wav'?'.wav':speech.mime==='audio/mp4'?'.mp4':'.mp3';
const wav=await normalizeAudio(speech.buffer,`gnani-test${ext}`);
const transcript=await stt(wav);
console.log(`Gnani round trip: ${transcript}`);
await req('/api/auth/login',{method:'POST',body:JSON.stringify({username:process.env.DEMO_USERNAME,password:process.env.DEMO_PASSWORD})});
await req('/api/demo/reset',{method:'POST',body:JSON.stringify({confirm:true})});
const sentences=[
  'Sharma ji ko do sau pachas rupay udhaar likh do','haan','Sharma ji ka balance batao',
  'Sharma ji ne sau rupay payment diye','haan','Dukaan mein das kilo chawal add karo','haan',
  'Dukaan se do kilo chawal kam karo','haan','chawal ka stock kitna hai','chawal mangwana hai',
  'haan','mujhe kya kya mangwana hai','pichhli entry undo karo','haan','nahi','yeh kya hai'
];
for(const text of sentences){const result=await req('/api/voice/text',{method:'POST',body:JSON.stringify({text})});console.log(`${text} -> ${result.reply}`);}
console.log('Provider and text-pipeline smoke checks completed.');
