(() => {
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => [...document.querySelectorAll(q)];
  const BASE = { w: 1080, h: 1350 };
  const TEMPLATES = {
    editorial:{accent:"#e85d3f",overlay:40,title:{x:78,y:750,w:900,size:82,weight:700,color:"#ffffff",align:"left",font:"'Noto Serif KR', 'Nanum Myeongjo', serif"},body:{x:82,y:1015,w:850,size:33,weight:400,color:"#f5f1eb",align:"left",font:"'IBM Plex Sans KR', 'Noto Sans KR', sans-serif"},eyebrow:{x:82,y:105,w:700,size:23,weight:700,color:"#ff8b70",align:"left",font:"'IBM Plex Sans KR', sans-serif"}},
    bold:{accent:"#ff4d24",overlay:56,title:{x:64,y:118,w:950,size:102,weight:400,color:"#ffffff",align:"left",font:"'Black Han Sans', 'Noto Sans KR', sans-serif"},body:{x:68,y:1040,w:860,size:34,weight:700,color:"#ffffff",align:"left",font:"'Noto Sans KR', sans-serif"},eyebrow:{x:68,y:72,w:760,size:24,weight:700,color:"#ff7654",align:"left",font:"'Do Hyeon', sans-serif"}},
    clean:{accent:"#111111",overlay:16,title:{x:72,y:855,w:930,size:72,weight:600,color:"#111111",align:"left",font:"'IBM Plex Sans KR', 'Noto Sans KR', sans-serif"},body:{x:76,y:1075,w:850,size:29,weight:400,color:"#333333",align:"left",font:"'IBM Plex Sans KR', sans-serif"},eyebrow:{x:76,y:815,w:700,size:21,weight:600,color:"#777777",align:"left",font:"'IBM Plex Sans KR', sans-serif"}},
    corporate:{accent:"#3776c8",overlay:48,title:{x:72,y:690,w:900,size:74,weight:900,color:"#ffffff",align:"left",font:"'Noto Sans KR', sans-serif"},body:{x:76,y:1000,w:820,size:29,weight:400,color:"#eaf2ff",align:"left",font:"'IBM Plex Sans KR', sans-serif"},eyebrow:{x:76,y:120,w:720,size:21,weight:700,color:"#9ec9ff",align:"left",font:"'IBM Plex Sans KR', sans-serif"}},
    press:{accent:"#172033",overlay:22,title:{x:70,y:805,w:930,size:68,weight:800,color:"#172033",align:"left",font:"'Nanum Myeongjo', 'Noto Serif KR', serif"},body:{x:74,y:1045,w:860,size:27,weight:400,color:"#384152",align:"left",font:"'Noto Sans KR', sans-serif"},eyebrow:{x:74,y:115,w:760,size:20,weight:700,color:"#ffffff",align:"left",font:"'IBM Plex Sans KR', sans-serif"}},
    product:{accent:"#f0c657",overlay:48,title:{x:72,y:180,w:900,size:92,weight:400,color:"#ffffff",align:"left",font:"'Do Hyeon', 'Noto Sans KR', sans-serif"},body:{x:76,y:1050,w:840,size:31,weight:600,color:"#ffffff",align:"left",font:"'IBM Plex Sans KR', sans-serif"},eyebrow:{x:76,y:125,w:720,size:23,weight:700,color:"#f0c657",align:"left",font:"'Noto Sans KR', sans-serif"}},
    interview:{accent:"#d29b70",overlay:38,title:{x:82,y:710,w:860,size:74,weight:700,color:"#ffffff",align:"left",font:"'Gowun Batang', 'Noto Serif KR', serif"},body:{x:86,y:1010,w:820,size:29,weight:400,color:"#fff6ed",align:"left",font:"'Gowun Batang', serif"},eyebrow:{x:86,y:130,w:700,size:21,weight:700,color:"#ffd1ae",align:"left",font:"'IBM Plex Sans KR', sans-serif"}},
    stats:{accent:"#ffd338",overlay:60,title:{x:70,y:245,w:940,size:116,weight:400,color:"#111111",align:"left",font:"'Black Han Sans', 'Noto Sans KR', sans-serif"},body:{x:76,y:1020,w:840,size:31,weight:700,color:"#ffffff",align:"left",font:"'Noto Sans KR', sans-serif"},eyebrow:{x:76,y:120,w:700,size:23,weight:700,color:"#ffd338",align:"left",font:"'IBM Plex Sans KR', sans-serif"}},
    compare:{accent:"#4b82c3",overlay:42,title:{x:70,y:188,w:940,size:72,weight:700,color:"#ffffff",align:"center",font:"'IBM Plex Sans KR', 'Noto Sans KR', sans-serif"},body:{x:110,y:1040,w:860,size:29,weight:600,color:"#ffffff",align:"center",font:"'IBM Plex Sans KR', sans-serif"},eyebrow:{x:190,y:125,w:700,size:21,weight:700,color:"#b5d7ff",align:"center",font:"'IBM Plex Sans KR', sans-serif"}},
    checklist:{accent:"#58a36c",overlay:24,title:{x:78,y:245,w:900,size:74,weight:400,color:"#ffffff",align:"left",font:"'Do Hyeon', 'Noto Sans KR', sans-serif"},body:{x:150,y:885,w:740,size:31,weight:600,color:"#173222",align:"left",font:"'Noto Sans KR', sans-serif"},eyebrow:{x:82,y:130,w:720,size:21,weight:700,color:"#b9efc5",align:"left",font:"'IBM Plex Sans KR', sans-serif"}},
    qa:{accent:"#8f7cf4",overlay:50,title:{x:70,y:300,w:940,size:94,weight:400,color:"#ffffff",align:"left",font:"'Do Hyeon', 'Noto Sans KR', sans-serif"},body:{x:76,y:1010,w:850,size:30,weight:600,color:"#ffffff",align:"left",font:"'IBM Plex Sans KR', sans-serif"},eyebrow:{x:76,y:125,w:700,size:22,weight:700,color:"#d2cbff",align:"left",font:"'IBM Plex Sans KR', sans-serif"}},
    event:{accent:"#ffd23f",overlay:46,title:{x:70,y:650,w:940,size:98,weight:400,color:"#ffffff",align:"left",font:"'Black Han Sans', 'Noto Sans KR', sans-serif"},body:{x:76,y:1030,w:850,size:31,weight:700,color:"#ffffff",align:"left",font:"'Do Hyeon', 'Noto Sans KR', sans-serif"},eyebrow:{x:76,y:120,w:700,size:24,weight:700,color:"#ffd23f",align:"left",font:"'IBM Plex Sans KR', sans-serif"}},
    premium:{accent:"#c8a65b",overlay:58,title:{x:90,y:680,w:900,size:76,weight:800,color:"#fffdf7",align:"left",font:"'Nanum Myeongjo', 'Noto Serif KR', serif"},body:{x:94,y:1010,w:820,size:27,weight:400,color:"#eee3cb",align:"left",font:"'Noto Serif KR', serif"},eyebrow:{x:94,y:130,w:700,size:20,weight:700,color:"#d9be7d",align:"left",font:"'IBM Plex Sans KR', sans-serif"}},
    quote:{accent:"#c2a487",overlay:30,title:{x:110,y:390,w:860,size:70,weight:700,color:"#ffffff",align:"center",font:"'Gowun Batang', 'Noto Serif KR', serif"},body:{x:160,y:990,w:760,size:27,weight:400,color:"#f8efe7",align:"center",font:"'Gowun Batang', serif"},eyebrow:{x:190,y:260,w:700,size:21,weight:700,color:"#ead8c7",align:"center",font:"'IBM Plex Sans KR', sans-serif"}},
    magazine:{accent:"#d3473e",overlay:38,title:{x:65,y:165,w:950,size:88,weight:800,color:"#ffffff",align:"left",font:"'Nanum Myeongjo', 'Noto Serif KR', serif"},body:{x:70,y:1050,w:860,size:29,weight:600,color:"#ffffff",align:"left",font:"'IBM Plex Sans KR', sans-serif"},eyebrow:{x:70,y:110,w:720,size:20,weight:700,color:"#ff9b94",align:"left",font:"'IBM Plex Sans KR', sans-serif"}},
    announcement:{accent:"#2563eb",overlay:20,title:{x:92,y:390,w:860,size:76,weight:800,color:"#0f172a",align:"left",font:"'Noto Sans KR', sans-serif"},body:{x:96,y:720,w:830,size:30,weight:400,color:"#475569",align:"left",font:"'IBM Plex Sans KR', sans-serif"},eyebrow:{x:96,y:320,w:700,size:22,weight:700,color:"#2563eb",align:"left",font:"'IBM Plex Sans KR', sans-serif"}},
    tips:{accent:"#0f766e",overlay:18,title:{x:82,y:155,w:900,size:72,weight:800,color:"#1c1917",align:"left",font:"'Noto Sans KR', sans-serif"},body:{x:155,y:520,w:780,size:34,weight:600,color:"#292524",align:"left",font:"'IBM Plex Sans KR', sans-serif"},eyebrow:{x:82,y:105,w:700,size:20,weight:700,color:"#0f766e",align:"left",font:"'IBM Plex Sans KR', sans-serif"}},
    profile:{accent:"#a78bfa",overlay:58,title:{x:100,y:620,w:880,size:70,weight:700,color:"#ffffff",align:"center",font:"'Noto Sans KR', sans-serif"},body:{x:145,y:860,w:790,size:29,weight:400,color:"#e4e4e7",align:"center",font:"'IBM Plex Sans KR', sans-serif"},eyebrow:{x:190,y:560,w:700,size:21,weight:700,color:"#c4b5fd",align:"center",font:"'IBM Plex Sans KR', sans-serif"}},
    minimalcenter:{accent:"#0f172a",overlay:10,title:{x:120,y:520,w:840,size:74,weight:700,color:"#0f172a",align:"center",font:"'Gowun Batang', 'Noto Serif KR', serif"},body:{x:170,y:760,w:740,size:28,weight:400,color:"#64748b",align:"center",font:"'IBM Plex Sans KR', sans-serif"},eyebrow:{x:190,y:455,w:700,size:19,weight:700,color:"#94a3b8",align:"center",font:"'IBM Plex Sans KR', sans-serif"}}
  };
  const TEMPLATE_SETS = {
    business:{
      label:"기업 PR",
      cards:[
        {role:"cover",template:"editorial",variant:"full"},
        {role:"key",template:"corporate",variant:"zoom"},
        {role:"detail",template:"clean",variant:"left"},
        {role:"points",template:"announcement",variant:"blur"},
        {role:"closing",template:"premium",variant:"bottom"}
      ]
    },
    sns:{
      label:"SNS 홍보",
      cards:[
        {role:"cover",template:"bold",variant:"full"},
        {role:"problem",template:"product",variant:"zoom"},
        {role:"solution",template:"clean",variant:"right"},
        {role:"summary",template:"tips",variant:"blur"},
        {role:"cta",template:"event",variant:"bottom"}
      ]
    },
    interview:{
      label:"인터뷰",
      cards:[
        {role:"intro",template:"profile",variant:"full"},
        {role:"quote",template:"quote",variant:"face"},
        {role:"answer",template:"interview",variant:"left"},
        {role:"insight",template:"magazine",variant:"right"},
        {role:"closing",template:"minimalcenter",variant:"blur"}
      ]
    },
    event:{
      label:"이벤트",
      cards:[
        {role:"cover",template:"event",variant:"full"},
        {role:"intro",template:"bold",variant:"zoom"},
        {role:"info",template:"announcement",variant:"right"},
        {role:"benefit",template:"checklist",variant:"blur"},
        {role:"cta",template:"premium",variant:"bottom"}
      ]
    },
    compare:{
      label:"비교·체크",
      cards:[
        {role:"cover",template:"compare",variant:"full"},
        {role:"compareA",template:"stats",variant:"zoom"},
        {role:"compareB",template:"clean",variant:"left"},
        {role:"check",template:"tips",variant:"right"},
        {role:"closing",template:"minimalcenter",variant:"blur"}
      ]
    }
  };
  const state = {
    images: [], reference:null, cards:[], active:0, selected:"title", template:"editorial", templateSet:"business",
    ratio:"4:5", zoom:.7, history:[], dragging:null, originalDirection:null
  };
  const els = {
    stage:$("#cardStage"), empty:$("#emptyStage"), thumbs:$("#thumbnails"), imageList:$("#imageList"),
    direction:$("#directionInput"), count:$("#cardCount"), ratio:$("#ratioSelect"), toast:$("#toast"),
    selection:$("#selectionLabel"), zoomValue:$("#zoomValue")
  };

  const uid = () => Math.random().toString(36).slice(2,9);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const activeCard = () => state.cards[state.active];
  const ensureExtraLayers = (card) => {
    if(!card) return [];
    if(!Array.isArray(card.extraLayers)) card.extraLayers=[];
    return card.extraLayers;
  };
  const getLayer = (card,key) => card?.layers?.[key] || ensureExtraLayers(card).find(l=>l.id===key);
  const layerEntries = (card) => [
    ...["eyebrow","title","body"].map(k=>[k,card.layers[k]]),
    ...ensureExtraLayers(card).map(l=>[l.id,l])
  ];
  const toast = (msg) => { els.toast.textContent=msg; els.toast.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>els.toast.classList.remove("show"),1800); };
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const saveDraft = () => {
    try {
      const clean={...state,images:state.images.slice(0,10),history:[],dragging:null};
      localStorage.setItem("cardnews-draft",JSON.stringify(clean));
      $("#saveState").textContent="저장됨";
      setTimeout(()=>$("#saveState").textContent="이 기기에 자동 저장",1200);
    } catch { $("#saveState").textContent="용량이 커서 자동 저장 안 됨"; }
  };
  const remember = () => {
    if(!state.cards.length) return;
    state.history.push(JSON.stringify({cards:state.cards,active:state.active}));
    if(state.history.length>30) state.history.shift();
  };
  const undo = () => {
    const h=state.history.pop(); if(!h){toast("되돌릴 내용이 없습니다");return;}
    const v=JSON.parse(h); state.cards=v.cards; state.active=Math.min(v.active,state.cards.length-1); render(); saveDraft();
  };

  async function filesToImages(files){
    const list=[...files].filter(f=>f.type.startsWith("image/"));
    for(const file of list){
      const data=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});
      state.images.push({id:uid(),name:file.name,data});
    }
    renderImageList(); toast(`${list.length}장의 사진을 추가했습니다`);
  }
  function renderImageList(){
    els.imageList.innerHTML=state.images.map((im,i)=>`<div class="image-chip"><img src="${im.data}" alt="${escapeHtml(im.name)}"><button data-remove-image="${i}" aria-label="삭제">×</button></div>`).join("");
  }
  function getThemeSample(){
    if(!state.reference) return Promise.resolve(null);
    return new Promise(resolve=>{
      const img=new Image(); img.onload=()=>{
        const c=document.createElement("canvas"); c.width=c.height=20; const x=c.getContext("2d"); x.drawImage(img,0,0,20,20);
        const d=x.getImageData(0,0,20,20).data; let r=0,g=0,b=0,n=0;
        for(let i=0;i<d.length;i+=16){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
        resolve(`#${[r/n,g/n,b/n].map(v=>Math.round(v).toString(16).padStart(2,"0")).join("")}`);
      }; img.onerror=()=>resolve(null); img.src=state.reference;
    });
  }
  function smartCopy(direction,count){
    const raw=direction.trim();
    const cards=Array.from({length:count},()=>({eyebrow:"",title:"",body:""}));
    if(!raw) return cards;

    // 사용자 입력에 없는 문장을 새로 만들지 않습니다.
    // 줄바꿈/문장 단위로만 나누고, 원문은 그대로 유지합니다.
    const chunks=raw
      .split(/\n+/)
      .flatMap(line=>line.split(/(?<=[.!?。！？])\s+/))
      .map(v=>v.trim())
      .filter(Boolean);

    if(!chunks.length) return cards;
    for(let i=0;i<Math.min(count,chunks.length);i++) cards[i].title=chunks[i];

    // 카드 수보다 문장이 많을 때도 새 문구를 만들지 않고
    // 남은 원문을 마지막 카드 본문에 그대로 이어 붙입니다.
    if(chunks.length>count){
      cards[count-1].body=chunks.slice(count).join("\n");
    }
    return cards;
  }
  function imageVariantSettings(variant){
    const map={
      full:{zoom:100,x:50,y:50,blur:0},
      zoom:{zoom:145,x:50,y:38,blur:0},
      face:{zoom:170,x:50,y:28,blur:0},
      left:{zoom:128,x:30,y:50,blur:0},
      right:{zoom:128,x:70,y:50,blur:0},
      blur:{zoom:118,x:50,y:50,blur:9},
      bottom:{zoom:112,x:50,y:66,blur:0}
    };
    return map[variant]||map.full;
  }
  function buildCardSet(setName,direction,refColor){
    const set=TEMPLATE_SETS[setName]||TEMPLATE_SETS.business;
    const copy=smartCopy(direction,set.cards.length);
    const hasImages=state.images.length>0;
    return set.cards.map((config,i)=>{
      const t=TEMPLATES[config.template]||TEMPLATES.editorial;
      const img=hasImages?state.images[i%state.images.length]:null;
      const v=imageVariantSettings(config.variant);
      return {
        id:uid(), role:config.role, template:config.template,
        image:img?.data||"", name:img?.name||"",
        imageVariant:config.variant, imageZoom:v.zoom, imageX:v.x, imageY:v.y, imageBlur:v.blur,
        overlay:t.overlay, accent:refColor||t.accent,
        layers:{
          eyebrow:{...clone(t.eyebrow),text:copy[i]?.eyebrow||""},
          title:{...clone(t.title),text:copy[i]?.title||""},
          body:{...clone(t.body),text:copy[i]?.body||""}
        },
        extraLayers:[]
      };
    });
  }

  function polishDirection(){
    const input=els.direction.value.trim();
    if(!input){toast("다듬을 문장을 입력해주세요");els.direction.focus();return;}
    if(!state.originalDirection) state.originalDirection=input;

    const tone=$("#toneSelect").value;
    const toneWordMap={
      premium:[
        [/있어\s*보이게/g,"세련되게"],
        [/예쁘게/g,"정돈되고 세련되게"],
        [/멋있게/g,"완성도 높게"]
      ],
      press:[
        [/부드럽게/g,"간결하고 명확하게"],
        [/쉽게/g,"명확하게"]
      ],
      social:[
        [/딱딱하지\s*않게/g,"친근하고 자연스럽게"],
        [/어렵지\s*않게/g,"쉽고 자연스럽게"]
      ],
      bold:[
        [/길지\s*않게/g,"짧고 강하게"],
        [/간단하게/g,"짧고 명확하게"]
      ],
      warm:[
        [/친근하게/g,"따뜻하고 자연스럽게"],
        [/부드럽게/g,"따뜻하고 부드럽게"]
      ]
    };

    let polished=input
      .replace(/\r\n?/g,"\n")
      .split("\n")
      .map(line=>line
        .trim()
        .replace(/[ \t]+/g," ")
        .replace(/\s+([,.!?])/g,"$1")
        .replace(/([,.!?]){2,}/g,"$1")
        .replace(/ai/gi,"AI")
        .replace(/해\s*줘/g,"해주세요")
        .replace(/만들어\s*줘/g,"만들어주세요")
        .replace(/써\s*줘/g,"작성해주세요")
        .replace(/보여\s*줘/g,"보여주세요")
        .replace(/알려\s*줘/g,"알려주세요")
        .replace(/정리해\s*줘/g,"정리해주세요")
        .replace(/해야합니다/g,"해야 합니다")
        .replace(/해야돼/g,"해야 합니다")
        .replace(/하고싶/g,"하고 싶")
      )
      .filter(Boolean)
      .join("\n");

    for(const [pattern,value] of (toneWordMap[tone]||[])) polished=polished.replace(pattern,value);

    // 문장의 핵심 내용은 그대로 두고 반복되는 조사/표현만 정리합니다.
    polished=polished
      .replace(/내용을를/g,"내용을")
      .replace(/([은는이가을를])\1+/g,"$1")
      .replace(/\s+$/gm,"")
      .trim();

    if(polished===input){
      toast("문장 내용은 유지하고 띄어쓰기와 표현을 정리했습니다");
    }else{
      toast("입력한 내용을 유지하면서 문장을 다듬었습니다");
    }
    els.direction.value=polished;
    $("#restoreDirection").hidden=false;
    saveDraft();
  }
  function restoreDirection(){
    if(!state.originalDirection)return;
    els.direction.value=state.originalDirection;state.originalDirection=null;$("#restoreDirection").hidden=true;
    toast("원래 문장으로 되돌렸습니다");
  }
  async function generate(){
    remember();
    const refColor=await getThemeSample();
    const set=TEMPLATE_SETS[state.templateSet]||TEMPLATE_SETS.business;
    state.cards=buildCardSet(state.templateSet,els.direction.value,refColor);
    state.template=set.cards[0].template;
    state.active=0; state.selected="title";
    render(); saveDraft();
    toast(state.images.length?set.label+" 5장 · 이미지 베리에이션 완료":set.label+" 5장 · 텍스트 전용으로 생성");
  }
  function ratioSize(){
    if(state.ratio==="1:1") return {w:1080,h:1080};
    if(state.ratio==="9:16") return {w:1080,h:1920};
    return BASE;
  }
  function stageDisplaySize(){
    const r=ratioSize(), width=432; return {w:width,h:Math.round(width*r.h/r.w),scale:width/r.w};
  }
  function templateOverlay(card){
    const a=Math.min(.9,card.overlay/100+.25);
    const map={
      clean:"linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.96) 62%)",
      corporate:"linear-gradient(90deg,rgba(6,25,50,.18),rgba(6,25,50,.72))",
      press:"linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.22) 57%,rgba(255,255,255,0) 58%)",
      product:"linear-gradient(180deg,rgba(8,12,20,.42),rgba(8,12,20,.72))",
      interview:"linear-gradient(90deg,rgba(40,20,8,.2),rgba(20,10,4,.62))",
      stats:"linear-gradient(180deg,rgba(0,0,0,.42),rgba(0,0,0,.72))",
      compare:"linear-gradient(90deg,rgba(255,255,255,.10) 0 50%,rgba(0,0,0,.48) 50% 100%)",
      checklist:"linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.48) 58%,rgba(255,255,255,0) 59%)",
      qa:"linear-gradient(145deg,rgba(30,20,70,.28),rgba(30,20,70,.72))",
      event:"linear-gradient(180deg,rgba(65,15,5,.18),rgba(65,15,5,.68))",
      premium:"linear-gradient(180deg,rgba(0,0,0,.28),rgba(0,0,0,.78))",
      quote:"linear-gradient(180deg,rgba(35,25,20,.22),rgba(35,25,20,.64))",
      magazine:"linear-gradient(180deg,rgba(0,0,0,.16),rgba(0,0,0,.68))",
      announcement:"linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.10))",
      tips:"linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.18))",
      profile:"linear-gradient(180deg,rgba(9,9,15,.28),rgba(9,9,15,.78))",
      minimalcenter:"linear-gradient(180deg,rgba(255,255,255,.18),rgba(255,255,255,.40))"
    };
    return map[card.template]||`linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,${a}))`;
  }
  function templateDecorHtml(card,s){
    const A=card.accent;
    const box=(cls,x,y,w,h,style="")=>`<div class="template-decor ${cls}" style="left:${x*s}px;top:${y*s}px;width:${w*s}px;height:${h*s}px;${style}"></div>`;
    switch(card.template){
      case "corporate": return box("decor-panel",700,0,380,1350,`background:${A};opacity:.24`)+box("decor-line",72,642,260,8,`background:${A}`);
      case "press": return box("decor-paper",0,770,1080,580,"background:rgba(255,255,255,.96)")+box("decor-line",70,770,220,10,`background:${A}`);
      case "product": return box("decor-circle",760,110,220,220,`background:${A};border-radius:50%;opacity:.92`)+box("decor-panel",0,1160,1080,190,"background:rgba(8,12,20,.78)");
      case "interview": return box("decor-panel",0,0,175,1350,`background:${A};opacity:.5`)+`<div class="template-decor decor-symbol" style="left:${720*s}px;top:${500*s}px;font-size:${220*s}px;color:${A};opacity:.72">“</div>`;
      case "stats": return box("decor-panel",0,155,1080,365,`background:${A};opacity:.92`)+`<div class="template-decor decor-symbol" style="right:${55*s}px;top:${170*s}px;font-size:${80*s}px;color:#111;font-weight:900">%</div>`;
      case "compare": return box("decor-panel",0,480,535,520,"background:rgba(255,255,255,.18);border-right:2px solid rgba(255,255,255,.8)")+box("decor-panel",545,480,535,520,"background:rgba(5,18,38,.25)");
      case "checklist": return box("decor-paper",55,810,970,455,"background:rgba(255,255,255,.95);border-radius:28px")+[0,1,2].map(i=>box("decor-check",92,870+i*100,42,42,`border:4px solid ${A};border-radius:8px`)).join("");
      case "qa": return `<div class="template-decor decor-badge" style="left:${65*s}px;top:${535*s}px;width:${150*s}px;height:${150*s}px;background:${A};font-size:${88*s}px">Q</div><div class="template-decor decor-badge" style="right:${70*s}px;top:${790*s}px;width:${120*s}px;height:${120*s}px;background:#fff;color:#5d4fd2;font-size:${68*s}px">A</div>`;
      case "event": return box("decor-ribbon",700,-120,230,600,`background:${A};transform:rotate(35deg);opacity:.86`)+box("decor-frame",42,42,996,1266,`border:5px solid ${A};border-radius:24px`);
      case "premium": return box("decor-frame",48,48,984,1254,`border:3px solid ${A};border-radius:6px`)+box("decor-line",90,650,180,3,`background:${A}`);
      case "quote": return `<div class="template-decor decor-symbol" style="left:${70*s}px;top:${280*s}px;font-size:${300*s}px;color:${A};opacity:.8">“</div>`+box("decor-line",390,930,300,3,`background:${A}`);
      case "magazine": return box("decor-panel",0,0,1080,86,`background:${A};opacity:.94`)+box("decor-frame",38,105,1004,1190,"border:3px solid rgba(255,255,255,.75)")+ `<div class="template-decor decor-kicker" style="right:${55*s}px;top:${28*s}px;font-size:${22*s}px">JB MAGAZINE</div>`;
      case "announcement": return box("decor-paper",55,260,970,820,"background:rgba(255,255,255,.96);border-radius:12px")+box("decor-line",55,260,12,820,`background:${A}`)+box("decor-line",95,350,150,6,`background:${A}`);
      case "tips": return box("decor-paper",45,70,990,1205,"background:rgba(250,250,249,.94);border-radius:24px")+[0,1,2].map(i=>`<div class="template-decor decor-tip-number" style="left:${82*s}px;top:${(560+i*120)*s}px;width:${54*s}px;height:${54*s}px;background:${A};font-size:${25*s}px">${i+1}</div>`).join("");
      case "profile": return box("decor-panel",90,500,900,620,"background:rgba(24,24,27,.82);border-radius:36px")+box("decor-ring",390,180,300,300,`border:8px solid ${A};border-radius:50%;box-shadow:0 0 0 16px rgba(255,255,255,.08)`);
      case "minimalcenter": return box("decor-paper",85,360,910,590,"background:rgba(248,250,252,.95);border-radius:18px")+box("decor-line",390,900,300,3,`background:${A};opacity:.35`);
      default:return "";
    }
  }
  function render(){
    const card=activeCard(); const ds=stageDisplaySize();
    els.stage.style.width=ds.w+"px"; els.stage.style.height=ds.h+"px";
    if(!card){els.stage.innerHTML="";els.stage.appendChild(els.empty);els.empty.hidden=false;els.thumbs.innerHTML="";syncControls();return;}
    els.empty.hidden=true;
    els.stage.innerHTML=`
      <div class="stage-bg ${card.image?"":"text-only"}" style="${card.image?`background-image:url('${card.image}');background-position:${card.imageX??50}% ${card.imageY??50}%;transform:scale(${(card.imageZoom??100)/100});filter:blur(${card.imageBlur??0}px)`:`background:${["clean","press","announcement","tips","minimalcenter"].includes(card.template)?"#f4f1e9":"#172033"}`}"></div>
      <div class="stage-overlay" style="background:${templateOverlay(card)}"></div>
      ${templateDecorHtml(card,ds.scale)}
      ${layerEntries(card).map(([k,l])=>layerHtml(k,l,ds.scale)).join("")}
    `;
    bindLayers();
    els.thumbs.innerHTML=state.cards.map((c,i)=>`<button class="thumb ${i===state.active?"active":""}" data-card="${i}">${c.image?`<i class="thumb-image" style="background-image:url(\'${c.image}\');background-position:${c.imageX??50}% ${c.imageY??50}%;transform:scale(${Math.max(1,(c.imageZoom??100)/120)});filter:blur(${Math.min(2,c.imageBlur??0)}px)"></i>`:`<i class="thumb-text-only" style="background:${["clean","press","announcement","tips","minimalcenter"].includes(c.template)?"#f4f1e9":"#172033"}"></i>`}<span>${i+1}</span></button>`).join("");
    syncControls();
  }
  function layerHtml(key,l,s){
    if(!l?.text?.trim()) return "";
    return `<div class="text-layer ${state.selected===key?"selected":""}" data-layer="${key}" tabindex="0" style="left:${l.x*s}px;top:${l.y*s}px;width:${l.w*s}px;font-size:${l.size*s}px;font-weight:${l.weight};color:${l.color};text-align:${l.align};font-family:${l.font}">${escapeHtml(l.text)}</div>`;
  }
  function bindLayers(){
    $$(".text-layer").forEach(el=>{
      el.addEventListener("pointerdown",e=>{
        const key=el.dataset.layer; state.selected=key; $$(".text-layer").forEach(x=>x.classList.toggle("selected",x===el));
        syncControls();
        if(el.getAttribute("contenteditable")==="true") return;
        remember(); const l=getLayer(activeCard(),key); if(!l)return; state.dragging={key,sx:e.clientX,sy:e.clientY,x:l.x,y:l.y}; el.setPointerCapture(e.pointerId);
      });
      el.addEventListener("pointermove",e=>{
        if(!state.dragging||state.dragging.key!==el.dataset.layer) return;
        const ds=stageDisplaySize(); const l=getLayer(activeCard(),state.dragging.key); if(!l)return;
        l.x=Math.max(0,Math.min(ratioSize().w-l.w,state.dragging.x+(e.clientX-state.dragging.sx)/ds.scale));
        l.y=Math.max(0,Math.min(ratioSize().h-60,state.dragging.y+(e.clientY-state.dragging.sy)/ds.scale));
        el.style.left=l.x*ds.scale+"px";el.style.top=l.y*ds.scale+"px";
      });
      el.addEventListener("pointerup",()=>{if(state.dragging){state.dragging=null;saveDraft();}});
      el.addEventListener("dblclick",()=>{el.setAttribute("contenteditable","true");el.focus();document.execCommand("selectAll",false,null);});
      el.addEventListener("keydown",e=>{
        if(el.getAttribute("contenteditable")!=="true") return;
        // Enter/Shift+Enter는 줄바꿈으로 사용합니다.
        // Ctrl(또는 Cmd)+Enter, Esc로 편집을 끝낼 수 있습니다.
        if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();el.blur();}
        else if(e.key==="Escape"){e.preventDefault();el.blur();}
      });
      el.addEventListener("blur",()=>{if(el.getAttribute("contenteditable")==="true"){const l=getLayer(activeCard(),el.dataset.layer); if(l)l.text=el.innerText.trim();el.removeAttribute("contenteditable");saveDraft();render();}});
      el.addEventListener("click",()=>{state.selected=el.dataset.layer;syncControls();});
    });
  }
  function syncControls(){
    const c=activeCard(), l=getLayer(c,state.selected);
    const label={title:"제목",body:"본문",eyebrow:"상단 문구"}[state.selected]||"추가 텍스트";
    els.selection.textContent=l?(label+" 선택됨"):"텍스트를 선택하세요";
    if(l){$("#fontFamily").value=l.font;$("#fontSize").value=l.size;$("#fontWeight").value=String(l.weight);$("#fontColor").value=l.color;$$(".align-buttons button").forEach(b=>b.classList.toggle("active",b.dataset.align===l.align));}
    if(c){$("#imageZoom").value=c.imageZoom??100;$("#imageX").value=c.imageX??50;$("#imageY").value=c.imageY??50;$("#imageBlur").value=c.imageBlur??0;$("#imageZoom").disabled=!c.image;$("#imageX").disabled=!c.image;$("#imageY").disabled=!c.image;$("#imageBlur").disabled=!c.image;$("#overlayStrength").value=c.overlay;$("#accentColor").value=c.accent;$$(".template").forEach(b=>b.classList.toggle("active",b.dataset.template===c.template));} $$(".card-set").forEach(b=>b.classList.toggle("active",b.dataset.set===state.templateSet));
    els.zoomValue.textContent=Math.round(state.zoom*100)+"%";
    $("#stageScaler").style.transform=`scale(${state.zoom/.7})`;
  }
  function updateLayer(prop,value){
    const c=activeCard(); if(!c)return; const l=getLayer(c,state.selected); if(!l)return; remember(); l[prop]=value; render();saveDraft();
  }
  async function loadLocalFonts(){
    const status=$("#localFontStatus"), button=$("#loadLocalFonts");
    if(!("queryLocalFonts" in window)){
      status.textContent="이 기능은 PC용 Chrome 또는 Edge에서 사용할 수 있습니다.";
      status.className="local-font-status error";
      return;
    }
    try{
      button.disabled=true;button.textContent="폰트 확인 중…";
      const fonts=await window.queryLocalFonts();
      const families=[...new Set(fonts.map(f=>f.family).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"ko"));
      const sandoll=families.filter(n=>/sandoll|산돌|호요요|sd\s/i.test(n));
      const others=families.filter(n=>!sandoll.includes(n));
      const select=$("#fontFamily");
      select.querySelectorAll("optgroup[data-local]").forEach(g=>g.remove());
      const addGroup=(label,items)=>{
        if(!items.length)return;
        const group=document.createElement("optgroup");group.label=label;group.dataset.local="true";
        items.forEach(name=>{const option=document.createElement("option");option.value=`"${name}", sans-serif`;option.textContent=name;group.appendChild(option);});
        select.appendChild(group);
      };
      addGroup(`산돌 폰트 (${sandoll.length})`,sandoll);
      addGroup(`내 PC 폰트 (${others.length})`,others);
      status.textContent=sandoll.length?`산돌 폰트 ${sandoll.length}개를 포함해 총 ${families.length}개를 불러왔습니다.`:`총 ${families.length}개를 불러왔습니다. 산돌구름에서 폰트를 먼저 활성화하면 산돌 폰트도 표시됩니다.`;
      status.className="local-font-status success";
      button.textContent="폰트 목록 새로고침";
      toast("내 PC 폰트를 불러왔습니다");
    }catch(err){
      status.textContent=err?.name==="NotAllowedError"?"폰트 접근을 허용해야 목록을 불러올 수 있습니다.":"폰트 목록을 불러오지 못했습니다.";
      status.className="local-font-status error";button.textContent="다시 불러오기";
    }finally{button.disabled=false;}
  }
  function addTextLayer(){
    const c=activeCard(); if(!c){toast("카드를 먼저 만들어주세요");return;}
    remember();
    const t=TEMPLATES[c.template]||TEMPLATES.editorial;
    const id="extra-"+uid();
    const darkText=["clean","press","tips","announcement","minimalcenter"].includes(c.template);
    const layer={id,text:"새 텍스트",x:140,y:620,w:800,size:48,weight:600,color:darkText?"#172033":"#ffffff",align:"center",font:t.body.font};
    ensureExtraLayers(c).push(layer); state.selected=id; render(); saveDraft(); toast("텍스트를 추가했습니다");
    requestAnimationFrame(()=>{const el=document.querySelector(`[data-layer="${id}"]`);if(el){el.setAttribute("contenteditable","true");el.focus();document.execCommand("selectAll",false,null);}});
  }
  function applyTemplate(name){
    const t=TEMPLATES[name]; if(!t)return;
    state.template=name;
    $$(".template").forEach(b=>b.classList.toggle("active",b.dataset.template===name));
    const c=activeCard();if(!c)return;
    remember();

    // 템플릿은 디자인만 바꾸고, 사용자가 작성한 문구는 절대 덮어쓰지 않습니다.
    const existingText={
      eyebrow:c.layers?.eyebrow?.text??"",
      title:c.layers?.title?.text??"",
      body:c.layers?.body?.text??""
    };
    c.template=name;c.overlay=t.overlay;c.accent=t.accent;
    for(const k of ["eyebrow","title","body"]) c.layers[k]={...clone(t[k]),text:existingText[k]};

    render();saveDraft();toast("글은 그대로 두고 디자인만 바꿨습니다");
  }
  function addPage(){
    remember(); const prev=activeCard(); const t=TEMPLATES[state.template];
    state.cards.push(prev?{...clone(prev),id:uid()}:{id:uid(),image:state.images[0]?.data||"",name:state.images[0]?.name||"",template:state.template,overlay:t.overlay,imageZoom:100,imageX:50,imageY:50,imageBlur:0,accent:t.accent,layers:{eyebrow:{...clone(t.eyebrow),text:""},title:{...clone(t.title),text:""},body:{...clone(t.body),text:""}}});
    state.active=state.cards.length-1;render();saveDraft();
  }
  function duplicatePage(){if(!activeCard())return;remember();state.cards.splice(state.active+1,0,{...clone(activeCard()),id:uid()});state.active++;render();saveDraft();toast("카드를 복제했습니다");}
  function deletePage(){if(!activeCard())return;if(state.cards.length===1){toast("카드는 한 장 이상 필요합니다");return;}remember();state.cards.splice(state.active,1);state.active=Math.max(0,state.active-1);render();saveDraft();}

  function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});}
  function wrapLines(ctx,text,maxWidth){
    const paragraphs=String(text).split("\n"), lines=[];
    for(const p of paragraphs){let line="";for(const ch of p){const test=line+ch;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=ch;}else line=test;}lines.push(line||" ");}
    return lines;
  }
  function roundRectFill(ctx,x,y,w,h,r,fill,stroke=null,lineWidth=1){ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}ctx.restore();}
  function drawTemplateDecor(ctx,card,sz){
    const sx=sz.w/1080, sy=sz.h/1350, X=v=>v*sx, Y=v=>v*sy, A=card.accent;
    ctx.save();
    if(card.template==="corporate"){ctx.globalAlpha=.24;ctx.fillStyle=A;ctx.fillRect(X(700),0,X(380),sz.h);ctx.globalAlpha=1;ctx.fillRect(X(72),Y(642),X(260),Y(8));}
    else if(card.template==="press"){ctx.fillStyle="rgba(255,255,255,.96)";ctx.fillRect(0,Y(770),sz.w,sz.h-Y(770));ctx.fillStyle=A;ctx.fillRect(X(70),Y(770),X(220),Y(10));}
    else if(card.template==="product"){ctx.fillStyle=A;ctx.globalAlpha=.92;ctx.beginPath();ctx.arc(X(870),Y(220),X(110),0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle="rgba(8,12,20,.78)";ctx.fillRect(0,Y(1160),sz.w,Y(190));}
    else if(card.template==="interview"){ctx.globalAlpha=.5;ctx.fillStyle=A;ctx.fillRect(0,0,X(175),sz.h);ctx.globalAlpha=.72;ctx.fillStyle=A;ctx.font=`${Y(220)}px Georgia`;ctx.fillText("“",X(720),Y(500));}
    else if(card.template==="stats"){ctx.globalAlpha=.92;ctx.fillStyle=A;ctx.fillRect(0,Y(155),sz.w,Y(365));ctx.globalAlpha=1;ctx.fillStyle="#111";ctx.font=`900 ${Y(80)}px Arial`;ctx.fillText("%",X(950),Y(175));}
    else if(card.template==="compare"){ctx.fillStyle="rgba(255,255,255,.18)";ctx.fillRect(0,Y(480),X(535),Y(520));ctx.fillStyle="rgba(5,18,38,.25)";ctx.fillRect(X(545),Y(480),X(535),Y(520));ctx.fillStyle="rgba(255,255,255,.8)";ctx.fillRect(X(539),Y(480),X(2),Y(520));}
    else if(card.template==="checklist"){roundRectFill(ctx,X(55),Y(810),X(970),Y(455),X(28),"rgba(255,255,255,.95)");for(let i=0;i<3;i++)roundRectFill(ctx,X(92),Y(870+i*100),X(42),Y(42),X(8),"rgba(255,255,255,0)",A,X(4));}
    else if(card.template==="qa"){roundRectFill(ctx,X(65),Y(535),X(150),Y(150),X(75),A);ctx.fillStyle="#fff";ctx.font=`800 ${Y(88)}px Arial`;ctx.fillText("Q",X(105),Y(565));roundRectFill(ctx,X(890),Y(790),X(120),Y(120),X(60),"#fff");ctx.fillStyle="#5d4fd2";ctx.font=`800 ${Y(68)}px Arial`;ctx.fillText("A",X(930),Y(815));}
    else if(card.template==="event"){ctx.translate(X(815),Y(180));ctx.rotate(35*Math.PI/180);ctx.globalAlpha=.86;ctx.fillStyle=A;ctx.fillRect(X(-115),Y(-300),X(230),Y(600));ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.strokeStyle=A;ctx.lineWidth=X(5);ctx.strokeRect(X(42),Y(42),X(996),Y(1266));}
    else if(card.template==="premium"){ctx.strokeStyle=A;ctx.lineWidth=X(3);ctx.strokeRect(X(48),Y(48),X(984),Y(1254));ctx.fillStyle=A;ctx.fillRect(X(90),Y(650),X(180),Y(3));}
    else if(card.template==="quote"){ctx.globalAlpha=.8;ctx.fillStyle=A;ctx.font=`${Y(300)}px Georgia`;ctx.fillText("“",X(70),Y(280));ctx.globalAlpha=1;ctx.fillRect(X(390),Y(930),X(300),Y(3));}
    else if(card.template==="magazine"){ctx.globalAlpha=.94;ctx.fillStyle=A;ctx.fillRect(0,0,sz.w,Y(86));ctx.globalAlpha=1;ctx.strokeStyle="rgba(255,255,255,.75)";ctx.lineWidth=X(3);ctx.strokeRect(X(38),Y(105),X(1004),Y(1190));ctx.fillStyle="#fff";ctx.font=`700 ${Y(22)}px Arial`;ctx.textAlign="right";ctx.fillText("JB MAGAZINE",X(1025),Y(34));}
    else if(card.template==="announcement"){roundRectFill(ctx,X(55),Y(260),X(970),Y(820),X(12),"rgba(255,255,255,.96)");ctx.fillStyle=A;ctx.fillRect(X(55),Y(260),X(12),Y(820));ctx.fillRect(X(95),Y(350),X(150),Y(6));}
    else if(card.template==="tips"){roundRectFill(ctx,X(45),Y(70),X(990),Y(1205),X(24),"rgba(250,250,249,.94)");for(let i=0;i<3;i++){roundRectFill(ctx,X(82),Y(560+i*120),X(54),Y(54),X(27),A);ctx.fillStyle="#fff";ctx.font=`700 ${Y(25)}px Arial`;ctx.textAlign="center";ctx.fillText(String(i+1),X(109),Y(573+i*120));}}
    else if(card.template==="profile"){roundRectFill(ctx,X(90),Y(500),X(900),Y(620),X(36),"rgba(24,24,27,.82)");ctx.strokeStyle=A;ctx.lineWidth=X(8);ctx.beginPath();ctx.arc(X(540),Y(330),X(150),0,Math.PI*2);ctx.stroke();}
    else if(card.template==="minimalcenter"){roundRectFill(ctx,X(85),Y(360),X(910),Y(590),X(18),"rgba(248,250,252,.95)");ctx.globalAlpha=.35;ctx.fillStyle=A;ctx.fillRect(X(390),Y(900),X(300),Y(3));ctx.globalAlpha=1;}
    ctx.restore();
  }
  async function cardToBlob(card){
    if(document.fonts?.ready) await document.fonts.ready;
    const sz=ratioSize(), canvas=document.createElement("canvas");canvas.width=sz.w;canvas.height=sz.h;const ctx=canvas.getContext("2d");
    if(card.image){
      const img=await loadImage(card.image); const scale=Math.max(sz.w/img.width,sz.h/img.height)*((card.imageZoom??100)/100);const w=img.width*scale,h=img.height*scale;const px=(card.imageX??50)/100,py=(card.imageY??50)/100;const dx=(sz.w-w)*px,dy=(sz.h-h)*py;ctx.save();ctx.filter=(card.imageBlur??0)>0?`blur(${card.imageBlur}px)`:"none";ctx.drawImage(img,dx,dy,w,h);ctx.restore();
    }else{
      ctx.fillStyle=["clean","press","announcement","tips","minimalcenter"].includes(card.template)?"#f4f1e9":"#172033";ctx.fillRect(0,0,sz.w,sz.h);
    }
    const grad=ctx.createLinearGradient(0,0,0,sz.h);
    if(card.template==="clean"){grad.addColorStop(0,"rgba(255,255,255,0)");grad.addColorStop(.58,"rgba(255,255,255,0)");grad.addColorStop(1,"rgba(255,255,255,.98)");}
    else if(card.template==="press"||card.template==="checklist"){grad.addColorStop(0,"rgba(0,0,0,.10)");grad.addColorStop(.56,"rgba(0,0,0,.30)");grad.addColorStop(.57,"rgba(0,0,0,0)");grad.addColorStop(1,"rgba(0,0,0,0)");}
    else{grad.addColorStop(0,"rgba(0,0,0,.08)");grad.addColorStop(1,`rgba(0,0,0,${Math.min(.9,card.overlay/100+.25)})`);}
    if(card.image){ctx.fillStyle=grad;ctx.fillRect(0,0,sz.w,sz.h);}drawTemplateDecor(ctx,card,sz);
    ctx.fillStyle=card.accent;ctx.fillRect(0,0,14,sz.h);
    for(const [key,l] of layerEntries(card)){if(!l?.text?.trim())continue;ctx.save();ctx.fillStyle=l.color;ctx.font=`${l.weight} ${l.size}px ${l.font}`;ctx.textAlign=l.align;ctx.textBaseline="top";const lines=wrapLines(ctx,l.text,l.w);const x=l.align==="center"?l.x+l.w/2:l.align==="right"?l.x+l.w:l.x;lines.forEach((line,i)=>ctx.fillText(line,x,l.y+i*l.size*1.22));ctx.restore();}
    return new Promise(res=>canvas.toBlob(res,"image/png",1));
  }
  async function downloadCurrent(){
    const c=activeCard();if(!c)return;toast("PNG를 만드는 중입니다");const b=await cardToBlob(c);downloadBlob(b,`cardnews-${String(state.active+1).padStart(2,"0")}.png`);
  }
  function downloadBlob(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000);}
  const crcTable=(()=>{let t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
  function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
  function u16(n){return [n&255,(n>>>8)&255]} function u32(n){return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]}
  function makeZip(files){
    const enc=new TextEncoder(), local=[], central=[];let offset=0;
    files.forEach(f=>{const name=enc.encode(f.name),data=f.data,crc=crc32(data);const lh=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...name]);local.push(lh,data);const ch=new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset),...name]);central.push(ch);offset+=lh.length+data.length;});
    const csize=central.reduce((n,a)=>n+a.length,0);const end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(csize),...u32(offset),...u16(0)]);return new Blob([...local,...central,end],{type:"application/zip"});
  }
  async function downloadAll(){
    if(!state.cards.length)return;toast("전체 카드를 ZIP으로 만드는 중입니다");
    const files=[];for(let i=0;i<state.cards.length;i++){const b=await cardToBlob(state.cards[i]);files.push({name:`cardnews-${String(i+1).padStart(2,"0")}.png`,data:new Uint8Array(await b.arrayBuffer())});}
    downloadBlob(makeZip(files),"cardnews-all.zip");toast("ZIP 저장을 시작했습니다");
  }

  $("#imageInput").addEventListener("change",e=>filesToImages(e.target.files));
  $("#dropzone").addEventListener("dragover",e=>{e.preventDefault();e.currentTarget.classList.add("drag")});
  $("#dropzone").addEventListener("dragleave",e=>e.currentTarget.classList.remove("drag"));
  $("#dropzone").addEventListener("drop",e=>{e.preventDefault();e.currentTarget.classList.remove("drag");filesToImages(e.dataTransfer.files)});
  els.imageList.addEventListener("click",e=>{const i=e.target.dataset.removeImage;if(i!==undefined){state.images.splice(Number(i),1);renderImageList();}});
  $("#referenceInput").addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{state.reference=r.result;$("#referencePreview").src=r.result;$("#referencePreview").hidden=false;$("#referenceText").hidden=true;};r.readAsDataURL(f);});
  $("#generateBtn").addEventListener("click",generate);$("#undoBtn").addEventListener("click",undo);
  $$(".card-set").forEach(button=>button.addEventListener("click",async()=>{
    state.templateSet=button.dataset.set;
    $$(".card-set").forEach(b=>b.classList.toggle("active",b===button));
    await generate();
  }));
  $("#polishDirection").addEventListener("click",polishDirection);$("#restoreDirection").addEventListener("click",restoreDirection);
  $("#fontFamily").addEventListener("change",e=>updateLayer("font",e.target.value));$("#fontSize").addEventListener("change",e=>updateLayer("size",Number(e.target.value)));$("#fontWeight").addEventListener("change",e=>updateLayer("weight",Number(e.target.value)));$("#fontColor").addEventListener("input",e=>updateLayer("color",e.target.value));
  $("#loadLocalFonts").addEventListener("click",loadLocalFonts);
  $("#addTextLayer").addEventListener("click",addTextLayer);
  $$(".align-buttons button").forEach(b=>b.addEventListener("click",()=>updateLayer("align",b.dataset.align)));
  $$(".template").forEach(b=>b.addEventListener("click",()=>applyTemplate(b.dataset.template)));
  $$(".template-filter button").forEach(button=>button.addEventListener("click",()=>{
    const filter=button.dataset.templateFilter;
    $$(".template-filter button").forEach(b=>b.classList.toggle("active",b===button));
    $$(".template").forEach(card=>card.hidden=filter!=="all"&&card.dataset.category!==filter);
  }));
  $("#imageZoom").addEventListener("input",e=>{if(activeCard()){activeCard().imageZoom=Number(e.target.value);render();}});
  $("#imageX").addEventListener("input",e=>{if(activeCard()){activeCard().imageX=Number(e.target.value);render();}});
  $("#imageY").addEventListener("input",e=>{if(activeCard()){activeCard().imageY=Number(e.target.value);render();}});
  $("#imageBlur").addEventListener("input",e=>{if(activeCard()){activeCard().imageBlur=Number(e.target.value);render();}});
  $("#overlayStrength").addEventListener("input",e=>{if(activeCard()){activeCard().overlay=Number(e.target.value);render();}});
  $("#accentColor").addEventListener("input",e=>{if(activeCard()){activeCard().accent=e.target.value;render();}});
  $("#ratioSelect").addEventListener("change",e=>{state.ratio=e.target.value;render();saveDraft();});
  els.thumbs.addEventListener("click",e=>{const b=e.target.closest("[data-card]");if(b){state.active=Number(b.dataset.card);render();}});
  $("#addPage").addEventListener("click",addPage);$("#duplicatePage").addEventListener("click",duplicatePage);$("#deletePage").addEventListener("click",deletePage);
  $("#prevPage").addEventListener("click",()=>{if(state.cards.length){state.active=(state.active-1+state.cards.length)%state.cards.length;render();}});
  $("#nextPage").addEventListener("click",()=>{if(state.cards.length){state.active=(state.active+1)%state.cards.length;render();}});
  $("#zoomOut").addEventListener("click",()=>{state.zoom=Math.max(.4,state.zoom-.1);syncControls();});$("#zoomIn").addEventListener("click",()=>{state.zoom=Math.min(1,state.zoom+.1);syncControls();});
  $("#downloadPageBtn").addEventListener("click",downloadCurrent);$("#downloadAllBtn").addEventListener("click",downloadAll);

  window.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();undo();}});
  if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js?v=20260922-set5a",{updateViaCache:"none"}).then(r=>r.update()).catch(()=>{});
  try{const draft=JSON.parse(localStorage.getItem("cardnews-draft"));if(draft?.cards?.length){Object.assign(state,draft,{history:[],dragging:null});if(!TEMPLATE_SETS[state.templateSet])state.templateSet="business";renderImageList();$("#ratioSelect").value=state.ratio;toast("지난 작업을 불러왔습니다");}}catch{}
  render();

  if(document.modelContext?.registerTool){
    const lifecycle=new AbortController();
    Promise.resolve(document.modelContext.registerTool({
      name:"generate_card_news",title:"카드뉴스 자동 구성",description:"현재 입력된 방향성과 업로드된 이미지로 편집 가능한 카드 세트를 구성합니다.",
      inputSchema:{type:"object",properties:{direction:{type:"string"},set:{type:"string",enum:["business","sns","interview","event","compare"]}},required:["direction"],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      async execute(input){els.direction.value=input.direction;if(input.set&&TEMPLATE_SETS[input.set])state.templateSet=input.set;await generate();return{count:state.cards.length,set:state.templateSet,status:"generated"};}
    },{signal:lifecycle.signal})).catch(()=>{});
  }
})();
