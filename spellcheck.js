(() => {
  const input = document.querySelector("#directionInput");
  const checkButton = document.querySelector("#spellCheckBtn");
  const panel = document.querySelector("#spellPanel");
  const status = document.querySelector("#spellStatus");
  const list = document.querySelector("#spellResults");
  const applyAllButton = document.querySelector("#spellApplyAll");
  const restoreButton = document.querySelector("#spellRestore");
  if (!input || !checkButton || !panel || !status || !list || !applyAllButton || !restoreButton) return;

  // Lightweight browser adaptation of safe/review examples from the
  // GeulLint public rule catalog (MIT). This is not the full WASM engine.
  const RULES = [
    ["grammar.conjugation.doe-to-dwae","되서","돼서","‘되서’는 ‘돼서’로 씁니다.",true],
    ["grammar.conjugation.doe-to-dwae","되요","돼요","‘되요’는 ‘돼요’로 씁니다.",true],
    ["grammar.conjugation.doe-to-dwae","됀","된","‘됀’은 ‘된’으로 씁니다.",true],
    ["grammar.conjugation.doe-to-dwae","됄","될","‘됄’은 ‘될’로 씁니다.",true],
    ["grammar.conjugation.doe-to-dwae","됌","됨","‘됌’은 ‘됨’으로 씁니다.",true],
    ["grammar.conjugation.dwae-to-doe","돼게","되게","어미 앞에서는 ‘되게’로 씁니다.",true],
    ["grammar.conjugation.dwae-to-doe","돼면서","되면서","어미 앞에서는 ‘되면서’로 씁니다.",true],
    ["grammar.conjugation.dwae-to-doe","돼도록","되도록","어미 앞에서는 ‘되도록’으로 씁니다.",true],
    ["grammar.copula.anieyo","아니예요","아니에요","‘아니에요’가 표준 표기입니다.",true],
    ["grammar.ending.hal-ge","할께","할게","약속·의지의 종결 어미는 ‘-ㄹ게’입니다.",true],
    ["grammar.ending.sipsio","하십시요","하십시오","높임 명령형은 ‘-십시오’입니다.",true],
    ["grammar.ending.sipsio","보십시요","보십시오","높임 명령형은 ‘-십시오’입니다.",true],
    ["grammar.negation.anh-doe","않됩니다","안 됩니다","부정 부사 ‘안’을 사용합니다.",true],
    ["grammar.negation.anh-doe","않되다","안 되다","부정 부사 ‘안’을 사용합니다.",true],
    ["grammar.ending.euryeo","먹을려고","먹으려고","의도를 나타낼 때 ‘먹으려고’로 씁니다.",true],
    ["grammar.ending.euryeo","볼려고","보려고","의도를 나타낼 때 ‘보려고’로 씁니다.",true],
    ["grammar.ending.euryeo-context","갈려고","가려고","문맥상 ‘가려고’가 자연스럽습니다.",false],
    ["grammar.ending.colloquial-yong","감사해용","감사해요","편집 문체에서는 표준 종결어미 ‘-요’를 권합니다.",false],
    ["spacing.compound.database","데이터 베이스","데이터베이스","한 단어로 굳어진 ‘데이터베이스’는 붙여 씁니다.",true],
    ["spacing.dependent-noun.geot","좋을것 같다","좋을 것 같다","의존 명사 ‘것’은 띄어 씁니다.",true],
    ["spacing.dependent-noun.jeok","본적 있다","본 적 있다","의존 명사 ‘적’은 띄어 씁니다.",true],
    ["spacing.dependent-noun.jul","알줄 안다","알 줄 안다","의존 명사 ‘줄’은 띄어 씁니다.",true],
    ["spacing.dependent-noun.jung","하는중","하는 중","의존 명사 ‘중’은 띄어 씁니다.",true],
    ["spacing.dependent-noun.ppun","기다릴뿐이다","기다릴 뿐이다","의존 명사 ‘뿐’은 띄어 씁니다.",true],
    ["spacing.dependent-noun.ri","잊을리가 없다","잊을 리가 없다","의존 명사 ‘리’는 띄어 씁니다.",true],
    ["spacing.dependent-noun.su","할수 있다","할 수 있다","의존 명사 ‘수’는 띄어 씁니다.",true],
    ["spacing.dependent-noun.su","할수 없다","할 수 없다","의존 명사 ‘수’는 띄어 씁니다.",true],
    ["spacing.dependent-noun.ttae","만날때","만날 때","의존 명사 ‘때’는 띄어 씁니다.",true],
    ["spacing.fixed.ppunman-anira","뿐만아니라","뿐만 아니라","‘뿐만 아니라’는 띄어 씁니다.",true],
    ["spacing.fixed.su-bakke","할 수 밖에","할 수밖에","‘수밖에’는 붙여 씁니다.",true],
    ["spelling.adverb.i-hi","깨끗히","깨끗이","부사 표기는 ‘깨끗이’입니다.",true],
    ["spelling.confusable.oraen-oraet","오랫만에","오랜만에","‘오랜만에’가 맞습니다.",true],
    ["spelling.confusable.waen-il","왠일","웬일","뜻밖의 일을 나타낼 때 ‘웬일’입니다.",true],
    ["spelling.confusable.wen-waen","왠만","웬만","‘웬만’이 표준 표기입니다.",true],
    ["spelling.conjugation.boe-bwae","뵈요","봬요","‘뵈어요’의 준말은 ‘봬요’입니다.",true],
    ["spelling.conjugation.dwaet","됬","됐","‘됬’은 ‘됐’으로 씁니다.",true],
    ["spelling.lexical.anseong-matchum","안성마춤","안성맞춤","‘안성맞춤’이 표준 표기입니다.",true],
    ["spelling.lexical.chireotda","치뤘다","치렀다","‘치렀다’가 표준 표기입니다.",true],
    ["spelling.lexical.chojeom","촛점","초점","‘초점’이 표준 표기입니다.",true],
    ["spelling.lexical.daega","댓가","대가","‘대가’가 표준 표기입니다.",true],
    ["spelling.lexical.dodaeche","도데체","도대체","‘도대체’가 표준 표기입니다.",true],
    ["spelling.lexical.eoieopda","어의없","어이없","‘어이없다’가 표준 표기입니다.",true],
    ["spelling.lexical.eojjaetdeun","어쨋든","어쨌든","‘어쨌든’이 표준 표기입니다.",true],
    ["spelling.lexical.gaesu","갯수","개수","‘개수’가 표준 표기입니다.",true],
    ["spelling.lexical.geokkuro","꺼꾸로","거꾸로","‘거꾸로’가 표준 표기입니다.",true],
    ["spelling.lexical.geondeurida","건들이다","건드리다","‘건드리다’가 표준 표기입니다.",true],
    ["spelling.lexical.geumse","금새","금세","‘금세’가 표준 표기입니다.",true],
    ["spelling.lexical.gop-ppaegi","곱배기","곱빼기","‘곱빼기’가 표준 표기입니다.",true],
    ["spelling.lexical.hamatteomyeon","하마트면","하마터면","‘하마터면’이 표준 표기입니다.",true],
    ["spelling.lexical.huihanhada","희안","희한","‘희한’이 표준 표기입니다.",true],
    ["spelling.lexical.jamgatda","잠궜다","잠갔다","‘잠갔다’가 표준 표기입니다.",true],
    ["spelling.lexical.jjagipgi","짜집기","짜깁기","‘짜깁기’가 표준 표기입니다.",true],
    ["spelling.lexical.myeochil","몇일","며칠","‘몇일’은 ‘며칠’로 씁니다.",true],
    ["spelling.lexical.seolgeoji","설겆이","설거지","‘설거지’가 표준 표기입니다.",true],
    ["spelling.lexical.sutgarak","숫가락","숟가락","‘숟가락’이 표준 표기입니다.",true],
    ["spelling.lexical.tongjjaero","통채로","통째로","‘통째로’가 표준 표기입니다.",true],
    ["spelling.lexical.umcheurida","움추리다","움츠리다","‘움츠리다’가 표준 표기입니다.",true],
    ["spelling.lexical.yeokhal","역활","역할","‘역할’이 표준 표기입니다.",true],
    ["spelling.lexical.yosae","요세","요새","‘요새’가 표준 표기입니다.",true],
    ["spelling.lexical.yukgaejang","육계장","육개장","‘육개장’이 표준 표기입니다.",true],
    ["spelling.loanword.curated","메세지","메시지","표준 외래어 표기는 ‘메시지’입니다.",true],
    ["spelling.lexical.deita","데이타","데이터","‘데이터’로 씁니다.",true],
    ["spelling.lexical.seolreim","설레임","설렘","명사 표기는 ‘설렘’입니다.",true],
    ["style.redundancy.gajang-choego","가장 최고","최고","뜻이 겹치는 표현입니다.",false],
    ["style.redundancy.majority-over","과반수 이상","과반수","‘과반수’에 이미 절반을 넘는다는 뜻이 있습니다.",false],
    ["technical.term.web-browser","웹부라우저","웹 브라우저","기술 용어 표기를 확인하세요.",true]
  ].map(([id,find,replace,message,safe]) => ({id,find,replace,message,safe}));

  const REGEX_RULES = [
    {
      id:"grammar.particle.duplicate", safe:true,
      re:/([은는이가을를])\1+/g,
      message:"조사가 중복된 것 같습니다.",
      suggest:(m)=>m[1]
    },
    {
      id:"punctuation.duplicate.comma", safe:true,
      re:/,{2,}/g,
      message:"연속 쉼표를 하나로 줄입니다.",
      suggest:()=>","
    },
    {
      id:"punctuation.no-space-before-mark", safe:true,
      re:/\s+([,.!?])/g,
      message:"문장 부호 앞에는 띄어쓰지 않습니다.",
      suggest:(m)=>m[1]
    },
    {
      id:"punctuation.space-after-comma", safe:true,
      re:/,([가-힣])/g,
      message:"쉼표 뒤에는 한 칸 띄웁니다.",
      suggest:(m)=>", "+m[1]
    },
    {
      id:"punctuation.space-after-sentence-mark", safe:true,
      re:/([.!?])([가-힣])/g,
      message:"문장 부호 뒤의 다음 문장은 한 칸 띄웁니다.",
      suggest:(m)=>m[1]+" "+m[2]
    },
    {
      id:"repetition.adjacent-word", safe:false,
      re:/\b([가-힣]{2,})\s+\1\b/g,
      message:"같은 단어가 바로 반복되었습니다.",
      suggest:(m)=>m[1]
    }
  ];

  // Review-only typo candidates. This catches one-syllable insertion/deletion/substitution
  // around frequently used Korean copy words without auto-correcting unknown words.
  const TYPO_LEXICON = [
    "안녕하세요","감사합니다","반갑습니다","부탁드립니다","확인해주세요","알려주세요","보내주세요",
    "가능합니다","필요합니다","진행합니다","진행됩니다","완료했습니다","준비했습니다","소개합니다",
    "안내합니다","참여해주세요","신청해주세요","문의해주세요","중요합니다","좋습니다","맞습니다",
    "있습니다","없습니다","어렵습니다","쉽습니다","새로운","특별한","다양한","전문적인","자연스럽게",
    "세련되게","친근하게","간결하게","정확하게","편리하게","안전하게","브랜드","제품","서비스",
    "이벤트","행사","고객","혜택","정보","내용","일정","신청","문의","참여","발표","인터뷰","현장",
    "디자인","카드뉴스","스튜디오","이미지","사진","문장","제목","본문","회사","대표","제작","촬영",
    "편집","업데이트","다운로드","저장","기능","사용","선택","자동","생성","구성","비교","체크리스트",
    "마무리","자세히","함께","지금","오늘","내일","이번","먼저","바로","가장","모두","정말"
  ];

  function editDistance(a,b){
    if(a===b) return 0;
    if(Math.abs(a.length-b.length)>1) return 2;
    const prev=Array.from({length:b.length+1},(_,i)=>i);
    const cur=new Array(b.length+1);
    for(let i=1;i<=a.length;i++){
      cur[0]=i;
      let rowMin=cur[0];
      for(let j=1;j<=b.length;j++){
        const cost=a[i-1]===b[j-1]?0:1;
        cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+cost);
        rowMin=Math.min(rowMin,cur[j]);
      }
      if(rowMin>1) return 2;
      for(let j=0;j<=b.length;j++) prev[j]=cur[j];
    }
    return prev[b.length];
  }

  function typoCandidates(text){
    const out=[];
    const tokenRe=/[가-힣]{4,}/g;
    let match;
    while((match=tokenRe.exec(text))){
      const token=match[0];
      let best=null;
      let bestDistance=2;
      let ties=0;
      for(const word of TYPO_LEXICON){
        if(word===token || Math.abs(word.length-token.length)>1) continue;
        const distance=editDistance(token,word);
        if(distance<bestDistance){bestDistance=distance;best=word;ties=1;}
        else if(distance===bestDistance && distance<=1){ties++;}
      }
      if(best && bestDistance===1 && ties===1){
        out.push({
          id:"typo.fuzzy.common-word",
          safe:false,
          start:match.index,
          end:match.index+token.length,
          original:token,
          suggestion:best,
          message:"자주 쓰는 표현과 한 글자 차이가 납니다. 오타인지 확인해보세요."
        });
      }
    }
    return out;
  }

  let restoreText = null;
  let findings = [];

  function scanText(text) {
    const out = [];
    for (const rule of RULES) {
      let from = 0;
      while (from < text.length) {
        const index = text.indexOf(rule.find, from);
        if (index < 0) break;
        out.push({
          id: rule.id, safe: rule.safe, start:index, end:index+rule.find.length,
          original:rule.find, suggestion:rule.replace, message:rule.message
        });
        from = index + Math.max(1, rule.find.length);
      }
    }
    for (const rule of REGEX_RULES) {
      const re = new RegExp(rule.re.source, rule.re.flags.includes("g") ? rule.re.flags : rule.re.flags+"g");
      let match;
      while ((match = re.exec(text))) {
        out.push({
          id:rule.id, safe:rule.safe, start:match.index, end:match.index+match[0].length,
          original:match[0], suggestion:rule.suggest(match), message:rule.message
        });
        if (!match[0].length) re.lastIndex++;
      }
    }
    out.push(...typoCandidates(text));
    out.sort((a,b)=>a.start-b.start || (b.end-b.start)-(a.end-a.start));
    const filtered=[];
    let lastEnd=-1;
    for(const item of out){
      if(item.start < lastEnd) continue;
      filtered.push(item);
      lastEnd=item.end;
    }
    return filtered;
  }

  function applyFinding(text, finding) {
    return text.slice(0,finding.start)+finding.suggestion+text.slice(finding.end);
  }

  function runCheck() {
    const text = input.value;
    if (!text.trim()) {
      panel.hidden = false;
      status.textContent = "검사할 문장을 입력해주세요";
      list.innerHTML = '<p class="spell-empty">검사할 문장이 없습니다.</p>';
      applyAllButton.disabled = true;
      return;
    }
    findings = scanText(text);
    panel.hidden = false;
    const safeCount = findings.filter(x=>x.safe).length;
    const reviewCount = findings.length-safeCount;
    status.textContent = findings.length
      ? `${findings.length}건 발견 · 바로 적용 ${safeCount} · 검토 ${reviewCount}`
      : "현재 규칙에서 발견된 오류가 없습니다";
    applyAllButton.disabled = safeCount === 0;
    if (!findings.length) {
      list.innerHTML = '<p class="spell-empty">✓ 현재 로컬 규칙에서 고칠 표현을 찾지 못했습니다.</p>';
      return;
    }
    list.innerHTML = findings.map((f,i)=>`
      <article class="spell-item">
        <div class="spell-item-head">
          <span class="spell-badge ${f.safe?"safe":"review"}">${f.safe?"바로 적용":"검토"}</span>
          <small>${f.id}</small>
        </div>
        <p class="spell-change"><del>${escapeHtml(f.original)}</del><b>→</b><strong>${escapeHtml(f.suggestion)}</strong></p>
        <p class="spell-message">${escapeHtml(f.message)}</p>
        <button type="button" data-spell-apply="${i}">이 제안 적용</button>
      </article>
    `).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  }

  checkButton.addEventListener("click", () => {
    if (restoreText === null) restoreText = input.value;
    runCheck();
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-spell-apply]");
    if (!button) return;
    const index = Number(button.dataset.spellApply);
    const finding = findings[index];
    if (!finding) return;
    if (restoreText === null) restoreText = input.value;
    input.value = applyFinding(input.value, finding);
    input.dispatchEvent(new Event("input", {bubbles:true}));
    restoreButton.disabled = false;
    runCheck();
  });

  applyAllButton.addEventListener("click", () => {
    if (restoreText === null) restoreText = input.value;
    const safe = scanText(input.value).filter(x=>x.safe).sort((a,b)=>b.start-a.start);
    let text = input.value;
    for (const finding of safe) text = applyFinding(text, finding);
    input.value = text;
    input.dispatchEvent(new Event("input", {bubbles:true}));
    restoreButton.disabled = false;
    runCheck();
  });

  restoreButton.addEventListener("click", () => {
    if (restoreText === null) return;
    input.value = restoreText;
    input.dispatchEvent(new Event("input", {bubbles:true}));
    restoreText = null;
    restoreButton.disabled = true;
    runCheck();
  });

  input.addEventListener("input", () => {
    if (!panel.hidden) {
      status.textContent = "문장이 바뀌었습니다 · 다시 검사해주세요";
      applyAllButton.disabled = true;
    }
  });
})();
