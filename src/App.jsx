import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, ShoppingCart, FileText, Package, Wallet, BarChart2,
  LogIn, LogOut, CheckCircle2, Loader2, AlertTriangle, ArrowUpRight, ArrowDownRight, Bell,
  PanelLeftClose, PanelLeftOpen, TrendingUp,
  Users, Building2, Wrench, UserCog, Plus, Pencil, Trash2,
  Search, X, Send, Paperclip, Pin, Clock, ChevronRight,
  Phone, MessageSquare, Mail, FileImage, Star, Archive,
  Eye, MoreHorizontal, Filter, RefreshCw, Download
} from "lucide-react";

const R="#C41E2A",DARK="#111827",GRAY="#6B7280",GRAY_L="#9CA3AF",BORDER="#E5E7EB",BG="#F9FAFB",WHITE="#FFFFFF",GREEN="#16A34A",GREEN_L="#F0FDF4",BLUE="#2563EB",BLUE_L="#EFF6FF",AMBER="#D97706",AMBER_L="#FFFBEB",PURPLE="#7C3AED",PURPLE_L="#F5F3FF";

const THEME = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Noto Sans JP',sans-serif;background:#F9FAFB;color:#111827;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideR{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideLeft{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
@keyframes chatPop{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.anim-fade-up{animation:fadeUp .3s ease both}
.anim-slide-left{animation:slideLeft .2s ease both}
.spin{animation:spin .9s linear infinite}
.sidebar{transition:width .2s cubic-bezier(.4,0,.2,1);overflow:hidden;min-height:100vh}
tbody tr:hover td{background:#F9FAFB}
textarea,input,select{font-family:'Noto Sans JP',sans-serif;outline:none}
`;

function StatusBadge({ s }) {
  const map = {
    "受付中":{bg:BLUE_L,text:BLUE,border:"#BFDBFE"},"未返信":{bg:"#FEF2F2",text:R,border:"#FECACA"},
    "返信済":{bg:GREEN_L,text:GREEN,border:"#BBF7D0"},"仕入先照会中":{bg:PURPLE_L,text:PURPLE,border:"#DDD6FE"},
    "見積済":{bg:AMBER_L,text:AMBER,border:"#FDE68A"},"受注確定":{bg:GREEN_L,text:GREEN,border:"#BBF7D0"},
    "発送済":{bg:"#F0FDFA",text:"#0D9488",border:"#99F6E4"},"完了":{bg:"#F9FAFB",text:GRAY,border:BORDER},
    "未入金":{bg:"#FEF2F2",text:R,border:"#FECACA"},"督促済":{bg:AMBER_L,text:AMBER,border:"#FDE68A"},
    "入金済":{bg:GREEN_L,text:GREEN,border:"#BBF7D0"},"AI解析中":{bg:PURPLE_L,text:PURPLE,border:"#DDD6FE"},
    "確認待ち":{bg:BLUE_L,text:BLUE,border:"#BFDBFE"},"下書き":{bg:"#F9FAFB",text:GRAY,border:BORDER},
    "確認前":{bg:"#F9FAFB",text:GRAY,border:BORDER},
    "一部入金あり":{bg:AMBER_L,text:AMBER,border:"#FDE68A"},
    "過入金あり":{bg:PURPLE_L,text:PURPLE,border:"#DDD6FE"},
    "督促不要":{bg:GREEN_L,text:GREEN,border:"#BBF7D0"},
    "督促前":{bg:"#F9FAFB",text:GRAY,border:BORDER},
    "督促中（メールのみ）":{bg:AMBER_L,text:AMBER,border:"#FDE68A"},
    "督促中（電話済）":{bg:"#FEF2F2",text:R,border:"#FECACA"},
    "督促完了":{bg:GREEN_L,text:GREEN,border:"#BBF7D0"},
    "発送手配中":{bg:"#F0FDFA",text:"#0D9488",border:"#99F6E4"},
  };
  const { bg="#F9FAFB", text=GRAY, border=BORDER } = map[s] || {};
  return (
    <span style={{ background:bg, color:text, border:`1px solid ${border}`,
      fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4,
      whiteSpace:"nowrap", display:"inline-flex", alignItems:"center" }}>
      {s}
    </span>
  );
}

const CH_ICON = { "LINE":"💬", "FAX":"📠", "メール":"📧", "電話":"📞" };

const TEMPLATES = [
  { id:1, title:"在庫確認テンプレート", body:"いつもお世話になっております。\nご依頼の部品について在庫確認を行います。\n\n品番: \n数量: \n\n確認次第ご連絡いたします。", pinned:true },
  { id:2, title:"お見積もり回答", body:"お問い合わせありがとうございます。\n以下の通りお見積もりをご案内いたします。\n\n品番: \n金額: ¥\n納期: 営業日\n\nご確認のほどよろしくお願いいたします。", pinned:true },
  { id:3, title:"発送完了通知", body:"この度はご注文いただきありがとうございます。\n下記の通り発送いたしましたのでご連絡いたします。\n\n追跡番号: \n配送業者: \n到着予定: \n\nよろしくお願いいたします。", pinned:false },
  { id:4, title:"お礼・クロージング", body:"この度はお取引いただきありがとうございました。\n今後ともどうぞよろしくお願いいたします。", pinned:false },
];

const INIT_CASES = [
  { id:"C-2041", created:"2026/04/07 09:12", customer:"大阪モーター整備", ch:"LINE", car:"BMW 3シリーズ G20", part:"フロントコントロールアーム左", part_no:"31126855157", staff:null, status:"未返信", body:"BMWのフロンロアアームをお願いします", phone:"06-1234-5678", note:"急ぎ対応希望", images:[], replies:[] },
  { id:"C-2040", created:"2026/04/07 08:55", customer:"神戸カーサービス", ch:"FAX", car:"Mercedes C220d", part:"ブレーキパッド（低ダスト）", part_no:"A0004230012", staff:"宮嶋", status:"未返信", body:"Mercedes C220dのブレーキパッドが必要です。前後セット希望。", phone:"078-234-5678", note:"", images:[], replies:[] },
  { id:"C-2039", created:"2026/04/07 08:31", customer:"京都輸入車工房", ch:"メール", car:"Porsche Cayenne 9YA", part:"エアサスペンション", part_no:"95810611100", staff:null, status:"未返信", body:"CayenneのエアサスがNGです。リア左右お願いします。", phone:"075-345-6789", note:"過去にも同様の注文あり", images:[], replies:[] },
  { id:"C-2038", created:"2026/04/07 08:10", customer:"東京欧州車センター", ch:"LINE", car:"Audi A6 C8", part:"タイミングベルトキット", part_no:"06L109257B", staff:"小嶋", status:"返信済", body:"A6のタイミングベルトキット（ウォーターポンプ込み）をお願いします", phone:"03-4567-8901", note:"", images:[], replies:[{from:"担当",text:"ご確認できました。在庫あり、納期2営業日です。",time:"08:25"}] },
  { id:"C-2037", created:"2026/04/07 07:44", customer:"横浜ユーロモータース", ch:"FAX", car:"VW Golf GTI", part:"DSGオイルポンプ", part_no:"0AM927769D", staff:"宮嶋", status:"返信済", body:"Golf GTI DSGのオイルポンプ。緊急対応でお願いします。", phone:"045-567-8901", note:"", images:[], replies:[{from:"担当",text:"在庫確認中です。本日中にご回答します。",time:"08:00"}] },
  { id:"C-2036", created:"2026/04/07 07:22", customer:"名古屋プレミアムAuto", ch:"メール", car:"BMW 5シリーズ N52", part:"バルブトロニックモーター", part_no:"N13-01-001", staff:"小嶋", status:"完了", body:"5シリーズN52エンジンのバルブトロニックモーターをお願いします。", phone:"052-678-9012", note:"", images:[], replies:[{from:"担当",text:"発送完了しました。追跡番号: 1234567890",time:"09:00"}] },
];

function ChatBubble({ from, text, time, isRight, isAI, avatar, onConfirm, onEdit, confirmed }) {
  // confirmed = true means AI bubble was already sent (show as normal blue bubble)
  const showAsAI = isAI && !confirmed;
  return (
    <div style={{ display:"flex", justifyContent:isRight?"flex-end":"flex-start", marginBottom:showAsAI?14:10, animation:"chatPop .3s ease both" }}>
      {!isRight && avatar && (
        <div style={{ width:24, height:24, borderRadius:"50%", background:`${R}15`, color:R, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0, marginRight:8, marginTop:2 }}>
          {avatar}
        </div>
      )}
      <div style={{ maxWidth:"80%", display:"flex", flexDirection:"column", alignItems:isRight?"flex-end":"flex-start" }}>
        {!isRight && from && <div style={{ fontSize:10, color:GRAY_L, marginBottom:3 }}>{from}</div>}
        <div style={{
          background: showAsAI ? "#FAFAFA" : (confirmed || (!isAI && isRight)) ? BLUE : isRight ? BLUE : "#F3F4F6",
          color: showAsAI ? GRAY_L : (isRight || confirmed) ? WHITE : DARK,
          borderRadius: isRight ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
          padding:"9px 13px", fontSize:13, lineHeight:1.7,
          border: showAsAI ? `1.5px dashed #D1D5DB` : "none",
          fontStyle: showAsAI ? "normal" : "normal",
        }}>
          {showAsAI && (
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
              <span style={{ fontSize:10, color:R, fontWeight:700 }}>🤖 AI下書き（送信前）</span>
              <span style={{ fontSize:10, color:"#D1D5DB" }}>— 灰色は未送信です</span>
            </div>
          )}
          <span style={{ color: showAsAI ? "#9CA3AF" : "inherit" }}>{text}</span>
        </div>
        {/* ── AI下書きアクションボタン ── */}
        {showAsAI && onConfirm && onEdit && (
          <div style={{ display:"flex", gap:6, marginTop:6 }}>
            <button
              onClick={onEdit}
              style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 12px", fontSize:11, fontWeight:500, background:WHITE, color:GRAY, border:`1px solid ${BORDER}`, borderRadius:6, cursor:"pointer", fontFamily:"inherit" }}
            >
              <Pencil size={11} /> 編集
            </button>
            <button
              onClick={onConfirm}
              style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 12px", fontSize:11, fontWeight:700, background:R, color:WHITE, border:"none", borderRadius:6, cursor:"pointer", fontFamily:"inherit" }}
            >
              <Send size={11} /> 送信確定
            </button>
          </div>
        )}
        <div style={{ fontSize:10, color:GRAY_L, marginTop:3 }}>{time}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SCREEN 0: 受付ダッシュボード
   ═══════════════════════════════════════════════════ */
function DashboardScreen({ setScreen, setInquiryActive }) {
  const [cases, setCases] = useState(INIT_CASES);
  const [ch, setCh] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("未返信");
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [draft, setDraft] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState(TEMPLATES);
  const [attachments, setAttachments] = useState([]);
  const [newForm, setNewForm] = useState({ customer:"", ch:"LINE", phone:"", car:"", part:"", note:"", body:"" });
  const [aiDrafting, setAiDrafting] = useState(false);
  // ── AI下書き確認フロー用 ──
  const [aiDraftMode, setAiDraftMode] = useState(false); // true = AI下書き待ち確認中
  const [aiFlowStep, setAiFlowStep] = useState({});
  const [aiFlowChoice, setAiFlowChoice] = useState({});
  const [confirmedBubbles, setConfirmedBubbles] = useState({});
  function confirmBubble(key) {
    // バブル自体を「送信済み（青）」に切り替えるだけ。replies への追加は行わない（二重表示防止）
    setConfirmedBubbles(p => ({ ...p, [key]: true }));
    // ステータスだけ返信済に更新
    setCases(prev => prev.map(c => c.id !== selected ? c : { ...c, status:"返信済" }));
    if (statusFilter === "未返信") setStatusFilter("ALL");
  }
  const [hiddenBubbles, setHiddenBubbles] = useState({});
  const [editingBubbleKey, setEditingBubbleKey] = useState(null);

  function editBubble(key, text) {
    setDraft(text);
    setAiDraftMode(false);
    setEditingBubbleKey(key);
  }

  const tabs = [
    { id:"ALL", icon:"📋", label:"全件", count:cases.length },
    { id:"LINE", icon:"💬", label:"LINE", count:cases.filter(c=>c.ch==="LINE").length },
    { id:"FAX", icon:"📠", label:"FAX", count:cases.filter(c=>c.ch==="FAX").length },
    { id:"メール", icon:"📧", label:"メール", count:cases.filter(c=>c.ch==="メール").length },
    { id:"電話", icon:"📞", label:"電話", count:cases.filter(c=>c.ch==="電話").length },
  ];

  const filtered = cases.filter(c => {
    const chMatch = ch==="ALL" || c.ch===ch;
    const stMatch = statusFilter==="ALL" || c.status===statusFilter;
    const qMatch = !searchQ || JSON.stringify(c).toLowerCase().includes(searchQ.toLowerCase());
    return chMatch && stMatch && qMatch;
  });

  const selectedCase = cases.find(c => c.id===selected);
  const unread = cases.filter(c => c.status==="未返信").length;

  function handleSend() {
    if (!draft.trim() && !attachments.length) return;
    setCases(prev => prev.map(c => c.id !== selected ? c : {
      ...c, status:"返信済",
      replies: [...c.replies, { from:"担当", text:draft, time:new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"}), attachments }]
    }));
    if (statusFilter === "未返信") setStatusFilter("ALL");
    setDraft(""); setAttachments([]); setDraftSaved(false); setAiDraftMode(false);
    // 編集フローで送信した場合、元のAI下書きバブルを非表示にする
    if (editingBubbleKey) {
      setHiddenBubbles(p => ({ ...p, [editingBubbleKey]: true }));
      setEditingBubbleKey(null);
    }
  }

  function handleStatusChange(id, newStatus) {
    setCases(prev => prev.map(c => c.id !== id ? c : { ...c, status:newStatus }));
  }

  function handleAIDraft() {
    if (!selectedCase) return;
    setAiDrafting(true);
    setTimeout(() => {
      setDraft(`${selectedCase.customer} ご担当者様\n\nいつもお世話になっております。カレント自動車株式会社パーツ部でございます。\n\nご依頼の「${selectedCase.part || "お問い合わせ部品"}」（品番: ${selectedCase.part_no || "確認中"}）につきまして、在庫を確認いたします。\n\n車種: ${selectedCase.car || "確認中"}\n\n本日中にご回答いたします。何卒よろしくお願いいたします。\n\nカレント自動車株式会社 パーツ部\nTEL: 045-XXX-XXXX`);
      setAiDrafting(false);
      setAiDraftMode(true); // ← AI下書き確認モードに入る
    }, 800);
  }

  function handleInquiryToSupplier() {
    if (!selectedCase) return;
    setInquiryActive({ caseId: selectedCase.id, part: selectedCase.part, part_no: selectedCase.part_no, car: selectedCase.car, customer: selectedCase.customer });
    setScreen(1);
  }

  function applyTemplate(t) { setDraft(t.body); setShowTemplates(false); setAiDraftMode(false); }
  function togglePin(id) { setTemplates(prev => prev.map(t => t.id!==id ? t : { ...t, pinned:!t.pinned })); }

  function handleNewSubmit() {
    const nc = { id:`C-${2046+cases.length}`, created:new Date().toLocaleString("ja-JP"), customer:newForm.customer||"（未入力）", ch:newForm.ch, car:newForm.car, part:newForm.part, part_no:"", staff:null, status:"未返信", body:newForm.body, phone:newForm.phone, note:newForm.note, images:[], replies:[] };
    setCases(prev => [nc, ...prev]);
    setShowNew(false);
    setNewForm({ customer:"", ch:"LINE", phone:"", car:"", part:"", note:"", body:"" });
    setSelected(nc.id);
  }

  const kpiCards = [
    { label:"未返信", value:unread, color:R, bg:"#FEF2F2", border:"#FECACA" },
    { label:"本日の受付", value:filtered.length, color:BLUE, bg:BLUE_L, border:"#BFDBFE" },
    { label:"返信済（本日）", value:cases.filter(c=>c.status==="返信済").length, color:GREEN, bg:GREEN_L, border:"#BBF7D0" },
    { label:"完了", value:cases.filter(c=>c.status==="完了").length, color:GRAY, bg:"#F9FAFB", border:BORDER },
  ];
  const S = { background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" };

  const step2041 = aiFlowStep["C-2041"] || 0;
  const choice2041 = aiFlowChoice["C-2041"];

  function renderLineAIFlow(c) {
    if (c.id !== "C-2041") return null;
    if (step2041 === 0) return (
      <div style={{ marginTop:10, padding:"10px 12px", background:"#FEF2F2", border:`1px solid #FECACA`, borderRadius:8 }}>
        <div style={{ fontSize:11, color:R, fontWeight:600, marginBottom:6 }}>🤖 AI対話フロー</div>
        <div style={{ fontSize:11, color:GRAY, marginBottom:8 }}>AI下書きで部品・車種の確認を自動開始します</div>
        <button onClick={() => setAiFlowStep(p=>({...p,"C-2041":1}))} style={{ padding:"5px 14px", background:R, color:WHITE, border:"none", borderRadius:5, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          AI対話を開始する
        </button>
      </div>
    );
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
        {step2041 >= 1 && !hiddenBubbles["C-2041-b1"] && <ChatBubble isRight={true} isAI={true} confirmed={!!confirmedBubbles["C-2041-b1"]} text={"ご連絡ありがとうございます。車体番号「WBA5R110X0FH12345」のBMW G20の件ですね。\nお問い合わせの部品を確認させてください。"} time="09:12" onConfirm={() => confirmBubble("C-2041-b1")} onEdit={() => editBubble("C-2041-b1","ご連絡ありがとうございます。車体番号「WBA5R110X0FH12345」のBMW G20の件ですね。\nお問い合わせの部品を確認させてください。")} />}
        {step2041 === 1 && (
          <div style={{ display:"flex", justifyContent:"center", margin:"8px 0" }}>
            <div style={{ background:PURPLE_L, border:`1px solid #DDD6FE`, borderRadius:10, padding:"10px 16px", textAlign:"center" }}>
              <div style={{ fontSize:11, color:PURPLE, fontWeight:600, marginBottom:8 }}>📱 お客様画面（モバイルアプリ）</div>
              <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                {["たしかに合っている","違うかも"].map(opt => (
                  <button key={opt} onClick={() => { setAiFlowChoice(p=>({...p,"C-2041":opt})); setAiFlowStep(p=>({...p,"C-2041":2})); }} style={{ padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", background:opt==="たしかに合っている"?GREEN_L:WHITE, color:opt==="たしかに合っている"?GREEN:GRAY, border:`1.5px solid ${opt==="たしかに合っている"?"#BBF7D0":BORDER}` }}>{opt}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step2041 >= 2 && <ChatBubble from="大阪モーター整備" text={choice2041 || "たしかに合っている"} time="09:13" avatar="大" />}
        {step2041 >= 2 && (choice2041==="たしかに合っている" || !choice2041) && !hiddenBubbles["C-2041-b2"] && (
          <ChatBubble isRight={true} isAI={true} confirmed={!!confirmedBubbles["C-2041-b2"]} text={"お問い合わせは「BMW フロントロアアーム（左）/ 品番: 31126855157」の件と確認いたしました。\nこちらの部品でお間違いないでしょうか？"} time="09:13" onConfirm={() => confirmBubble("C-2041-b2")} onEdit={() => editBubble("C-2041-b2","お問い合わせは「BMW フロントロアアーム（左）/ 品番: 31126855157」の件と確認いたしました。\nこちらの部品でお間違いないでしょうか？")} />
        )}
        {step2041 === 2 && (choice2041==="たしかに合っている" || !choice2041) && (
          <div style={{ display:"flex", justifyContent:"center", margin:"8px 0" }}>
            <div style={{ background:PURPLE_L, border:`1px solid #DDD6FE`, borderRadius:10, padding:"12px 16px" }}>
              <div style={{ fontSize:11, color:PURPLE, fontWeight:600, marginBottom:8 }}>📱 部品画像・対応番号通知（システム）</div>
              <div style={{ display:"flex", gap:8, marginBottom:10, justifyContent:"center" }}>
                {["①ロアアーム左","②ロアアーム右","③リアアーム"].map((p,pi) => (
                  <div key={pi} style={{ background:WHITE, border:`1px solid ${pi===0?R:BORDER}`, borderRadius:8, padding:"8px 10px", textAlign:"center", fontSize:11, color:pi===0?R:GRAY, fontWeight:pi===0?600:400, minWidth:76 }}>🔩<br/>{p}</div>
                ))}
              </div>
              <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
                {["たしかに合っている","合っているかわからない","ぜんぜん違う"].map(opt => (
                  <button key={opt} onClick={() => { setAiFlowChoice(p=>({...p,"C-2041":opt})); setAiFlowStep(p=>({...p,"C-2041":3})); }} style={{ padding:"6px 10px", borderRadius:7, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit", background:opt==="たしかに合っている"?GREEN_L:opt==="ぜんぜん違う"?"#FEF2F2":WHITE, color:opt==="たしかに合っている"?GREEN:opt==="ぜんぜん違う"?R:GRAY, border:`1.5px solid ${opt==="たしかに合っている"?"#BBF7D0":opt==="ぜんぜん違う"?"#FECACA":BORDER}` }}>{opt}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step2041 >= 2 && choice2041==="違うかも" && (
          <>
            {!hiddenBubbles["C-2041-b3"] && <ChatBubble isRight={true} isAI={true} confirmed={!!confirmedBubbles["C-2041-b3"]} text={"ご確認ありがとうございます。追加情報をいただけますと幸いです。以下の類似候補はいかがでしょうか？"} time="09:13" onConfirm={() => confirmBubble("C-2041-b3")} onEdit={() => editBubble("C-2041-b3","ご確認ありがとうございます。追加情報をいただけますと幸いです。以下の類似候補はいかがでしょうか？")} />}
            <div style={{ display:"flex", justifyContent:"center", margin:"6px 0" }}>
              <div style={{ background:PURPLE_L, border:`1px solid #DDD6FE`, borderRadius:8, padding:"10px 14px" }}>
                <div style={{ fontSize:11, color:PURPLE, fontWeight:600, marginBottom:6 }}>📱 類似候補</div>
                {["リアコントロールアーム左","フロントスタビライザーリンク","ロアボールジョイント"].map((p,i) => (
                  <div key={i} style={{ fontSize:12, color:DARK, padding:"3px 0" }}>・{p}</div>
                ))}
              </div>
            </div>
          </>
        )}
        {step2041 >= 3 && choice2041==="たしかに合っている" && (
          <>
            <div style={{ display:"flex", justifyContent:"center", margin:"6px 0" }}>
              <div style={{ background:GREEN_L, border:`1px solid #BBF7D0`, borderRadius:8, padding:"6px 16px", fontSize:12, color:GREEN }}>✓ 部品確定: フロントコントロールアーム左 (31126855157)</div>
            </div>
            {!hiddenBubbles["C-2041-b4"] && <ChatBubble isRight={true} isAI={true} confirmed={!!confirmedBubbles["C-2041-b4"]} text={"ありがとうございます。お見積を承りました。在庫を確認いたしますので暫くお待ちください。"} time="09:14" onConfirm={() => confirmBubble("C-2041-b4")} onEdit={() => editBubble("C-2041-b4","ありがとうございます。お見積を承りました。在庫を確認いたしますので暫くお待ちください。")} />}
          </>
        )}
        {step2041 >= 3 && choice2041==="ぜんぜん違う" && !hiddenBubbles["C-2041-b5"] && (
          <ChatBubble isRight={true} isAI={true} confirmed={!!confirmedBubbles["C-2041-b5"]} text={"ご確認ありがとうございます。適合せず失礼いたしました。恐れ入りますが追加情報を、差し支えない範囲でなるべく多くいただけますと幸いです。"} time="09:14" onConfirm={() => confirmBubble("C-2041-b5")} onEdit={() => editBubble("C-2041-b5","ご確認ありがとうございます。適合せず失礼いたしました。恐れ入りますが追加情報を、差し支えない範囲でなるべく多くいただけますと幸いです。")} />
        )}
      </div>
    );
  }

  return (
    <div className="anim-fade-up" style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {kpiCards.map(k => (
          <div key={k.label} style={{ ...S, padding:"14px 16px" }}>
            <div style={{ fontSize:11, color:GRAY, marginBottom:8 }}>{k.label}</div>
            <div style={{ fontSize:30, fontWeight:700, color:k.color, lineHeight:1 }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:0, background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05)", minHeight:520 }}>
        {/* LEFT LIST */}
        <div style={{ width:selectedCase?360:"100%", flexShrink:0, borderRight:selectedCase?`1px solid ${BORDER}`:"none", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"10px 14px", borderBottom:`1px solid ${BORDER}`, background:"#FAFAFA", display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ display:"flex", gap:0, overflowX:"auto" }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setCh(t.id)} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 10px", fontSize:12, fontWeight:500, cursor:"pointer", background:"transparent", border:"none", fontFamily:"inherit", whiteSpace:"nowrap", borderBottom:ch===t.id?`2px solid ${R}`:"2px solid transparent", color:ch===t.id?R:GRAY, transition:"all .15s" }}>
                  <span>{t.icon}</span><span>{t.label}</span>
                  <span style={{ fontSize:10, fontWeight:600, borderRadius:8, padding:"1px 6px", background:ch===t.id?`${R}15`:"#F3F4F6", color:ch===t.id?R:GRAY_L }}>{t.count}</span>
                </button>
              ))}
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <div style={{ position:"relative", flex:1 }}>
                <Search size={12} style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:GRAY_L }} />
                <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="顧客名・品番・内容で検索" style={{ width:"100%", padding:"6px 8px 6px 28px", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:12, color:DARK, background:WHITE }} />
              </div>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ padding:"6px 8px", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:12, color:DARK, background:WHITE, cursor:"pointer" }}>
                <option value="ALL">全件</option><option value="未返信">未返信</option><option value="返信済">返信済</option><option value="完了">完了</option>
              </select>
              <button onClick={() => setShowNew(true)} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", background:R, color:WHITE, border:"none", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                <Plus size={13} /> 新規
              </button>
            </div>
          </div>
          <div style={{ flex:1, overflowY:"auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding:32, textAlign:"center", color:GRAY_L, fontSize:13 }}>該当する問い合わせがありません</div>
            ) : filtered.map((c, i) => (
              <div key={c.id} onClick={() => setSelected(c.id)} style={{ padding:"12px 14px", borderBottom:`1px solid ${BORDER}`, cursor:"pointer", background:selected===c.id?`${R}06`:WHITE, borderLeft:selected===c.id?`3px solid ${R}`:"3px solid transparent", animation:`fadeUp .2s ${i*.03}s ease both`, opacity:0, transition:"background .1s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:11, fontFamily:"JetBrains Mono", color:R, fontWeight:600 }}>{c.id}</span>
                    <span style={{ fontSize:11, background:"#F3F4F6", color:GRAY, borderRadius:3, padding:"1px 6px" }}>{CH_ICON[c.ch]} {c.ch}</span>
                  </div>
                  <StatusBadge s={c.status} />
                </div>
                <div style={{ fontWeight:600, fontSize:13, color:DARK, marginBottom:2 }}>{c.customer}</div>
                <div style={{ fontSize:11, color:GRAY, marginBottom:4, display:"flex", gap:8 }}>
                  <span>{c.car}</span>
                  {c.part && <span style={{ fontFamily:"JetBrains Mono", color:BLUE }}>{c.part.substring(0,12)}{c.part.length>12?"…":""}</span>}
                </div>
                <div style={{ fontSize:11, color:GRAY_L, display:"flex", justifyContent:"space-between" }}>
                  <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:220 }}>{c.body}</span>
                  <span style={{ flexShrink:0, marginLeft:8 }}>{c.created.split(" ")[1]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT DETAIL */}
        {selectedCase && (
          <div className="anim-slide-left" style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
            <div style={{ padding:"12px 18px", borderBottom:`1px solid ${BORDER}`, background:"#FAFAFA", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                  <span style={{ fontSize:12, fontFamily:"JetBrains Mono", color:R, fontWeight:600 }}>{selectedCase.id}</span>
                  <span style={{ fontSize:11, background:"#F3F4F6", color:GRAY, borderRadius:3, padding:"1px 6px" }}>{CH_ICON[selectedCase.ch]} {selectedCase.ch}</span>
                  <StatusBadge s={selectedCase.status} />
                </div>
                <div style={{ fontSize:15, fontWeight:700, color:DARK }}>{selectedCase.customer}</div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                {selectedCase.status==="未返信" && (
                  <button onClick={() => handleStatusChange(selectedCase.id,"返信済")} style={{ padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit", background:GREEN_L, color:GREEN, border:`1px solid #BBF7D0`, borderRadius:5 }}>返信済にする</button>
                )}
                {selectedCase.status==="返信済" && (
                  <button onClick={() => handleStatusChange(selectedCase.id,"完了")} style={{ padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit", background:"#F9FAFB", color:GRAY, border:`1px solid ${BORDER}`, borderRadius:5 }}>完了にする</button>
                )}
                <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", cursor:"pointer", color:GRAY_L, display:"flex" }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"14px 18px", display:"flex", flexDirection:"column", gap:12 }}>
              {/* Info grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[["車種",selectedCase.car],["部品名",selectedCase.part],["品番",selectedCase.part_no],["電話番号",selectedCase.phone],["担当者",selectedCase.staff||"（未割振）"],["受付日時",selectedCase.created]].map(([lbl,val]) => (
                  <div key={lbl} style={{ background:"#FAFAFA", borderRadius:7, padding:"8px 12px", border:`1px solid ${BORDER}` }}>
                    <div style={{ fontSize:10, color:GRAY_L, marginBottom:2 }}>{lbl}</div>
                    <div style={{ fontSize:12, fontWeight:500, color:lbl==="品番"?R:DARK, fontFamily:lbl==="品番"?"JetBrains Mono":undefined }}>{val||"―"}</div>
                  </div>
                ))}
              </div>
              {selectedCase.note && (
                <div style={{ background:AMBER_L, border:`1px solid #FDE68A`, borderRadius:7, padding:"8px 12px" }}>
                  <div style={{ fontSize:10, color:AMBER, fontWeight:600, marginBottom:3 }}>備考</div>
                  <div style={{ fontSize:12, color:DARK }}>{selectedCase.note}</div>
                </div>
              )}

              {/* ── 仕入先へ確認ボタン ── */}
              {selectedCase.part && selectedCase.status !== "完了" && (
                <div style={{ background:"#F5F3FF", border:`1px solid #DDD6FE`, borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:PURPLE, fontWeight:600, marginBottom:2 }}>部品が確定したら</div>
                    <div style={{ fontSize:12, color:DARK }}>
                      <span style={{ fontFamily:"JetBrains Mono", color:R, fontWeight:600 }}>{selectedCase.part_no}</span>
                      {" / "}{selectedCase.part}
                    </div>
                  </div>
                  <button
                    onClick={handleInquiryToSupplier}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:PURPLE, color:WHITE, border:"none", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}
                  >
                    🔍 この部品で仕入先へ確認
                  </button>
                </div>
              )}

              {/* Chat area */}
              <div>
                <div style={{ fontSize:11, color:GRAY_L, marginBottom:8 }}>
                  {selectedCase.ch==="LINE" ? "💬 LINEチャット（AI対話フロー）" : "受信メッセージ・やり取り履歴"}
                </div>
                <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, padding:14, display:"flex", flexDirection:"column", maxHeight:380, overflowY:"auto" }}>
                  <ChatBubble
                    from={selectedCase.customer}
                    text={selectedCase.body}
                    time={selectedCase.created.split(" ")[1]}
                    avatar={selectedCase.customer.charAt(0)}
                    isRight={false}
                  />
                  {selectedCase.ch==="LINE" && renderLineAIFlow(selectedCase)}
                  {selectedCase.replies.map((r, i) => (
                    <ChatBubble key={i} from="担当" text={r.text} time={r.time} isRight={true} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ borderTop:`1px solid ${BORDER}`, padding:"6px 18px", background:"#FAFAFA" }}>
              <button style={{ fontSize:11, color:GRAY, display:"flex", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
                <Clock size={12} /> {selectedCase.customer} の過去の問い合わせを見る <ChevronRight size={12} />
              </button>
            </div>

            {selectedCase.status !== "完了" && (
              <div style={{ borderTop:`1px solid ${BORDER}`, padding:14, background:WHITE }}>
                {/* Template buttons row */}
                <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                  {templates.filter(t=>t.pinned).map(t => (
                    <button key={t.id} onClick={() => applyTemplate(t)} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 8px", fontSize:11, background:WHITE, color:GRAY, border:`1px solid ${BORDER}`, borderRadius:4, cursor:"pointer", fontFamily:"inherit" }}>
                      <Pin size={10} style={{ color:AMBER }} /> {t.title}
                    </button>
                  ))}
                  {selectedCase.ch==="メール" && (
                    <button onClick={handleAIDraft} disabled={aiDrafting} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 10px", fontSize:11, fontWeight:600, background:"#FEF2F2", color:R, border:`1px solid #FECACA`, borderRadius:4, cursor:"pointer", fontFamily:"inherit" }}>
                      {aiDrafting ? <><Loader2 size={10} className="spin" /> 生成中…</> : <>🤖 AI下書き生成</>}
                    </button>
                  )}
                  <button onClick={() => setShowTemplates(!showTemplates)} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 8px", fontSize:11, background:"#F9FAFB", color:GRAY_L, border:`1px solid ${BORDER}`, borderRadius:4, cursor:"pointer", fontFamily:"inherit" }}>
                    <MoreHorizontal size={10} /> テンプレート一覧
                  </button>
                </div>
                {showTemplates && (
                  <div style={{ marginBottom:8, border:`1px solid ${BORDER}`, borderRadius:8, overflow:"hidden", boxShadow:"0 4px 12px rgba(0,0,0,0.08)" }}>
                    {templates.map(t => (
                      <div key={t.id} style={{ padding:"9px 12px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:8, cursor:"pointer", background:WHITE }} onClick={() => applyTemplate(t)}>
                        <Pin size={12} style={{ color:t.pinned?AMBER:GRAY_L }} onClick={e=>{e.stopPropagation();togglePin(t.id);}} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:500, color:DARK }}>{t.title}</div>
                          <div style={{ fontSize:11, color:GRAY_L, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.body.substring(0,50)}…</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── AI下書き確認モード ── */}
                {aiDraftMode ? (
                  <div>
                    {/* AI下書きバナー */}
                    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background:"#FEF2F2", border:`1px solid #FECACA`, borderRadius:"6px 6px 0 0", borderBottom:"none" }}>
                      <span style={{ fontSize:11, color:R, fontWeight:700 }}>🤖 AI下書き — 送信前に内容をご確認ください</span>
                    </div>
                    {/* Gray readonly textarea */}
                    <textarea
                      value={draft}
                      readOnly
                      rows={5}
                      style={{ width:"100%", border:`1px solid #FECACA`, borderRadius:"0 0 7px 7px", padding:"9px 12px", fontSize:13, color:"#9CA3AF", background:"#FAFAFA", lineHeight:1.7, marginBottom:8, resize:"none", cursor:"default" }}
                    />
                    {/* 送信確定 / 編集 ボタン */}
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <button
                        onClick={() => setAiDraftMode(false)}
                        style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:WHITE, color:GRAY, border:`1px solid ${BORDER}`, borderRadius:7, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}
                      >
                        <Pencil size={13} /> 編集する
                      </button>
                      <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
                        <select style={{ padding:"6px 8px", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:12, color:DARK, background:WHITE }}>
                          <option>📧 メール</option><option>💬 LINE</option><option>📠 FAX</option>
                        </select>
                        <button
                          onClick={handleSend}
                          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 18px", background:R, color:WHITE, border:"none", borderRadius:7, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
                        >
                          <Send size={14} /> 送信確定
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 通常の編集モード */
                  <div>
                    <textarea
                      value={draft}
                      onChange={e => { setDraft(e.target.value); setDraftSaved(false); }}
                      placeholder="返信内容を入力（テンプレートを選択または直接入力）…"
                      rows={4}
                      style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:7, padding:"9px 12px", fontSize:13, color:DARK, background:WHITE, lineHeight:1.7, marginBottom:8, resize:"none" }}
                    />
                    {attachments.length > 0 && (
                      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                        {attachments.map((a,i) => (
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 8px", background:BLUE_L, color:BLUE, border:`1px solid #BFDBFE`, borderRadius:4, fontSize:11 }}>
                            <FileImage size={11} /> {a}
                            <button onClick={() => setAttachments(p=>p.filter((_,j)=>j!==i))} style={{ background:"none", border:"none", cursor:"pointer", color:BLUE, display:"flex" }}><X size={10} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <button onClick={() => setAttachments(p=>[...p,`image_${p.length+1}.jpg`])} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 10px", fontSize:11, background:WHITE, color:GRAY, border:`1px solid ${BORDER}`, borderRadius:6, cursor:"pointer", fontFamily:"inherit" }}>
                        <Paperclip size={13} /> 画像添付
                      </button>
                      <button onClick={() => { setDraftSaved(true); setTimeout(()=>setDraftSaved(false),2000); }} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 10px", fontSize:11, background:WHITE, color:GRAY, border:`1px solid ${BORDER}`, borderRadius:6, cursor:"pointer", fontFamily:"inherit" }}>
                        {draftSaved ? <><CheckCircle2 size={12} style={{ color:GREEN }}/> 保存済</> : <>下書き保存</>}
                      </button>
                      <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
                        <select style={{ padding:"6px 8px", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:12, color:DARK, background:WHITE }}>
                          <option>📧 メール</option><option>💬 LINE</option><option>📠 FAX</option>
                        </select>
                        <button onClick={handleSend} disabled={!draft.trim()} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 16px", background:draft.trim()?R:"#F3F4F6", color:draft.trim()?WHITE:GRAY_L, border:"none", borderRadius:7, fontSize:13, fontWeight:700, cursor:draft.trim()?"pointer":"default", fontFamily:"inherit" }}>
                          <Send size={14} /> 送信
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* NEW MODAL */}
      {showNew && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }} onClick={() => setShowNew(false)}>
          <div style={{ background:WHITE, borderRadius:12, width:520, maxHeight:"85vh", overflow:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)", padding:24 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <div style={{ fontSize:15, fontWeight:700, color:DARK }}>新規問い合わせ作成</div>
              <button onClick={() => setShowNew(false)} style={{ background:"none", border:"none", cursor:"pointer", color:GRAY_L }}><X size={18} /></button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:12, color:GRAY, display:"block", marginBottom:4 }}>チャネル</label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                  {["LINE","FAX","メール","電話"].map(c => (
                    <button key={c} onClick={() => setNewForm(f=>({...f,ch:c}))} style={{ padding:"7px 0", borderRadius:6, fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit", background:newForm.ch===c?`${R}10`:WHITE, color:newForm.ch===c?R:GRAY, border:`1.5px solid ${newForm.ch===c?R:BORDER}`, transition:"all .15s" }}>{CH_ICON[c]} {c}</button>
                  ))}
                </div>
              </div>
              {[["顧客名 *","customer","大阪モーター整備"],["電話番号","phone","06-1234-5678"],["車種","car","BMW 3シリーズ G20"],["部品名","part","フロントコントロールアーム"]].map(([lbl,key,ph]) => (
                <div key={key}>
                  <label style={{ fontSize:12, color:GRAY, display:"block", marginBottom:4 }}>{lbl}</label>
                  <input value={newForm[key]} onChange={e=>setNewForm(f=>({...f,[key]:e.target.value}))} placeholder={ph} style={{ width:"100%", padding:"8px 10px", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:13, color:DARK }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:12, color:GRAY, display:"block", marginBottom:4 }}>問い合わせ内容</label>
                <textarea value={newForm.body} onChange={e=>setNewForm(f=>({...f,body:e.target.value}))} rows={4} style={{ width:"100%", padding:"8px 10px", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:13, color:DARK, lineHeight:1.7, resize:"none" }} />
              </div>
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
                <button onClick={() => setShowNew(false)} style={{ padding:"8px 16px", border:`1px solid ${BORDER}`, borderRadius:7, background:WHITE, color:GRAY, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>キャンセル</button>
                <button onClick={handleNewSubmit} style={{ padding:"8px 18px", background:R, color:WHITE, border:"none", borderRadius:7, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700 }}>登録する</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Counter({ target, prefix="¥", suffix="", duration=1000, run }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (!run) return;
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts-start)/duration, 1);
      setVal(Math.floor(p*target));
      if (p<1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [run, target]);
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════
   SCREEN 1: 仕入先比較（在庫照会フロー付き）
   ═══════════════════════════════════════════════════ */
function SupplierScreen({ inquiryActive, clearInquiry }) {
  const [filters, setFilters] = useState(["全品種"]);
  const [run, setRun] = useState(false);
  const [orderTarget, setOrderTarget] = useState(null); // 発注対象サプライヤー
  const [orderEmailBody, setOrderEmailBody] = useState("");
  const [orderSent, setOrderSent] = useState(false);

  // ── 照会フロー用ステート ──
  const [inquiryPhase, setInquiryPhase] = useState(inquiryActive ? "loading" : "idle");
  // phase: "idle" | "loading" | "done"
  const [inquiryResults, setInquiryResults] = useState({});

  useEffect(() => {
    if (inquiryActive && inquiryPhase === "loading") {
      // 1秒ロード後に結果表示
      const t = setTimeout(() => {
        setInquiryResults({
          "TOHO自動車":       { status:"在庫確認中", method:"システム連携", color:BLUE,   bg:BLUE_L,   border:"#BFDBFE", icon:"🔄" },
          "Ts.CO.Ltd":        { status:"在庫あり・即時確認済", method:"システム即時反映", color:GREEN,  bg:GREEN_L,  border:"#BBF7D0", icon:"✅" },
          "ヤナセオートシステムズ": { status:"FAX送付済", method:"FAX送付済",  color:AMBER,  bg:AMBER_L,  border:"#FDE68A", icon:"📠" },
          "パーツダイレクト":  { status:"FAX送付済", method:"FAX送付済",  color:AMBER,  bg:AMBER_L,  border:"#FDE68A", icon:"📠" },
        });
        setInquiryPhase("done");
        setRun(true);
      }, 1200);
      return () => clearTimeout(t);
    } else if (!inquiryActive) {
      const t = setTimeout(() => setRun(true), 300);
      return () => clearTimeout(t);
    }
  }, [inquiryActive, inquiryPhase]);

  function toggleFilter(f) {
    if (f === "全品種") { setFilters(["全品種"]); return; }
    setFilters(prev => {
      const without = prev.filter(x => x !== "全品種");
      if (without.includes(f)) {
        const next = without.filter(x => x !== f);
        return next.length === 0 ? ["全品種"] : next;
      }
      return [...without, f];
    });
  }

  const suppliers = [
    { name:"TOHO自動車", type:"純正品", typeKey:"純正", price:11305, days:3, score:74, badge:"💰 最安値（純正）", badgeColor:BLUE_L, badgeText:BLUE, borderColor:BORDER, highlight:false },
    { name:"Ts.CO.Ltd", type:"優良品(OEM)", typeKey:"優良", price:7800, days:2, score:91, badge:"🏆 AI推奨", badgeColor:"#FEF2F2", badgeText:R, borderColor:R, highlight:true, reason:"最速納期 / 過去48件クレームゼロ / 中価格帯" },
    { name:"ヤナセオートシステムズ", type:"純正品", typeKey:"純正", price:12100, days:4, score:68, badge:null, borderColor:BORDER, highlight:false },
    { name:"パーツダイレクト", type:"社外品", typeKey:"社外", price:5200, days:4, score:58, badge:"💲 格安", badgeColor:"#F0FDFA", badgeText:"#0D9488", borderColor:"#99F6E4", highlight:false, reason:"保証6ヶ月 / 格安帯 / クレーム履歴3件" },
  ];

  const filterOpts = ["全品種","純正","優良品","社外品"];
  const visible = filters.includes("全品種") ? suppliers : suppliers.filter(s => {
    return filters.some(f => {
      if (f==="純正") return s.typeKey==="純正";
      if (f==="優良品") return s.typeKey==="優良";
      if (f==="社外品") return s.typeKey==="社外";
      return true;
    });
  });

  const typeC = { "純正品":{bg:BLUE_L,c:BLUE}, "優良品(OEM)":{bg:GREEN_L,c:GREEN}, "社外品":{bg:"#F0FDFA",c:"#0D9488"} };

  return (
    <div className="anim-fade-up" style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {/* 照会元情報 */}
      <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, padding:"14px 20px", display:"flex", gap:28, alignItems:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        {inquiryActive ? (
          <>
            <div style={{ display:"flex", gap:28, flex:1 }}>
              {[
                {l:"受付案件",v:inquiryActive.caseId,red:true,mono:true},
                {l:"顧客",v:inquiryActive.customer},
                {l:"対象部品",v:inquiryActive.part || "フロントコントロールアーム左"},
                {l:"品番",v:inquiryActive.part_no || "31126855157",red:true,mono:true},
                {l:"車両",v:inquiryActive.car || "BMW G20 3シリーズ 2021年式"},
              ].map(r=>(
                <div key={r.l}><div style={{ fontSize:11, color:GRAY_L, marginBottom:2 }}>{r.l}</div>
                <div style={{ fontSize:13, fontWeight:600, color:r.red?R:DARK, fontFamily:r.mono?"JetBrains Mono":undefined }}>{r.v}</div></div>
              ))}
            </div>
            <button onClick={clearInquiry} style={{ fontSize:11, color:GRAY_L, background:"none", border:`1px solid ${BORDER}`, borderRadius:5, padding:"4px 10px", cursor:"pointer", fontFamily:"inherit" }}>照会解除</button>
          </>
        ) : (
          <>
            {[{l:"対象部品",v:"フロントコントロールアーム左"},{l:"品番",v:"31126855157",red:true,mono:true},{l:"車両",v:"BMW G20 3シリーズ 2021年式"}].map(r=>(
              <div key={r.l}><div style={{ fontSize:11, color:GRAY_L, marginBottom:2 }}>{r.l}</div>
              <div style={{ fontSize:13, fontWeight:600, color:r.red?R:DARK, fontFamily:r.mono?"JetBrains Mono":undefined }}>{r.v}</div></div>
            ))}
          </>
        )}
      </div>

      {/* ── AIが確認中ローディング ── */}
      {inquiryPhase === "loading" && (
        <div style={{ background:PURPLE_L, border:`1px solid #DDD6FE`, borderRadius:10, padding:"20px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <Loader2 size={28} style={{ color:PURPLE, animation:"spin .9s linear infinite" }} />
          <div style={{ fontSize:14, fontWeight:600, color:PURPLE }}>AIが仕入先へ在庫確認・見積依頼を送信中…</div>
          <div style={{ fontSize:12, color:GRAY, textAlign:"center", lineHeight:1.7 }}>
            各仕入先のシステム接続・FAX送付を並行処理しています。<br/>しばらくお待ちください。
          </div>
          <div style={{ display:"flex", gap:16, marginTop:4 }}>
            {suppliers.map(s => (
              <div key={s.name} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:WHITE, borderRadius:7, border:`1px solid #DDD6FE`, fontSize:12, color:GRAY }}>
                <Loader2 size={12} style={{ color:PURPLE, animation:"spin .9s linear infinite" }} />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 照会結果バナー（done時） ── */}
      {inquiryPhase === "done" && (
        <div style={{ background:GREEN_L, border:`1px solid #BBF7D0`, borderRadius:10, padding:"12px 18px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:GREEN, marginBottom:6 }}>✅ 仕入先への在庫確認・見積依頼が完了しました</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {Object.entries(inquiryResults).map(([name, res]) => (
              <div key={name} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 12px", background:res.bg, border:`1px solid ${res.border}`, borderRadius:6, fontSize:11, color:res.color, fontWeight:500 }}>
                <span>{res.icon}</span>
                <span style={{ fontWeight:600 }}>{name}</span>
                <span style={{ fontWeight:400 }}>— {res.method}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 平常時は loading 中でもフィルタ非表示 ── */}
      {inquiryPhase !== "loading" && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {filterOpts.map(f => {
            const active = f==="全品種" ? filters.includes("全品種") : filters.includes(f);
            return (
              <button key={f} onClick={() => toggleFilter(f)} style={{ padding:"7px 16px", borderRadius:20, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", background:active?R:WHITE, color:active?WHITE:GRAY, border:`1px solid ${active?R:BORDER}`, transition:"all .15s", display:"flex", alignItems:"center", gap:5 }}>
                {active && f!=="全品種" && <CheckCircle2 size={13} />}
                {f}
              </button>
            );
          })}
          {!filters.includes("全品種") && (
            <div style={{ padding:"7px 10px", fontSize:12, color:GRAY_L, display:"flex", alignItems:"center" }}>
              {filters.length}種類選択中
            </div>
          )}
        </div>
      )}

      {inquiryPhase !== "loading" && (
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${visible.length},1fr)`, gap:16 }}>
          {visible.map((s, i) => {
            const tc = typeC[s.type] || {bg:"#F9FAFB",c:GRAY};
            const inqRes = inquiryResults[s.name];
            return (
              <div key={s.name} style={{ background:WHITE, borderRadius:10, border:`1.5px solid ${s.borderColor}`, padding:22, boxShadow:s.highlight?`0 4px 20px ${R}20`:"0 1px 3px rgba(0,0,0,0.05)", animation:`slideR .35s ${i*.1}s ease both`, opacity:0 }}>
                {s.badge && <span style={{ display:"inline-block", background:s.badgeColor, color:s.badgeText, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:5, marginBottom:12 }}>{s.badge}</span>}

                {/* ── 照会ステータスバッジ ── */}
                {inqRes && (
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10, padding:"4px 10px", background:inqRes.bg, border:`1px solid ${inqRes.border}`, borderRadius:5, fontSize:11, color:inqRes.color, fontWeight:600 }}>
                    <span>{inqRes.icon}</span> {inqRes.status}
                  </div>
                )}

                <div style={{ fontWeight:700, fontSize:16, color:DARK, marginBottom:4 }}>{s.name}</div>
                <div style={{ marginBottom:14 }}>
                  <span style={{ background:tc.bg, color:tc.c, fontSize:11, fontWeight:600, padding:"2px 10px", borderRadius:4 }}>{s.type}</span>
                </div>
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, color:GRAY_L, marginBottom:2 }}>仕入単価</div>
                  <div style={{ fontSize:30, fontWeight:700, color:s.highlight?R:DARK, fontFamily:"JetBrains Mono" }}><Counter target={s.price} run={run} /></div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                  {[{l:"納期",v:s.days,suffix:"営業日",c:s.days===2?GREEN:DARK},{l:"スコア",v:s.score,suffix:"pt",c:s.score>=90?GREEN:s.score>=75?AMBER:GRAY}].map(m=>(
                    <div key={m.l} style={{ background:"#F9FAFB", borderRadius:8, padding:10, border:`1px solid ${BORDER}` }}>
                      <div style={{ fontSize:10, color:GRAY_L, marginBottom:2 }}>{m.l}</div>
                      <div style={{ fontSize:18, fontWeight:700, color:m.c, fontFamily:"JetBrains Mono" }}><Counter target={m.v} prefix="" suffix={m.suffix} run={run} duration={800} /></div>
                    </div>
                  ))}
                </div>
                {s.reason && <div style={{ background:s.highlight?"#FEF2F2":"#F9FAFB", border:`1px solid ${s.highlight?"#FECACA":BORDER}`, borderRadius:8, padding:10, marginBottom:16 }}>
                  <div style={{ fontSize:10, color:s.highlight?R:GRAY, fontWeight:700, marginBottom:3 }}>AI推奨理由</div>
                  <div style={{ fontSize:11, color:DARK }}>{s.reason}</div>
                </div>}
                <button
                  onClick={() => {
                    if (s.highlight || true) {
                      const partName = inquiryActive?.part || "フロントコントロールアーム左";
                      const partNo   = inquiryActive?.part_no || "31126855157";
                      const customer = inquiryActive?.customer || "大阪モーター整備";
                      const car      = inquiryActive?.car || "BMW G20 3シリーズ";
                      setOrderTarget(s);
                      setOrderSent(false);
                      setOrderEmailBody(
`${s.name} ご担当者様

いつもお世話になっております。
カレント自動車株式会社 パーツ部でございます。

下記の通りご発注申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━
■ 発注品目
  品番　: ${partNo}
  品名　: ${partName}
  数量　: 1個
  仕入単価: ¥${s.price.toLocaleString()}
  お届け先: ${customer}（${car}）

■ お届け先住所
  〒XXX-XXXX 大阪府大阪市…
  ${customer} 御中

■ 納期希望
  お早めにご手配いただけますと幸いです。
  （目安: ${s.days}営業日）

■ 直送のお願い
  お手数ですが、上記お届け先へ直送を
  お願いいたします。伝票には「カレント
  自動車株式会社」とご記載ください。
━━━━━━━━━━━━━━━━━━━━━━━━

ご不明な点がございましたらお気軽にご連絡ください。
どうぞよろしくお願いいたします。

カレント自動車株式会社 パーツ部
TEL: 045-XXX-XXXX
MAIL: parts@currentmotor.co.jp`
                      );
                    }
                  }}
                  style={{ width:"100%", padding:"10px 0", borderRadius:8, fontSize:13, fontWeight:600, background:s.highlight?R:WHITE, color:s.highlight?WHITE:GRAY, border:`1px solid ${s.highlight?R:BORDER}`, cursor:"pointer", fontFamily:"inherit" }}
                >
                  {s.highlight ? "この仕入先で発注する →" : "選択する"}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {/* ── 発注指示メール パネル ── */}
      {orderTarget && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:60, animation:"fadeUp .2s ease both" }}>
          <div style={{ background:WHITE, borderRadius:14, width:640, maxHeight:"88vh", overflow:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.25)", display:"flex", flexDirection:"column" }}>
            {/* ── Header ── */}
            {!orderSent ? (
              <>
                <div style={{ padding:"18px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:38, height:38, borderRadius:9, background:`${R}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Send size={17} style={{ color:R }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:DARK }}>発注指示メール作成</div>
                    <div style={{ fontSize:11, color:GRAY_L, marginTop:2 }}>
                      送信先: <span style={{ fontWeight:600, color:DARK }}>{orderTarget.name}</span>
                      　仕入単価: <span style={{ fontFamily:"JetBrains Mono", color:R, fontWeight:700 }}>¥{orderTarget.price.toLocaleString()}</span>
                      　納期: <span style={{ color:GREEN, fontWeight:600 }}>{orderTarget.days}営業日</span>
                    </div>
                  </div>
                  <button onClick={() => setOrderTarget(null)} style={{ background:"none", border:"none", cursor:"pointer", color:GRAY_L, display:"flex" }}>
                    <X size={18} />
                  </button>
                </div>
                <div style={{ padding:"16px 24px", display:"flex", flexDirection:"column", gap:12 }}>
                  {/* Supplier type badge */}
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ background:orderTarget.highlight?"#FEF2F2":BLUE_L, color:orderTarget.highlight?R:BLUE, fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:20, border:`1px solid ${orderTarget.highlight?"#FECACA":"#BFDBFE"}` }}>
                      {orderTarget.highlight ? "🏆 AI推奨サプライヤー" : "選択サプライヤー"}
                    </span>
                    <span style={{ background:GREEN_L, color:GREEN, fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, border:"1px solid #BBF7D0" }}>
                      スコア {orderTarget.score}pt
                    </span>
                  </div>
                  {/* Email fields */}
                  {[
                    ["宛先", `${orderTarget.name} ご担当者様`],
                    ["件名", `【発注依頼】${inquiryActive?.part || "フロントコントロールアーム左"} / 品番: ${inquiryActive?.part_no || "31126855157"}`],
                    ["送信元", "小嶋 鹿乃雲 <kojima@currentmotor.co.jp>"],
                  ].map(([lbl, val]) => (
                    <div key={lbl} style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ fontSize:11, color:GRAY_L, width:42, flexShrink:0, textAlign:"right" }}>{lbl}</div>
                      <input defaultValue={val} style={{ flex:1, padding:"7px 10px", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:12, color:DARK, background:"#FAFAFA" }} />
                    </div>
                  ))}
                  <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:12 }}>
                    <div style={{ fontSize:11, color:GRAY_L, marginBottom:6 }}>本文</div>
                    <textarea
                      value={orderEmailBody}
                      onChange={e => setOrderEmailBody(e.target.value)}
                      rows={16}
                      style={{ width:"100%", padding:"10px 12px", border:`1px solid ${BORDER}`, borderRadius:7, fontSize:12, color:DARK, background:WHITE, lineHeight:1.8, resize:"vertical", fontFamily:"'Noto Sans JP',sans-serif" }}
                    />
                  </div>
                  {/* Attachments hint */}
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", background:BLUE_L, color:BLUE, border:"1px solid #BFDBFE", borderRadius:5, fontSize:11, fontWeight:500 }}>
                      <FileImage size={12} /> 発注書PDF（自動生成）
                    </div>
                    <div style={{ fontSize:11, color:GRAY_L }}>自動添付されます</div>
                  </div>
                </div>
                <div style={{ padding:"14px 24px", borderTop:`1px solid ${BORDER}`, background:"#FAFAFA", display:"flex", gap:10, justifyContent:"flex-end" }}>
                  <button onClick={() => setOrderTarget(null)} style={{ padding:"9px 18px", border:`1px solid ${BORDER}`, borderRadius:8, background:WHITE, color:GRAY, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>
                    キャンセル
                  </button>
                  <button
                    onClick={() => setOrderSent(true)}
                    style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 22px", background:R, color:WHITE, border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
                  >
                    <Send size={14} /> 発注メールを送信する
                  </button>
                </div>
              </>
            ) : (
              /* ── 送信完了画面 ── */
              <div style={{ padding:"48px 40px", display:"flex", flexDirection:"column", alignItems:"center", gap:20, textAlign:"center" }}>
                <div style={{ width:64, height:64, borderRadius:"50%", background:GREEN_L, border:"2px solid #BBF7D0", display:"flex", alignItems:"center", justifyContent:"center", animation:"fadeUp .4s ease both" }}>
                  <CheckCircle2 size={30} style={{ color:GREEN }} />
                </div>
                <div style={{ animation:"fadeUp .4s .1s ease both", opacity:0 }}>
                  <div style={{ fontSize:18, fontWeight:700, color:DARK, marginBottom:8 }}>発注メールを送信しました</div>
                  <div style={{ fontSize:13, color:GRAY, lineHeight:1.8 }}>
                    <span style={{ fontWeight:600, color:DARK }}>{orderTarget.name}</span> へ発注指示メールを送付しました。<br/>
                    発注書PDFも自動添付されています。
                  </div>
                </div>
                {/* Summary card */}
                <div style={{ width:"100%", background:"#FAFAFA", border:`1px solid ${BORDER}`, borderRadius:10, padding:"16px 20px", animation:"fadeUp .4s .2s ease both", opacity:0 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, textAlign:"left" }}>
                    {[
                      ["仕入先", orderTarget.name],
                      ["品番", inquiryActive?.part_no || "31126855157"],
                      ["品名", inquiryActive?.part || "フロントコントロールアーム左"],
                      ["仕入単価", `¥${orderTarget.price.toLocaleString()}`],
                      ["納期目安", `${orderTarget.days}営業日`],
                      ["お届け先", inquiryActive?.customer || "大阪モーター整備"],
                    ].map(([lbl, val]) => (
                      <div key={lbl} style={{ padding:"8px 12px", background:WHITE, borderRadius:7, border:`1px solid ${BORDER}` }}>
                        <div style={{ fontSize:10, color:GRAY_L, marginBottom:2 }}>{lbl}</div>
                        <div style={{ fontSize:12, fontWeight:600, color:lbl==="品番"||lbl==="仕入単価"?R:DARK, fontFamily:lbl==="品番"?"JetBrains Mono":undefined }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Next steps */}
                <div style={{ width:"100%", background:BLUE_L, border:"1px solid #BFDBFE", borderRadius:10, padding:"12px 16px", textAlign:"left", animation:"fadeUp .4s .3s ease both", opacity:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:BLUE, marginBottom:8 }}>次のステップ</div>
                  {[
                    "仕入先からの発送確認連絡をお待ちください",
                    "追跡番号が届いたら「受注・発送」ページで登録します",
                    "発送完了後、請求書を自動発行します",
                  ].map((step, i) => (
                    <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:i<2?6:0 }}>
                      <span style={{ width:18, height:18, borderRadius:"50%", background:BLUE, color:WHITE, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0, marginTop:1 }}>{i+1}</span>
                      <span style={{ fontSize:12, color:DARK }}>{step}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setOrderTarget(null); setOrderSent(false); }}
                  style={{ padding:"10px 28px", background:DARK, color:WHITE, border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", animation:"fadeUp .4s .4s ease both", opacity:0 }}
                >
                  閉じる
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SCREEN 2: 見積作成
   ═══════════════════════════════════════════════════ */
function QuoteScreen() {
  const [margin, setMargin] = useState(20);
  const [aiApplied, setAiApplied] = useState(false);
  const [sent, setSent] = useState(false);
  const [method, setMethod] = useState("メール");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const cost = 7800;
  const aiMargin = 28;
  const raw = cost * (1 + margin/100);
  const final = Math.ceil(raw/100) * 100;
  const tax = Math.round(final * 0.1);
  const total = final + tax;
  const box = { background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, padding:20, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" };

  const emailBody = `大阪モーター整備 ご担当者様

いつもお世話になっております。
カレント自動車株式会社 パーツ部でございます。

先ほどのお問い合わせについて、お見積もりをご案内いたします。

━━━━━━━━━━━━━━━━━━━━━━━━
■ お見積内容
  見積番号: Q-2041
  品番　　: 31126855157
  品名　　: フロントコントロールアーム左
  　　　　  （BMW G20 / OEM品）
  数量　　: 1個
  単価　　: ¥${final.toLocaleString()}
  消費税  : ¥${tax.toLocaleString()}
  合計　　: ¥${total.toLocaleString()}（税込）

■ 納期目安
  2営業日（在庫あり）

■ お支払い条件
  月末締め翌月末払い
━━━━━━━━━━━━━━━━━━━━━━━━

見積書PDFを添付しております。
ご確認のほどよろしくお願いいたします。

ご不明な点はお気軽にお申し付けください。

カレント自動車株式会社 パーツ部
小嶋 鹿乃雲
TEL: 045-XXX-XXXX
MAIL: kojima@currentmotor.co.jp`;

  return (
    <>
    <div className="anim-fade-up" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={box}>
          <div style={{ fontSize:11, color:GRAY_L, marginBottom:2 }}>仕入先</div>
          <div style={{ fontWeight:700, fontSize:15, color:DARK, marginBottom:12 }}>Ts.CO.Ltd（優良品 OEM）</div>
          <div style={{ fontSize:11, color:GRAY_L, marginBottom:4 }}>仕入原価</div>
          <div style={{ fontFamily:"JetBrains Mono", fontSize:28, fontWeight:700, color:DARK }}>¥{cost.toLocaleString()}</div>
          <div style={{ fontFamily:"JetBrains Mono", fontSize:11, color:GRAY_L, marginTop:2 }}>品番: 31126855157</div>
        </div>
        <div style={box}>
          <div style={{ fontSize:14, fontWeight:600, color:DARK, marginBottom:14 }}>マージン率設定</div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <input type="range" min={0} max={50} value={margin} onChange={e=>{setMargin(Number(e.target.value));setAiApplied(false);}} style={{ flex:1, accentColor:R, height:4 }} />
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <input type="number" value={margin} min={0} max={50} onChange={e=>{setMargin(Number(e.target.value));setAiApplied(false);}} style={{ width:56, textAlign:"center", border:`1px solid ${BORDER}`, borderRadius:6, padding:"5px 0", fontSize:14, fontFamily:"inherit", color:DARK }} />
              <span style={{ fontSize:13, color:GRAY }}>%</span>
            </div>
          </div>
          <div style={{ background:"#FEF2F2", border:`1px solid #FECACA`, borderRadius:8, padding:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:11, color:R, fontWeight:600, marginBottom:2 }}>AI推奨マージン</div>
                <div style={{ fontSize:26, fontWeight:700, color:R, fontFamily:"JetBrains Mono" }}>{aiMargin}%</div>
                <div style={{ fontSize:10, color:GRAY, marginTop:2 }}>大阪モーター整備×BMW部品 過去成約率より算出</div>
              </div>
              <button onClick={() => {setMargin(aiMargin);setAiApplied(true);}} style={{ background:R, color:WHITE, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>適用する</button>
            </div>
            {aiApplied && <div style={{ marginTop:8, fontSize:11, color:GREEN, fontWeight:600 }}>✓ AI推奨マージン適用済み</div>}
          </div>
        </div>
        <div style={box}>
          <div style={{ fontSize:14, fontWeight:600, color:DARK, marginBottom:12 }}>価格計算</div>
          {[
            {l:"仕入原価", v:`¥${cost.toLocaleString()}`},
            {l:`マージン（${margin}%）`, v:`＋¥${Math.round(cost*margin/100).toLocaleString()}`},
            {l:"端数切上（¥100単位）", v:`→ ¥${final.toLocaleString()}`, accent:true},
          ].map((r,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:i<2?`1px solid ${BORDER}`:undefined }}>
              <span style={{ fontSize:12, color:GRAY }}>{r.l}</span>
              <span style={{ fontFamily:"JetBrains Mono", fontSize:13, fontWeight:600, color:r.accent?R:DARK }}>{r.v}</span>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:14, paddingTop:14, borderTop:`2px solid ${BORDER}` }}>
            <span style={{ fontWeight:700, fontSize:14, color:DARK }}>お見積金額</span>
            <span style={{ fontFamily:"JetBrains Mono", fontSize:26, fontWeight:700, color:R }}>¥{final.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
{/* ── 右カラム: 見積書プレビュー ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.05)", fontSize:11 }}>

            {/* ── ① ヘッダー: 宛先（左）＋ ロゴ・発行者（右） ── */}
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              {/* 左: 宛先 */}
              <div>
                <div style={{ color:"#666" }}>〒216-0012 神奈川県川崎市宮前区水沢2-17-10</div>
                <div style={{ color:"#666", marginBottom:8 }}>TEL:044-978-5678　FAX:044-978-5679</div>
                <div style={{ fontWeight:700, fontSize:14, color:DARK }}>WORK HERO株式会社　整備ユニット</div>
                <div style={{ fontWeight:700, fontSize:13, color:DARK }}>テックセンター　御中</div>
              </div>
              {/* 右: ロゴ＋発行者 */}
              <div style={{ textAlign:"right" }}>
                <img
                  src="https://scontent-nrt1-2.xx.fbcdn.net/v/t39.30808-1/294942328_340184231660789_7377181289936199718_n.jpg?stp=dst-jpg_s240x240_tt6&_nc_cat=101&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=Zozwpq6FMGEQ7kNvwGghh-i&_nc_oc=Adrpczj8AXpTeRaYzhh4fke_AFTIWP5xJ4YDIn0iJ4gKCTh4DB_Gxlc6m6dJKU__dnQ5Kp4bXn73SsUGVy2FkWUu&_nc_zt=24&_nc_ht=scontent-nrt1-2.xx&_nc_gid=ikiejMHU7Coj6Jc0l8lWpg&_nc_ss=7a3a8&oh=00_Af1SWRKy9OirOjladMkmXt6WLBhePSLBOaKW8vQfSbUJtw&oe=69DCC5F5"
                  alt="Current Motor"
                  style={{ height:36, objectFit:"contain", display:"block", marginLeft:"auto" }}
                />
                <div style={{ fontWeight:600, color:DARK, marginTop:4 }}>カレント自動車株式会社</div>
                <div style={{ color:"#666", marginTop:2 }}>カレントパーツサプライ</div>
                <div style={{ color:"#666" }}>〒222-0033 神奈川県横浜市港北区新横浜2-5-11</div>
                <div style={{ color:"#666" }}>金子第1ビル2F</div>
                <div style={{ color:"#666" }}>TEL:045-479-9957　FAX:045-479-9958</div>
                <div style={{ color:"#666", marginTop:2 }}>京浜ロジスティクスセンタ / 尼崎ロジスティクスセンタ</div>
              </div>
            </div>

            <div style={{ borderTop:`2px solid ${DARK}`, marginBottom:12 }} />

            {/* ── ② 件名エリア（左）＋ 発行情報（右） ── */}
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14, gap:16 }}>
              {/* 左: 件名・納期等 */}
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5 }}>
                {[
                  ["件名",         "フロントコントロールアーム左 他"],
                  ["納期",         "2営業日（在庫あり）"],
                  ["納入先",       "WORK HERO株式会社"],
                  ["お支払条件",   "月末締め翌月末払い"],
                  ["お見積有効期限","2026/04/21（2週間）"],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display:"flex", gap:8, alignItems:"baseline" }}>
                    <span style={{ color:GRAY, minWidth:88, flexShrink:0 }}>{lbl}</span>
                    <span style={{ borderBottom:`1px solid #ccc`, flex:1, paddingBottom:1, color:DARK }}>{val}</span>
                  </div>
                ))}
              </div>
              {/* 右: 合計金額＋発行情報 */}
              <div style={{ display:"flex", flexDirection:"column", gap:8, minWidth:180 }}>
                <div style={{ border:`1px solid ${DARK}`, borderRadius:4, padding:"8px 14px", textAlign:"center" }}>
                  <div style={{ color:GRAY, marginBottom:2 }}>合計金額（税込）</div>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:18, fontWeight:700, color:R }}>¥{"50,875"}</div>
                </div>
                <div style={{ border:`1px solid ${BORDER}`, borderRadius:4, padding:"8px 12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ color:GRAY }}>発行日</span><span style={{ color:DARK }}>2026.04.07</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}><span style={{ color:GRAY }}>見積No</span><span style={{ fontFamily:"JetBrains Mono", color:R }}>Q-2041</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}><span style={{ color:GRAY }}>担当</span><span style={{ color:DARK }}>小嶋　鹿乃雲</span></div>
                </div>
              </div>
            </div>

            <div style={{ color:GRAY_L, marginBottom:8 }}>ご照会の件、下記の通りお見積り申し上げます。</div>

            {/* ── ③ 明細テーブル ── */}
            <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:0 }}>
              <thead>
                <tr style={{ background:DARK, color:WHITE }}>
                  {["品　　名", "数量", "単位", "単　価", "税抜金額"].map(h => (
                    <th key={h} style={{ padding:"5px 8px", textAlign:h==="品　　名"?"left":"right", fontWeight:500, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom:"1px solid #eee" }}>
                  <td style={{ padding:"8px" }}>
                    フロントコントロールアーム左<br/>
                    <span style={{ fontSize:10, color:"#999", fontFamily:"monospace" }}>31126855157　BMW G20 / OEM品</span>
                  </td>
                  <td style={{ padding:"8px", textAlign:"right" }}>1</td>
                  <td style={{ padding:"8px", textAlign:"right" }}>個</td>
                  <td style={{ padding:"8px", textAlign:"right" }}>¥{final.toLocaleString()}</td>
                  <td style={{ padding:"8px", textAlign:"right", fontWeight:600 }}>¥{final.toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom:"1px solid #eee" }}>
                  <td style={{ padding:"8px" }}>
                    イグニッションコイル（High Power）<br/>
                    <span style={{ fontSize:10, color:"#999", fontFamily:"monospace" }}>12138643360 G20 / OEM品</span>
                  </td>
                  <td style={{ padding:"8px", textAlign:"right" }}>4</td>
                  <td style={{ padding:"8px", textAlign:"right" }}>個</td>
                  <td style={{ padding:"8px", textAlign:"right" }}>¥{"6,800"}</td>
                  <td style={{ padding:"8px", textAlign:"right", fontWeight:600 }}>¥{"27,200"}</td>
                </tr>
                <tr style={{ borderBottom:"1px solid #eee" }}>
                  <td style={{ padding:"8px" }}>
                    湿式エアクリーナーエレメント<br/>
                    <span style={{ fontSize:10, color:"#999", fontFamily:"monospace" }}>13718691835 G20 / OEM品</span>
                  </td>
                  <td style={{ padding:"8px", textAlign:"right" }}>1</td>
                  <td style={{ padding:"8px", textAlign:"right" }}>個</td>
                  <td style={{ padding:"8px", textAlign:"right" }}>¥{"5,200"}</td>
                  <td style={{ padding:"8px", textAlign:"right", fontWeight:600 }}>¥{"5,200"}</td>
                </tr>
                <tr style={{ borderBottom:"1px solid #eee" }}>
                  <td style={{ padding:"8px" }}>
                    フロント ブレーキパッド センサー<br/>
                    <span style={{ fontSize:10, color:"#999", fontFamily:"monospace" }}>34356870349 G20 / OEM品</span>
                  </td>
                  <td style={{ padding:"8px", textAlign:"right" }}>1</td>
                  <td style={{ padding:"8px", textAlign:"right" }}>個</td>
                  <td style={{ padding:"8px", textAlign:"right" }}>¥{"3,900"}</td>
                  <td style={{ padding:"8px", textAlign:"right", fontWeight:600 }}>¥{"3,900"}</td>
                </tr>
                <tr style={{ borderBottom:"1px solid #eee" }}>
                  <td style={{ padding:"8px" }}>
                    送料<br/>
                    <span style={{ fontSize:10, color:"#999", fontFamily:"monospace" }}></span>
                  </td>
                  <td style={{ padding:"8px", textAlign:"right" }}></td>
                  <td style={{ padding:"8px", textAlign:"right" }}></td>
                  <td style={{ padding:"8px", textAlign:"right" }}></td>
                  <td style={{ padding:"8px", textAlign:"right", fontWeight:600 }}>¥{"550"}</td>
                </tr>
                {/* 空行（PDFに合わせて余白確保） */}
                {[...Array(4)].map((_,i) => (
                  <tr key={i} style={{ borderBottom:"1px solid #eee" }}>
                    <td style={{ padding:"6px 8px" }}></td>
                    <td /><td /><td /><td />
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── ④ フッター: 振込先・備考（左）＋ 小計・税・合計（右） ── */}
            <div style={{ display:"flex", gap:16, marginTop:8, borderTop:"1px solid #eee", paddingTop:10 }}>
              {/* 左: 振込先・備考 */}
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:12 }}>
                  <div style={{ flex:1, border:`1px solid ${BORDER}`, borderRadius:4, padding:"8px 10px" }}>
                    <div style={{ fontWeight:600, color:DARK, marginBottom:4 }}>振込先</div>
                    <div style={{ color:GRAY }}>PayPay銀行 本店営業部</div>
                    <div style={{ color:GRAY }}>普通 1553622</div>
                    <div style={{ color:GRAY }}>カレント自動車株式会社</div>
                    <div style={{ color:GRAY_L, fontSize:10, marginTop:6 }}>※振込手数料はお客様にてご負担くださいませ。</div>
                    <div style={{ color:GRAY_L, fontSize:10 }}>※6ヵ月以内かつ10,000km未満の部品保証がございます。</div>
                  </div>
                  <div style={{ flex:1, border:`1px solid ${BORDER}`, borderRadius:4, padding:"8px 10px" }}>
                    <div style={{ fontWeight:600, color:DARK, marginBottom:4 }}>備　考</div>
                  </div>
                </div>
              </div>
              {/* 右: 小計・消費税・合計 */}
              <div style={{ minWidth:180 }}>
                {[
                  ["【 小　計 】", `¥${"46,250"}`],
                  ["【 消費税 】", `¥${"4,625"}`],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:"1px solid #eee" }}>
                    <span style={{ color:GRAY }}>{lbl}</span>
                    <span style={{ fontFamily:"JetBrains Mono", color:DARK }}>{val}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`2px solid ${DARK}` }}>
                  <span style={{ fontWeight:700, color:DARK }}>【 合　計 】</span>
                  <span style={{ fontFamily:"JetBrains Mono", fontWeight:700, fontSize:14, color:R }}>¥{"50,875"}</span>
                </div>
                <div style={{ textAlign:"right", color:GRAY_L, marginTop:6 }}>【 1 / 1 】</div>
              </div>
            </div>

          </div>

          {/* ── 送付方法 ── */}
          <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
              {["FAX","メール"].map(m => (
                <button key={m} onClick={() => setMethod(m)} style={{ padding:"9px 0", borderRadius:7, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", background:method===m?R:WHITE, color:method===m?WHITE:GRAY, border:`1px solid ${method===m?R:BORDER}`, transition:"all .15s" }}>
                  {m==="FAX" ? "📠 FAX送付" : "📧 メール送付"}
                </button>
              ))}
            </div>
            {!sent ? (
              <button
                onClick={() => { if (method === "メール") { setShowEmailModal(true); } else { setSent(true); } }}
                style={{ width:"100%", padding:"12px 0", background:R, color:WHITE, border:"none", borderRadius:8, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
              >
                {method === "メール" ? "📧 見積書をメール送付する →" : "📠 FAXで送付する →"}
              </button>
            ) : (
              <div style={{ textAlign:"center", padding:"12px 0", color:GREEN, fontWeight:600, fontSize:14 }}>
                ✓ 送付完了（{method} / {new Date().toLocaleTimeString("ja-JP")}）
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* ── 見積メール作成モーダル ── */}
    {showEmailModal && (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:60 }}>
        <div style={{ background:WHITE, borderRadius:14, width:660, maxHeight:"90vh", overflow:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.25)", display:"flex", flexDirection:"column" }}>
          {!emailSent ? (
            <>
              {/* Header */}
              <div style={{ padding:"18px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:38, height:38, borderRadius:9, background:`${BLUE}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Mail size={17} style={{ color:BLUE }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:DARK }}>見積書メール作成</div>
                  <div style={{ fontSize:11, color:GRAY_L, marginTop:2 }}>
                    送信先: <span style={{ fontWeight:600, color:DARK }}>大阪モーター整備</span>
                    　合計: <span style={{ fontFamily:"JetBrains Mono", color:R, fontWeight:700 }}>¥{total.toLocaleString()}（税込）</span>
                  </div>
                </div>
                <button onClick={() => setShowEmailModal(false)} style={{ background:"none", border:"none", cursor:"pointer", color:GRAY_L, display:"flex" }}>
                  <X size={18} />
                </button>
              </div>
              {/* Fields */}
              <div style={{ padding:"16px 24px", display:"flex", flexDirection:"column", gap:12 }}>
                {[
                  ["宛先", "大阪モーター整備 田中 誠様 <tanaka@osaka-motor.co.jp>"],
                  ["CC", "kojima@currentmotor.co.jp"],
                  ["件名", `【お見積書】フロントコントロールアーム左 / Q-2041 / ¥${total.toLocaleString()}（税込）`],
                  ["送信元", "小嶋 鹿乃雲 <kojima@currentmotor.co.jp>"],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ fontSize:11, color:GRAY_L, width:46, flexShrink:0, textAlign:"right" }}>{lbl}</div>
                    <input defaultValue={val} style={{ flex:1, padding:"7px 10px", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:12, color:DARK, background:"#FAFAFA" }} />
                  </div>
                ))}
                <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:12 }}>
                  <div style={{ fontSize:11, color:GRAY_L, marginBottom:6 }}>本文</div>
                  <textarea
                    defaultValue={emailBody}
                    rows={14}
                    style={{ width:"100%", padding:"10px 12px", border:`1px solid ${BORDER}`, borderRadius:7, fontSize:12, color:DARK, background:WHITE, lineHeight:1.8, resize:"vertical", fontFamily:"'Noto Sans JP',sans-serif" }}
                  />
                </div>
                {/* Attachment */}
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", background:"#FEF2F2", color:R, border:"1px solid #FECACA", borderRadius:5, fontSize:11, fontWeight:600 }}>
                    <FileText size={12} /> Q-2041_見積書.pdf
                  </div>
                  <div style={{ fontSize:11, color:GRAY_L }}>自動添付（見積書PDF）</div>
                </div>
              </div>
              {/* Footer */}
              <div style={{ padding:"14px 24px", borderTop:`1px solid ${BORDER}`, background:"#FAFAFA", display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={() => setShowEmailModal(false)} style={{ padding:"9px 18px", border:`1px solid ${BORDER}`, borderRadius:8, background:WHITE, color:GRAY, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>
                  キャンセル
                </button>
                <button
                  onClick={() => setEmailSent(true)}
                  style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 22px", background:R, color:WHITE, border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
                >
                  <Send size={14} /> 見積書を送信する
                </button>
              </div>
            </>
          ) : (
            /* 送信完了 */
            <div style={{ padding:"48px 40px", display:"flex", flexDirection:"column", alignItems:"center", gap:20, textAlign:"center" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:GREEN_L, border:"2px solid #BBF7D0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <CheckCircle2 size={30} style={{ color:GREEN }} />
              </div>
              <div>
                <div style={{ fontSize:18, fontWeight:700, color:DARK, marginBottom:8 }}>見積書メールを送信しました</div>
                <div style={{ fontSize:13, color:GRAY, lineHeight:1.8 }}>
                  <span style={{ fontWeight:600, color:DARK }}>大阪モーター整備</span> へ見積書PDFを添付して送付しました。
                </div>
              </div>
              <div style={{ width:"100%", background:"#FAFAFA", border:`1px solid ${BORDER}`, borderRadius:10, padding:"16px 20px", textAlign:"left" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[
                    ["見積番号", "Q-2041"],
                    ["品名", "フロントコントロールアーム左"],
                    ["見積金額（税抜）", `¥${final.toLocaleString()}`],
                    ["消費税（10%）", `¥${tax.toLocaleString()}`],
                    ["合計（税込）", `¥${total.toLocaleString()}`],
                    ["有効期限", "2026/04/21（2週間）"],
                  ].map(([lbl, val]) => (
                    <div key={lbl} style={{ padding:"8px 12px", background:WHITE, borderRadius:7, border:`1px solid ${BORDER}` }}>
                      <div style={{ fontSize:10, color:GRAY_L, marginBottom:2 }}>{lbl}</div>
                      <div style={{ fontSize:12, fontWeight:600, color:lbl.includes("合計")?R:DARK, fontFamily:lbl.includes("番号")||lbl.includes("金額")||lbl.includes("税")?undefined:undefined }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ width:"100%", background:BLUE_L, border:"1px solid #BFDBFE", borderRadius:10, padding:"12px 16px", textAlign:"left" }}>
                <div style={{ fontSize:12, fontWeight:700, color:BLUE, marginBottom:8 }}>次のステップ</div>
                {["お客様からの受注確定連絡をお待ちください","受注後は「受注・発送」ページで発注手配へ進みます"].map((s,i) => (
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:i===0?6:0 }}>
                    <span style={{ width:18, height:18, borderRadius:"50%", background:BLUE, color:WHITE, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>{i+1}</span>
                    <span style={{ fontSize:12, color:DARK }}>{s}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setShowEmailModal(false); setEmailSent(false); setSent(true); }}
                style={{ padding:"10px 28px", background:DARK, color:WHITE, border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}
              >
                閉じる
              </button>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   SCREEN 3: 受注・発送
   ═══════════════════════════════════════════════════ */
function OrderScreen() {
  const [mode, setMode] = useState("direct");
  const [docTab, setDocTab] = useState("直送依頼文");
  const [cod, setCod] = useState(false);
  const [emailStep, setEmailStep] = useState(0);
  const [invStep, setInvStep] = useState(0);
  const [aiStep, setAiStep] = useState(0);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const ts = [600,1800,3000].map((d,i) => setTimeout(() => setEmailStep(i+1), d));
    const iv = [2000,3400].map((d,i) => setTimeout(() => setInvStep(i+1), d));
    // AI自動対応ステップ（順次実行）
    const ai = [500,1200,2100,3200,4400,5800].map((d,i) => setTimeout(() => setAiStep(i+1), d));
    const ll = ["受注登録開始...","顧客ID: OM-0418 確認","品番 31126855157 在庫確認...","在庫なし → 仕入先発注モード","Ts.CO.Ltd 発注データ生成","受注伝票 #ORD-20260407-2041 生成","基幹システム登録完了 ✓"]
      .map((m,i) => setTimeout(() => setLogs(p=>[...p,m]), 400+i*500));
    return () => [...ts,...iv,...ai,...ll].forEach(clearTimeout);
  }, []);

  const DIRECT = `【直送依頼書】\n宛先: Ts.CO.Ltd ご担当者様\n\n品番: 31126855157\n品名: フロントコントロールアーム左 (OEM)\n数量: 1個 / 金額: ¥7,800\n\nお届け先:\n  大阪モーター整備株式会社\n  〒XXX-XXXX 大阪府大阪市...\n\n・到着後、追跡番号をご連絡ください\n・伝票に「カレント自動車」と記載ください\n\nカレント自動車株式会社 パーツ部`;
  const WARE = `【発送指示書】\n宛先: SBSロジコム 東扇島倉庫 御中\n\n品番: 31126855157\n品名: フロントコントロールアーム左\n数量: 1個 / ロケーション: A-12-3\n\nお届け先:\n  大阪モーター整備株式会社\n  〒XXX-XXXX 大阪府...\n\n・精密部品 → 緩衝材を十分に使用\n・発送後、追跡番号をSlackに報告\n\nカレント自動車株式会社`;
  const docTabs = mode==="direct" ? ["直送依頼文","代引指示"] : ["倉庫発注文書","代引指示"];
  const box = { background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" };

  const ER = ({ label, needed }) => {
    const done = emailStep >= needed;
    return (
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:`1px solid ${BORDER}` }}>
        {done ? <CheckCircle2 size={16} style={{ color:GREEN }} /> : <Loader2 size={16} className="spin" style={{ color:R }} />}
        <span style={{ fontSize:13, color:done?DARK:GRAY_L }}>{label}</span>
        {done && <span style={{ marginLeft:"auto", fontSize:11, color:GRAY_L }}>完了</span>}
      </div>
    );
  };

  return (
    <div className="anim-fade-up" style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ background:GREEN_L, border:`1px solid #BBF7D0`, borderRadius:10, padding:"12px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <CheckCircle2 size={22} style={{ color:GREEN, flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:2 }}>
            <div style={{ fontWeight:700, fontSize:14, color:GREEN }}>発送手配中</div>
            <StatusBadge s="受注確定" />
            <span style={{ background:BLUE_L, color:BLUE, border:`1px solid #BFDBFE`, fontSize:11, fontWeight:600, padding:"2px 10px", borderRadius:4 }}>📄 請求書払い（月末締め）</span>
          </div>
          <div style={{ fontSize:12, color:GRAY }}>大阪モーター整備 / C-2041 / 受注番号: ORD-20260407-2041</div>
        </div>
        <div style={{ fontFamily:"JetBrains Mono", fontSize:22, fontWeight:700, color:R }}>¥9,300</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[{id:"direct",label:"直送（ドロップシッピング）"},{id:"warehouse",label:"自社倉庫経由（東扇島）"}].map(m => (
              <button key={m.id} onClick={() => {setMode(m.id);setDocTab(m.id==="direct"?"直送依頼文":"倉庫発注文書");}} style={{ padding:"9px 0", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit", background:mode===m.id?`${R}08`:WHITE, color:mode===m.id?R:GRAY, border:`1.5px solid ${mode===m.id?R:BORDER}`, transition:"all .15s" }}>
                {m.label}
              </button>
            ))}
          </div>
          <div style={{ ...box, overflow:"hidden" }}>
            <div style={{ display:"flex", borderBottom:`1px solid ${BORDER}`, background:"#FAFAFA" }}>
              {docTabs.map(t => <button key={t} onClick={() => setDocTab(t)} style={{ flex:1, padding:"10px 0", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit", background:"transparent", border:"none", borderBottom:docTab===t?`2px solid ${R}`:"2px solid transparent", color:docTab===t?R:GRAY, transition:"all .15s" }}>{t}</button>)}
            </div>
            <div style={{ padding:16 }}>
              {docTab !== "代引指示"
                ? <pre style={{ fontFamily:"JetBrains Mono", fontSize:11, color:DARK, whiteSpace:"pre-wrap", lineHeight:1.8 }}>{docTab==="直送依頼文"?DIRECT:WARE}</pre>
                : <div>
                    <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom:12 }}>
                      <input type="checkbox" checked={cod} onChange={e=>setCod(e.target.checked)} style={{ width:16, height:16, accentColor:R }} />
                      <span style={{ fontSize:14, fontWeight:500, color:DARK }}>代引き払いを指定する</span>
                    </label>
                    {cod && <div style={{ background:"#FEF2F2", border:`1px solid #FECACA`, borderRadius:8, padding:14, animation:"fadeUp .3s ease both" }}>
                      <div style={{ fontSize:11, color:GRAY_L, marginBottom:2 }}>代引き金額</div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:22, fontWeight:700, color:R }}>¥10,230</div>
                      <div style={{ fontSize:11, color:GRAY, marginTop:3 }}>※ 税込・手数料込</div>
                    </div>}
                  </div>
              }
            </div>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={box}>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:22, height:22, borderRadius:6, background:`${R}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontSize:12 }}>🤖</span>
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:DARK }}>AI自動対応状況</div>
              <div style={{ marginLeft:"auto", fontSize:10, color:GRAY_L }}>
                {aiStep >= 6 ? <span style={{ color:GREEN, fontWeight:600 }}>✓ 全処理完了</span> : <span style={{ color:R }}>処理中…</span>}
              </div>
            </div>
            <div style={{ padding:"0 16px" }}>
              {[
                { label:"受注内容をAIが解析・確認", detail:"品番・数量・顧客情報の照合完了", step:1, icon:"🔍", color:BLUE },
                { label:"Ts.CO.Ltd へ発注メール送信", detail:"直送指示 + 発注書PDF添付", step:2, icon:"📧", color:GREEN },
                { label:"大阪モーター整備 へ受注確認メール", detail:"納期・金額・追跡番号を自動記載", step:3, icon:"📧", color:GREEN },
                { label:"SBSロジコム へ発送指示メール", detail:"ピッキング指示・梱包方法を送信", step:4, icon:"📦", color:AMBER },
                { label:"請求書 INV-2041 を自動生成", detail:"¥10,230（税込）月末締め翌月末払い", step:5, icon:"📄", color:PURPLE },
                { label:"入金管理システムへ自動登録", detail:"督促スケジュールを設定済み", step:6, icon:"💰", color:R },
              ].map((item, i, arr) => {
                const done = aiStep >= item.step;
                const active = aiStep === item.step - 1;
                return (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 0", borderBottom:i < arr.length-1 ? `1px solid ${BORDER}` : "none" }}>
                    <div style={{ width:28, height:28, borderRadius:7, background:done?`${item.color}15`:"#F9FAFB", border:`1px solid ${done?item.color:BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0, marginTop:1, transition:"all .3s" }}>
                      {done ? <CheckCircle2 size={14} style={{ color:item.color }} /> : active ? <Loader2 size={14} className="spin" style={{ color:item.color }} /> : <span style={{ fontSize:11 }}>{item.icon}</span>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:500, color:done?DARK:GRAY_L, transition:"color .3s" }}>{item.label}</div>
                      {done && <div style={{ fontSize:10, color:GRAY_L, marginTop:2 }}>{item.detail}</div>}
                    </div>
                    {done && <span style={{ fontSize:10, color:GRAY_L, flexShrink:0, marginTop:3 }}>完了</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={box}>
            <div style={{ padding:"14px 16px", borderBottom:`1px solid ${BORDER}` }}><div style={{ fontSize:13, fontWeight:600, color:DARK }}>請求書自動処理</div></div>
            <div style={{ padding:"0 16px" }}>
              {[{l:"INV-2041 / ¥10,230（税込）— 自動生成",s:1},{l:"大阪モーター整備 へメール送付",s:2}].map((r,i,arr) => (
                <div key={r.l} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:i<arr.length-1?`1px solid ${BORDER}`:undefined }}>
                  <span style={{ fontSize:12, color:DARK }}>{r.l}</span>
                  {invStep>=r.s ? <CheckCircle2 size={14} style={{ color:GREEN }} /> : <Loader2 size={14} className="spin" style={{ color:GRAY_L }} />}
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...box, background:"#F9FAFB" }}>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${BORDER}` }}><div style={{ fontSize:11, color:GRAY_L, fontWeight:500 }}>基幹システム登録ログ</div></div>
            <div style={{ padding:"12px 16px", fontFamily:"JetBrains Mono", fontSize:11, lineHeight:1.9 }}>
              {logs.map((l,i) => <div key={i} style={{ color:l.includes("✓")?GREEN:GRAY, animation:"fadeUp .3s ease both" }}><span style={{ color:"#D1D5DB", marginRight:8 }}>[{String(i+1).padStart(2,"0")}]</span>{l}</div>)}
              {logs.length < 7 && <span style={{ color:R, animation:"blink 1s step-start infinite" }}>█</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SCREEN 4: 請求書発行・入金管理
   ═══════════════════════════════════════════════════ */
function PaymentScreen() {
  const [mainTab, setMainTab] = useState("入金管理");
  const [filter, setFilter] = useState("全件");
  const [showDunning, setShowDunning] = useState(false);
  const [dunningTarget, setDunningTarget] = useState(null);
  const [dunSent, setDunSent] = useState({});
  const [payOv, setPayOv] = useState({});
  const [dunOv, setDunOv] = useState({});
  const [draftModal, setDraftModal] = useState(null); // 確認・編集モーダル対象ドラフト

  // 各ドラフトの明細データ
  const draftDetails = {
    "DRAFT-0430-001": {
      customer:"大阪モーター整備", contact:"田中 誠", email:"tanaka@osaka-motor.co.jp",
      period:"2026年4月分", issueDate:"2026/04/30", dueDate:"2026/05/31",
      terms:"月末締め翌月末払い", staff:"小嶋 鹿乃雲",
      items:[
        { date:"04/07", ordNo:"ORD-2041", part:"フロントコントロールアーム左", partNo:"31126855157", qty:1, unit:9300, amount:9300 },
      ],
      shipping:{ carrier:"ヤマト運輸", tracking:"1234567890", fee:0, note:"送料無料（¥5,000以上）" },
    },
    "DRAFT-0430-002": {
      customer:"東京欧州車センター", contact:"佐藤 健", email:"sato@tokyo-euro.co.jp",
      period:"2026年4月分", issueDate:"2026/04/30", dueDate:"2026/05/31",
      terms:"月末締め翌月末払い", staff:"小嶋 鹿乃雲",
      items:[
        { date:"04/07", ordNo:"ORD-2038", part:"タイミングベルトキット", partNo:"06L109257B", qty:1, unit:26000, amount:26000 },
      ],
      shipping:{ carrier:"佐川急便", tracking:"9876543210", fee:0, note:"送料無料（¥5,000以上）" },
    },
    "DRAFT-0430-003": {
      customer:"横浜ユーロモータース", contact:"高橋 明", email:"takahashi@yokohama-euro.co.jp",
      period:"2026年4月分", issueDate:"2026/04/30", dueDate:"2026/05/31",
      terms:"月末締め翌月末払い", staff:"宮嶋 雅之",
      items:[
        { date:"04/01", ordNo:"ORD-2031", part:"DSGオイルポンプ", partNo:"0AM927769D", qty:1, unit:30600, amount:30600 },
        { date:"04/03", ordNo:"ORD-2029", part:"ブレーキパッド（前後セット）", partNo:"A0004230012", qty:2, unit:9800, amount:19600 },
        { date:"04/06", ordNo:"ORD-2027", part:"イグニッションコイル", partNo:"98735566700", qty:4, unit:6300, amount:25200 },
      ],
      shipping:{ carrier:"ヤマト運輸", tracking:"1122334455", fee:800, note:"小型精密部品 — 別途送料" },
    },
  };

  const staffInfo = {
    "小嶋": { fullName:"小嶋 鹿乃雲", phone:"045-001-0101" },
    "宮嶋": { fullName:"宮嶋 雅之", phone:"078-002-0202" },
  };

  const invoices = [
    { no:"INV-2041", customer:"大阪モーター整備",    staff:"小嶋", amount:10230, confirmed:0,     issued:"04/07", due:"04/30", payStatus:"未入金",      dunStatus:"督促前" },
    { no:"INV-2038", customer:"東京欧州車センター",   staff:"小嶋", amount:28600, confirmed:0,     issued:"04/07", due:"04/30", payStatus:"未入金",      dunStatus:"督促中（メールのみ）" },
    { no:"INV-2035", customer:"神戸カーサービス",     staff:"宮嶋", amount:15400, confirmed:15400, issued:"04/05", due:"04/30", payStatus:"入金済",      dunStatus:"督促不要" },
    { no:"INV-2031", customer:"横浜ユーロモータース", staff:"宮嶋", amount:42100, confirmed:42100, issued:"04/01", due:"04/30", payStatus:"入金済",      dunStatus:"督促不要" },
    { no:"INV-2028", customer:"名古屋プレミアムAuto", staff:"小嶋", amount:8900,  confirmed:0,     issued:"03/28", due:"04/20", payStatus:"未入金",      dunStatus:"督促前" },
    { no:"INV-2025", customer:"京都輸入車工房",       staff:"宮嶋", amount:33700, confirmed:20000, issued:"03/25", due:"04/20", payStatus:"一部入金あり", dunStatus:"督促中（電話済）" },
    { no:"INV-2019", customer:"名古屋プレミアムAuto", staff:"小嶋", amount:12400, confirmed:13000, issued:"03/10", due:"03/31", payStatus:"過入金あり",   dunStatus:"督促不要" },
  ];

  const monthlyDrafts = [
    { no:"DRAFT-0430-001", customer:"大阪モーター整備",    total:10230, items:1, draftDate:"04/30" },
    { no:"DRAFT-0430-002", customer:"東京欧州車センター",   total:28600, items:1, draftDate:"04/30" },
    { no:"DRAFT-0430-003", customer:"横浜ユーロモータース", total:75800, items:3, draftDate:"04/30" },
  ];

  const getPay = inv => payOv[inv.no] || inv.payStatus;
  const getDun = inv => dunOv[inv.no] || inv.dunStatus;
  const getDiff = inv => { if (getPay(inv) === "入金済") return 0; return inv.confirmed - inv.amount; };
  const filtered = filter === "全件" ? invoices : invoices.filter(inv => getPay(inv)===filter || getDun(inv)===filter);
  const payCounts = {};
  ["未入金","一部入金あり","入金済","過入金あり"].forEach(s => payCounts[s] = invoices.filter(inv=>getPay(inv)===s).length);
  const payColors = { "未入金":{bg:"#FEF2F2",text:R,border:"#FECACA"}, "一部入金あり":{bg:AMBER_L,text:AMBER,border:"#FDE68A"}, "過入金あり":{bg:PURPLE_L,text:PURPLE,border:"#DDD6FE"}, "入金済":{bg:GREEN_L,text:GREEN,border:"#BBF7D0"}, "確認前":{bg:"#F9FAFB",text:GRAY,border:BORDER} };
  const dunColors = { "督促不要":{bg:GREEN_L,text:GREEN,border:"#BBF7D0"}, "督促前":{bg:"#F9FAFB",text:GRAY,border:BORDER}, "督促中（メールのみ）":{bg:AMBER_L,text:AMBER,border:"#FDE68A"}, "督促中（電話済）":{bg:"#FEF2F2",text:R,border:"#FECACA"}, "督促完了":{bg:GREEN_L,text:GREEN,border:"#BBF7D0"} };
  const S = { background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" };

  return (
    <>
    <div className="anim-fade-up" style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, padding:"14px 20px", display:"flex", alignItems:"center", gap:32, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        {[
          {l:"未入金",    v:payCounts["未入金"]||0,     total:invoices.filter(i=>getPay(i)==="未入金").reduce((s,i)=>s+i.amount,0),      c:R},
          {l:"一部入金",  v:payCounts["一部入金あり"]||0, total:invoices.filter(i=>getPay(i)==="一部入金あり").reduce((s,i)=>s+i.amount,0), c:AMBER},
          {l:"入金済",   v:payCounts["入金済"]||0,       total:invoices.filter(i=>getPay(i)==="入金済").reduce((s,i)=>s+i.amount,0),      c:GREEN},
        ].map(s => (
          <div key={s.l} style={{ display:"flex", alignItems:"center", gap:14, padding:"6px 18px", borderRadius:8, background:s.c===R?"#FEF2F2":s.c===AMBER?AMBER_L:GREEN_L, border:`1px solid ${s.c===R?"#FECACA":s.c===AMBER?"#FDE68A":"#BBF7D0"}` }}>
            <div style={{ fontSize:28, fontWeight:700, color:s.c, fontFamily:"JetBrains Mono", lineHeight:1 }}>{s.v}</div>
            <div>
              <div style={{ fontSize:11, color:s.c, fontWeight:600 }}>{s.l}</div>
              <div style={{ fontSize:12, fontWeight:700, color:s.c, fontFamily:"JetBrains Mono", marginTop:2 }}>¥{s.total.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", background:WHITE, borderRadius:"10px 10px 0 0", border:`1px solid ${BORDER}`, overflow:"hidden" }}>
        {["入金管理","月末一括請求書"].map(t => (
          <button key={t} onClick={() => setMainTab(t)} style={{ padding:"12px 20px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", background:"transparent", border:"none", borderBottom:mainTab===t?`2px solid ${R}`:"2px solid transparent", color:mainTab===t?R:GRAY, transition:"all .15s" }}>{t}</button>
        ))}
      </div>
      {mainTab === "月末一括請求書" && (
        <div style={{ ...S, overflow:"hidden" }}>
          <div style={{ padding:"12px 18px", borderBottom:`1px solid ${BORDER}`, background:"#FAFAFA", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:DARK }}>月末一括請求書ドラフト（2026/04/30 自動生成）</div>
              <div style={{ fontSize:11, color:GRAY_L, marginTop:2 }}>システムが自動ドラフト生成済み。ご確認の上、一括送付してください。</div>
            </div>
            <button style={{ padding:"8px 16px", background:R, color:WHITE, border:"none", borderRadius:7, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>✈ 一括送付する</button>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:"#FAFAFA" }}>{["ドラフト番号","顧客名","請求金額","品目数","請求予定日","ステータス","操作"].map(h=><th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:11, color:GRAY_L, fontWeight:600, borderBottom:`1px solid ${BORDER}` }}>{h}</th>)}</tr></thead>
            <tbody>{monthlyDrafts.map((d,i)=>(
              <tr key={d.no} style={{ borderBottom:`1px solid ${BORDER}`, animation:`fadeUp .22s ${i*.05}s ease both`, opacity:0 }}>
                <td style={{ padding:"12px 16px", fontFamily:"JetBrains Mono", fontSize:11, color:GRAY_L }}>{d.no}</td>
                <td style={{ padding:"12px 16px", fontSize:13, fontWeight:600, color:DARK }}>{d.customer}</td>
                <td style={{ padding:"12px 16px", fontFamily:"JetBrains Mono", fontSize:13, color:DARK }}>¥{d.total.toLocaleString()}</td>
                <td style={{ padding:"12px 16px", fontSize:12, color:GRAY }}>{d.items}件</td>
                <td style={{ padding:"12px 16px", fontSize:12, color:GRAY_L }}>{d.draftDate}</td>
                <td style={{ padding:"12px 16px" }}><StatusBadge s="下書き" /></td>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => setDraftModal(d)} style={{ fontSize:11, padding:"4px 10px", background:BLUE_L, color:BLUE, border:`1px solid #BFDBFE`, borderRadius:5, cursor:"pointer", fontFamily:"inherit" }}>確認・編集</button>
                    <button style={{ fontSize:11, padding:"4px 10px", background:GREEN_L, color:GREEN, border:`1px solid #BBF7D0`, borderRadius:5, cursor:"pointer", fontFamily:"inherit" }}>送付する</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {mainTab === "入金管理" && (
        <>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {["全件","未入金","一部入金あり","入金済","督促前","督促中（メールのみ）","督促中（電話済）"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding:"5px 12px", borderRadius:16, fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit", background:filter===f?R:WHITE, color:filter===f?WHITE:GRAY, border:`1px solid ${filter===f?R:BORDER}`, transition:"all .15s" }}>{f}</button>
            ))}
          </div>
          <div style={{ ...S, overflow:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, minWidth:900 }}>
              <thead><tr style={{ background:"#FAFAFA" }}>{["請求書番号","顧客名","社内担当","顧客連絡先","請求額","入金確認額","差額","入金ステータス","督促ステータス","操作"].map(h=><th key={h} style={{ padding:"9px 12px", textAlign:"left", fontSize:11, color:GRAY_L, fontWeight:600, borderBottom:`1px solid ${BORDER}`, whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
              <tbody>{filtered.map((inv, i) => {
                const ps = getPay(inv), ds = getDun(inv), diff = getDiff(inv);
                const si = staffInfo[inv.staff];
                const pc = payColors[ps] || {};
                const dc = dunColors[ds] || {};
                return (
                  <tr key={inv.no} style={{ borderBottom:`1px solid ${BORDER}`, animation:`fadeUp .25s ${i*.04}s ease both`, opacity:0 }}>
                    <td style={{ padding:"12px 12px", fontFamily:"JetBrains Mono", fontSize:11, color:R, fontWeight:600, whiteSpace:"nowrap" }}>{inv.no}</td>
                    <td style={{ padding:"12px 12px", fontWeight:600, color:DARK, whiteSpace:"nowrap" }}>{inv.customer}</td>
                    <td style={{ padding:"12px 12px", whiteSpace:"nowrap" }}>
                      <div style={{ fontSize:11, color:DARK }}>{si?.fullName}</div>
                    </td>
                    <td style={{ padding:"12px 12px", whiteSpace:"nowrap" }}>
                      <div style={{ fontSize:11, color:GRAY }}>📞 {si?.phone}</div>
                    </td>
                    <td style={{ padding:"12px 12px", fontFamily:"JetBrains Mono", color:DARK, whiteSpace:"nowrap" }}>¥{inv.amount.toLocaleString()}</td>
                    <td style={{ padding:"12px 12px", fontFamily:"JetBrains Mono", color:inv.confirmed>0?GREEN:GRAY_L, whiteSpace:"nowrap" }}>{inv.confirmed > 0 ? `¥${inv.confirmed.toLocaleString()}` : "―"}</td>
                    <td style={{ padding:"12px 12px", fontFamily:"JetBrains Mono", whiteSpace:"nowrap" }}>{diff===0?<span style={{ color:GRAY_L }}>―</span>:diff<0?<span style={{ color:R, fontWeight:700 }}>¥{diff.toLocaleString()}</span>:<span style={{ color:PURPLE, fontWeight:700 }}>+¥{diff.toLocaleString()}</span>}</td>
                    <td style={{ padding:"12px 12px" }}><select value={ps} onChange={e=>setPayOv(p=>({...p,[inv.no]:e.target.value}))} style={{ border:`1px solid ${pc.border||BORDER}`, background:pc.bg||"#F9FAFB", color:pc.text||GRAY, borderRadius:4, padding:"3px 6px", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{["確認前","未入金","一部入金あり","過入金あり","入金済"].map(s=><option key={s}>{s}</option>)}</select></td>
                    <td style={{ padding:"12px 12px" }}><select value={ds} onChange={e=>setDunOv(p=>({...p,[inv.no]:e.target.value}))} style={{ border:`1px solid ${dc.border||BORDER}`, background:dc.bg||"#F9FAFB", color:dc.text||GRAY, borderRadius:4, padding:"3px 6px", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{["督促不要","督促前","督促中（メールのみ）","督促中（電話済）","督促完了"].map(s=><option key={s}>{s}</option>)}</select></td>
                    <td style={{ padding:"12px 12px" }}>
                      <div style={{ display:"flex", gap:5 }}>
                        {ps !== "入金済" && ps !== "督促不要" && <button onClick={() => {setDunningTarget(inv);setShowDunning(true);}} style={{ fontSize:11, fontWeight:500, padding:"4px 8px", background:dunSent[inv.no]?GREEN_L:AMBER_L, color:dunSent[inv.no]?GREEN:AMBER, border:`1px solid ${dunSent[inv.no]?"#BBF7D0":"#FDE68A"}`, borderRadius:5, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>{dunSent[inv.no]?"✓ 送信済":"📧 督促メール"}</button>}
                        {ps !== "入金済" && <button onClick={() => setPayOv(p=>({...p,[inv.no]:"入金済"}))} style={{ fontSize:11, fontWeight:500, padding:"4px 8px", background:GREEN_L, color:GREEN, border:`1px solid #BBF7D0`, borderRadius:5, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>入金確認</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </>
      )}
      {showDunning && dunningTarget && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }} onClick={() => setShowDunning(false)}>
          <div style={{ background:WHITE, borderRadius:12, width:540, maxHeight:"80vh", overflow:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)", padding:24 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ fontSize:15, fontWeight:700, color:DARK }}>📧 督促メール作成</div>
              <button onClick={() => setShowDunning(false)} style={{ background:"none", border:"none", cursor:"pointer", color:GRAY_L }}><X size={18} /></button>
            </div>
            <div style={{ background:AMBER_L, border:`1px solid #FDE68A`, borderRadius:8, padding:"8px 14px", marginBottom:16, fontSize:12, color:AMBER }}>
              {dunningTarget.no} / {dunningTarget.customer} / 請求額: ¥{dunningTarget.amount.toLocaleString()} / 期限: {dunningTarget.due}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[["宛先",`${dunningTarget.customer} ご担当者様`],["件名",`【お支払いのご確認】${dunningTarget.no}（¥${dunningTarget.amount.toLocaleString()}）`],["担当者",`${staffInfo[dunningTarget.staff]?.fullName} (${staffInfo[dunningTarget.staff]?.phone})`]].map(([lbl,val]) => (
                <div key={lbl}><label style={{ fontSize:11, color:GRAY_L, display:"block", marginBottom:4 }}>{lbl}</label><input defaultValue={val} style={{ width:"100%", padding:"7px 10px", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:12, color:DARK }} /></div>
              ))}
              <div><label style={{ fontSize:11, color:GRAY_L, display:"block", marginBottom:4 }}>本文</label><textarea rows={8} defaultValue={`${dunningTarget.customer} ご担当者様\n\nいつもお世話になっております。カレント自動車株式会社の${staffInfo[dunningTarget.staff]?.fullName}でございます。\n\n下記請求書のお支払いについてご確認をお願いいたします。\n\n請求書番号: ${dunningTarget.no}\n請求金額: ¥${dunningTarget.amount.toLocaleString()}（税込）\nお支払い期限: ${dunningTarget.due}\n\nご多用の折、恐れ入りますが、ご確認のほどよろしくお願いいたします。\n\nカレント自動車株式会社 パーツ部\nTEL: ${staffInfo[dunningTarget.staff]?.phone}`} style={{ width:"100%", padding:"8px 10px", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:12, color:DARK, lineHeight:1.7, resize:"none" }} /></div>
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                <button onClick={() => setShowDunning(false)} style={{ padding:"8px 16px", border:`1px solid ${BORDER}`, borderRadius:7, background:WHITE, color:GRAY, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>キャンセル</button>
                <button onClick={() => { setDunOv(p=>({...p,[dunningTarget.no]:"督促中（メールのみ）"})); setDunSent(p=>({...p,[dunningTarget.no]:true})); setShowDunning(false); setDunningTarget(null); }} style={{ padding:"8px 18px", background:R, color:WHITE, border:"none", borderRadius:7, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700 }}>送信する</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* ── ドラフト確認・編集モーダル ── */}
    {draftModal && (() => {
      const det = draftDetails[draftModal.no];
      if (!det) return null;
      const subtotal = det.items.reduce((s, r) => s + r.amount, 0);
      const shipping = det.shipping.fee;
      const tax      = Math.round((subtotal + shipping) * 0.1);
      const total    = subtotal + shipping + tax;
      return (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:60 }}>
          <div style={{ background:WHITE, borderRadius:14, width:700, maxHeight:"90vh", overflow:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.25)", display:"flex", flexDirection:"column" }}>
            {/* Header */}
            <div style={{ padding:"18px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:38, height:38, borderRadius:9, background:`${PURPLE}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <FileText size={17} style={{ color:PURPLE }} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:DARK }}>月末一括請求書 — 確認・編集</div>
                <div style={{ fontSize:11, color:GRAY_L, marginTop:2 }}>
                  <span style={{ fontWeight:600, color:DARK }}>{det.customer}</span>
                  　{det.period}　{draftModal.no}
                </div>
              </div>
              <button onClick={() => setDraftModal(null)} style={{ background:"none", border:"none", cursor:"pointer", color:GRAY_L, display:"flex" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
              {/* 請求先・条件 */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  ["請求先",     `${det.customer}　${det.contact} 様`],
                  ["メール",     det.email],
                  ["対象期間",   det.period],
                  ["請求日",     det.issueDate],
                  ["支払期限",   det.dueDate],
                  ["支払条件",   det.terms],
                  ["担当者",     det.staff],
                  ["ドラフトNo", draftModal.no],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ background:"#FAFAFA", borderRadius:7, padding:"8px 12px", border:`1px solid ${BORDER}` }}>
                    <div style={{ fontSize:10, color:GRAY_L, marginBottom:2 }}>{lbl}</div>
                    <div style={{ fontSize:12, fontWeight:500, color:DARK }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* 明細テーブル */}
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:DARK, marginBottom:8 }}>発注明細</div>
                <div style={{ border:`1px solid ${BORDER}`, borderRadius:8, overflow:"hidden" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                    <thead>
                      <tr style={{ background:"#F9FAFB" }}>
                        {["日付","受注番号","品名","品番","数量","単価","金額"].map(h => (
                          <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:11, color:GRAY_L, fontWeight:600, borderBottom:`1px solid ${BORDER}`, whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {det.items.map((row, i) => (
                        <tr key={i} style={{ borderBottom:i < det.items.length-1 ? `1px solid ${BORDER}` : "none" }}>
                          <td style={{ padding:"10px 12px", fontSize:11, color:GRAY_L, whiteSpace:"nowrap" }}>{row.date}</td>
                          <td style={{ padding:"10px 12px", fontFamily:"JetBrains Mono", fontSize:11, color:R, fontWeight:600, whiteSpace:"nowrap" }}>{row.ordNo}</td>
                          <td style={{ padding:"10px 12px", color:DARK, fontWeight:500 }}>{row.part}</td>
                          <td style={{ padding:"10px 12px", fontFamily:"JetBrains Mono", fontSize:11, color:GRAY }}>{row.partNo}</td>
                          <td style={{ padding:"10px 12px", textAlign:"center", color:DARK }}>{row.qty}</td>
                          <td style={{ padding:"10px 12px", textAlign:"right", fontFamily:"JetBrains Mono", color:DARK }}>¥{row.unit.toLocaleString()}</td>
                          <td style={{ padding:"10px 12px", textAlign:"right", fontFamily:"JetBrains Mono", fontWeight:700, color:DARK }}>¥{row.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 送料 */}
              <div style={{ background:shipping > 0 ? AMBER_L : GREEN_L, border:`1px solid ${shipping > 0 ? "#FDE68A" : "#BBF7D0"}`, borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", gap:12 }}>
                <Package size={15} style={{ color: shipping > 0 ? AMBER : GREEN, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:600, color: shipping > 0 ? AMBER : GREEN, marginBottom:2 }}>送料</div>
                  <div style={{ fontSize:12, color:DARK }}>{det.shipping.carrier}　追跡: <span style={{ fontFamily:"JetBrains Mono", fontSize:11 }}>{det.shipping.tracking}</span></div>
                  <div style={{ fontSize:11, color:GRAY, marginTop:2 }}>{det.shipping.note}</div>
                </div>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:16, fontWeight:700, color: shipping > 0 ? AMBER : GREEN }}>
                  {shipping > 0 ? `¥${shipping.toLocaleString()}` : "無料"}
                </div>
              </div>

              {/* 合計 */}
              <div style={{ background:"#FAFAFA", border:`1px solid ${BORDER}`, borderRadius:8, padding:"12px 16px" }}>
                {[
                  ["小計",           `¥${subtotal.toLocaleString()}`,  false],
                  ["送料",           shipping > 0 ? `¥${shipping.toLocaleString()}` : "¥0（無料）", false],
                  ["消費税（10%）",  `¥${tax.toLocaleString()}`,        false],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${BORDER}` }}>
                    <span style={{ fontSize:12, color:GRAY }}>{lbl}</span>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:12, color:DARK }}>{val}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", paddingTop:10, marginTop:4 }}>
                  <span style={{ fontWeight:700, fontSize:14, color:DARK }}>合計（税込）</span>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:22, fontWeight:700, color:R }}>¥{total.toLocaleString()}</span>
                </div>
              </div>

              {/* 備考 */}
              <div>
                <div style={{ fontSize:11, color:GRAY_L, marginBottom:6 }}>備考・特記事項</div>
                <textarea
                  defaultValue={`${det.period}分のご請求となります。
お支払い期限: ${det.dueDate}
ご不明な点はご連絡ください。`}
                  rows={3}
                  style={{ width:"100%", padding:"8px 10px", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:12, color:DARK, lineHeight:1.7, resize:"none", fontFamily:"'Noto Sans JP',sans-serif" }}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding:"14px 24px", borderTop:`1px solid ${BORDER}`, background:"#FAFAFA", display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={() => setDraftModal(null)} style={{ padding:"9px 18px", border:`1px solid ${BORDER}`, borderRadius:8, background:WHITE, color:GRAY, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>
                閉じる
              </button>
              <button style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 22px", background:PURPLE, color:WHITE, border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                <Download size={14} /> PDF出力
              </button>
              <button style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 22px", background:R, color:WHITE, border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                <Send size={14} /> この請求書を送付する
              </button>
            </div>
          </div>
        </div>
      );
    })()}
    </>
  );
}

/* ─── MASTER SHELL ─── */
function MasterShell({ title, subtitle, columns, rows, renderRow, searchPlaceholder="検索..." }) {
  const [q, setQ] = useState(""); const [modal, setModal] = useState(false);
  const filtered = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="anim-fade-up" style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div><div style={{ fontSize:15, fontWeight:700, color:DARK }}>{title}</div><div style={{ fontSize:12, color:GRAY_L, marginTop:2 }}>{subtitle}</div></div>
        <button onClick={() => setModal(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", background:R, color:WHITE, border:"none", borderRadius:7, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}><Plus size={15} /> 新規登録</button>
      </div>
      <div style={{ position:"relative", maxWidth:360 }}>
        <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:GRAY_L, pointerEvents:"none" }} />
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder={searchPlaceholder} style={{ width:"100%", padding:"9px 12px 9px 36px", border:`1px solid ${BORDER}`, borderRadius:7, fontSize:13, color:DARK, background:WHITE, fontFamily:"inherit" }} />
        {q && <button onClick={() => setQ("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:GRAY_L, display:"flex" }}><X size={13} /></button>}
      </div>
      <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#FAFAFA" }}>{columns.map(c=><th key={c} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, color:GRAY_L, fontWeight:600, borderBottom:`1px solid ${BORDER}` }}>{c}</th>)}<th style={{ padding:"10px 16px", textAlign:"left", fontSize:11, color:GRAY_L, fontWeight:600, borderBottom:`1px solid ${BORDER}` }}>操作</th></tr></thead>
          <tbody>{filtered.length===0?<tr><td colSpan={columns.length+1} style={{ padding:"32px 0", textAlign:"center", color:GRAY_L, fontSize:13 }}>データがありません</td></tr>:filtered.map((row,i)=>renderRow(row,i))}</tbody>
        </table>
        <div style={{ padding:"10px 16px", borderTop:`1px solid ${BORDER}`, background:"#FAFAFA" }}>
          <span style={{ fontSize:11, color:GRAY_L }}>{filtered.length} 件表示（全{rows.length}件）</span>
        </div>
      </div>
      {modal && <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }} onClick={() => setModal(false)}>
        <div style={{ background:WHITE, borderRadius:12, padding:28, width:440, boxShadow:"0 20px 60px rgba(0,0,0,0.18)" }} onClick={e=>e.stopPropagation()}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ fontSize:15, fontWeight:700, color:DARK }}>新規登録</div>
            <button onClick={() => setModal(false)} style={{ background:"none", border:"none", cursor:"pointer", color:GRAY_L }}><X size={18} /></button>
          </div>
          <div style={{ padding:"16px 0", textAlign:"center", color:GRAY, fontSize:13 }}>フォーム（デモ省略）</div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>
            <button onClick={() => setModal(false)} style={{ padding:"8px 18px", border:`1px solid ${BORDER}`, borderRadius:7, background:WHITE, color:GRAY, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>キャンセル</button>
            <button onClick={() => setModal(false)} style={{ padding:"8px 18px", background:R, color:WHITE, border:"none", borderRadius:7, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700 }}>登録する</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
function ActionBtns() {
  return (<div style={{ display:"flex", gap:6 }}><button style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", background:BLUE_L, color:BLUE, border:`1px solid #BFDBFE`, borderRadius:5, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:500 }}><Pencil size={11} /> 編集</button><button style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", background:"#FEF2F2", color:R, border:`1px solid #FECACA`, borderRadius:5, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:500 }}><Trash2 size={11} /> 削除</button></div>);
}

function CustomerMaster() {
  const rows=[{id:"C-001",name:"大阪モーター整備",type:"整備工場",contact:"田中 誠",tel:"06-1234-5678",area:"大阪府",terms:"月末締め翌月末払"},{id:"C-002",name:"神戸カーサービス",type:"整備工場",contact:"山田 一郎",tel:"078-234-5678",area:"兵庫県",terms:"月末締め翌月末払"},{id:"C-003",name:"京都輸入車工房",type:"ディーラー",contact:"鈴木 花子",tel:"075-345-6789",area:"京都府",terms:"都度払い（代引き）"},{id:"C-004",name:"東京欧州車センター",type:"整備工場",contact:"佐藤 健",tel:"03-4567-8901",area:"東京都",terms:"月末締め翌月末払"},{id:"C-005",name:"横浜ユーロモータース",type:"整備工場",contact:"高橋 明",tel:"045-567-8901",area:"神奈川県",terms:"月末締め翌月末払"},{id:"C-006",name:"名古屋プレミアムAuto",type:"ディーラー",contact:"伊藤 幸子",tel:"052-678-9012",area:"愛知県",terms:"15日締め末払い"},{id:"C-007",name:"福岡輸入車専門店",type:"販売店",contact:"渡辺 次郎",tel:"092-789-0123",area:"福岡県",terms:"月末締め翌月末払"},{id:"C-008",name:"札幌カーリペア",type:"整備工場",contact:"中村 博",tel:"011-890-1234",area:"北海道",terms:"都度払い（代引き）"}];
  const tc={"整備工場":{bg:BLUE_L,c:BLUE,b:"#BFDBFE"},"ディーラー":{bg:GREEN_L,c:GREEN,b:"#BBF7D0"},"販売店":{bg:PURPLE_L,c:PURPLE,b:"#DDD6FE"}};
  return <MasterShell title="顧客マスタ" subtitle="取引先整備工場・ディーラー情報の管理（280社）" columns={["顧客ID","顧客名","区分","担当者","電話番号","エリア","支払条件"]} rows={rows} searchPlaceholder="顧客名・エリアで検索..." renderRow={(r,i)=>{const t=tc[r.type]||{bg:"#F9FAFB",c:GRAY,b:BORDER};return(<tr key={r.id} style={{borderBottom:`1px solid ${BORDER}`,animation:`fadeUp .28s ${i*.04}s ease both`,opacity:0}}><td style={{padding:"12px 16px",fontFamily:"JetBrains Mono",fontSize:12,color:R,fontWeight:600}}>{r.id}</td><td style={{padding:"12px 16px",fontSize:13,fontWeight:600,color:DARK}}>{r.name}</td><td style={{padding:"12px 16px"}}><span style={{background:t.bg,color:t.c,border:`1px solid ${t.b}`,fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:4}}>{r.type}</span></td><td style={{padding:"12px 16px",fontSize:13,color:DARK}}>{r.contact}</td><td style={{padding:"12px 16px",fontFamily:"JetBrains Mono",fontSize:12,color:GRAY}}>{r.tel}</td><td style={{padding:"12px 16px",fontSize:12,color:GRAY}}>{r.area}</td><td style={{padding:"12px 16px",fontSize:12,color:GRAY}}>{r.terms}</td><td style={{padding:"12px 16px"}}><ActionBtns/></td></tr>);}}/>;
}
function SupplierMasterScreen() {
  const rows=[{id:"S-001",name:"TOHO自動車",type:"部品商",contact:"東方 一",lead:"3営業日",currency:"JPY",score:74,note:"純正品中心"},{id:"S-002",name:"Ts.CO.Ltd",type:"OEMサプライヤ",contact:"田中 S",lead:"2営業日",currency:"JPY",score:91,note:"優良品・高スコア"},{id:"S-003",name:"ヤナセオートシステムズ",type:"ディーラー系",contact:"柳瀬 浩",lead:"4営業日",currency:"JPY",score:68,note:"ベンツ純正強い"},{id:"S-004",name:"パーツダイレクト",type:"社外品サプライヤ",contact:"吉田 明",lead:"4営業日",currency:"JPY",score:58,note:"格安帯・保証6ヶ月"},{id:"S-005",name:"Euro Parts GmbH",type:"欧州輸入",contact:"Klaus M",lead:"7営業日",currency:"EUR",score:82,note:"Partslink24連携"}];
  const sc=s=>s>=90?{bg:GREEN_L,c:GREEN}:s>=80?{bg:BLUE_L,c:BLUE}:s>=70?{bg:AMBER_L,c:AMBER}:{bg:"#F9FAFB",c:GRAY};
  return <MasterShell title="仕入先マスタ" subtitle="部品調達先・サプライヤー情報の管理（46社）" columns={["仕入先ID","社名","区分","担当者","平均納期","通貨","スコア","備考"]} rows={rows} searchPlaceholder="社名・区分で検索..." renderRow={(r,i)=>{const s=sc(r.score);return(<tr key={r.id} style={{borderBottom:`1px solid ${BORDER}`,animation:`fadeUp .28s ${i*.04}s ease both`,opacity:0}}><td style={{padding:"12px 16px",fontFamily:"JetBrains Mono",fontSize:12,color:R,fontWeight:600}}>{r.id}</td><td style={{padding:"12px 16px",fontSize:13,fontWeight:600,color:DARK}}>{r.name}</td><td style={{padding:"12px 16px",fontSize:12,color:GRAY}}>{r.type}</td><td style={{padding:"12px 16px",fontSize:13,color:DARK}}>{r.contact}</td><td style={{padding:"12px 16px",fontFamily:"JetBrains Mono",fontSize:12,color:GRAY}}>{r.lead}</td><td style={{padding:"12px 16px"}}><span style={{fontFamily:"JetBrains Mono",fontSize:11,background:"#F3F4F6",padding:"2px 8px",borderRadius:4,color:GRAY}}>{r.currency}</span></td><td style={{padding:"12px 16px"}}><span style={{background:s.bg,color:s.c,fontSize:12,fontWeight:700,fontFamily:"JetBrains Mono",padding:"2px 8px",borderRadius:4}}>{r.score}</span></td><td style={{padding:"12px 16px",fontSize:11,color:GRAY_L}}>{r.note}</td><td style={{padding:"12px 16px"}}><ActionBtns/></td></tr>);}}/>;
}
function PartsMaster() {
  const rows=[{no:"31126855157",name:"フロントコントロールアーム左",maker:"BMW",model:"3シリーズ G20",year:"2019-",cat:"サスペンション",unit:"¥7,800〜¥12,100"},{no:"A0004230012",name:"ブレーキパッド（フロント）",maker:"Mercedes",model:"C/E/S クラス",year:"2015-",cat:"ブレーキ",unit:"¥4,200〜¥9,800"},{no:"95810611100",name:"エアサスペンション（リア）",maker:"Porsche",model:"Cayenne 9YA",year:"2018-",cat:"サスペンション",unit:"¥42,000〜"},{no:"06L109257B",name:"タイミングベルトキット",maker:"Audi/VW",model:"A6/Passat",year:"2012-",cat:"エンジン",unit:"¥18,500〜"},{no:"0AM927769D",name:"DSGオイルポンプ",maker:"VW",model:"Golf/Polo DSG",year:"2010-",cat:"ミッション",unit:"¥22,000〜"},{no:"N13-01-001",name:"バルブトロニックモーター",maker:"BMW",model:"5/7シリーズ N52",year:"2005-",cat:"エンジン",unit:"¥28,000〜"},{no:"34116860023",name:"ブレーキローター（前）",maker:"BMW",model:"X3/X5 G01/G05",year:"2017-",cat:"ブレーキ",unit:"¥8,500〜¥15,000"},{no:"98735566700",name:"イグニッションコイル",maker:"Porsche",model:"911/Boxster",year:"2011-",cat:"点火系",unit:"¥6,200〜"}];
  const cc={"サスペンション":{bg:BLUE_L,c:BLUE},"ブレーキ":{bg:"#FEF2F2",c:R},"エンジン":{bg:AMBER_L,c:AMBER},"ミッション":{bg:PURPLE_L,c:PURPLE},"点火系":{bg:GREEN_L,c:GREEN}};
  return <MasterShell title="部品マスタ" subtitle="取扱い部品・品番・適合車種の管理（約3,000件）" columns={["品番","品名","メーカー","適合車種","年式","カテゴリ","参考単価"]} rows={rows} searchPlaceholder="品番・品名・メーカーで検索..." renderRow={(r,i)=>{const c=cc[r.cat]||{bg:"#F9FAFB",c:GRAY};return(<tr key={r.no} style={{borderBottom:`1px solid ${BORDER}`,animation:`fadeUp .28s ${i*.04}s ease both`,opacity:0}}><td style={{padding:"12px 16px",fontFamily:"JetBrains Mono",fontSize:12,color:R,fontWeight:600}}>{r.no}</td><td style={{padding:"12px 16px",fontSize:13,fontWeight:600,color:DARK}}>{r.name}</td><td style={{padding:"12px 16px",fontSize:12,color:DARK}}>{r.maker}</td><td style={{padding:"12px 16px",fontSize:12,color:GRAY}}>{r.model}</td><td style={{padding:"12px 16px",fontFamily:"JetBrains Mono",fontSize:11,color:GRAY_L}}>{r.year}</td><td style={{padding:"12px 16px"}}><span style={{background:c.bg,color:c.c,fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:4}}>{r.cat}</span></td><td style={{padding:"12px 16px",fontFamily:"JetBrains Mono",fontSize:12,color:DARK}}>{r.unit}</td><td style={{padding:"12px 16px"}}><ActionBtns/></td></tr>);}}/>;
}
function StaffMaster() {
  const rows=[{id:"U-001",name:"小嶋 鹿乃雲",kana:"こじま かのん",dept:"パーツ事業部",role:"マネージャー",email:"kojima@currentmotor.co.jp",joined:"2018/04",status:"在籍"},{id:"U-002",name:"宮嶋 雅之",kana:"みやじま まさゆき",dept:"パーツ事業部",role:"シニア担当",email:"miyajima@currentmotor.co.jp",joined:"2019/07",status:"在籍"},{id:"U-003",name:"山本 健一",kana:"やまもと けんいち",dept:"パーツ事業部",role:"担当",email:"yamamoto@currentmotor.co.jp",joined:"2021/04",status:"在籍"},{id:"U-004",name:"佐々木 美咲",kana:"ささき みさき",dept:"経理部",role:"経理担当",email:"sasaki@currentmotor.co.jp",joined:"2020/10",status:"在籍"},{id:"U-005",name:"田中 翔",kana:"たなか しょう",dept:"パーツ事業部",role:"担当",email:"tanaka@currentmotor.co.jp",joined:"2022/04",status:"在籍"},{id:"U-006",name:"業務委託 A",kana:"―",dept:"外部",role:"業務委託",email:"―",joined:"2023/01",status:"委託中"}];
  const rc={"マネージャー":{bg:"#FEF2F2",c:R},"シニア担当":{bg:PURPLE_L,c:PURPLE},"担当":{bg:BLUE_L,c:BLUE},"経理担当":{bg:AMBER_L,c:AMBER},"業務委託":{bg:"#F9FAFB",c:GRAY}};
  const sc={"在籍":{bg:GREEN_L,c:GREEN},"委託中":{bg:AMBER_L,c:AMBER}};
  return <MasterShell title="担当者マスタ" subtitle="社員・業務委託スタッフの管理" columns={["社員ID","氏名","よみがな","部署","役割","メールアドレス","入社年月","在籍"]} rows={rows} searchPlaceholder="名前・部署で検索..." renderRow={(r,i)=>{const rr=rc[r.role]||{bg:"#F9FAFB",c:GRAY};const ss=sc[r.status]||{bg:"#F9FAFB",c:GRAY};return(<tr key={r.id} style={{borderBottom:`1px solid ${BORDER}`,animation:`fadeUp .28s ${i*.04}s ease both`,opacity:0}}><td style={{padding:"12px 16px",fontFamily:"JetBrains Mono",fontSize:12,color:R,fontWeight:600}}>{r.id}</td><td style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:"50%",background:`${R}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:R,flexShrink:0}}>{r.name.charAt(0)}</div><div style={{fontSize:13,fontWeight:600,color:DARK}}>{r.name}</div></div></td><td style={{padding:"12px 16px",fontSize:12,color:GRAY_L}}>{r.kana}</td><td style={{padding:"12px 16px",fontSize:12,color:DARK}}>{r.dept}</td><td style={{padding:"12px 16px"}}><span style={{background:rr.bg,color:rr.c,fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:4}}>{r.role}</span></td><td style={{padding:"12px 16px",fontFamily:"JetBrains Mono",fontSize:11,color:GRAY_L}}>{r.email}</td><td style={{padding:"12px 16px",fontSize:12,color:GRAY_L}}>{r.joined}</td><td style={{padding:"12px 16px"}}><span style={{background:ss.bg,color:ss.c,fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:4}}>{r.status}</span></td><td style={{padding:"12px 16px"}}><ActionBtns/></td></tr>);}}/>;
}

/* ═══════════════════════════════════════════════════
   SCREEN 9: 売上ダッシュボード
   ═══════════════════════════════════════════════════ */
function SalesDashboard() {
  const [period, setPeriod] = useState("月次");
  // 変更後（12ヶ月: 10月〜9月）
  const monthly = [
    { m:"10月", 売上:13200000, 粗利:2904000, 粗利率:22.0, 件数:86,  forecast:null },
    { m:"11月", 売上:15100000, 粗利:3549000, 粗利率:23.5, 件数:98,  forecast:null },
    { m:"12月", 売上:14200000, 粗利:3238000, 粗利率:22.8, 件数:92,  forecast:null },
    { m:"1月",  売上:13600000, 粗利:3128000, 粗利率:23.0, 件数:88,  forecast:null },
    { m:"2月",  売上:15800000, 粗利:3871000, 粗利率:24.5, 件数:103, forecast:null },
    { m:"3月",  売上:14700000, 粗利:3528000, 粗利率:24.0, 件数:96,  forecast:null },
    { m:"4月",  売上:16400000, 粗利:4133000, 粗利率:25.2, 件数:108, forecast:null },
    { m:"5月",  売上:15300000, 粗利:3795000, 粗利率:24.8, 件数:100, forecast:null },
    { m:"6月",  売上:17600000, 粗利:4576000, 粗利率:26.0, 件数:116, forecast:null },
    { m:"7月",  売上:16500000, 粗利:4373000, 粗利率:26.5, 件数:109, forecast:null },
    { m:"8月",  売上:18300000, 粗利:4997000, 粗利率:27.3, 件数:122, forecast:null },
    { m:"9月",  売上:8500000,  粗利:2380000, 粗利率:28.0, 件数:56,  forecast:20000000 },
  ];
  const kpis = [
    { label:"今月売上（速報）", value:"¥8,500,000",  sub:"予測: ¥20,000,000（前月超え）", up:true, color:R,      bg:"#FEF2F2", border:"#FECACA" },
    { label:"今月粗利",         value:"¥2,380,000",  sub:"粗利率 28.0%",                  up:true, color:GREEN,  bg:GREEN_L,   border:"#BBF7D0" },
    { label:"今月受注件数",     value:"56件",         sub:"前月比 速報値",                 up:true, color:BLUE,   bg:BLUE_L,    border:"#BFDBFE" },
    { label:"月次平均粗利率",   value:"24.8%",        sub:"12ヶ月平均",                    up:true, color:PURPLE, bg:PURPLE_L,  border:"#DDD6FE" },
  ];
  const recentOrders = [
    { id:"ORD-2041", customer:"大阪モーター整備",     part:"フロントコントロールアーム左", amount:9300,  margin:19.4, grossAmt:1804, date:"04/07", status:"発送済",   staff:"小嶋" },
    { id:"ORD-2040", customer:"神戸カーサービス",      part:"ブレーキパッド（低ダスト）",   amount:14800, margin:22.1, grossAmt:3271, date:"04/07", status:"発送済",   staff:"宮嶋" },
    { id:"ORD-2038", customer:"東京欧州車センター",    part:"タイミングベルトキット",       amount:28600, margin:31.5, grossAmt:9009, date:"04/07", status:"受注確定", staff:"小嶋" },
    { id:"ORD-2037", customer:"横浜ユーロモータース",  part:"DSGオイルポンプ",              amount:33700, margin:27.8, grossAmt:9369, date:"04/07", status:"受注確定", staff:"宮嶋" },
  ];
  const topCustomers = [
    { name:"横浜ユーロモータース", sales:1840000, orders:9, share:28.4 },
    { name:"大阪モーター整備",     sales:1210000, orders:7, share:18.7 },
    { name:"東京欧州車センター",   sales:980000,  orders:5, share:15.1 },
    { name:"名古屋プレミアムAuto", sales:720000,  orders:4, share:11.1 },
    { name:"神戸カーサービス",     sales:590000,  orders:3, share:9.1 },
  ];
  const topParts = [
    { cat:"サスペンション", sales:1280000, pct:40.7, color:BLUE },
    { cat:"ブレーキ",       sales:780000,  pct:24.8, color:R },
    { cat:"エンジン",       sales:540000,  pct:17.2, color:AMBER },
    { cat:"ミッション",     sales:320000,  pct:10.2, color:PURPLE },
    { cat:"その他",         sales:220000,  pct:7.1,  color:GRAY },
  ];
  const chartMaxVal = Math.max(...monthly.map(d => d.forecast || d.売上));
  const chartH = 160, barW = 42, gap = 14;
  const totalW = monthly.length * (barW + gap) - gap;
  const grossMin = Math.min(...monthly.map(d => d.粗利率));
  const grossMax = Math.max(...monthly.map(d => d.粗利率));
  const pts = monthly.map((d, i) => {
    const x = i * (barW + gap) + barW / 2;
    const y = chartH - ((d.粗利率 - grossMin) / (grossMax - grossMin || 1)) * (chartH - 45) - 8;
    return `${x},${y}`;
  });
  const S = { background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" };
  return (
    <div className="anim-fade-up" style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontSize:13, color:GRAY }}>2026年10月 〜 2027年9月（速報）</div>
        <div style={{ display:"flex", gap:6 }}>
          {["月次","四半期"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:500, cursor:"pointer", background:period===p?R:WHITE, color:period===p?WHITE:GRAY, border:`1px solid ${period===p?R:BORDER}`, fontFamily:"inherit" }}>{p}</button>
          ))}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ ...S, padding:"16px 18px" }}>
            <div style={{ fontSize:11, color:GRAY, marginBottom:8 }}>{k.label}</div>
            <div style={{ fontSize:22, fontWeight:700, color:k.color, fontFamily:"JetBrains Mono", marginBottom:6, lineHeight:1 }}>{k.value}</div>
            <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11 }}>
              {k.up ? <ArrowUpRight size={13} style={{ color:GREEN }} /> : <ArrowDownRight size={13} style={{ color:R }} />}
              <span style={{ color:k.up?GREEN:R }}>{k.sub}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:14 }}>
        <div style={{ ...S, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:600, color:DARK }}>月次売上 / 粗利推移</div>
            <div style={{ display:"flex", gap:10, fontSize:11, color:GRAY_L }}>
              <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:10, height:10, borderRadius:2, background:R, display:"inline-block" }}></span>売上</span>
              <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:10, height:10, borderRadius:2, background:`${R}35`, border:`1px dashed ${R}`, display:"inline-block" }}></span>予測</span>
              <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:10, height:2, background:GREEN, display:"inline-block" }}></span>粗利率</span>
            </div>
          </div>
          <div style={{ overflowX:"auto" }}>
            <svg width={totalW + 40} height={chartH + 60} style={{ display:"block" }}>
              {[0,1,2,3].map(ii => {
                const y = chartH - (chartH / 3) * ii;
                const val = Math.round((chartMaxVal / 3) * ii / 100000) * 100000;
                return <g key={ii}><line x1={30} y1={y} x2={totalW+40} y2={y} stroke={BORDER} strokeWidth={0.5} strokeDasharray="4,4" /><text x={28} y={y-3} fontSize={9} fill={GRAY_L} textAnchor="end">¥{(val/10000).toFixed(0)}万</text></g>;
              })}
              <g transform="translate(30,0)">
                {monthly.map((d, i) => {
                  const bh = (d.売上 / chartMaxVal) * (chartH - 45);
                  const fh = d.forecast ? ((d.forecast - d.売上) / chartMaxVal) * (chartH - 45) : 0;
                  const x = i * (barW + gap);
                  const isLast = i === monthly.length - 1;
                  return (
                    <g key={d.m}>
                      <rect x={x} y={chartH - bh} width={barW} height={bh} fill={isLast ? `${R}85` : R} rx={3} />
                      {isLast && fh > 0 && <rect x={x} y={chartH - bh - fh} width={barW} height={fh} fill={`${R}25`} rx={3} stroke={R} strokeWidth={1.5} strokeDasharray="4,3" />}
                      <text x={x + barW/2} y={chartH + 14} textAnchor="middle" fontSize={10} fill={isLast ? R : GRAY}>{d.m}</text>
                      {isLast ? (
                        <>
                          <rect x={x + barW/2 - 22} y={chartH - bh - fh - 16} width={44} height={13} fill="white" fillOpacity={0.92} rx={2} />
                          <text x={x + barW/2} y={chartH - bh - fh - 6} textAnchor="middle" fontSize={9} fontWeight="600" fill={R}>予測¥{(d.forecast/10000).toFixed(0)}万</text>
                        </>
                      ) : (
                        <>
                          <rect x={x + barW/2 - 18} y={chartH - bh - 15} width={36} height={12} fill="white" fillOpacity={0.85} rx={2} />
                          <text x={x + barW/2} y={chartH - bh - 6} textAnchor="middle" fontSize={9} fill={GRAY_L}>¥{(d.売上/10000).toFixed(0)}万</text>
                        </>
                      )}
                    </g>
                  );
                })}
                <polyline points={pts.join(" ")} fill="none" stroke={GREEN} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                {monthly.map((d, i) => {
                  const [x, y] = pts[i].split(",").map(Number);
                  return (<g key={i}><circle cx={x} cy={y} r={3} fill={GREEN} /><text x={x} y={y - 8} textAnchor="middle" fontSize={8} fill={GREEN}>{d.粗利率}%</text></g>);
                })}
              </g>
            </svg>
          </div>
        </div>
        <div style={{ ...S, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, color:DARK, marginBottom:14 }}>カテゴリ別売上構成</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {topParts.map(p => (
              <div key={p.cat}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ width:8, height:8, borderRadius:2, background:p.color, display:"inline-block", flexShrink:0 }}></span>
                    <span style={{ fontSize:12, color:DARK }}>{p.cat}</span>
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <span style={{ fontSize:11, color:GRAY_L, fontFamily:"JetBrains Mono" }}>¥{(p.sales/10000).toFixed(0)}万</span>
                    <span style={{ fontSize:11, fontWeight:600, color:p.color, fontFamily:"JetBrains Mono", minWidth:36, textAlign:"right" }}>{p.pct}%</span>
                  </div>
                </div>
                <div style={{ height:6, background:"#F3F4F6", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${p.pct}%`, background:p.color, borderRadius:3, transition:"width .6s ease" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:16, paddingTop:12, borderTop:`1px solid ${BORDER}` }}>
            <div style={{ fontSize:11, color:GRAY_L, marginBottom:4 }}>今月合計</div>
            <div style={{ fontSize:20, fontWeight:700, color:DARK, fontFamily:"JetBrains Mono" }}>¥8,500,000</div>
          </div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div style={{ ...S, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, color:DARK, marginBottom:14 }}>顧客別売上ランキング（今月）</div>
          {topCustomers.map((c, i) => (
            <div key={c.name} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:i<topCustomers.length-1?`1px solid ${BORDER}`:"none" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:i===0?AMBER_L:"#F9FAFB", color:i===0?AMBER:GRAY_L, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0, border:`1px solid ${i===0?"#FDE68A":BORDER}` }}>{i+1}</div>
              <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:12, fontWeight:500, color:DARK, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</div><div style={{ fontSize:10, color:GRAY_L }}>{c.orders}件</div></div>
              <div style={{ textAlign:"right", flexShrink:0 }}><div style={{ fontSize:13, fontWeight:700, color:DARK, fontFamily:"JetBrains Mono" }}>¥{(c.sales/10000).toFixed(0)}万</div><div style={{ fontSize:10, color:GRAY_L }}>{c.share}%</div></div>
            </div>
          ))}
        </div>
        <div style={{ ...S, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, color:DARK, marginBottom:14 }}>直近の成約案件</div>
          {recentOrders.map((o, i) => (
            <div key={o.id} style={{ padding:"10px 0", borderBottom:i<recentOrders.length-1?`1px solid ${BORDER}`:"none" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                    <span style={{ fontSize:11, fontFamily:"JetBrains Mono", color:R, fontWeight:600 }}>{o.id}</span>
                    <StatusBadge s={o.status} />
                    <span style={{ fontSize:10, background:"#F3F4F6", color:GRAY, borderRadius:3, padding:"1px 6px" }}>{o.staff}</span>
                  </div>
                  <div style={{ fontSize:12, fontWeight:500, color:DARK, marginBottom:1 }}>{o.customer}</div>
                  <div style={{ fontSize:11, color:GRAY_L, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.part}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:DARK, fontFamily:"JetBrains Mono" }}>¥{o.amount.toLocaleString()}</div>
                  <div style={{ fontSize:10, color:o.margin>25?GREEN:GRAY_L }}>粗利 ¥{o.grossAmt.toLocaleString()} ({o.margin}%)</div>
                  <div style={{ fontSize:10, color:GRAY_L }}>{o.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InventoryScreen() {
  const [tab, setTab] = useState("在庫一覧");
  const [filter, setFilter] = useState("全件");
  const stocks = [
    {no:"31126855157",name:"フロントコントロールアーム左",cat:"サスペンション",maker:"BMW",qty:3,reserved:1,available:2,loc:"A-12-3",cost:7800,alert:false},
    {no:"A0004230012",name:"ブレーキパッド（フロント）",cat:"ブレーキ",maker:"Mercedes",qty:8,reserved:3,available:5,loc:"B-04-1",cost:4200,alert:false},
    {no:"95810611100",name:"エアサスペンション（リア）",cat:"サスペンション",maker:"Porsche",qty:1,reserved:1,available:0,loc:"C-01-2",cost:38000,alert:true},
    {no:"06L109257B",name:"タイミングベルトキット",cat:"エンジン",maker:"Audi/VW",qty:2,reserved:0,available:2,loc:"A-08-5",cost:16500,alert:false},
    {no:"0AM927769D",name:"DSGオイルポンプ",cat:"ミッション",maker:"VW",qty:0,reserved:0,available:0,loc:"―",cost:19800,alert:true},
  ];
  const filtered = filter==="在庫切れ"?stocks.filter(s=>s.qty===0):filter==="引当中"?stocks.filter(s=>s.reserved>0):filter==="引当可能"?stocks.filter(s=>s.available>0):stocks;
  const S = { background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" };
  return (
    <div className="anim-fade-up" style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ background:"#FEF2F2", border:`1px solid #FECACA`, borderRadius:10, padding:"12px 18px", display:"flex", alignItems:"center", gap:10 }}>
        <AlertTriangle size={16} style={{ color:R, flexShrink:0 }} />
        <div style={{ fontSize:13, color:R, fontWeight:600 }}>引当注意：</div>
        <div style={{ fontSize:13, color:DARK }}>エアサスペンション（95810611100）引当可能数ゼロ。DSGオイルポンプは在庫切れ。</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[{label:"総SKU数",value:`${stocks.length}種`,color:DARK,bg:"#F9FAFB",border:BORDER},{label:"引当中",value:`${stocks.reduce((a,s)=>a+s.reserved,0)}件`,color:PURPLE,bg:PURPLE_L,border:"#DDD6FE"},{label:"引当可能",value:`${stocks.reduce((a,s)=>a+s.available,0)}件`,color:GREEN,bg:GREEN_L,border:"#BBF7D0"},{label:"在庫切れ",value:`${stocks.filter(s=>s.qty===0).length}種`,color:R,bg:"#FEF2F2",border:"#FECACA"}].map(k=>(
          <div key={k.label} style={{...S,padding:"14px 18px"}}><div style={{fontSize:11,color:GRAY,marginBottom:6}}>{k.label}</div><div style={{fontSize:28,fontWeight:700,color:k.color,fontFamily:"JetBrains Mono",lineHeight:1}}>{k.value}</div></div>
        ))}
      </div>
      <div style={{...S,overflow:"hidden"}}>
        <div style={{display:"flex",borderBottom:`1px solid ${BORDER}`,background:"#FAFAFA"}}>
          {["在庫一覧","引当管理"].map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"11px 20px",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",background:"transparent",border:"none",borderBottom:tab===t?`2px solid ${R}`:"2px solid transparent",color:tab===t?R:GRAY}}>{t}</button>)}
        </div>
        <div style={{padding:"10px 14px",borderBottom:`1px solid ${BORDER}`,display:"flex",gap:8}}>
          {["全件","在庫切れ","引当中","引当可能"].map(f=><button key={f} onClick={()=>setFilter(f)} style={{padding:"5px 12px",borderRadius:16,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",background:filter===f?R:WHITE,color:filter===f?WHITE:GRAY,border:`1px solid ${filter===f?R:BORDER}`}}>{f}</button>)}
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#FAFAFA"}}>{["品番","品名","在庫数","引当数","引当可能","ロケーション","仕入原価","状態"].map(h=><th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:11,color:GRAY_L,fontWeight:600,borderBottom:`1px solid ${BORDER}`}}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map((s,i)=>(
            <tr key={s.no} style={{borderBottom:`1px solid ${BORDER}`,animation:`fadeUp .22s ${i*.04}s ease both`,opacity:0}}>
              <td style={{padding:"11px 14px",fontFamily:"JetBrains Mono",fontSize:11,color:R,fontWeight:600}}>{s.no}</td>
              <td style={{padding:"11px 14px",fontSize:12,fontWeight:500,color:DARK}}>{s.name}</td>
              <td style={{padding:"11px 14px",textAlign:"center"}}><span style={{fontFamily:"JetBrains Mono",fontSize:14,fontWeight:700,color:s.qty===0?R:DARK}}>{s.qty}</span></td>
              <td style={{padding:"11px 14px",textAlign:"center"}}>{s.reserved>0?<span style={{background:PURPLE_L,color:PURPLE,fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:4,fontFamily:"JetBrains Mono"}}>{s.reserved}</span>:<span style={{color:GRAY_L}}>―</span>}</td>
              <td style={{padding:"11px 14px",textAlign:"center"}}><span style={{fontFamily:"JetBrains Mono",fontSize:14,fontWeight:700,color:s.available===0?R:GREEN}}>{s.available}</span></td>
              <td style={{padding:"11px 14px",fontFamily:"JetBrains Mono",fontSize:11,color:GRAY}}>{s.loc}</td>
              <td style={{padding:"11px 14px",fontFamily:"JetBrains Mono",fontSize:12,color:DARK}}>¥{s.cost.toLocaleString()}</td>
              <td style={{padding:"11px 14px"}}>{s.qty===0?<span style={{background:"#FEF2F2",color:R,fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:4}}>在庫切れ</span>:s.available===0?<span style={{background:PURPLE_L,color:PURPLE,fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:4}}>引当済</span>:<span style={{background:GREEN_L,color:GREEN,fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:4}}>引当可</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function CreditMemoScreen() {
  const [showNew, setShowNew] = useState(false);
  const memos = [
    {id:"CRD-008",orig:"INV-2031",customer:"横浜ユーロモータース",part:"エアサスペンション（リア）",amount:42100,reason:"適合不良（車種違い）",date:"2026/04/03",status:"承認済",approved:"小嶋"},
    {id:"CRD-007",orig:"INV-2028",customer:"名古屋プレミアムAuto",part:"DSGオイルポンプ",amount:8900,reason:"輸送中破損",date:"2026/03/30",status:"承認済",approved:"宮嶋"},
    {id:"CRD-005",orig:"INV-2015",customer:"大阪モーター整備",part:"タイミングベルトキット",amount:28600,reason:"注文キャンセル",date:"2026/03/15",status:"差戻し",approved:"―"},
  ];
  const S = { background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" };
  return (
    <div className="anim-fade-up" style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:13, color:GRAY }}>赤伝は元の請求書を修正・削除せず、マイナス伝票として新規発行します。</div>
        <button onClick={() => setShowNew(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:R, color:WHITE, border:"none", borderRadius:7, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}><Plus size={14} /> 赤伝を起票する</button>
      </div>
      <div style={{ ...S, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#FAFAFA" }}>{["赤伝番号","元請求書","顧客名","返品品目","返品金額","返品理由","起票日","ステータス","承認者"].map(h=><th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:11, color:GRAY_L, fontWeight:600, borderBottom:`1px solid ${BORDER}` }}>{h}</th>)}</tr></thead>
          <tbody>{memos.map((m,i)=>(
            <tr key={m.id} style={{ borderBottom:`1px solid ${BORDER}`, animation:`fadeUp .22s ${i*.04}s ease both`, opacity:0 }}>
              <td style={{ padding:"12px 14px", fontFamily:"JetBrains Mono", fontSize:11, color:R, fontWeight:600 }}>{m.id}</td>
              <td style={{ padding:"12px 14px", fontFamily:"JetBrains Mono", fontSize:11, color:GRAY }}>{m.orig}</td>
              <td style={{ padding:"12px 14px", fontSize:12, fontWeight:500, color:DARK }}>{m.customer}</td>
              <td style={{ padding:"12px 14px", fontSize:12, color:GRAY }}>{m.part}</td>
              <td style={{ padding:"12px 14px", fontFamily:"JetBrains Mono", fontSize:13, fontWeight:700, color:R }}>¥{m.amount.toLocaleString()}</td>
              <td style={{ padding:"12px 14px", fontSize:11, color:GRAY }}>{m.reason}</td>
              <td style={{ padding:"12px 14px", fontSize:11, color:GRAY_L }}>{m.date}</td>
              <td style={{ padding:"12px 14px" }}>{m.status==="承認済"?<span style={{ background:GREEN_L, color:GREEN, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4 }}>承認済</span>:<span style={{ background:AMBER_L, color:AMBER, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4 }}>差戻し</span>}</td>
              <td style={{ padding:"12px 14px", fontSize:12, color:DARK }}>{m.approved}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function VinLedgerScreen() {
  const [tab, setTab] = useState("VINカルテ");
  const [selected, setSelected] = useState("WBA5R110X0FH12345");
  const vins = [
    { vin:"WBA5R110X0FH12345", car:"BMW G20 3シリーズ 2021年式", customer:"大阪モーター整備", orders:4, last:"2026/04/07", parts:["31126855157","34116860023","N13-01-001"] },
    { vin:"WDD2052361A123456", car:"Mercedes C220d W205 2018年式", customer:"神戸カーサービス", orders:7, last:"2026/04/05", parts:["A0004230012"] },
    { vin:"WP1ZZZ9YBKLA12345", car:"Porsche Cayenne 9YA 2019年式", customer:"京都輸入車工房", orders:2, last:"2026/04/03", parts:["95810611100"] },
    { vin:"WAUZZZ4G5EN123456", car:"Audi A6 C7 2014年式", customer:"東京欧州車センター", orders:5, last:"2026/03/28", parts:["06L109257B"] },
  ];
  const compat = [
    { oem:"31126855157", name:"フロントコントロールアーム左", maker:"BMW", applies:"G20/G21/G28/F30/F31", aftermarket:[{brand:"LEMFÖDER",no:"37854 01",price:"¥7,800",score:91},{brand:"FEBI",no:"176481",price:"¥8,200",score:85},{brand:"MEYLE",no:"316 050 0010",price:"¥6,900",score:78}] },
    { oem:"A0004230012", name:"ブレーキパッド（フロント）", maker:"Mercedes", applies:"W205/W213/W222", aftermarket:[{brand:"BREMBO",no:"P 50 097",price:"¥4,200",score:94},{brand:"TRW",no:"GDB1882",price:"¥3,800",score:82}] },
    { oem:"95810611100", name:"エアサスペンション（リア）", maker:"Porsche", applies:"9YA/9YB", aftermarket:[{brand:"KYB",no:"339706",price:"¥38,000",score:80}] },
  ];
  const selVin = vins.find(v => v.vin === selected);
  const S = { background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" };
  return (
    <div className="anim-fade-up" style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ ...S, overflow:"hidden" }}>
        <div style={{ display:"flex", borderBottom:`1px solid ${BORDER}`, background:"#FAFAFA" }}>
          {["VINカルテ","互換品番マスタ"].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding:"11px 20px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", background:"transparent", border:"none", borderBottom:tab===t?`2px solid ${R}`:"2px solid transparent", color:tab===t?R:GRAY }}>{t}</button>)}
        </div>
        {tab === "VINカルテ" && (
          <div style={{ display:"flex", minHeight:420 }}>
            <div style={{ width:300, borderRight:`1px solid ${BORDER}`, overflowY:"auto" }}>
              {vins.map(v => (
                <div key={v.vin} onClick={() => setSelected(v.vin)} style={{ padding:"12px 16px", borderBottom:`1px solid ${BORDER}`, cursor:"pointer", background:selected===v.vin?`${R}06`:WHITE, borderLeft:selected===v.vin?`3px solid ${R}`:"3px solid transparent" }}>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:11, color:R, fontWeight:600, marginBottom:3 }}>{v.vin}</div>
                  <div style={{ fontSize:12, fontWeight:500, color:DARK, marginBottom:2 }}>{v.car}</div>
                  <div style={{ fontSize:11, color:GRAY_L, display:"flex", justifyContent:"space-between" }}><span>{v.customer}</span><span>注文 {v.orders}件</span></div>
                </div>
              ))}
            </div>
            {selVin && (
              <div style={{ flex:1, padding:20, display:"flex", flexDirection:"column", gap:14 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[["VIN番号",selVin.vin,true],["車種・年式",selVin.car,false],["顧客",selVin.customer,false],["最終注文",selVin.last,false],["注文件数",`${selVin.orders}件`,false]].map(([l,v,mono]) => (
                    <div key={l} style={{ background:"#FAFAFA", borderRadius:7, padding:"8px 12px", border:`1px solid ${BORDER}` }}>
                      <div style={{ fontSize:10, color:GRAY_L, marginBottom:2 }}>{l}</div>
                      <div style={{ fontSize:mono?11:12, fontWeight:500, color:mono?R:DARK, fontFamily:mono?"JetBrains Mono":undefined }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize:12, color:GRAY, marginBottom:8 }}>過去の注文部品</div>
                  {selVin.parts.map(p => (
                    <div key={p} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"#FAFAFA", borderRadius:7, border:`1px solid ${BORDER}`, marginBottom:6 }}>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:R, fontWeight:600 }}>{p}</span>
                      <span style={{ fontSize:11, color:GRAY }}>— 部品マスタ参照</span>
                      <button style={{ marginLeft:"auto", fontSize:11, padding:"2px 8px", background:BLUE_L, color:BLUE, border:`1px solid #BFDBFE`, borderRadius:4, cursor:"pointer", fontFamily:"inherit" }}>再注文</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {tab === "互換品番マスタ" && (
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {compat.map((c, i) => (
              <div key={c.oem} style={{ borderBottom:`1px solid ${BORDER}`, padding:16, animation:`fadeUp .22s ${i*.08}s ease both`, opacity:0 }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:12 }}>
                  <div><div style={{ fontFamily:"JetBrains Mono", fontSize:13, color:R, fontWeight:700 }}>{c.oem}</div><div style={{ fontSize:11, color:GRAY_L }}>{c.maker} / 純正品番</div></div>
                  <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600, color:DARK }}>{c.name}</div><div style={{ fontSize:11, color:GRAY_L }}>適合: {c.applies}</div></div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:`repeat(${c.aftermarket.length},1fr)`, gap:10 }}>
                  {c.aftermarket.map(a => (
                    <div key={a.no} style={{ background:"#FAFAFA", borderRadius:8, padding:12, border:`1px solid ${BORDER}` }}>
                      <div style={{ fontSize:11, fontWeight:700, color:DARK, marginBottom:2 }}>{a.brand}</div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:11, color:GRAY, marginBottom:6 }}>{a.no}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:13, fontWeight:700, color:DARK }}>{a.price}</span>
                        <span style={{ fontSize:11, fontWeight:600, color:a.score>=90?GREEN:a.score>=80?BLUE:AMBER, fontFamily:"JetBrains Mono" }}>{a.score}pt</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── NAV ─── */
const OPS_NAV = [
  {id:9,Icon:BarChart2,label:"売上ダッシュボード",sub:"売上分析"},
  {id:0,Icon:LayoutDashboard,label:"受付対応",sub:"問い合わせ管理"},
  {id:1,Icon:ShoppingCart,label:"仕入先比較",sub:"仕入比較"},
  {id:2,Icon:FileText,label:"見積作成",sub:"見積書"},
  {id:3,Icon:Package,label:"受注・発送",sub:"受注管理"},
  {id:4,Icon:Wallet,label:"請求・入金管理",sub:"入金確認"},
];
const MASTER_NAV = [
  {id:5,Icon:Users,label:"顧客マスタ",sub:"顧客管理"},
  {id:6,Icon:Building2,label:"仕入先マスタ",sub:"仕入先管理"},
  {id:7,Icon:Wrench,label:"部品マスタ",sub:"部品管理"},
  {id:8,Icon:UserCog,label:"担当者マスタ",sub:"スタッフ管理"},
  {id:10,Icon:Package,label:"在庫・引当管理",sub:"在庫管理"},
  {id:11,Icon:FileText,label:"赤伝・返品管理",sub:"返品処理"},
  {id:12,Icon:Search,label:"VIN・互換品番",sub:"部品特定支援"},
];
const ALL_NAV_MAP = Object.fromEntries([...OPS_NAV,...MASTER_NAV].map(n=>[n.id,n]));

function Sidebar({ open, setOpen, screen, setScreen }) {
  return (
    <aside className="sidebar" style={{ width:open?220:64, background:WHITE, borderRight:`1px solid ${BORDER}`, display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 16px", height:64, borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:R, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:WHITE, flexShrink:0 }}>C</div>
        {open && <div style={{ overflow:"hidden" }}><div style={{ fontSize:13, fontWeight:700, color:DARK, whiteSpace:"nowrap" }}>カレント自動車</div><div style={{ fontSize:10, color:GRAY_L, whiteSpace:"nowrap" }}>部品販売管理システム</div></div>}
      </div>
      <nav style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
        {open && <div style={{ fontSize:10, fontWeight:700, color:GRAY_L, letterSpacing:"0.08em", padding:"6px 10px 4px" }}>業務</div>}
        {OPS_NAV.map(n => {
          const active = screen === n.id;
          return (
            <button key={n.id} onClick={() => setScreen(n.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:open?"9px 10px":"9px", justifyContent:open?"flex-start":"center", borderRadius:8, cursor:"pointer", border:"none", fontFamily:"inherit", fontSize:13, fontWeight:active?600:400, background:active?`${R}10`:WHITE, color:active?R:GRAY, borderLeft:active?`3px solid ${R}`:"3px solid transparent", transition:"all .15s" }}>
              <n.Icon size={17} style={{ flexShrink:0 }} />
              {open && <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{n.label}</span>}
            </button>
          );
        })}
        <div style={{ margin:"10px 8px", borderTop:`1px solid ${BORDER}` }} />
        {open && <div style={{ fontSize:10, fontWeight:700, color:GRAY_L, letterSpacing:"0.08em", padding:"2px 10px 4px" }}>マスタ登録</div>}
        {MASTER_NAV.map(n => {
          const active = screen === n.id;
          return (
            <button key={n.id} onClick={() => setScreen(n.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:open?"9px 10px":"9px", justifyContent:open?"flex-start":"center", borderRadius:8, cursor:"pointer", border:"none", fontFamily:"inherit", fontSize:13, fontWeight:active?600:400, background:active?`${R}10`:WHITE, color:active?R:GRAY, borderLeft:active?`3px solid ${R}`:"3px solid transparent", transition:"all .15s" }}>
              <n.Icon size={17} style={{ flexShrink:0 }} />
              {open && <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{n.label}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding:8, borderTop:`1px solid ${BORDER}`, flexShrink:0 }}>
        <button onClick={() => setOpen(!open)} style={{ width:"100%", height:36, display:"flex", alignItems:"center", justifyContent:"center", background:"transparent", border:"none", cursor:"pointer", borderRadius:6, color:GRAY_L }}>
          {open ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
        </button>
      </div>
    </aside>
  );
}

function TopBar({ isLoggedIn, setIsLoggedIn, screen }) {
  return (
    <header style={{ position:"sticky", top:0, zIndex:10, height:64, display:"flex", alignItems:"center", padding:"0 24px", background:"rgba(255,255,255,0.9)", backdropFilter:"blur(8px)", borderBottom:`1px solid ${BORDER}` }}>
      <div>
        <div style={{ fontSize:15, fontWeight:700, color:DARK }}>{ALL_NAV_MAP[screen]?.label}</div>
        <div style={{ fontSize:11, color:GRAY_L }}>{ALL_NAV_MAP[screen]?.sub} — カレント自動車株式会社</div>
      </div>
      <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12 }}>
        <button style={{ position:"relative", background:"none", border:"none", cursor:"pointer", color:GRAY, display:"flex", alignItems:"center", padding:6, borderRadius:7 }}>
          <Bell size={17} />
          <span style={{ position:"absolute", top:4, right:4, width:8, height:8, background:R, borderRadius:"50%", border:`2px solid ${WHITE}` }} />
        </button>
        <div style={{ width:1, height:24, background:BORDER }} />
        {isLoggedIn ? (
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:`${R}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:R }}>小</div>
              <div><div style={{ fontSize:13, fontWeight:600, color:DARK, lineHeight:1 }}>小嶋 鹿乃雲</div><div style={{ fontSize:10, color:GRAY_L, marginTop:2 }}>パーツ事業部</div></div>
            </div>
            <button onClick={() => setIsLoggedIn(false)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", border:`1px solid ${BORDER}`, borderRadius:7, background:WHITE, fontSize:12, fontWeight:500, color:GRAY, cursor:"pointer", fontFamily:"inherit" }}>
              <LogOut size={13} /> ログアウト
            </button>
          </div>
        ) : (
          <button onClick={() => setIsLoggedIn(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:R, color:WHITE, border:"none", borderRadius:7, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            <LogIn size={14} /> ログイン
          </button>
        )}
      </div>
    </header>
  );
}

function CaseStrip({ screen }) {
  if (screen === 0 || screen >= 5) return null;
  const labels = ["","仕入先照会中","見積作成中","発送手配中","入金管理","","","",""];
  return (
    <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:14, padding:"10px 16px", marginBottom:16, borderRadius:8, background:WHITE, border:`1px solid ${BORDER}`, fontSize:12, boxShadow:"0 1px 2px rgba(0,0,0,0.04)" }}>
      <span style={{ color:GRAY_L }}>進行中案件</span>
      <span style={{ fontFamily:"JetBrains Mono", fontWeight:700, color:R }}>C-2041</span>
      <span style={{ color:DARK, fontWeight:500 }}>大阪モーター整備</span>
      <span style={{ color:GRAY_L }}>BMW G20 3シリーズ</span>
      <span style={{ fontFamily:"JetBrains Mono", color:BLUE }}>31126855157</span>
      <span style={{ color:GRAY_L }}>フロントコントロールアーム左</span>
      <span style={{ marginLeft:"auto" }}><StatusBadge s={labels[screen]||"受付中"} /></span>
    </div>
  );
}

/* ─── APP ROOT ─── */
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [screen, setScreen] = useState(0);
  const [inquiryActive, setInquiryActive] = useState(null); // null or { caseId, part, part_no, car, customer }

  function clearInquiry() { setInquiryActive(null); }

  // Render screen with appropriate props
  function renderScreen() {
    switch(screen) {
      case 0: return <DashboardScreen key={screen} setScreen={setScreen} setInquiryActive={setInquiryActive} />;
      case 1: return <SupplierScreen key={`${screen}-${inquiryActive?.caseId}`} inquiryActive={inquiryActive} clearInquiry={clearInquiry} />;
      case 2: return <QuoteScreen key={screen} />;
      case 3: return <OrderScreen key={screen} />;
      case 4: return <PaymentScreen key={screen} />;
      case 5: return <CustomerMaster key={screen} />;
      case 6: return <SupplierMasterScreen key={screen} />;
      case 7: return <PartsMaster key={screen} />;
      case 8: return <StaffMaster key={screen} />;
      case 9: return <SalesDashboard key={screen} />;
      case 10: return <InventoryScreen key={screen} />;
      case 11: return <CreditMemoScreen key={screen} />;
      case 12: return <VinLedgerScreen key={screen} />;
      default: return <DashboardScreen key={screen} setScreen={setScreen} setInquiryActive={setInquiryActive} />;
    }
  }

  return (
    <>
      <style>{THEME}</style>
      <div style={{ display:"flex", minHeight:"100vh", background:BG }}>
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} screen={screen} setScreen={setScreen} />
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
          <TopBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} screen={screen} />
          <main style={{ flex:1, padding:24, overflowY:"auto" }}>
            <CaseStrip screen={screen} />
            {renderScreen()}
          </main>
        </div>
      </div>
    </>
  );
}
