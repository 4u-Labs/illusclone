const loading=document.getElementById('vectorcraft_loading');
const text=document.getElementById('loading-text');
const detail=document.getElementById('loading-detail');
const progress=document.getElementById('loading-progress');
const retry=document.getElementById('boot-retry');
const english=document.documentElement.lang==='en';
const say=(pt,en)=>english?en:pt;
const controller=new AbortController();
const timer=setTimeout(()=>controller.abort(),180000);
try {
  if(typeof WebAssembly==='undefined')throw new Error(say('Este navegador não oferece WebAssembly.','This browser does not support WebAssembly.'));
  text.textContent=say('Baixando o editor…','Downloading the editor…');
  const bindings=await import('./vectorcraft-web-b86a97bd7d399e62.js?v=2.1.2');
  const response=await fetch('./vectorcraft-web-b86a97bd7d399e62_bg.wasm?v=2.1.2',{signal:controller.signal});
  if(!response.ok)throw new Error('HTTP '+response.status);
  const total=response.headers.get('content-encoding')?0:Number(response.headers.get('content-length'))||0;
  let bytes;
  if(response.body) {
    const reader=response.body.getReader();const chunks=[];let received=0;
    while(true) {const {value,done}=await reader.read();if(done)break;chunks.push(value);received+=value.byteLength;
      detail.textContent=(received/1000000).toFixed(1)+' MB'+(total?' / '+(total/1000000).toFixed(1)+' MB':'')+say(' baixados',' downloaded');
      if(total){progress.max=total;progress.value=Math.min(received,total);}
    }
    bytes=new Uint8Array(received);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  } else bytes=new Uint8Array(await response.arrayBuffer());
  clearTimeout(timer);
  text.textContent=say('Inicializando o editor…','Initializing the editor…');
  progress.removeAttribute('value');detail.textContent=say('Preparando a área de trabalho e os recursos gráficos.','Preparing the workspace and graphics.');
  const wasm=await bindings.default({module_or_path:bytes});
  window.wasmBindings=bindings;
  dispatchEvent(new CustomEvent('TrunkApplicationStarted',{detail:{wasm}}));
  const start=Date.now();
  while(document.getElementById('vectorcraft_loading') && !loading.hidden && getComputedStyle(loading).display!=='none') {
    if(Date.now()-start>45000)throw new Error(say('O editor não confirmou que está pronto. Verifique o suporte a WebGPU/WebGL2.','The editor did not become ready. Check WebGPU/WebGL2 support.'));
    await new Promise(resolve=>setTimeout(resolve,150));
  }
  window.illuscloneReady=true;dispatchEvent(new Event('illusclone-ready'));
} catch(error) {
  console.error(error);window.illuscloneBootError=error;
  dispatchEvent(new CustomEvent('illusclone-boot-error',{detail:error}));
  if(!loading.isConnected)document.body.appendChild(loading);
  loading.hidden=false;loading.style.display='flex';
  loading.querySelector('.spinner')?.remove();progress.hidden=true;
  text.textContent=say('Não foi possível abrir o editor.','Unable to open the editor.');
  detail.textContent=error.name==='AbortError'?say('O download demorou demais. Verifique a conexão e tente novamente.','The download timed out. Check your connection and try again.'):error.message;
  retry.hidden=false;
} finally {clearTimeout(timer);}
