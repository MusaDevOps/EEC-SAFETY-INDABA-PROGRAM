(function(){
  const tableBody = document.getElementById('programmeBody');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');

  function renderSchedule(data){
    try{
      const headerTitle = document.querySelector('.branding h1');
      const tagline = document.querySelector('.branding .tagline');
      if(data.title) headerTitle.textContent = data.title;
      if(data.tagline) tagline.textContent = data.tagline;
    }catch(_e){}

    tableBody.innerHTML = '';
    data.items.forEach((item)=>{
      const tr = document.createElement('tr');
      if((item.activity||'').toUpperCase().includes('TEA BREAK') || (item.activity||'').toUpperCase().includes('LUNCH')){
        tr.classList.add('break');
      }
      const tdTime = document.createElement('td');
      tdTime.textContent = item.time || '';
      const tdActivity = document.createElement('td');
      tdActivity.innerHTML = `<div class="activity">${escapeHtml(item.activity||'')}</div>`;
      const tdSpeakers = document.createElement('td');
      tdSpeakers.innerHTML = `<div class="speakers">${escapeHtml(item.speakers||'')}</div>`;
      tr.appendChild(tdTime); tr.appendChild(tdActivity); tr.appendChild(tdSpeakers);
      tableBody.appendChild(tr);
    });
  }

  function escapeHtml(str){
    return String(str)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#39;');
  }

  async function loadSchedule(){
    const isFileProtocol = location.protocol === 'file:';
    if(isFileProtocol){
      try{
        const embedded = document.getElementById('embeddedSchedule').textContent;
        const data = JSON.parse(embedded);
        renderSchedule(data);
        window.__scheduleData = data;
        return;
      }catch(e){ /* fallthrough to try fetch anyway */ }
    }
    try{
      const res = await fetch('assets/schedule.json', {cache:'no-store'});
      if(!res.ok) throw new Error('Failed to fetch schedule.json');
      const data = await res.json();
      renderSchedule(data);
      window.__scheduleData = data;
    }catch(err){
      try{
        const embedded = document.getElementById('embeddedSchedule').textContent;
        const data = JSON.parse(embedded);
        renderSchedule(data);
        window.__scheduleData = data;
      }catch(e){
        console.error('Failed to load schedule', err, e);
      }
    }
  }

  downloadPdfBtn?.addEventListener('click', ()=>{
    const preferredName = 'SAFETY  INDABA PROGRAM.pdf';
    const isFileProtocol = location.protocol === 'file:';
    const directHref = 'assets/SAFETY _INDABA_PROGRAM.pdf';
    if(isFileProtocol){
      // On file://, avoid fetch (blocked by CORS); rely on native download attribute
      const a = document.createElement('a');
      a.href = directHref;
      a.download = preferredName;
      a.target = '_self';
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(()=> a.remove(), 300);
      return;
    }
    // On http/https, fetch as blob to prevent navigation
    (async ()=>{
      try{
        const res = await fetch(encodeURI(directHref));
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = preferredName; a.target = '_self'; a.rel = 'noopener'; a.style.display = 'none';
        document.body.appendChild(a); a.click();
        setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 800);
      }catch(_e){
        alert('Could not download the PDF at assets/SAFETY _INDABA_PROGRAM.pdf');
      }
    })();
  });

  loadSchedule();
})();


