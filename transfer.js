(() => {
  const key = 'illusclone_import_svg';
  let payload = null, running = false, bootError = window.illuscloneBootError || null;
  const panel = document.getElementById('transfer-panel');
  const status = document.getElementById('transfer-status');
  const retry = document.getElementById('transfer-retry');
  const confirm = document.getElementById('transfer-confirm');
  const download = document.getElementById('transfer-download');
  function read() { try { return localStorage.getItem(key); } catch(e) { panel.hidden=false;status.textContent='Não foi possível acessar o SVG pendente. Habilite o armazenamento do navegador.';return null; } }
  async function ready() {
    const started = Date.now();
    while(Date.now() - started < 45000) {
      if(bootError) throw bootError;
      const canvas=document.getElementById('vectorcraft_canvas');
      const loading=document.getElementById('vectorcraft_loading');
      if(window.wasmBindings && canvas && canvas.width>0 && canvas.height>0 && (!loading || loading.hidden || getComputedStyle(loading).display==='none')) {
        await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);return canvas;
      }
      await new Promise(resolve=>setTimeout(resolve,150));
    }
    throw new Error('O editor ainda não ficou pronto. Aguarde ou baixe o SVG e abra pelo menu Arquivo.');
  }
  async function attempt() {
    if(running) return;
    payload=read();if(!payload)return;
    panel.hidden=false;running=true;retry.disabled=true;confirm.disabled=true;
    status.textContent='Aguardando o editor para importar o SVG…';
    try {
      const parsed=new DOMParser().parseFromString(payload,'image/svg+xml');
      if(parsed.querySelector('parsererror') || parsed.documentElement.localName!=='svg') throw new Error('O conteúdo pendente não é um SVG válido.');
      const canvas=await ready();
      const transfer=new DataTransfer();transfer.items.add(new File([payload],'vetor_4u.svg',{type:'image/svg+xml'}));
      canvas.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:transfer}));
      status.textContent='SVG enviado ao editor. Confira se abriu antes de confirmar. Tentar novamente pode importar outra cópia.';
      confirm.disabled=false;
    } catch(e) {status.textContent=e.message+' O arquivo pendente foi preservado.';}
    finally {running=false;retry.disabled=false;}
  }
  retry.addEventListener('click',attempt);
  confirm.addEventListener('click',()=>{
    try {
      if(localStorage.getItem(key)===payload) {localStorage.removeItem(key);panel.hidden=true;}
      else {status.textContent='Há um novo SVG pendente. Use Tentar novamente para importá-lo.';confirm.disabled=true;}
    } catch(e) {status.textContent='Não foi possível limpar a transferência. O SVG continua preservado.';}
  });
  download.addEventListener('click',()=>{
    const svg=payload || read();if(!svg)return;
    const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download='vetor_4u.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  window.addEventListener('storage',event=>{if(event.key===key && event.newValue){panel.hidden=false;status.textContent='Novo SVG recebido. Use Tentar novamente para importá-lo.';}});
  window.addEventListener('illusclone-boot-error',event=>{bootError=event.detail;});
  if(read()) attempt();
})();
