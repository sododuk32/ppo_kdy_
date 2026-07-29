// ===== i18n engine =====
// 정적 사이트용 경량 국제화. portfolio-data.js / portfolio-app.js 보다 먼저 로드됨.
//   I18N.t(key)  : UI 크롬 문자열(사전 기반)
//   I18N.tr(val) : 콘텐츠 값 해석 — 문자열은 그대로, {ko,ja}는 현재 언어(없으면 ko 폴백),
//                  배열은 각 원소를 재귀 해석. 구조용 객체(ko/ja 키 없음)는 원본 반환.
//   I18N.set(lang) : 언어 변경 + 저장 + 정적 텍스트 재적용 + 'langchange' 이벤트 발행
(function(){
  'use strict';
  const SUPPORTED = ['ko','ja'];
  const STORE_KEY = 'pf_lang';

  function detect(){
    try{ const s=localStorage.getItem(STORE_KEY); if(s && SUPPORTED.indexOf(s)>=0) return s; }catch(e){}
    const nav=((navigator.language||navigator.userLanguage||'ko')+'').toLowerCase();
    return nav.indexOf('ja')===0 ? 'ja' : 'ko';
  }

  // ---------- UI 크롬 문자열 ----------
  const UI = {
    ko:{
      doc_title:'프론트엔드 포트폴리오 · 곽대양',
      lang_switch_title:'언어 전환 (한국어 / 日本語)',
      // nav
      nav_chips:'키워드', nav_skills:'역량', nav_projects:'프로젝트', nav_side:'개인 프로젝트', nav_career:'경력',
      pdf_title:'인쇄용 PDF 페이지 열기 (Ctrl+P → PDF로 저장)',
      tut_replay_title:'튜토리얼 다시보기', tut_replay_aria:'튜토리얼',
      theme_title:'테마 전환', theme_aria:'테마 전환',
      // hero
      hero_role:'프론트엔드 소프트웨어 엔지니어',
      hero_tag:'서비스 전체를 이해하는 프론트엔드 엔지니어',
      hero_intro1:'React와 Next.js를 기반으로 사용자 경험과 프론트엔드 아키텍처를 고민하며, 서비스 전체를 이해하는 프론트엔드 엔지니어입니다. 이를 위해 백엔드·인프라 영역까지 직접 담당했으며, 테스트 도구·AWS 등 폭넓은 경험을 실무에 적용해 왔습니다.',
      hero_intro2:'저는 개발을 위한 요구사항을 캐치하고, 시기적절한 대응 방법을 통해 개발을 이어나가는 개발자라 생각합니다. 지난해에는 컨텍스트 엔지니어링을, 올해에는 하네스 엔지니어링을 실무에 도입·적용해본 경험이 있으며, 개인 지식 그래프용 저장소를 작업에 활용하고 있습니다. 사실 기반 선택과 실증을 통한 SW 개발로 더 높은 수준의 프론트엔드 개발과 SW 개발 업무를 이어나가고 싶습니다.',
      // section heads
      sec1_h:'키워드 칩', sec1_en:'/* click → 해당 프로젝트 상세 */',
      sec2_h:'보유 역량',
      sec3_h:'프로젝트', sec3_en:'/* 주요 프로젝트 · 카드 클릭 → 상세 페이지 */',
      sec4_h:'개인 프로젝트', sec4_en:'/* 사이드 프로젝트 · 실험 */',
      sec5_h:'경력', sec5_en:'/* 프론트엔드 · 설계 → 개발 → 배포 */',
      legend_tech:'기술 스택', legend_struct:'구조 · 설계 키워드',
      chip_empty:'칩을 누르면 해당 기술이 쓰인 프로젝트가 여기 표시됩니다',
      // footer
      foot_email:'이메일',
      // detail page
      back_btn:'이전 페이지로', crumb_prefix:'프로젝트 /',
      tech_h:'기술 개요', arch_h:'아키텍처', lb_alt:'확대 이미지',
      // tutorial
      tut_skip:'건너뛰기 ✕', tut_next:'다음 →', tut_start:'시작하기 ✓', tut_step:'STEP',
      tut_hint:'아무 곳이나 클릭하면 다음으로 · ✕ 한 번이면 닫힘',
      tut:[
        {t:'위에서부터 훑어 내려오세요', b:'상단 <b>키워드 칩</b>을 누르면 그 키워드가 쓰인 <b>프로젝트 상세 페이지</b>로 바로 이동합니다. 칩은 <b>실선=기술명</b>, <b>점선=구조·설계 키워드</b>예요. 위쪽 메뉴로 섹션 사이도 빠르게 오갈 수 있습니다.'},
        {t:'프로젝트는 깊이별로 열립니다', b:'목록 카드는 <b>제목만(1depth)</b> 보여줘요. 카드를 누르면 <b>별도 상세 페이지</b>로 넘어가 구조·작업·해결한 문제(2depth)가 펼쳐지고, 각 항목의 <b>내용 펼치기</b>로 설계도·세부 내용(3depth)이 그 자리에서 열립니다.'},
      ],
      // render labels — projects
      stack_lbl:'기술 스택', arch_lbl:'아키텍처', items_lbl:'세부 항목', items_hint:'· 제목만', open_cue:'상세 페이지 열기',
      about_h:'프로젝트 소개', about_what:'무엇을', about_problem:'왜', about_role:'내 역할', about_outcome:'결과',
      meta_period:'기간', meta_team:'팀 구성', meta_client:'대상',
      // side project fields
      f_bg:'배경', f_sol:'해결', f_res:'결과', f_retro:'회고', f_do:'한 일',
      side_arch_default:'전체 아키텍처 구성도', repo_suffix:'· GitHub →',
      // detail body sections
      core_feat:'핵심 기능', core_feat_fmt:'제목·요약 · 세부는 펼치기', detail_more:'세부 보기',
      result_perf:'결과 · 성과', result_perf_fmt:'지표',
      screens:'실제 화면', screens_fmt:'대시보드 · 스크린샷',
      struct_chip:'구조 유형 ·',
      // chip results
      no_match:'매칭 프로젝트 없음', count_suffix:'건',
      side_meta:'개인 프로젝트', career_item:'경력', career_item_meta:'2023–2026 · 경력 섹션 보기',
      // timeline
      duties_lbl:'담당 업무', cv_stack_lbl:'사용 기술 스택', cv_proj_stack_lbl:'사용 기술', cv_toggle:'세부 · 성과 보기',
      // research (현재 비어있음)
      r_status:'연구 · 대상 미정', r_tech_lbl:'사용 기술', r_diag_lbl:'구조 다이어그램', r_topics_lbl:'적용 후보 주제', r_appeal_h:'핵심 어필',
      // print (print.html 전용)
      p_toc:'수록 프로젝트', p_about_me:'자기소개', p_main_work:'주요 작업', p_activities:'외부활동',
      p_period:'기간', p_team:'팀', p_client:'대상', p_struct:'구조', p_stack:'스택', p_web:'웹 포트폴리오',
      p_repo:'저장소', p_edu:'동의대학교 컴퓨터공학과 · 2013 – 2021.02 졸업',
      p_summary:'React와 Next.js를 기반으로 사용자 경험과 프론트엔드 아키텍처를 고민하며, 서비스 전체를 이해하는 프론트엔드 엔지니어입니다. 이를 위해 백엔드·인프라 영역까지 직접 담당했으며, 테스트 도구·AWS 등 폭넓은 경험을 실무에 적용해 왔습니다. 저는 개발을 위한 요구사항을 캐치하고, 시기적절한 대응 방법을 통해 개발을 이어나가는 개발자라 생각합니다. 지난해에는 컨텍스트 엔지니어링을, 올해에는 하네스 엔지니어링을 실무에 도입·적용해본 경험이 있으며, 개인 지식 그래프용 저장소를 작업에 활용하고 있습니다. 사실 기반 선택과 실증을 통한 SW 개발로 더 높은 수준의 프론트엔드 개발과 SW 개발 업무를 이어나가고 싶습니다.',
      p_howto:'PDF로 저장: <code>Ctrl+P</code> → 대상 <b>“PDF로 저장”</b> → 추가 설정 <b>“배경 그래픽” 체크</b> · 용지 A4 · 여백 기본. 이 안내 박스는 인쇄물에는 나오지 않습니다.',
    },
    ja:{
      doc_title:'フロントエンドポートフォリオ · 곽대양',
      lang_switch_title:'言語切り替え (한국어 / 日本語)',
      // nav
      nav_chips:'キーワード', nav_skills:'スキル', nav_projects:'プロジェクト', nav_side:'個人プロジェクト', nav_career:'経歴',
      pdf_title:'印刷用PDFページを開く (Ctrl+P → PDFで保存)',
      tut_replay_title:'チュートリアルを再表示', tut_replay_aria:'チュートリアル',
      theme_title:'テーマ切り替え', theme_aria:'テーマ切り替え',
      // hero
      hero_role:'フロントエンド・ソフトウェアエンジニア',
      hero_tag:'サービス全体を理解するフロントエンドエンジニア',
      hero_intro1:'React と Next.js をベースにユーザー体験とフロントエンドアーキテクチャを追求する、サービス全体を理解するフロントエンドエンジニアです。そのためにバックエンド・インフラ領域まで自ら担当し、テストツール・AWS など幅広い経験を実務に活かしてきました。',
      hero_intro2:'私は開発のための要件を的確に捉え、時機に応じた対応でプロジェクトを前に進める開発者だと考えています。昨年はコンテキストエンジニアリングを、今年はハーネスエンジニアリングを実務に導入・適用した経験があり、個人のナレッジグラフ用リポジトリを業務に活用しています。事実に基づく選択と実証を通じたソフトウェア開発で、より高いレベルのフロントエンド開発・ソフトウェア開発に取り組んでいきたいと考えています。',
      // section heads
      sec1_h:'キーワードチップ', sec1_en:'/* click → 該当プロジェクトの詳細 */',
      sec2_h:'保有スキル',
      sec3_h:'プロジェクト', sec3_en:'/* 主要プロジェクト · カードをクリック → 詳細ページ */',
      sec4_h:'個人プロジェクト', sec4_en:'/* サイドプロジェクト · 実験 */',
      sec5_h:'経歴', sec5_en:'/* フロントエンド · 設計 → 開発 → デプロイ */',
      legend_tech:'技術スタック', legend_struct:'構造 · 設計キーワード',
      chip_empty:'チップを押すと、その技術を使ったプロジェクトがここに表示されます',
      // footer
      foot_email:'メール',
      // detail page
      back_btn:'前のページへ', crumb_prefix:'プロジェクト /',
      tech_h:'技術概要', arch_h:'アーキテクチャ', lb_alt:'拡大画像',
      // tutorial
      tut_skip:'スキップ ✕', tut_next:'次へ →', tut_start:'始める ✓', tut_step:'STEP',
      tut_hint:'どこをクリックしても次へ · ✕ 一度で閉じます',
      tut:[
        {t:'上から順に読み進めてください', b:'上部の<b>キーワードチップ</b>を押すと、そのキーワードを使った<b>プロジェクト詳細ページ</b>へ直接移動します。チップは<b>実線＝技術名</b>、<b>点線＝構造・設計キーワード</b>です。上部メニューでセクション間もすばやく移動できます。'},
        {t:'プロジェクトは深さごとに開きます', b:'一覧カードは<b>タイトルのみ（1階層）</b>を表示します。カードを押すと<b>専用の詳細ページ</b>へ移り、構造・作業・解決した課題（2階層）が展開され、各項目の<b>内容を開く</b>で設計図・詳細（3階層）がその場で開きます。'},
      ],
      // render labels — projects
      stack_lbl:'技術スタック', arch_lbl:'アーキテクチャ', items_lbl:'詳細項目', items_hint:'· タイトルのみ', open_cue:'詳細ページを開く',
      about_h:'プロジェクト紹介', about_what:'何を', about_problem:'なぜ', about_role:'担当範囲', about_outcome:'結果',
      meta_period:'期間', meta_team:'チーム構成', meta_client:'対象',
      // side project fields
      f_bg:'背景', f_sol:'解決', f_res:'結果', f_retro:'振り返り', f_do:'やったこと',
      side_arch_default:'全体アーキテクチャ構成図', repo_suffix:'· GitHub →',
      // detail body sections
      core_feat:'主要機能', core_feat_fmt:'タイトル·要約 · 詳細は展開', detail_more:'詳細を見る',
      result_perf:'結果 · 成果', result_perf_fmt:'指標',
      screens:'実際の画面', screens_fmt:'ダッシュボード · スクリーンショット',
      struct_chip:'構造タイプ ·',
      // chip results
      no_match:'該当プロジェクトなし', count_suffix:'件',
      side_meta:'個人プロジェクト', career_item:'経歴', career_item_meta:'2023–2026 · 経歴セクションを見る',
      // timeline
      duties_lbl:'担当業務', cv_stack_lbl:'使用技術スタック', cv_proj_stack_lbl:'使用技術', cv_toggle:'詳細 · 成果を見る',
      // research
      r_status:'研究 · 対象未定', r_tech_lbl:'使用技術', r_diag_lbl:'構造ダイアグラム', r_topics_lbl:'適用候補テーマ', r_appeal_h:'コアアピール',
      // print (print.html 専用)
      p_toc:'掲載プロジェクト', p_about_me:'自己紹介', p_main_work:'主な業務', p_activities:'外部活動',
      p_period:'期間', p_team:'チーム', p_client:'対象', p_struct:'構造', p_stack:'スタック', p_web:'Web ポートフォリオ',
      p_repo:'リポジトリ', p_edu:'東義大学校 コンピュータ工学科 · 2013 – 2021.02 卒業',
      p_summary:'React と Next.js をベースにユーザー体験とフロントエンドアーキテクチャを追求する、サービス全体を理解するフロントエンドエンジニアです。そのためにバックエンド・インフラ領域まで自ら担当し、テストツール・AWS など幅広い経験を実務に活かしてきました。私は開発のための要件を的確に捉え、時機に応じた対応でプロジェクトを前に進める開発者だと考えています。昨年はコンテキストエンジニアリングを、今年はハーネスエンジニアリングを実務に導入・適用した経験があり、個人のナレッジグラフ用リポジトリを業務に活用しています。事実に基づく選択と実証を通じたソフトウェア開発で、より高いレベルのフロントエンド開発・ソフトウェア開発に取り組んでいきたいと考えています。',
      p_howto:'PDFで保存: <code>Ctrl+P</code> → 送信先 <b>「PDFに保存」</b> → 詳細設定 <b>「背景のグラフィック」にチェック</b> · 用紙A4 · 余白 標準。この案内ボックスは印刷物には表示されません。',
    },
  };

  let LANG = detect();

  function t(key){
    const d=UI[LANG]||UI.ko;
    return d[key]!=null ? d[key] : (UI.ko[key]!=null ? UI.ko[key] : key);
  }
  function tr(v){
    if(v==null) return v;
    if(typeof v==='string') return v;
    if(Array.isArray(v)) return v.map(tr);
    if(typeof v==='object'){
      if('ko' in v || 'ja' in v) return v[LANG]!=null ? v[LANG] : (v.ko!=null ? v.ko : (v.ja!=null ? v.ja : ''));
      return v;
    }
    return v;
  }

  // 정적 HTML 문자열 적용 (data-i18n* 속성)
  function applyStatic(root){
    root = root||document;
    root.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent = t(el.getAttribute('data-i18n')); });
    root.querySelectorAll('[data-i18n-html]').forEach(el=>{ el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    root.querySelectorAll('[data-i18n-title]').forEach(el=>{ el.setAttribute('title', t(el.getAttribute('data-i18n-title'))); });
    root.querySelectorAll('[data-i18n-aria]').forEach(el=>{ el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))); });
    root.querySelectorAll('[data-i18n-alt]').forEach(el=>{ el.setAttribute('alt', t(el.getAttribute('data-i18n-alt'))); });
    document.title = t('doc_title');
  }

  function set(lang){
    if(SUPPORTED.indexOf(lang)<0 || lang===LANG) return;
    LANG=lang;
    try{ localStorage.setItem(STORE_KEY, lang); }catch(e){}
    document.documentElement.setAttribute('lang', lang);
    applyStatic();
    window.dispatchEvent(new CustomEvent('langchange',{detail:{lang}}));
  }

  window.I18N = {
    get lang(){ return LANG; },
    supported: SUPPORTED,
    t, tr, set, applyStatic,
  };

  // 초기 언어 반영 (렌더 전에 lang 속성부터 세팅)
  document.documentElement.setAttribute('lang', LANG);
  // 이 스크립트는 body 끝에서 로드돼 data-i18n 대상이 모두 파싱된 상태 —
  // 즉시 적용해 JA 사용자에게 한국어가 깜빡이는 것을 막고, DOMContentLoaded 에도 한 번 더(멱등) 적용
  try{ applyStatic(); }catch(e){}
  document.addEventListener('DOMContentLoaded', ()=>applyStatic());
})();
