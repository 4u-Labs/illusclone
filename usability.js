(() => {
  const en=currentLang==='en';const say=(pt,enText)=>en?enText:pt;
  const header=document.getElementById('illusclone-header-actions');
  const resize=()=>{document.documentElement.style.setProperty('--app-header-height',Math.ceil(header.getBoundingClientRect().height)+'px');window.dispatchEvent(new Event('resize'));};
  new ResizeObserver(resize).observe(header);
  let activity=false;const warn=event=>{if(activity){event.preventDefault();event.returnValue='';}};
  const noteActivity=()=>{if(!activity){activity=true;window.addEventListener('beforeunload',warn);}};
  const canvas=document.getElementById('vectorcraft_canvas');
  canvas.addEventListener('pointerdown',noteActivity);
  canvas.addEventListener('keydown',noteActivity);
  canvas.addEventListener('drop',noteActivity);
  canvas.addEventListener('input',noteActivity);
  canvas.addEventListener('paste',noteActivity);
  const dialog=document.getElementById('restart-dialog');let nextLang=null,opener=null;
  window.requestEditorRestart=lang=>{nextLang=lang;opener=document.activeElement;document.getElementById('restart-error').textContent='';if(!dialog.open)dialog.showModal();document.getElementById('restart-cancel').focus();};
  document.getElementById('restart-cancel').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>opener?.isConnected&&opener.focus());
  document.getElementById('restart-confirm').onclick=()=>{
    try {
      if(nextLang) {
        // Compute preferences before changing storage, preserving unrelated settings.
        const updates=['vectorcraft.preferences','illustratorclone.preferences'].map(key=>{
          let prefs;try{prefs=JSON.parse(localStorage.getItem(key)||'{}');}catch{prefs={};}
          if(!prefs || typeof prefs!=='object' || Array.isArray(prefs))prefs={};
          return [key,JSON.stringify({...prefs,interfaceLanguage:nextLang==='pt'?'pt-br':'en'})];
        });
        for(const [key,value] of updates)localStorage.setItem(key,value);
        localStorage.setItem('illusclone_lang',nextLang);
      }
      activity=false;window.removeEventListener('beforeunload',warn);location.reload();
    } catch(error) {document.getElementById('restart-error').textContent=say('Não foi possível salvar a preferência. A página não foi reiniciada.','Unable to save the preference. The page was not restarted.');}
  };
  document.getElementById('boot-retry').onclick=()=>{if(activity)window.requestEditorRestart(null);else location.reload();};
  document.getElementById('help-close').setAttribute('aria-label',say('Fechar ajuda','Close help'));
  document.getElementById('boot-retry').textContent=say('Tentar novamente','Try again');
  document.getElementById('restart-title').textContent=say('Salvar antes de reiniciar','Save before restarting');
  document.getElementById('restart-message').textContent=say('Salve seu documento pelo menu do editor antes de continuar. Reiniciar pode descartar alterações não salvas.','Save your document using the editor menu first. Restarting may discard unsaved changes.');
  document.getElementById('restart-cancel').textContent=say('Continuar editando','Keep editing');
  document.getElementById('restart-confirm').textContent=say('Já salvei — reiniciar','I saved — restart');
  document.getElementById('about-summary').textContent=say('Sobre o app e links','About and links');
  document.getElementById('practical-help').innerHTML=en?
    '<h4>Import artwork</h4><p>Use the editor’s File menu to open artwork. For transfers from VectorAI, check the imported document before selecting “O arquivo abriu”. You can download the pending SVG as a backup.</p><h4>Edit and compare</h4><p>Select an object to inspect its properties. Use the editor’s node and curve tools for detailed changes. Check the Undo and Redo commands in its menus before making major edits.</p><h4>Save and export</h4><p>Save an editable document with the editor’s save command. Export SVG to exchange vector artwork, or choose another format offered by the export dialog. Reopen the exported file and check gradients, fonts, transparency and dimensions.</p><h4>Protect your work</h4><p>Save before changing language or reloading. This page cannot confirm the editor’s save state. A browser leave warning is enabled after interaction with the canvas; it does not replace saving.</p><h4>Keyboard and offline use</h4><p>Tab and Shift+Tab navigate the page controls. Enter or Space activates buttons. Escape closes this help. The editor’s own shortcuts are shown in its menus. Check offline availability below before disconnecting.</p>':
    '<h4>Importar sua arte</h4><p>Use o menu Arquivo do editor para abrir sua arte. Ao receber um SVG do VectorAI, confira o documento antes de clicar em “O arquivo abriu”. Você também pode baixar o SVG pendente como cópia.</p><h4>Editar e conferir</h4><p>Selecione um objeto para conferir suas propriedades. Use as ferramentas de nós e curvas do editor para ajustes finos. Confira os comandos Desfazer e Refazer nos menus antes de fazer alterações maiores.</p><h4>Salvar e exportar</h4><p>Salve um documento editável pelo comando de salvar do editor. Exporte SVG para intercâmbio vetorial ou escolha outro formato oferecido na janela de exportação. Reabra o arquivo exportado e confira degradês, fontes, transparência e dimensões.</p><h4>Preservar seu trabalho</h4><p>Salve antes de trocar o idioma ou recarregar. Esta página não consegue confirmar o estado de salvamento do editor. Um aviso de saída é ativado após interação com o canvas; ele não substitui salvar o documento.</p><h4>Teclado e uso offline</h4><p>Tab e Shift+Tab percorrem os controles da página. Enter ou Espaço ativam botões. Esc fecha esta ajuda. Os atalhos internos do editor aparecem nos seus menus. Confira abaixo a disponibilidade offline antes de desconectar.</p>';
})();
