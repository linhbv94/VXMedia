// Regression exercises the real App/Player with native browser media playback.
// Only the desktop file/dialog bridge is replaced with local fixtures.
import assert from 'node:assert/strict';
import { createServer } from 'vite';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const bridge = '\0playback_test_bridge';
const wave = Buffer.alloc(44 + 8000 * 2 * 30);
wave.write('RIFF'); wave.writeUInt32LE(wave.length - 8, 4); wave.write('WAVEfmt ', 8);
wave.writeUInt32LE(16, 16); wave.writeUInt16LE(1, 20); wave.writeUInt16LE(1, 22);
wave.writeUInt32LE(8000, 24); wave.writeUInt32LE(16000, 28);
wave.writeUInt16LE(2, 32); wave.writeUInt16LE(16, 34); wave.write('data', 36);
wave.writeUInt32LE(wave.length - 44, 40);
const server = await createServer({ server: { host: '127.0.0.1', port: 1436, strictPort: true }, plugins: [{
  name: 'playback_regression_fixtures', enforce: 'pre',
  resolveId(id, importer) {
    if ((/\/services\/tauri(?:\.ts)?$/).test(id) || (id === './tauri' && importer?.includes('/services/'))) return bridge;
  },
  load(id) {
    if (id !== bridge) return;
    return `
      const image = (path) => ({path, name:path.split('/').pop(), media_type:'image', extension:'png', size_bytes:10});
      const audio = (path) => ({path, name:path.split('/').pop(), media_type:'audio', extension:'wav', size_bytes:10});
      const video = (path) => ({path, name:path.split('/').pop(), media_type:'video', extension:'webm', size_bytes:10});
      const folders = {
        '/music': [audio('/music/one.wav'), image('/music/cover.png'), audio('/music/two.wav'), audio('/music/three.wav')],
        '/other': [audio('/other/other.wav')],
        '/images': [image('/images/first.png'), image('/images/second.png')],
        '/videos': [video('/videos/clip.webm'), image('/videos/cover.png'), video('/videos/next.webm')],
        '/other_videos': [video('/other_videos/other.webm')],
      };
      export const getDirectoryMedia = async(path) => {
        const parent = path.substring(0, path.lastIndexOf('/'));
        const items = folders[parent];
        return {parent_dir:parent,items,total_count:items.length,current_index:items.findIndex(item=>item.path===path)};
      };
      export const getSafeMediaSrc = async(path) => {
        if(window.__delaySource === path) await new Promise(resolve=>window.__resolveSource=resolve);
        if(path.endsWith('.webm')) return window.__videoFixtureURL+'#'+encodeURIComponent(path);
        if (!path.endsWith('.png')) {const blob=await fetch('/fixture.wav').then(res=>res.blob());return URL.createObjectURL(blob)+'#'+encodeURIComponent(path);}
        return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="teal"/></svg>';
      };
      export const readAudioMetadata = async(path)=>({title:path.split('/').pop(),artist:'Playback fixture'});
      export const listenOpenMediaFile = async(callback)=>{window.__openMedia=callback;return ()=>{if(window.__openMedia===callback) delete window.__openMedia;};};
      export const listenMenuOpenEvents = async()=>()=>{};
      export const getInitialMediaFile = async()=>null;
      export const openFileDialog = async()=>null;
      export const openFolderDialog = async()=>null;
      export const isTauriEnvironment = ()=>false;
      export const setAlwaysOnTop = async(value)=>value;
      export const clipboardFiles = async()=>true;
      export const createMediaWindow = async()=>true;
      export const logFrontend = async()=>{};
      export const listenFullscreen = async(callback)=>{window.__fullscreenChanged=callback; callback(false); return ()=>{};};
      export const setFullscreen = async(value)=>{window.__fullscreenChanged(value);};
      export const startDragging = async()=>{};
      export const setWindowDecorations = async()=>{};
      export const setTrafficLightsVisible = async()=>{};
      export const minimizeWindow = async()=>{};
      export const toggleMaximizeWindow = async()=>{};
      export const closeWindow = async()=>{window.__closeCalls=(window.__closeCalls||0)+1;};
      export const readFileBinary = async()=>new ArrayBuffer(0);
      export const printFile = async()=>true;
    `;
  },
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url.startsWith('/fixture.wav')) { res.setHeader('Content-Type','audio/wav'); res.end(wave); } else next();
    });
  },
}] });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE_PATH,
    headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport:{width:900,height:600}, userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/145.0.0.0 Safari/537.36' });
  const errors=[]; page.on('pageerror',error=>{errors.push(error.message);console.error(error.message);});
  page.on('console',message=>{if(message.type()==='error') console.error(message.text());});
  await page.addInitScript(() => {
    localStorage.setItem('media_tool_settings', JSON.stringify({language:'vi', theme:'dark', hud_hide_delay_ms:0, seek_short_sec:1,seek_long_sec:5,ab_loop_crossfade_ms:45,default_loop_file:'all',volume:0.8}));
    Object.defineProperty(navigator,'platform',{value:'Win32'});
    const load=HTMLMediaElement.prototype.load;
    HTMLMediaElement.prototype.load=function(){this.__loads=(this.__loads||0)+1;return load.call(this);};
  });
  await page.goto('http://127.0.0.1:1436');
  await page.waitForFunction(()=>Boolean(window.__openMedia));
  const open = async(path) => {await page.evaluate(path=>window.__openMedia(path),path);};
  const playing = async(path)=>{try{await page.waitForFunction(path=>{const el=document.querySelector('audio');return el.dataset.currentPath===path && !el.paused && el.readyState>=4;},path,{timeout:10000});}catch(error){console.error(await page.locator('audio').evaluate(el=>({src:el.src,dataset:{...el.dataset},paused:el.paused,ready:el.readyState,error:el.error?.message,body:document.body.innerText.slice(0,500)})));throw error;}};
  const snapshot = ()=>page.locator('audio').evaluate(el=>({path:el.dataset.currentPath,src:el.src,time:el.currentTime,paused:el.paused,loads:el.__loads,origin:el.dataset.originSessionId}));
  await open('/music/one.wav'); await playing('/music/one.wav');
  await page.locator('audio').evaluate(el=>{el.currentTime=7;});
  const before=await snapshot();
  await open('/images/first.png');
  await page.waitForSelector('img[alt="first.png"]');
  await page.waitForTimeout(300);
  let after=await snapshot();
  assert.equal(after.loads,before.loads,'opening image tab must not reload audio');
  assert.equal(after.paused,false); assert.ok(after.time>=7,'background audio retains progress');
  await page.locator('[title="/music"]').click();
  after=await snapshot(); assert.equal(after.loads,before.loads); assert.ok(after.time>=7);
  // Keep A/B state while the music viewport is hidden.
  await page.keyboard.press('[');
  await page.locator('audio').evaluate(el=>{el.currentTime=10;el.dispatchEvent(new Event('timeupdate'));});
  await page.keyboard.press(']');
  await page.locator('[title="/images"]').click();
  await page.locator('audio').evaluate(el=>{el.currentTime=11;el.dispatchEvent(new Event('timeupdate'));});
  await page.waitForTimeout(150);
  assert.ok((await snapshot()).time<9,'A/B loop survives changing tabs');
  await page.locator('[title="/music"]').click(); await page.keyboard.press('Backslash');
  // Deferred URL conversion cannot label an old source with the new path.
  await page.evaluate(()=>window.__delaySource='/music/two.wav');
  await open('/music/two.wav'); await page.waitForFunction(()=>Boolean(window.__resolveSource));
  after=await snapshot(); assert.equal(after.path,'/music/one.wav'); assert.equal(after.loads,before.loads);
  await page.evaluate(()=>{window.__resolveSource();window.__delaySource=null;}); await playing('/music/two.wav');
  assert.ok((await snapshot()).src.includes('two.wav'));
  // Ended advances the music owner exactly once; it skips cover art and leaves image selection alone.
  await open('/music/one.wav'); await playing('/music/one.wav');
  await page.locator('[title="/images"]').click();
  await page.locator('audio').evaluate(el=>el.dispatchEvent(new Event('ended')));
  await playing('/music/two.wav');
  assert.equal(await page.locator('img[alt="first.png"]').count(),1);
  const sourceLoads=(await snapshot()).loads;
  await open('/other/other.wav'); await playing('/other/other.wav');
  await page.keyboard.press('Space'); assert.equal((await snapshot()).paused,true,'one keypress pauses once');
  await page.keyboard.press('Space'); await playing('/other/other.wav');
  await page.locator('[title="/images"]').click();
  await page.keyboard.press('Space'); assert.equal((await snapshot()).paused,true);
  await page.keyboard.press('Space'); await playing('/other/other.wav');
  await page.waitForTimeout(200); assert.equal((await snapshot()).loads,sourceLoads+1,'inactive music folders cannot replace the source');
  // Closing other tabs also clears their audio owner.
  await page.locator('[title="/images"]').click({button:'right'});
  await page.getByRole('button',{name:'Đóng các tab khác',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('audio').hasAttribute('src'));
  // A real video with an audio track covers listening to a video, not just WAV music.
  await page.evaluate(async() => {
    const canvas=document.createElement('canvas');canvas.width=160;canvas.height=90;
    const context=canvas.getContext('2d');context.fillStyle='teal';context.fillRect(0,0,160,90);
    const audioContext=new AudioContext();await audioContext.resume();
    const oscillator=audioContext.createOscillator();const destination=audioContext.createMediaStreamDestination();
    oscillator.connect(destination);oscillator.start();
    const stream=canvas.captureStream(5);stream.addTrack(destination.stream.getAudioTracks()[0]);
    const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,opus'});const chunks=[];
    recorder.ondataavailable=event=>chunks.push(event.data);
    const stopped=new Promise(resolve=>recorder.onstop=resolve);
    recorder.start();await new Promise(resolve=>setTimeout(resolve,6000));recorder.stop();await stopped;
    window.__videoFixtureURL=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));
    oscillator.stop();stream.getTracks().forEach(track=>track.stop());await audioContext.close();
  });
  const videoPlaying=async(path)=>page.waitForFunction(path=>{
    const el=document.querySelector('video');return el?.src.includes(encodeURIComponent(path))&&!el.paused&&el.readyState>=3;
  },path,{timeout:10000});
  await open('/videos/clip.webm');await videoPlaying('/videos/clip.webm');
  // Fullscreen ignores windowed HUD preferences and preserves the mounted video.
  const root = page.locator('[data-fullscreen]');
  await page.mouse.move(410, 190);
  await page.waitForFunction(()=>document.querySelector('[data-fullscreen]').dataset.hudDimmed==='true',null,{timeout:4000});
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-hud-layer]')].every(el=>getComputedStyle(el).opacity==='0.4'));
  const opacities = await page.locator('[data-hud-layer]').evaluateAll(els=>els.map(el=>getComputedStyle(el).opacity));
  assert.ok(opacities.every(value=>Number(value)===0.4));
  assert.equal(await page.locator('video').evaluate(el=>getComputedStyle(el).opacity),'1');
  await page.mouse.move(415, 195);
  await page.waitForFunction(()=>document.querySelector('[data-fullscreen]').dataset.hudDimmed==='false');
  await page.keyboard.press('h');
  await page.keyboard.press('f');
  await page.waitForFunction(()=>document.querySelector('[data-fullscreen]').dataset.fullscreen==='true');
  assert.equal(await root.getAttribute('data-hud-visible'), 'false');
  assert.equal(await page.getByTitle('Close', {exact:true}).count(), 1);
  assert.equal(await page.locator('video').evaluate(el=>getComputedStyle(el).cursor),'none');
  await page.mouse.move(420, 200);
  await page.waitForFunction(()=>document.querySelector('[data-fullscreen]').dataset.hudVisible==='true');
  assert.notEqual(await page.locator('video').evaluate(el=>getComputedStyle(el).cursor),'none');
  await page.getByTitle('Close',{exact:true}).click();
  assert.equal(await page.evaluate(()=>window.__closeCalls),1);
  await page.waitForFunction(()=>document.querySelector('[data-fullscreen]').dataset.hudVisible==='false',null,{timeout:4000});
  await page.setViewportSize({width:1400,height:850});
  const fitted = await page.locator('video').evaluate(el=>({width:el.clientWidth,height:el.clientHeight}));
  assert.equal(fitted.width,1400); assert.equal(fitted.height,850);
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.querySelector('[data-fullscreen]').dataset.fullscreen==='false');
  assert.equal(await root.getAttribute('data-hud-visible'), 'false');
  assert.equal(await page.getByTitle('Close', {exact:true}).count(), 1);
  await page.keyboard.press('h');
  await page.setViewportSize({width:900,height:600});
  assert.equal(await page.locator('video').evaluate(el=>el.clientWidth),900);

  await page.locator('video').evaluate(el=>{el.currentTime=1;window.__originalVideo=el;});
  await open('/images/first.png');await page.waitForSelector('img[alt="first.png"]');
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>window.__originalVideo.isConnected),true,'opening an image tab must retain the video element');
  assert.equal(await page.locator('video').evaluate(el=>el.closest('[inert]')!==null),true,'hidden player controls must not receive focus');
  assert.ok(await page.locator('video').evaluate(el=>el.getBoundingClientRect().right<0),'hidden video stays outside the visible viewport');
  assert.equal(await page.locator('video').evaluate(el=>el.paused),false,'video audio continues under the image tab');
  assert.ok(await page.locator('video').evaluate(el=>el.currentTime>=1),'video progress survives opening an image');
  await page.locator('[title="/videos"]').click();
  assert.equal(await page.locator('video').evaluate(el=>el===window.__originalVideo),true,'returning must reuse the same video');
  assert.ok(await page.locator('video').evaluate(el=>el.currentTime>=1),'returning must not restart the video');
  await page.keyboard.press('[');
  await page.locator('video').evaluate(el=>{el.currentTime=2;el.dispatchEvent(new Event('timeupdate'));});
  await page.keyboard.press(']');
  await page.locator('[title="/images"]').click();
  await page.locator('video').evaluate(el=>{el.currentTime=2.5;el.dispatchEvent(new Event('timeupdate'));});
  assert.ok(await page.locator('video').evaluate(el=>el.currentTime<1.8),'video A/B loop remains active in an image tab');
  await page.keyboard.press('Space');
  assert.equal(await page.locator('video').evaluate(el=>el.paused),true,'Space pauses background video');
  await page.keyboard.press('Space');await videoPlaying('/videos/clip.webm');
  await page.keyboard.press('ArrowRight');await page.waitForSelector('img[alt="second.png"]');
  assert.ok(await page.locator('video').evaluate(el=>el.currentTime<1.8),'hidden video must not also handle image navigation keys');
  await page.locator('[title="/videos"]').click();await page.keyboard.press('Backslash');
  await page.locator('[title="/images"]').click();
  await page.locator('video').evaluate(el=>el.dispatchEvent(new Event('ended')));
  await videoPlaying('/videos/next.webm');
  assert.equal(await page.locator('img[alt="second.png"]').count(),1,'ended advances the video source, not the visible image');
  // Images in the same folder also retain playback; the pill returns to the actual playing file.
  await open('/videos/cover.png');await page.waitForSelector('img[alt="cover.png"]');
  await videoPlaying('/videos/next.webm');
  await page.getByTitle('Mở tab video',{exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('video')?.checkVisibility());
  await open('/other/other.wav');await playing('/other/other.wav');
  await page.waitForFunction(()=>document.querySelector('video')?.paused);
  assert.equal(await page.locator('video').evaluate(el=>el.paused),true,'playing a music file pauses video without overlapping audio');
  const pausedVideoTime=await page.locator('video').evaluate(el=>el.currentTime);
  await page.locator('[title="/videos"]').click();
  assert.equal(await page.locator('video').evaluate(el=>el.paused),true,'returning must preserve an intentionally paused video');
  assert.equal(await page.locator('video').evaluate(el=>el.currentTime),pausedVideoTime);
  await page.keyboard.press('Space');await videoPlaying('/videos/next.webm');
  await page.waitForFunction(()=>document.querySelector('audio')?.paused);
  assert.equal((await snapshot()).paused,true,'resuming video pauses the music source');
  await open('/other_videos/other.webm');await videoPlaying('/other_videos/other.webm');
  assert.equal(await page.locator('video').count(),1,'only one video source can play');
  await page.locator('[title="/images"]').click();
  await page.locator('[title="/other_videos"]').getByTitle('Đóng tab',{exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('video'));
  assert.equal(await page.evaluate(()=>window.__originalVideo.paused),true,'closing the source tab stops and unloads video');
  await open('/videos/clip.webm');await videoPlaying('/videos/clip.webm');
  await page.locator('[title="/images"]').click({button:'right'});
  await page.getByRole('button',{name:'Đóng các tab khác',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('video'));
  assert.equal((await snapshot()).paused,true);
  // Single-track playlist restarts without loading another source.
  await open('/other/other.wav'); await playing('/other/other.wav');
  const singleLoads=(await snapshot()).loads;
  await page.locator('audio').evaluate(el=>{el.currentTime=20;el.dispatchEvent(new Event('ended'));});
  await page.waitForTimeout(150); after=await snapshot(); assert.ok(after.time<2); assert.equal(after.loads,singleLoads);
  await page.locator('[title="/other"]').getByTitle('Đóng tab',{exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('audio').hasAttribute('src'));
  assert.deepEqual(errors,[],'React/runtime must not throw');
  const mac = await browser.newPage();
  await mac.addInitScript(()=>Object.defineProperty(navigator,'platform',{value:'MacIntel'}));
  await mac.goto('http://127.0.0.1:1436');
  await mac.waitForFunction(()=>Boolean(window.__fullscreenChanged));
  await mac.keyboard.press('f');
  await mac.waitForFunction(()=>document.querySelector('[data-fullscreen]').dataset.fullscreen==='true');
  await mac.mouse.move(250,200);
  await mac.getByTitle('Close',{exact:true}).click();
  assert.equal(await mac.evaluate(()=>window.__closeCalls),1,'Mac fullscreen close invokes window bridge');
  assert.equal(await mac.locator('[data-fullscreen]').getAttribute('data-fullscreen'),'true');
  await mac.close();
  console.log('PASS: audio + video with sound: image tabs/return, A-B persistence, deferred source, ended owner/once, Space/keyboard isolation, exclusive playback, source tab close/close others, same-folder images/pill return');
} finally { await browser?.close(); await server.close(); }
