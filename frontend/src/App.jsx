import { useEffect, useState } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fontBase64 } from './ThaiFont';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API_URL from './config';

// ============================================================
// 🎨 GLOBAL STYLES — "ธีมสีและรูปแบบ" ของทั้งแอป
// เปรียบเหมือน "คู่มือแต่งร้าน" ที่ทุกส่วนต้องทำตาม
// ฉีดเข้า <head> ครั้งเดียวตอนโหลด จากนั้นใช้ className ได้ทุกที่
// ============================================================
// ============================================================
// 🎨 GLOBAL STYLES — "ธีมสีและรูปแบบ" ของทั้งแอป
//
// เปรียบเหมือน "คู่มือแต่งร้าน" ที่ฝ่ายตกแต่งทำไว้ให้ครั้งเดียว
// แล้วทุกส่วนของแอปใช้ className ต่างๆ ได้เลย
// ฉีดเข้า <head> ผ่าน useEffect ครั้งเดียวตอน mount
// ============================================================
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

  /* ============================================================
   CSS Custom Properties (ตัวแปร) — เหมือน "แพลเลตสี" ของดีไซเนอร์
   เปลี่ยนที่นี่ที่เดียว สีเปลี่ยนทั้งแอปเลย
   ============================================================ */
  :root {
    /* สีหลัก Indigo-Violet (ม่วง) */
    --p:   #7C6FFF;   /* Primary — ม่วงสด */
    --pd:  #6358E8;   /* Primary Dark — ม่วงเข้ม (hover) */
    --pl:  #EFEDFF;   /* Primary Light — ม่วงอ่อนมาก (background ไฮไลต์) */

    /* สีเสริม */
    --s:   #FF6B9D;   /* Secondary — ชมพูสด */
    --ok:  #10B981;   /* Success — เขียวมรกต */
    --warn:#F59E0B;   /* Warning — เหลืองอำพัน */
    --err: #EF4444;   /* Danger — แดง */

    /* สีพื้นผิว */
    --bg:  #F0F1F8;   /* พื้นหลังทั้งหน้า — เทาม่วงอ่อน */
    --card:#FFFFFF;   /* การ์ดขาว */
    --t1:  #16172B;   /* ตัวอักษรหลัก — เกือบดำ (Navy) */
    --t2:  #7B8099;   /* ตัวอักษรรอง — เทา */
    --dark:#16172B;   /* แถบเข้ม (Navbar / Admin Sidebar) */
    --border: #E8EAF2; /* ขอบเส้นบางๆ */

    /* ขอบมน — เหมือน "มุมห้อง" กลมหรือเหลี่ยม */
    --r:   14px;
    --r-sm: 8px;
    --r-lg: 20px;

    /* เงา */
    --sh:    0 2px 12px rgba(22,23,43,.07);
    --sh-md: 0 8px 28px rgba(22,23,43,.10);
    --sh-lg: 0 16px 48px rgba(22,23,43,.14);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* font หลักทั้งแอป — Prompt รองรับไทย+อังกฤษสวย */
  body {
    font-family: 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg);
    color: var(--t1);
    -webkit-font-smoothing: antialiased;
  }

  /* ============================================================
   BUTTON — เปรียบเหมือน "ปุ่มกดในลิฟต์"
   มีหลายสี แต่โครงสร้างเหมือนกัน ใช้ className เปลี่ยนสีได้
   ============================================================ */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px 22px;
    border: none; border-radius: 50px; /* pill shape */
    font-family: inherit; font-size: 14px; font-weight: 600;
    cursor: pointer;
    transition: all .2s cubic-bezier(.4,0,.2,1);
    text-decoration: none; white-space: nowrap;
    letter-spacing: .2px;
  }
  .btn:active { transform: scale(.96); }

  /* สีปุ่มต่างๆ */
  .btn-p    { background: linear-gradient(135deg,var(--p),var(--pd)); color:#fff; box-shadow:0 4px 16px rgba(124,111,255,.38); }
  .btn-p:hover  { box-shadow:0 6px 22px rgba(124,111,255,.5); transform:translateY(-1px); }
  .btn-ok   { background: linear-gradient(135deg,#10B981,#059669); color:#fff; box-shadow:0 4px 16px rgba(16,185,129,.3); }
  .btn-ok:hover { box-shadow:0 6px 22px rgba(16,185,129,.45); transform:translateY(-1px); }
  .btn-err  { background: linear-gradient(135deg,#EF4444,#DC2626); color:#fff; box-shadow:0 4px 14px rgba(239,68,68,.3); }
  .btn-err:hover { box-shadow:0 6px 20px rgba(239,68,68,.45); transform:translateY(-1px); }
  .btn-warn { background: linear-gradient(135deg,#F59E0B,#D97706); color:#fff; }
  .btn-dark { background: var(--dark); color:#fff; }
  .btn-dark:hover { background: #2A2B42; transform:translateY(-1px); }

  /* btn-ghost — โปร่งใส มีขอบ เหมือน "ปุ่มกระจก" */
  .btn-ghost {
    background: transparent;
    color: var(--p);
    border: 1.5px solid var(--p);
  }
  .btn-ghost:hover { background: var(--pl); border-color:var(--pd); }

  /* ขนาดปุ่ม */
  .btn-sm { padding:6px 14px; font-size:12px; }
  .btn-lg { padding:13px 32px; font-size:15px; }

  /* ============================================================
   CARD — เปรียบเหมือน "กล่องโชว์สินค้า" บนชั้นวาง
   ใส่เนื้อหาอะไรก็ได้ข้างใน
   ============================================================ */
  .card {
    background: var(--card);
    border-radius: var(--r);
    box-shadow: var(--sh);
    overflow: hidden;
    border: 1px solid rgba(232,234,242,.6);
  }
  .card-body { padding: 24px; }

  /* ============================================================
   BADGE — เปรียบเหมือน "ป้ายสถานะ" ขนาดเล็กแปะบนสินค้า
   ============================================================ */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 12px; border-radius: 50px;
    font-size: 11px; font-weight: 700;
    letter-spacing: .2px;
  }
  /* สีของ badge แต่ละสถานะ */
  .bdg-ok   { background:#D1FAE5; color:#065F46; }
  .bdg-warn { background:#FEF3C7; color:#92400E; }
  .bdg-err  { background:#FEE2E2; color:#991B1B; }
  .bdg-info { background:#DBEAFE; color:#1E40AF; }
  .bdg-p    { background:var(--pl); color:var(--pd); }

  /* ============================================================
   FORM INPUT — เปรียบเหมือน "ช่องกรอกข้อมูล" ที่ทุกหน้าใช้ร่วมกัน
   ============================================================ */
  .inp {
    width: 100%; padding: 11px 16px;
    border: 1.5px solid var(--border); border-radius: var(--r-sm);
    font-family: inherit; font-size: 14px; color: var(--t1);
    background: #FAFBFF;
    transition: border-color .2s, box-shadow .2s;
    outline: none;
  }
  .inp:focus {
    border-color: var(--p);
    box-shadow: 0 0 0 3px rgba(124,111,255,.14);
    background: #fff;
  }

  /* label เหนือ input — บอกว่าช่องนี้กรอกอะไร */
  .lbl {
    display: block; font-size: 11px; font-weight: 700;
    color: var(--t2); margin-bottom: 6px;
    text-transform: uppercase; letter-spacing: .6px;
  }

  /* ============================================================
   TABLE — เปรียบเหมือน "สเปรดชีต" แสดงข้อมูลเป็นแถวคอลัมน์
   ============================================================ */
  .tbl { width: 100%; border-collapse: collapse; }
  .tbl thead th {
    background: var(--dark); color: #fff;
    padding: 13px 16px; font-size: 11px; font-weight: 700;
    text-align: left; letter-spacing: .6px; text-transform: uppercase;
    white-space: nowrap;
  }
  .tbl thead th:first-child { border-radius: 0; }
  .tbl tbody tr { border-bottom: 1px solid var(--border); transition: background .12s; }
  .tbl tbody tr:last-child { border-bottom: none; }
  .tbl tbody tr:hover { background: #F8F8FF; }
  .tbl tbody td { padding: 13px 16px; font-size: 13px; vertical-align: middle; }

  /* ============================================================
   STAT CARD (Dashboard) — เปรียบเหมือน "กระดานคะแนน" ในห้างใหญ่
   บอกตัวเลขสำคัญ ยอดขาย จำนวนออเดอร์ ฯลฯ
   ============================================================ */
  .scard {
    background: var(--card);
    border-radius: var(--r);
    padding: 22px 20px;
    box-shadow: var(--sh);
    border: 1px solid rgba(232,234,242,.6);
    border-left: 4px solid transparent; /* ขอบสีซ้ายบอก "ธีม" ของการ์ดนั้น */
    transition: transform .2s, box-shadow .2s;
  }
  .scard:hover { transform: translateY(-3px); box-shadow: var(--sh-md); }
  .scard .sv { font-size: 28px; font-weight: 800; margin: 6px 0 2px; }
  .scard .sl { font-size: 12px; color: var(--t2); font-weight: 500; }
  .scard .si { font-size: 26px; }

  /* ============================================================
   ANIMATIONS — ภาพเคลื่อนไหว เหมือน "ม่านเปิดร้าน" ที่ค่อยๆ เลื่อนขึ้น
   ============================================================ */
  @keyframes fadeInUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes popIn  {
    0%  { transform:scale(.55); opacity:0; }
    72% { transform:scale(1.04); }
    100%{ transform:scale(1);   opacity:1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  /* utility class — ใช้กับ element ที่อยาก animate ตอนปรากฏ */
  .fiu { animation: fadeInUp .38s cubic-bezier(.4,0,.2,1) both; }
  .fi  { animation: fadeIn .28s ease both; }

  /* ============================================================
   SIDEBAR MENU ITEM — เปรียบเหมือน "แต่ละชั้นในลิฟต์" ที่กดแล้วไปหน้านั้น
   ============================================================ */
  .smenu {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: var(--r-sm); margin-bottom: 2px;
    text-decoration: none; color: var(--t1);
    font-weight: 600; font-size: 14px;
    cursor: pointer; transition: all .15s;
    border: none; background: transparent;
    font-family: inherit; width: 100%; text-align: left;
  }
  .smenu:hover  { background: var(--pl); color: var(--p); }
  /* .active = หน้าปัจจุบัน — แสดงด้วย gradient สวยงาม */
  .smenu.active {
    background: linear-gradient(135deg, var(--p), var(--pd));
    color: #fff;
    box-shadow: 0 4px 14px rgba(124,111,255,.3);
  }

  /* admin sidebar — สีเข้ม ตัวอักษรสว่าง */
  .smenu-dark { color: rgba(255,255,255,.6); }
  .smenu-dark:hover  { background: rgba(124,111,255,.18); color: #fff; }
  .smenu-dark.active {
    background: linear-gradient(135deg, var(--p), var(--pd));
    color: #fff;
    box-shadow: 0 4px 14px rgba(124,111,255,.35);
  }

  /* ============================================================
   PRODUCT CARD — เปรียบเหมือน "ป้ายโชว์สินค้า" แต่ละชิ้น
   hover แล้วนูนขึ้น = "ยกสินค้าขึ้นมาดู"
   ============================================================ */
  .pcard {
    background: var(--card);
    border-radius: var(--r);
    overflow: hidden;
    box-shadow: var(--sh);
    border: 1px solid rgba(232,234,242,.7);
    transition: transform .22s cubic-bezier(.4,0,.2,1), box-shadow .22s;
  }
  .pcard:hover {
    transform: translateY(-6px);
    box-shadow: 0 14px 40px rgba(124,111,255,.16);
  }

  /* ============================================================
   MOBILE RESPONSIVE
   📱 มือถือ = "หน้าร้านแบบพกพา" — layout ปรับตัวอัตโนมัติ
   ============================================================ */
  @media(max-width:768px) {
    .hide-m    { display:none!important; }
    .card-body { padding:16px; }
    .tbl { font-size:12px; }
    .tbl thead th, .tbl tbody td { padding:10px 10px; }

    /* กริดสินค้าบนมือถือ → เลื่อนซ้าย-ขวาได้ เหมือน "ชั้นวางหมุน" */
    .pgrid-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:8px; }
    .pgrid-wrap::-webkit-scrollbar { height:4px; }
    .pgrid-wrap::-webkit-scrollbar-thumb { background:var(--pl); border-radius:4px; }
    .pgrid-m { display:flex!important; gap:14px!important; width:max-content; }
    .pgrid-m > * { width:185px!important; min-width:185px; }
  }

  /* 💻 Desktop Grid — แสดงสินค้าแบบตาราง */
  @media(min-width:769px) {
    .pgrid-d { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:22px; }
  }

  /* ============================================================
   EXTRA UI POLISH — รายละเอียดเล็กๆ ที่ทำให้ UI ดูแพงขึ้น
   ============================================================ */

  /* Divider — เส้นคั่นบางๆ */
  .divider { border:none; border-top:1px solid var(--border); margin:18px 0; }

  /* Section title — หัวข้อแต่ละส่วน */
  .sec-title { font-size:11px; font-weight:700; color:var(--t2); text-transform:uppercase; letter-spacing:1px; padding:0 14px; margin-bottom:8px; }

  /* กล่องข้อมูลธนาคาร */
  .bank-box {
    background: linear-gradient(135deg,#F0FFF8,#E6FFED);
    border:1px dashed #10B981;
    border-radius:var(--r-sm); padding:12px 16px;
    font-size:13px; color:#065F46; text-align:center;
    margin-bottom:18px;
  }

  /* Tag/Chip สินค้า */
  .chip {
    display:inline-flex; align-items:center;
    padding:3px 10px; border-radius:50px; font-size:11px; font-weight:700;
    background:var(--pl); color:var(--pd);
  }

  /* Scroll bar global สวย */
  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:#F0F1F8; }
  ::-webkit-scrollbar-thumb { background:#D0D3E8; border-radius:4px; }
  ::-webkit-scrollbar-thumb:hover { background:var(--p); }

  /* Focus ring ทุก interactive element */
  :focus-visible { outline:2px solid var(--p); outline-offset:2px; }

  /* Smooth transition ทั้งหน้า */
  * { transition-timing-function: cubic-bezier(.4,0,.2,1); }

  /* =========================================================
   HERO GRADIENT TEXT — ตัวอักษรไล่สีใน Banner
   ========================================================= */
  .hero-text {
    background: linear-gradient(135deg,#fff 0%,rgba(255,255,255,.75) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* กล่องบน Admin Panel */
  .admin-header-bar {
    background: var(--card);
    border-radius: var(--r);
    padding: 18px 24px;
    margin-bottom: 22px;
    box-shadow: var(--sh);
    border: 1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;
  }
`;

// ============================================================
// 🟢 [ไม่เปลี่ยน Logic] หน้ารายละเอียดสินค้า
// เปรียบเหมือน "ป้ายข้อมูลสินค้าขนาดใหญ่" ในห้าง
// ============================================================
function ProductDetailPage({ products, addToCart, productReviews, fetchProductReviews }) {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const product = products.find(p => p.id === Number(id));

  // 🔄 ดึงรีวิวทันทีที่เข้าหน้านี้ หรือเมื่อ ID สินค้าเปลี่ยน
  useEffect(() => {
    if (id) fetchProductReviews(id);
  }, [id, fetchProductReviews]);

  if (!product) {
    return (
      <div style={{ padding:'80px 20px', textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:16 }}>😕</div>
        <h3 style={{ color:'var(--t2)', marginBottom:20 }}>กำลังโหลด... หรือไม่พบสินค้านี้</h3>
        <button className="btn btn-p" onClick={() => navigate('/')}>กลับหน้าแรก</button>
      </div>
    );
  }

  return (
    /* หน้ารายละเอียดสินค้า — wrapper ทั้งหมด */
    <div style={{ padding:'28px 20px', maxWidth:1000, margin:'0 auto' }} className="fiu">
      {/* ปุ่มย้อนกลับ */}
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom:20 }}>
        ⬅ ย้อนกลับ
      </button>

      {/* การ์ดหลัก: รูป + รายละเอียด */}
      <div className="card" style={{ marginBottom:24 }}>
        <div style={{ display:'flex', flexWrap:'wrap' }}>

          {/* 🖼️ ฝั่งซ้าย: รูปสินค้า */}
          <div style={{ flex:'1 1 360px', background:'#F0EEFF', minHeight:340, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
            {product.image ? (
              <img src={product.image} alt={product.name}
                style={{ width:'100%', height:380, objectFit:'cover' }}
                onError={e => { e.target.src = 'https://via.placeholder.com/400x380?text=No+Image'; }}
              />
            ) : (
              <div style={{ fontSize:72, opacity:.4 }}>📦</div>
            )}
          </div>

          {/* 📝 ฝั่งขวา: รายละเอียด */}
          <div className="card-body" style={{ flex:'1 1 300px', display:'flex', flexDirection:'column', gap:14 }}>
            <span className="badge bdg-p" style={{ alignSelf:'flex-start' }}>🏷️ {product.category || 'ไม่ระบุ'}</span>
            <h1 style={{ fontSize:'clamp(20px,4vw,30px)', fontWeight:800, lineHeight:1.3 }}>{product.name}</h1>
            <div style={{ fontSize:'clamp(26px,5vw,36px)', fontWeight:800, color:'var(--err)' }}>฿{Number(product.price).toLocaleString()}</div>

            <div style={{ background:'#F8F9FF', padding:'14px 16px', borderRadius:10 }}>
              <p style={{ margin:0, lineHeight:1.7, color:'var(--t2)', fontSize:14 }}>
                <strong style={{ color:'var(--t1)' }}>รายละเอียด:</strong><br />
                {product.description || 'ไม่มีรายละเอียดสินค้า'}
              </p>
            </div>

            <div className={`badge ${product.stock > 0 ? 'bdg-ok' : 'bdg-err'}`} style={{ alignSelf:'flex-start', fontSize:13, padding:'7px 14px' }}>
              📦 {product.stock > 0 ? `พร้อมส่ง ${product.stock} ชิ้น` : 'สินค้าหมดชั่วคราว'}
            </div>

            {/* ปุ่มใส่ตะกร้า */}
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className="btn btn-lg"
              style={{
                marginTop:'auto', width:'100%',
                background: product.stock > 0 ? 'linear-gradient(135deg,var(--p),var(--pd))' : '#C8CBD9',
                color:'#fff', boxShadow: product.stock > 0 ? '0 6px 20px rgba(108,99,255,.4)' : 'none',
                cursor: product.stock <= 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {product.stock > 0 ? '🛒 หยิบใส่ตะกร้า' : '❌ สินค้าหมด'}
            </button>
          </div>
        </div>
      </div>

      {/* ⭐ ส่วนรีวิว (ไม่เปลี่ยน Logic — เปลี่ยนแค่ style) */}
      <div className="card">
        <div className="card-body">
          <h3 style={{ fontWeight:700, marginBottom:18, paddingBottom:14, borderBottom:'1.5px solid #F0F1F9' }}>
            💬 รีวิวจากลูกค้า
            <span className="badge bdg-p" style={{ marginLeft:10, verticalAlign:'middle' }}>{productReviews.length}</span>
          </h3>

          {productReviews.length === 0 ? (
            <div style={{ textAlign:'center', padding:'30px 20px', color:'var(--t2)' }}>
              <div style={{ fontSize:40, marginBottom:8 }}>🌟</div>
              ยังไม่มีรีวิวสำหรับสินค้านี้
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {productReviews.map((rev) => (
                <div key={rev.id} style={{ background:'#FAFBFF', borderRadius:10, padding:'14px 16px', borderLeft:'3px solid var(--p)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <strong style={{ fontSize:14 }}>👤 {rev.username}</strong>
                    <span style={{ color:'#F59E0B', fontSize:16 }}>{'⭐'.repeat(rev.rating)}</span>
                  </div>
                  <p style={{ margin:'0 0 8px', color:'var(--t1)', lineHeight:1.6, fontSize:14 }}>{rev.comment}</p>
                  <small style={{ color:'var(--t2)', fontSize:12 }}>🗓️ {new Date(rev.created_at).toLocaleDateString('th-TH')}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 🟢 [ไม่เปลี่ยน Logic] หน้าโปรไฟล์ลูกค้า
// เปรียบเหมือน "บัตรสมาชิกห้าง" — แก้ไขข้อมูลส่วนตัว
// ============================================================
function ProfilePage({ userId }) {
  // ▼▼▼ Logic เหมือนเดิมทุกบรรทัด ▼▼▼
  const [profile, setProfile] = useState({ username: '', email: '', address: '', phone: '', profile_picture: '', password: '' });
  const [file, setFile] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      axios.get(`${API_URL}/users/${userId}`)
        .then(res => setProfile({ ...res.data, password: '' })) 
        .catch(err => console.error("ดึงข้อมูลไม่สำเร็จ", err));
    }
  }, [userId]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', profile.username || '');
    formData.append('email', profile.email || '');
    formData.append('address', profile.address || '');
    formData.append('phone', profile.phone || '');
    formData.append('password', profile.password || '');
    if (file) formData.append('profile_picture', file);

    axios.put(`${API_URL}/users/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(() => { alert('✅ บันทึกข้อมูลโปรไฟล์เรียบร้อย!'); window.location.reload(); })
    .catch(() => alert('❌ เกิดข้อผิดพลาดในการบันทึก'));
  };
  // ▲▲▲ Logic เหมือนเดิมทุกบรรทัด ▲▲▲

  return (
    <div style={{ padding:'28px 20px', maxWidth:580, margin:'0 auto' }} className="fiu">
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom:20 }}>⬅ ย้อนกลับ</button>

      <div className="card">
        {/* Header การ์ด — แถบสีพร้อมรูป */}
        <div style={{ background:'linear-gradient(135deg,var(--p),var(--pd))', padding:'30px 24px', textAlign:'center' }}>
          {/* วงกลมรูปโปรไฟล์ */}
          <div style={{ position:'relative', display:'inline-block' }}>
            <div style={{ width:100, height:100, borderRadius:'50%', overflow:'hidden', background:'rgba(255,255,255,.2)', border:'3px solid rgba(255,255,255,.5)', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {file ? (
                <img src={URL.createObjectURL(file)} alt="Preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : profile.profile_picture ? (
                <img src={profile.profile_picture} alt="Profile" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                  onError={e => { e.target.src = 'https://via.placeholder.com/150'; }} />
              ) : (
                <span style={{ fontSize:44, color:'rgba(255,255,255,.8)' }}>👤</span>
              )}
            </div>
            {/* ปุ่มเปลี่ยนรูป */}
            <label style={{ position:'absolute', bottom:0, right:0, width:30, height:30, borderRadius:'50%', background:'var(--s)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:14, border:'2px solid #fff' }}>
              📸
              <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => setFile(e.target.files[0])} />
            </label>
          </div>
          <h3 style={{ color:'#fff', marginTop:12, fontWeight:700 }}>{profile.username || 'ผู้ใช้งาน'}</h3>
          <p style={{ color:'rgba(255,255,255,.75)', fontSize:13 }}>{profile.email || ''}</p>
        </div>

        {/* ฟอร์มแก้ไข */}
        <div className="card-body">
          <form onSubmit={handleSaveProfile} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label className="lbl">👤 ชื่อผู้ใช้งาน</label>
              <input type="text" required value={profile.username || ''} onChange={e => setProfile({...profile, username: e.target.value})} className="inp" />
            </div>
            <div>
              <label className="lbl">📧 อีเมล</label>
              <input type="email" required value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} className="inp" />
            </div>
            <div>
              <label className="lbl" style={{ color:'var(--err)' }}>🔐 รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่เปลี่ยน)</label>
              <input type="password" value={profile.password || ''} onChange={e => setProfile({...profile, password: e.target.value})} className="inp" style={{ borderColor:'rgba(255,71,87,.3)' }} />
            </div>
            <hr style={{ border:'none', borderTop:'1px solid #F0F1F9' }} />
            <div>
              <label className="lbl">🏠 ที่อยู่จัดส่ง</label>
              <textarea rows={3} value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} className="inp" style={{ resize:'vertical' }} />
            </div>
            <div>
              <label className="lbl">📞 เบอร์โทรศัพท์</label>
              <input type="text" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="inp" />
            </div>
            <button type="submit" className="btn btn-ok btn-lg" style={{ width:'100%', marginTop:8 }}>
              💾 บันทึกข้อมูล
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// App Root
// ============================================================
function App() {
  return <Router><AppContent /></Router>;
}

// ============================================================
// 🏪 AppContent — "หัวใจ" ของทั้งแอป
// Logic ทุกบรรทัดเหมือนเดิม — เปลี่ยนแค่ style ใน return
// ============================================================
function AppContent() {
  const navigate = useNavigate();

  // ▼▼▼ STATE ทุกตัวเหมือนเดิม ▼▼▼
  const [orders, setOrders] = useState([]); 
  const [products, setProducts] = useState([]); 
  const [cart, setCart] = useState([]);         
  const [editingProduct, setEditingProduct] = useState(null); 
  const [file, setFile] = useState(null); 
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('token') ? true : false);
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'user');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [myOrders, setMyOrders] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [slipFile, setSlipFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [adminTab, setAdminTab] = useState('report'); 
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [allReviews, setAllReviews] = useState([]);
  const [productReviews, setProductReviews] = useState([]);
  // ▲▲▲ STATE ทุกตัวเหมือนเดิม ▲▲▲

  // ▼▼▼ useEffect และฟังก์ชันทุกตัวเหมือนเดิม 100% ▼▼▼
  useEffect(() => {
    axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
    if (isLoggedIn) fetchMyOrders();
    fetchOrders(); 
    const orderInterval = setInterval(() => { fetchOrders(); }, 5000);
    return () => clearInterval(orderInterval);
  }, [isLoggedIn, userId]);

  const fetchOrders = () => {
    axios.get(`${API_URL}/orders`)
      .then(res => { setOrders(res.data); })
      .catch(err => console.log("ดึงข้อมูลออเดอร์พลาด:", err));
  };

  const fetchMyOrders = () => {
    if (!userId) return;
    axios.get(`${API_URL}/my-orders/${userId}`)
      .then(res => setMyOrders(res.data))
      .catch(err => console.log("ดึงประวัติสั่งซื้อพลาด:", err));
  };

  const fetchProductReviews = async (productId) => {
    try {
      const res = await axios.get(`${API_URL}/reviews/${productId}`);
      setProductReviews(res.data);
    } catch (err) { console.error("Error fetching reviews:", err); }
  };

  const exportToExcel = () => {
    if (orders.length === 0) { alert("ไม่มีข้อมูลออเดอร์สำหรับ Export ครับ"); return; }
    const dataToExport = orders.map(order => ({
      "หมายเลขออเดอร์": `#${order.id}`,
      "จำนวนชิ้นที่สั่ง": order.items_count,
      "ยอดรวม (บาท)": order.total_price,
      "วันที่สั่งซื้อ": new Date(order.created_at).toLocaleString('th-TH'),
      "สถานะการจัดส่ง": order.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ยอดขายทั้งหมด");
    XLSX.writeFile(workbook, "BIG_SHOP_Sales_Report.xlsx");
  };

  const exportToPDF = () => {
    if (orders.length === 0) { alert("ไม่มีข้อมูลออเดอร์สำหรับ Export ครับ"); return; }
    const doc = new jsPDF();
    doc.addFileToVFS("THSarabunNew.ttf", fontBase64);
    doc.addFont("THSarabunNew.ttf", "ThaiFont", "normal");
    doc.setFont("ThaiFont");
    doc.setFontSize(20);
    doc.text("รายงานสรุปยอดขายทั้งหมด - BIG SHOP", 105, 20, { align: "center" });
    const tableColumn = ["หมายเลขออเดอร์", "จำนวนชิ้น", "ยอดรวม (บาท)", "วันที่สั่งซื้อ", "สถานะ"];
    const tableRows = [];
    orders.forEach(order => {
      const orderData = [`#${order.id}`, order.items_count, order.total_price, new Date(order.created_at).toLocaleString('th-TH'), order.status];
      tableRows.push(orderData);
    });
    autoTable(doc, {
      startY: 30, head: [tableColumn], body: tableRows,
      styles: { font: 'ThaiFont', fontSize: 14 },
      headStyles: { fillColor: [44, 62, 80], font: 'ThaiFont', fontStyle: 'normal' }
    });
    doc.save("BIG_SHOP_Sales_Report.pdf");
  };
  
  const deleteOrderHistory = (orderId) => {
    if (window.confirm("คุณต้องการลบประวัติการสั่งซื้อนี้ทิ้งใช่หรือไม่?")) {
      axios.delete(`${API_URL}/orders/${orderId}`)
        .then(() => { alert("🗑️ ลบประวัติการสั่งซื้อเรียบร้อยแล้ว"); fetchMyOrders(); fetchOrders(); })
        .catch(err => alert("❌ ไม่สามารถลบได้"));
    }
  };

  const cancelOrder = (orderId) => {
    if (window.confirm("คุณต้องการยกเลิกออเดอร์นี้ใช่หรือไม่?")) {
      axios.delete(`${API_URL}/orders/${orderId}`)
        .then(() => { alert("ยกเลิกออเดอร์เรียบร้อยแล้ว"); fetchMyOrders(); })
        .catch(err => alert("ไม่สามารถยกเลิกได้"));
    }
  };

  const generatePDF = async (order) => {
    try {
      const res = await axios.get(`${API_URL}/orders/${order.id}/items`);
      const items = res.data;
      const doc = new jsPDF();
      doc.addFileToVFS("THSarabunNew.ttf", fontBase64);
      doc.addFont("THSarabunNew.ttf", "ThaiFont", "normal");
      doc.setFont("ThaiFont", "normal");
      doc.setFontSize(26);
      doc.text("BIG SHOP", 105, 20, { align: "center" });
      doc.setFontSize(16);
      doc.text("ใบเสร็จรับเงิน / Receipt", 105, 28, { align: "center" });
      doc.setLineWidth(0.5);
      doc.line(15, 32, 195, 32);
      doc.setFontSize(14);
      doc.text(`หมายเลขคำสั่งซื้อ: #${order.id}`, 15, 42);
      const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString('th-TH') : new Date().toLocaleDateString('th-TH');
      doc.text(`วันที่สั่งซื้อ: ${orderDate}`, 15, 49);
      doc.text(`สถานะ: ${order.status}`, 15, 56);
      const tableRows = items.map((item, index) => [index + 1, item.name, item.quantity, `฿${Number(item.price).toLocaleString()}`, `฿${(Number(item.price) * item.quantity).toLocaleString()}`]);
      autoTable(doc, {
        startY: 62,
        head: [['ลำดับ', 'รายการสินค้า', 'จำนวน', 'ราคา/ชิ้น', 'รวมสุทธิ']],
        body: tableRows,
        foot: [['', '', '', 'ยอดรวมทั้งสิ้น', `฿${Number(order.total_price).toLocaleString()}`]],
        styles: { font: 'ThaiFont', fontStyle: 'normal', fontSize: 14 },
        headStyles: { fillColor: [44, 62, 80], textColor: 255, halign: 'center' },
        footStyles: { fillColor: [236, 240, 241], textColor: 20 },
        columnStyles: { 0: { halign: 'center', cellWidth: 20 }, 2: { halign: 'center', cellWidth: 25 }, 3: { halign: 'right', cellWidth: 35 }, 4: { halign: 'right', cellWidth: 35 } }
      });
      const finalY = doc.lastAutoTable.finalY || 100;
      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text("ขอบคุณที่ใช้บริการ BIG SHOP", 105, finalY + 15, { align: "center" });
      window.open(doc.output('bloburl'), '_blank');
    } catch (err) { alert("❌ เกิดข้อผิดพลาดในการดึงข้อมูลใบเสร็จ"); }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    let trackingNum = null;
    let transport = null;
    if (newStatus === "จัดส่งแล้ว") {
      transport = prompt("ระบุบริษัทขนส่ง (เช่น Kerry, Flash, ไปรษณีย์ไทย):");
      trackingNum = prompt("ระบุเลขพัสดุ:");
      if (!transport || !trackingNum) { alert("❌ ต้องระบุข้อมูลการส่งให้ครบถ้วน!"); return; }
    }
    axios.put(`${API_URL}/orders/${orderId}`, { status: newStatus, tracking_number: trackingNum, shipping_company: transport })
      .then(() => { alert("✅ อัปเดตสถานะเป็น: " + newStatus); fetchOrders(); axios.get(`${API_URL}/products`).then(res => setProducts(res.data)); })
      .catch(err => alert("อัปเดตพลาด: " + err));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    axios.post(`${API_URL}/login`, { username, password })
      .then(res => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('userId', res.data.id);
        setIsLoggedIn(true); setUserRole(res.data.role); setUserId(res.data.id);
        alert(`ยินดีต้อนรับครับคุณ ${username}!`);
        if (res.data.role === 'admin') navigate('/admin'); else navigate('/');
      })
      .catch(err => alert("ชื่อหรือรหัสผ่านผิดครับ!"));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    if (password !== confirmPassword) return alert("รหัสผ่านไม่ตรงกันครับ!");
    axios.post(`${API_URL}/register`, { username, password })
      .then(res => { alert(res.data.message); navigate('/login'); })
      .catch(err => alert(err.response.data.message || "เกิดข้อผิดพลาด"));
  };

  const flatCart = [];
  cart.forEach(item => { for (let i = 0; i < item.qty; i++) flatCart.push(item); });

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.qty >= product.stock) { alert(`⚠️ สินค้านี้มีสต็อกจำกัดเพียง ${product.stock} ชิ้นครับ`); return prevCart; }
        return prevCart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      } else { return [...prevCart, { ...product, qty: 1 }]; }
    });
    alert(`🛒 เพิ่ม "${product.name}" ลงตะกร้าแล้ว!`);
  };

  const updateQuantity = (id, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty < 1) return item;
        if (newQty > item.stock) { alert(`⚠️ สินค้านี้มีสต็อกจำกัดเพียง ${item.stock} ชิ้นครับ`); return item; }
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => { if (window.confirm("คุณต้องการยกเลิกตะกร้าสินค้าทั้งหมดใช่หรือไม่?")) setCart([]); };
  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const checkout = () => {
    if (cart.length === 0) return alert("ตะกร้าว่างเปล่า!");
    const orderData = { total_price: calculateTotal(), items_count: flatCart.length, user_id: userId, cartItems: flatCart };
    axios.post(`${API_URL}/orders`, orderData)
      .then(res => { setCurrentOrderId(res.data.orderId); setShowPayModal(true); fetchMyOrders(); })
      .catch(() => alert("สั่งซื้อไม่สำเร็จ"));
  };

  const fetchAdminReviews = async () => {
    try {
      const res = await axios.get('https://shop-system-backend.onrender.com/api/admin/reviews');
      setAllReviews(res.data);
    } catch (err) { console.error("ดึงข้อมูลรีวิวไม่สำเร็จ:", err); }
  };

  const deleteReview = async (id) => {
    try {
      await axios.delete(`https://shop-system-backend.onrender.com/api/admin/reviews/${id}`);
      alert("ลบรีวิวเรียบร้อยแล้ว");
      fetchAdminReviews();
    } catch (err) { alert("ลบไม่สำเร็จ"); }
  };

  useEffect(() => {
    if (adminTab === 'reviews') fetchAdminReviews();
  }, [adminTab]);

  const handlePayment = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('address', address);
    formData.append('phone', phone);
    formData.append('slip', slipFile);
    axios.put(`${API_URL}/orders/pay/${currentOrderId}`, formData)
      .then(() => {
        alert("ส่งหลักฐานเรียบร้อย! รอแอดมินตรวจสอบนะครับ");
        setCart([]); localStorage.removeItem('cart'); setShowPayModal(false);
        fetchMyOrders(); navigate('/my-orders');
      })
      .catch(err => alert("เกิดข้อผิดพลาดในการส่งหลักฐาน"));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

  const deleteProduct = (id) => {
    if (window.confirm("คุณแน่ใจนะว่าจะลบ?")) {
      axios.delete(`${API_URL}/products/${id}`)
        .then(() => { alert("ลบเรียบร้อย!"); axios.get(`${API_URL}/products`).then(res => setProducts(res.data)); });
    }
  };

  const selectToEdit = (product) => { setEditingProduct(product); };

  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://shop-system-backend.onrender.com/api/users');
      if (Array.isArray(response.data)) setUsers(response.data);
    } catch (error) { console.error('Fetch users error:', error); }
  };

  const updateUser = async (id, data) => {
    try {
      const response = await axios.put(`https://shop-system-backend.onrender.com/api/special-admin-update/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.status === 200) { await fetchUsers(); alert("✅ อัปเดตสำเร็จ "); }
    } catch (error) { console.error("Update Error:", error); alert("❌ ยิงไม่ติด: " + error.message); }
  };

  const addOrUpdateProduct = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', e.target.name.value);
    formData.append('price', e.target.price.value);
    formData.append('stock', e.target.stock.value);
    formData.append('description', e.target.desc.value);
    formData.append('category', e.target.category.value);
    if (file) formData.append('image', file);

    if (editingProduct) {
      axios.put(`${API_URL}/products/${editingProduct.id}`, formData)
        .then(() => { alert("แก้ไขเรียบร้อย!"); setEditingProduct(null); setFile(null); e.target.reset(); axios.get(`${API_URL}/products`).then(res => setProducts(res.data)); });
    } else {
      axios.post(`${API_URL}/products`, formData)
        .then(() => { alert("เพิ่มสินค้าแล้ว!"); setFile(null); e.target.reset(); axios.get(`${API_URL}/products`).then(res => setProducts(res.data)); });
    }
  };

  const totalSales = orders.filter(o => o.status === 'ชำระเงินแล้ว' || o.status === 'จัดส่งแล้ว').reduce((sum, o) => sum + Number(o.total_price), 0);
  const pendingOrders = orders.filter(o => o.status === 'รอดำเนินการ').length;
  const completedOrders = orders.filter(o => o.status === 'จัดส่งแล้ว').length;
  const totalUsers = [...new Set(orders.map(o => o.user_id))].length;
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const filteredProducts = products.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
    return matchSearch && (selectedCategory === 'ทั้งหมด' ? true : matchCategory);
  });

  const [profile, setProfile] = useState({ username: '', email: '', profile_picture: '' });
  useEffect(() => {
    if (userId) {
      axios.get(`${API_URL}/users/${userId}`)
        .then(res => setProfile(res.data))
        .catch(err => console.error(err));
    }
  }, [userId]);

  const logout = () => {
    localStorage.clear(); setIsLoggedIn(false); setUserRole('user');
    setIsSidebarOpen(false); navigate('/login');
  };
  // ▲▲▲ Logic ทุกบรรทัดเหมือนเดิม ▲▲▲

  // ============================================================
  // 🖥️ INJECT GLOBAL CSS — ฉีดสไตล์ลง <head> ครั้งเดียวตอนโหลด
  // เปรียบเหมือน "ติดป้ายชื่อห้องทุกห้องในห้าง" ก่อนเปิดร้าน
  // ============================================================
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = G;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // ============================================================
  // Helper สีสถานะออเดอร์ — เหมือน "ไฟสัญญาณ" บอกสถานะ
  // ============================================================
  const statusStyle = (s) => {
    const map = {
      'จัดส่งแล้ว':    { bg:'#D1FAE5', color:'#059669' },
      'ชำระเงินแล้ว':  { bg:'#DBEAFE', color:'#2563EB' },
      'กำลังจัดส่ง':   { bg:'#FEF3C7', color:'#D97706' },
      'รอดำเนินการ':   { bg:'#FEF3C7', color:'#D97706' },
      'ยกเลิก':         { bg:'#FEE2E2', color:'#DC2626' },
    };
    return map[s] || { bg:'#F3F4F6', color:'#6B7280' };
  };

  // ============================================================
  // 🖼️ RENDER — ส่วนแสดงผลทั้งหมด
  // ============================================================
  return (
    <div style={{ fontFamily:"'Prompt',sans-serif", background:'var(--bg)', minHeight:'100vh' }}>

      {/* ====================================================
          💳 MODAL ชำระเงิน
          เหมือน "ช่องรับชำระเงิน" ที่โผล่ขึ้นมา
      ==================================================== */}
      {showPayModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000, padding:16 }}>
          <div className="card fiu" style={{ width:'100%', maxWidth:460 }}>
            {/* หัว Modal */}
            <div style={{
              background:'linear-gradient(135deg,#10B981,#059669)',
              padding:'28px 20px', textAlign:'center', color:'#fff',
            }}>
              <div style={{ fontSize:44, marginBottom:8 }}>💰</div>
              <h2 style={{ fontWeight:800, margin:0 }}>แจ้งชำระเงิน</h2>
              <p style={{ opacity:.75, margin:'5px 0 0', fontSize:14 }}>ออเดอร์ #{currentOrderId}</p>
            </div>
            <div className="card-body">
              <div className="bank-box">
                💳 โอนเงินมาที่: <strong>ธนาคารกสิกรไทย 000-0-00000-0</strong>
              </div>
              <form onSubmit={handlePayment} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div><label className="lbl">🏠 ที่อยู่จัดส่ง</label><textarea required rows={3} value={address} onChange={e => setAddress(e.target.value)} className="inp" style={{ resize:'vertical' }} placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด..." /></div>
                <div><label className="lbl">📞 เบอร์โทรศัพท์</label><input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="inp" placeholder="08x-xxx-xxxx" /></div>
                <div><label className="lbl">📸 สลิปโอนเงิน</label><input type="file" accept="image/*" required style={{ fontSize:13 }} onChange={e => setSlipFile(e.target.files[0])} /></div>
                <div style={{ display:'flex', gap:10, marginTop:8 }}>
                  <button type="button" onClick={() => setShowPayModal(false)} className="btn btn-err" style={{ flex:1 }}>❌ ยกเลิก</button>
                  <button type="submit" className="btn btn-ok" style={{ flex:1 }}>✅ ยืนยันชำระ</button>
                </div>
                <button type="button" onClick={() => setShowPayModal(false)} style={{ background:'none', border:'none', color:'var(--t2)', cursor:'pointer', fontSize:13, textDecoration:'underline' }}>
                  ไว้ทำทีหลัง (ดูที่ประวัติสั่งซื้อ)
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          🌟 MODAL รีวิวสินค้า (ไม่เปลี่ยน Logic)
      ==================================================== */}
      {showReviewModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000, padding:16 }}>
          <div className="card fiu" style={{ width:'100%', maxWidth:420 }}>
            <div style={{ background:'linear-gradient(135deg,#6C5CE7,#A78BFA)', padding:'22px 20px', textAlign:'center', color:'#fff' }}>
              <div style={{ fontSize:40, marginBottom:6 }}>⭐</div>
              <h2 style={{ fontWeight:800, margin:0 }}>รีวิวสินค้า</h2>
            </div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label className="lbl">คะแนนความพึงพอใจ</label>
                <select value={rating} onChange={e => setRating(e.target.value)} className="inp">
                  <option value="5">⭐⭐⭐⭐⭐ ดีมาก</option>
                  <option value="4">⭐⭐⭐⭐ ดี</option>
                  <option value="3">⭐⭐⭐ ปานกลาง</option>
                  <option value="2">⭐⭐ พอใช้</option>
                  <option value="1">⭐ ควรปรับปรุง</option>
                </select>
              </div>
              <div>
                <label className="lbl">ความคิดเห็น</label>
                <textarea placeholder="เขียนรีวิวของคุณที่นี่..." className="inp" rows={4} style={{ resize:'vertical' }} value={comment} onChange={e => setComment(e.target.value)} />
              </div>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button onClick={() => setShowReviewModal(false)} className="btn btn-ghost" style={{ flex:1 }}>ยกเลิก</button>
                <button className="btn" style={{ flex:1, background:'linear-gradient(135deg,#6C5CE7,#A78BFA)', color:'#fff' }}
                  onClick={async () => {
                    try {
                      if (!selectedProduct) return alert("ไม่พบรหัสสินค้า");
                      await axios.post(`https://shop-system-backend.onrender.com/api/reviews`, {
                        product_id: selectedProduct, user_id: userId, rating, comment
                      });
                      alert("✅ ขอบคุณสำหรับรีวิวครับ!");
                      setShowReviewModal(false); setComment(""); setRating(5);
                    } catch (err) { console.error(err); alert("❌ รีวิวไม่สำเร็จ กรุณาลองใหม่"); }
                  }}>
                  ส่งรีวิว ⭐
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          🔝 NAVBAR — แถบด้านบนตลอดทุกหน้า
          เหมือน "ป้ายชื่อห้างและปุ่มกริ่งประตู"
      ==================================================== */}
      {/* NAVBAR */}
      <nav style={{
        background: 'linear-gradient(135deg,#16172B 0%,#1E2040 100%)',
        padding: '0 20px', height: 62,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 900,
        boxShadow: '0 1px 0 rgba(255,255,255,.05), 0 4px 24px rgba(0,0,0,.28)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => setIsSidebarOpen(true)} style={{
            background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.08)',
            color:'#fff', width:38, height:38, borderRadius:10,
            cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center',
          }}>☰</button>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:22 }}>🛒</span>
            <span style={{ fontWeight:800, fontSize:17, color:'#fff', letterSpacing:'-.3px' }}>BIG SHOP</span>
          </div>
        </div>
        <div>
          {isLoggedIn
            ? <button onClick={logout} className="btn btn-sm" style={{
                background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.25)',
                color:'#FCA5A5', borderRadius:10, padding:'7px 16px',
              }}>🚪 <span className="hide-m">ออกจากระบบ</span></button>
            : <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => navigate('/login')} className="btn btn-sm" style={{
                  background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)',
                  color:'#fff', borderRadius:10
                }}>เข้าสู่ระบบ</button>
              </div>
          }
        </div>
      </nav>

      {/* ====================================================
          🌫️ SIDEBAR OVERLAY — ม่านด้านหลัง Sidebar
          เหมือน "กระจกฝ้า" บังเนื้อหาตอน Sidebar เปิด
      ==================================================== */}
      {/* SIDEBAR OVERLAY — ม่านกระจกหลัง Sidebar */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={{
          position:'fixed', inset:0, background:'rgba(10,10,25,.55)',
          zIndex:998, backdropFilter:'blur(6px)',
          animation:'fadeIn .2s ease',
        }} />
      )}

      {/* SIDEBAR */}
      <div style={{
        position:'fixed', top:0, left: isSidebarOpen ? 0 : -300,
        width:265, height:'100vh',
        background: userRole === 'admin'
          ? 'linear-gradient(180deg,#16172B 0%,#1A1C38 100%)'
          : '#fff',
        boxShadow: isSidebarOpen ? '6px 0 40px rgba(0,0,0,.18)' : 'none',
        transition:'left .28s cubic-bezier(.4,0,.2,1)',
        zIndex:999, display:'flex', flexDirection:'column', overflowY:'auto',
        borderRight: userRole === 'admin' ? 'none' : '1px solid var(--border)',
      }}>
        {/* หัว Sidebar */}
        <div style={{
          padding:'18px 18px 16px',
          background: userRole === 'admin'
            ? 'linear-gradient(135deg,rgba(124,111,255,.22),rgba(100,90,220,.1))'
            : 'linear-gradient(135deg,var(--p),var(--pd))',
          display:'flex', justifyContent:'space-between', alignItems:'center',
          borderBottom: `1px solid ${userRole==='admin' ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.15)'}`,
        }}>
          <div style={{ color:'#fff', fontWeight:800, fontSize:15, letterSpacing:'-.2px', display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ fontSize:20 }}>{userRole === 'admin' ? '⚙️' : '🛍️'}</span>
            {userRole === 'admin' ? 'Admin Panel' : 'BIG SHOP'}
          </div>
          <button onClick={() => setIsSidebarOpen(false)} style={{
            background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.12)',
            color:'#fff', width:28, height:28, borderRadius:'50%',
            cursor:'pointer', fontSize:13,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>✕</button>
        </div>

        {/* โปรไฟล์ใน Sidebar */}
        <div style={{
          padding:'14px 16px',
          borderBottom:`1px solid ${userRole==='admin' ? 'rgba(255,255,255,.06)' : 'var(--border)'}`,
          display:'flex', alignItems:'center', gap:11,
          background: userRole==='admin' ? 'rgba(255,255,255,.03)' : '#FAFBFF',
        }}>
          <div style={{
            width:42, height:42, borderRadius:'50%', overflow:'hidden',
            background: userRole==='admin' ? 'rgba(124,111,255,.3)' : 'var(--pl)',
            border:`2px solid ${userRole==='admin' ? 'rgba(124,111,255,.45)' : 'var(--pl)'}`,
            flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:21,
          }}>
            {profile.profile_picture
              ? <img src={profile.profile_picture} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
              : '👤'
            }
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:700, color: userRole==='admin' ? '#fff' : 'var(--t1)', fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {profile.username || 'ผู้ใช้งาน'}
            </div>
            <div style={{ fontSize:11, color: userRole==='admin' ? 'rgba(255,255,255,.45)' : 'var(--t2)', marginTop:1 }}>
              {profile.email || (userRole==='admin' ? '🔑 ผู้ดูแลระบบ' : '👤 ลูกค้า')}
            </div>
          </div>
        </div>

        {/* เมนูลูกค้า */}
        <div style={{ padding:'12px 10px', flex:1 }}>
          {isLoggedIn && userRole !== 'admin' && (
            <Link to="/profile" onClick={() => setIsSidebarOpen(false)} className="smenu" style={{ fontSize:14 }}>
              <span style={{ fontSize:17 }}>👤</span> โปรไฟล์ของฉัน
            </Link>
          )}
          <Link to="/" onClick={() => setIsSidebarOpen(false)} className="smenu" style={{ fontSize:14 }}>
            <span style={{ fontSize:17 }}>🏠</span> หน้าแรก
          </Link>
          {userRole !== 'admin' && (
            <>
              <Link to="/cart" onClick={() => setIsSidebarOpen(false)} className="smenu" style={{ fontSize:14 }}>
                <span style={{ fontSize:17 }}>🛒</span> ตะกร้าสินค้า
                {cart.length > 0 && (
                  <span style={{
                    marginLeft:'auto', background:'var(--err)', color:'#fff',
                    borderRadius:50, padding:'1px 8px', fontSize:11, fontWeight:800,
                    minWidth:20, textAlign:'center',
                  }}>{cart.length}</span>
                )}
              </Link>
              {isLoggedIn && <Link to="/my-orders" onClick={() => setIsSidebarOpen(false)} className="smenu" style={{ fontSize:14 }}><span style={{ fontSize:17 }}>🧾</span> ประวัติการสั่งซื้อ</Link>}
            </>
          )}

          {/* เมนู Admin */}
          {isLoggedIn && userRole === 'admin' && (
            <div style={{ marginTop:8 }}>
              <div className="sec-title" style={{ color:'rgba(255,255,255,.28)', padding:'0 10px', marginBottom:6 }}>จัดการระบบ</div>
              {[
                { tab:'report',  icon:'📊', label:'รายงานสถิติ' },
                { tab:'add',     icon:'➕', label:'เพิ่มสินค้าใหม่' },
                { tab:'stock',   icon:'📦', label:'จัดการสต็อก' },
                { tab:'orders',  icon:'🧾', label:'รายการสั่งซื้อ' },
                { tab:'users',   icon:'👥', label:'จัดการผู้ใช้' },
                { tab:'reviews', icon:'📝', label:'จัดการรีวิว' },
              ].map(m => (
                <button key={m.tab} onClick={() => { setAdminTab(m.tab); navigate('/admin'); setIsSidebarOpen(false); }}
                  className={`smenu smenu-dark ${adminTab === m.tab ? 'active' : ''}`} style={{ fontSize:14, gap:10 }}>
                  <span style={{ fontSize:17 }}>{m.icon}</span>
                  {m.label}
                  {adminTab === m.tab && <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'rgba(255,255,255,.8)', flexShrink:0 }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          📄 ROUTES — แต่ละ "หน้า" ของแอป
          เหมือน "ห้องต่างๆ ในห้าง" ที่ URL บอกว่าอยู่ห้องไหน
      ==================================================== */}
      <Routes>

        {/* =================== หน้าแรก =================== */}
        <Route path="/" element={
          <div>
            {/* Hero Banner */}
            <div style={{
              background:'linear-gradient(135deg,#0F0E1A 0%,#2D1B69 40%,#7C6FFF 75%,#FF6B9D 100%)',
              padding:'clamp(50px,10vw,96px) 20px clamp(40px,8vw,76px)',
              textAlign:'center', color:'#fff',
              position:'relative', overflow:'hidden',
            }}>
              {/* วงกลมตกแต่ง — เหมือน "ฟองสบู่" ลอยอยู่เบื้องหลัง */}
              <div style={{ position:'absolute', top:-100, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,.04)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', bottom:-80, left:-60, width:250, height:250, borderRadius:'50%', background:'rgba(255,107,157,.1)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', top:'20%', left:'8%', width:140, height:140, borderRadius:'50%', background:'rgba(124,111,255,.12)', pointerEvents:'none' }} />

              <h1 style={{ fontSize:'clamp(2rem,7vw,4rem)', fontWeight:900, margin:0, letterSpacing:-1.5, position:'relative', textShadow:'0 4px 24px rgba(0,0,0,.3)' }}>
                🛍️ BIG1919 SHOP
              </h1>
              <p style={{ fontSize:'clamp(.9rem,2.5vw,1.15rem)', opacity:.82, marginTop:12, position:'relative', fontWeight:400 }}>
                "ช้อปใหญ่ จ่ายน้อย สอยทุกความคุ้ม!"
              </p>

              {/* Search Bar — เหมือน "เคาน์เตอร์ถามทาง" */}
              <div style={{ marginTop:30, maxWidth:560, margin:'30px auto 0', position:'relative' }}>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:20, top:'50%', transform:'translateY(-50%)', fontSize:18, pointerEvents:'none' }}>🔍</span>
                  <input type="text" placeholder="ค้นหาสินค้าที่ใช่สำหรับคุณ..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    style={{
                      width:'100%', padding:'15px 24px 15px 52px',
                      borderRadius:50, border:'none', fontSize:15,
                      boxShadow:'0 10px 32px rgba(0,0,0,.25)',
                      outline:'none', fontFamily:'inherit', fontWeight:400,
                      background:'rgba(255,255,255,.96)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* แถบหมวดหมู่ */}
            <div style={{ display:'flex', justifyContent:'center', gap:8, padding:'20px 16px 16px', flexWrap:'wrap' }}>
              {['ทั้งหมด', ...new Set(products.map(p => p.category).filter(cat => cat && cat !== 'ทั้งหมด'))].map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding:'8px 20px', borderRadius:50, border:'none', cursor:'pointer',
                    fontFamily:'inherit', fontSize:13, fontWeight:600, transition:'all .18s',
                    background: selectedCategory === cat
                      ? 'linear-gradient(135deg,var(--p),var(--pd))'
                      : 'var(--card)',
                    color: selectedCategory === cat ? '#fff' : 'var(--t1)',
                    boxShadow: selectedCategory === cat
                      ? '0 4px 14px rgba(124,111,255,.35)'
                      : 'var(--sh)',
                    transform: selectedCategory === cat ? 'scale(1.03)' : 'scale(1)',
                  }}>{cat}</button>
              ))}
            </div>

            {/* กริดสินค้า
                📱 มือถือ → เลื่อนซ้าย-ขวา (horizontal scroll) เหมือน "ชั้นวางที่เลื่อนได้"
                💻 คอมพ์  → Grid หลายคอลัมน์ */}
            <div className="pgrid-wrap" style={{ padding:'0 20px 40px' }}>
              <div className="pgrid-d pgrid-m" style={{ marginTop:0 }}>
                {filteredProducts.map((item, i) => (
                  <div key={item.id} className="pcard fiu" style={{ animationDelay:`${i*.04}s` }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width:'100%', height:190, objectFit:'cover' }} />
                      : <div style={{ height:190, background:'var(--pl)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:64, opacity:.5 }}>📦</div>
                    }
                    <div style={{ padding:'14px 16px 18px' }}>
                      {item.category && (
                        <span className="chip" style={{ marginBottom:8, display:'inline-flex' }}>{item.category}</span>
                      )}
                      <h3 style={{ fontSize:14, fontWeight:700, margin:'7px 0 4px', lineHeight:1.4, color:'var(--t1)' }}>{item.name}</h3>
                      <p style={{ fontSize:20, fontWeight:800, color:'var(--err)', margin:'4px 0 8px', letterSpacing:'-.3px' }}>
                        ฿{Number(item.price).toLocaleString()}
                      </p>
                      <div className={`badge ${item.stock > 0 ? 'bdg-ok' : 'bdg-err'}`} style={{ marginBottom:12, fontSize:11 }}>
                        {item.stock > 0 ? `📦 เหลือ ${item.stock} ชิ้น` : '❌ หมด'}
                      </div>
                      <div style={{ display:'flex', gap:7 }}>
                        <button onClick={() => navigate(`/product/${item.id}`)} className="btn btn-ghost btn-sm" style={{ flex:1, fontSize:12 }}>🔍 ดู</button>
                        <button onClick={() => addToCart(item)} disabled={item.stock <= 0}
                          className="btn btn-p btn-sm" style={{ flex:1, fontSize:12, opacity: item.stock <= 0 ? .45 : 1, cursor: item.stock <= 0 ? 'not-allowed' : 'pointer' }}>
                          {item.stock > 0 ? '🛒 หยิบ' : 'หมด'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--t2)' }}>
                  <div style={{ fontSize:60, marginBottom:12 }}>🔍</div>
                  <h3>ไม่พบสินค้าที่ค้นหา</h3>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer style={{
              padding:'44px 20px', marginTop:20,
              background:'linear-gradient(135deg,#0F0E1A,#16172B)',
              color:'#fff', textAlign:'center',
            }}>
              <p style={{ fontSize:'1.1rem', fontWeight:800, letterSpacing:'-.2px' }}>🛍️ BIG SHOP</p>
              <p style={{ opacity:.5, marginTop:8, fontSize:13, fontWeight:300 }}>ร้านค้าอันดับ 1 ของทุกคน</p>
              <p style={{ opacity:.4, marginTop:6, fontSize:13 }}>ติดต่อเรา: 093-112-1917 | Line: @phuwadet5617</p>
              <div style={{ width:40, height:1, background:'rgba(255,255,255,.1)', margin:'20px auto' }} />
              <p style={{ fontSize:11, opacity:.25, fontWeight:300 }}>© 2026 BIG SHOP. All rights reserved.</p>
            </footer>
          </div>
        } />

        {/* =================== โปรไฟล์ =================== */}
        <Route path="/profile" element={isLoggedIn ? <ProfilePage userId={userId} /> : <Navigate to="/login" />} />

        {/* =================== รายละเอียดสินค้า =================== */}
        <Route path="/product/:id" element={
          <ProductDetailPage products={products} addToCart={addToCart} productReviews={productReviews} fetchProductReviews={fetchProductReviews} />
        } />

        {/* =================== ตะกร้าสินค้า =================== */}
        <Route path="/cart" element={
          <div style={{ padding:'28px 20px', maxWidth:820, margin:'0 auto' }} className="fiu">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontWeight:800, margin:0 }}>🛒 ตะกร้าสินค้า</h2>
              {cart.length > 0 && <button onClick={clearCart} className="btn btn-err btn-sm">🗑️ ล้างทั้งหมด</button>}
            </div>

            <div className="card">
              <div className="card-body">
                {cart.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'50px 20px', color:'var(--t2)' }}>
                    <div style={{ fontSize:64, marginBottom:12 }}>🛒</div>
                    <h3>ตะกร้าว่างเปล่า</h3>
                    <button className="btn btn-p" style={{ marginTop:16 }} onClick={() => navigate('/')}>เลือกสินค้า</button>
                  </div>
                ) : (
                  <>
                    {cart.map(item => (
                      <div key={item.id} style={{ display:'flex', alignItems:'center', gap:14, borderBottom:'1px solid #F0F1F9', padding:'14px 0', flexWrap:'wrap' }}>
                        <img src={item.image} alt={item.name} style={{ width:68, height:68, objectFit:'cover', borderRadius:10, background:'#F8F9FF', flexShrink:0 }} />
                        <div style={{ flex:1, minWidth:120 }}>
                          <h4 style={{ margin:0, fontWeight:700 }}>{item.name}</h4>
                          <p style={{ margin:0, color:'var(--err)', fontWeight:700 }}>฿{Number(item.price).toLocaleString()}</p>
                        </div>

                        {/* ปุ่ม +/- จำนวน — สีชัดเจน: แดง=ลด, เขียว=เพิ่ม */}
                        <div style={{ display:'flex', alignItems:'center', borderRadius:50, overflow:'hidden', border:'1.5px solid #E2E6F3' }}>
                          <button onClick={() => updateQuantity(item.id, -1)} style={{ width:36, height:36, background:'var(--err)', color:'#fff', border:'none', cursor:'pointer', fontWeight:800, fontSize:16 }}>−</button>
                          <span style={{ padding:'0 14px', fontWeight:700, fontSize:15 }}>{item.qty}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} style={{ width:36, height:36, background:'var(--ok)', color:'#fff', border:'none', cursor:'pointer', fontWeight:800, fontSize:16 }}>+</button>
                        </div>

                        <div style={{ width:76, textAlign:'right', fontWeight:700 }}>฿{(item.price * item.qty).toLocaleString()}</div>
                        <button onClick={() => removeFromCart(item.id)} style={{ background:'none', border:'none', color:'var(--err)', fontSize:18, cursor:'pointer', padding:4 }}>✖</button>
                      </div>
                    ))}

                    <div style={{ marginTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
                      <h2 style={{ margin:0 }}>รวม: <span style={{ color:'var(--err)' }}>฿{calculateTotal().toLocaleString()}</span></h2>
                      <button className="btn btn-ok btn-lg"
                        onClick={() => {
                          if (isLoggedIn) {
                            axios.get(`${API_URL}/users/${userId}`).then(res => { setAddress(res.data.address || ''); setPhone(res.data.phone || ''); checkout(); });
                          } else { navigate('/login'); }
                        }}>
                        {isLoggedIn ? '✅ ยืนยันการสั่งซื้อ' : '🔑 ล็อกอินเพื่อสั่งซื้อ'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        } />

        {/* =================== ประวัติสั่งซื้อ =================== */}
        <Route path="/my-orders" element={
          <div style={{ padding:'28px 20px', maxWidth:960, margin:'0 auto' }} className="fiu">
            <h1 style={{ fontWeight:800, marginBottom:22, textAlign:'center' }}>📋 ประวัติการสั่งซื้อ</h1>
            <div className="card">
              <div style={{ overflowX:'auto' }}>
                {myOrders.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'50px 20px', color:'var(--t2)' }}>
                    <div style={{ fontSize:60, marginBottom:12 }}>📋</div>
                    <h3>ยังไม่มีรายการสั่งซื้อ</h3>
                  </div>
                ) : (
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>เลขที่ออเดอร์</th>
                        <th>วันที่สั่ง</th>
                        <th>ราคารวม</th>
                        <th>สถานะ</th>
                        <th>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.map(order => {
                        const ss = statusStyle(order.status);
                        return (
                          <tr key={order.id}>
                            <td style={{ fontWeight:700 }}>#{order.id}</td>
                            <td style={{ color:'var(--t2)', fontSize:13 }}>{new Date(order.created_at).toLocaleDateString('th-TH')}</td>
                            <td style={{ fontWeight:700, color:'var(--err)' }}>฿{Number(order.total_price).toLocaleString()}</td>
                            <td>
                              <span style={{ padding:'5px 12px', borderRadius:50, fontSize:11, fontWeight:700, background:ss.bg, color:ss.color }}>{order.status}</span>
                            </td>
                            <td>
                              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                                {order.status === 'รอดำเนินการ' && (
                                  <button onClick={() => cancelOrder(order.id)} className="btn btn-err btn-sm">ยกเลิก</button>
                                )}
                                <button onClick={() => { setCurrentOrderId(order.id); setShowPayModal(true); }} className="btn btn-sm" style={{ background:'var(--p)', color:'#fff' }}>💳 จ่าย</button>
                                <button onClick={() => generatePDF(order)} className="btn btn-sm btn-ok">📄 บิล</button>
                                {order.tracking_number && (
                                  <button onClick={() => {
                                    let url = "";
                                    const track = order.tracking_number;
                                    const company = order.shipping_company.toLowerCase();
                                    if (company.includes("kerry")) url = `https://th.kerryexpress.com/th/track/?track=${track}`;
                                    else if (company.includes("flash")) url = `https://www.flashexpress.co.th/tracking/?se=${track}`;
                                    else if (company.includes("thai") || company.includes("ไปรษณีย์")) url = `https://track.thailandpost.co.th/?trackNumber=${track}`;
                                    else url = `https://www.google.com/search?q=เช็คพัสดุ+${track}`;
                                    window.open(url, '_blank');
                                  }} className="btn btn-sm btn-warn">🚚 พัสดุ</button>
                                )}
                                {order.status === 'จัดส่งแล้ว' && (
                                  <button onClick={() => { setSelectedProduct(order.product_id); setShowReviewModal(true); }} className="btn btn-sm" style={{ background:'#6C5CE7', color:'#fff' }}>⭐ รีวิว</button>
                                )}
                                <button onClick={() => deleteOrderHistory(order.id)} className="btn btn-err btn-sm">🗑️</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        } />

        {/* =================== Login =================== */}
        <Route path="/login" element={
          isLoggedIn
            ? (userRole === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />)
            : (
              <div style={{ minHeight:'calc(100vh - 60px)', display:'flex', justifyContent:'center', alignItems:'center', padding:20, background:'linear-gradient(135deg,#1A1A2E 0%,#6C63FF 100%)' }}>
                <div className="card fiu" style={{ width:'100%', maxWidth:400 }}>
                  {/* หัว Login */}
                  <div style={{ background:'linear-gradient(135deg,var(--p),var(--pd))', padding:'30px 24px', textAlign:'center', color:'#fff' }}>
                    <div style={{ fontSize:48, marginBottom:8 }}>🔐</div>
                    <h2 style={{ fontWeight:800, margin:0 }}>เข้าสู่ระบบ</h2>
                    <p style={{ opacity:.8, margin:'4px 0 0', fontSize:14 }}>ยินดีต้อนรับกลับมา!</p>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      <div><label className="lbl">ชื่อผู้ใช้งาน</label><input name="username" type="text" placeholder="Username" required className="inp" /></div>
                      <div><label className="lbl">รหัสผ่าน</label><input name="password" type="password" placeholder="Password" required className="inp" /></div>
                      <button type="submit" className="btn btn-p btn-lg" style={{ width:'100%', marginTop:6 }}>เข้าสู่ระบบ</button>
                    </form>
                    <p style={{ textAlign:'center', marginTop:18, color:'var(--t2)', fontSize:14 }}>ยังไม่มีบัญชี? <Link to="/register" style={{ color:'var(--p)', fontWeight:700 }}>สมัครสมาชิกฟรี</Link></p>
                  </div>
                </div>
              </div>
            )
        } />

        {/* =================== Register =================== */}
        <Route path="/register" element={
          <div style={{ minHeight:'calc(100vh - 60px)', display:'flex', justifyContent:'center', alignItems:'center', padding:20, background:'linear-gradient(135deg,#1A1A2E 0%,#00C897 100%)' }}>
            <div className="card fiu" style={{ width:'100%', maxWidth:400 }}>
              <div style={{ background:'linear-gradient(135deg,var(--ok),#00A87A)', padding:'30px 24px', textAlign:'center', color:'#fff' }}>
                <div style={{ fontSize:48, marginBottom:8 }}>📝</div>
                <h2 style={{ fontWeight:800, margin:0 }}>สมัครสมาชิกใหม่</h2>
                <p style={{ opacity:.8, margin:'4px 0 0', fontSize:14 }}>สร้างบัญชีฟรี!</p>
              </div>
              <div className="card-body">
                <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div><label className="lbl">ชื่อผู้ใช้งาน</label><input name="username" placeholder="Username" required className="inp" /></div>
                  <div><label className="lbl">รหัสผ่าน</label><input name="password" type="password" placeholder="Password" required className="inp" /></div>
                  <div><label className="lbl">ยืนยันรหัสผ่าน</label><input name="confirmPassword" type="password" placeholder="Confirm Password" required className="inp" /></div>
                  <button type="submit" className="btn btn-ok btn-lg" style={{ width:'100%', marginTop:6 }}>สมัครสมาชิก</button>
                </form>
                <p style={{ textAlign:'center', marginTop:18, color:'var(--t2)', fontSize:14 }}>มีบัญชีอยู่แล้ว? <Link to="/login" style={{ color:'var(--p)', fontWeight:700 }}>เข้าสู่ระบบที่นี่</Link></p>
              </div>
            </div>
          </div>
        } />

        {/* =================== Admin Panel =================== */}
        <Route path="/admin" element={
          isLoggedIn && userRole === 'admin' ? (
            <div style={{ padding:'24px 20px', maxWidth:1400, margin:'0 auto' }}>

              {/* หัวหน้า Admin — กล่องบอกชื่อ Tab ที่เปิดอยู่ */}
              <div className="admin-header-bar">
                <h1 style={{ fontWeight:900, fontSize:'clamp(18px,4vw,26px)', margin:0, display:'flex', alignItems:'center', gap:8 }}>
                  {adminTab==='report'  && <><span>📊</span><span>รายงานสถิติ</span></>}
                  {adminTab==='add'     && <><span>➕</span><span>เพิ่ม / แก้ไขสินค้า</span></>}
                  {adminTab==='stock'   && <><span>📦</span><span>จัดการสต็อก</span></>}
                  {adminTab==='orders'  && <><span>🧾</span><span>รายการสั่งซื้อ</span></>}
                  {adminTab==='users'   && <><span>👥</span><span>จัดการผู้ใช้</span></>}
                  {adminTab==='reviews' && <><span>📝</span><span>จัดการรีวิว</span></>}
                </h1>
                <div style={{ fontSize:12, color:'var(--t2)', fontWeight:500 }}>
                  BIG SHOP Admin Panel
                </div>
              </div>

              {/* ===== TAB: รายงาน ===== */}
              {adminTab === 'report' && (
                <div className="fi">
                  {/* กราฟ */}
                  <div className="card" style={{ marginBottom:22 }}>
                    <div className="card-body">
                      <h3 style={{ fontWeight:700, marginBottom:18 }}>📈 ยอดขายรายวัน</h3>
                      <div style={{ width:'100%', height:280 }}>
                        <ResponsiveContainer>
                          <BarChart data={Object.values(orders.reduce((acc, order) => {
                            if (order.status !== 'ยกเลิก' && order.status !== 'รอดำเนินการ') {
                              const date = new Date(order.created_at).toLocaleDateString('th-TH');
                              if (!acc[date]) acc[date] = { name: date, ยอดขาย: 0 };
                              acc[date].ยอดขาย += Number(order.total_price);
                            }
                            return acc;
                          }, {}))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F9" />
                            <XAxis dataKey="name" tick={{ fontSize:11 }} />
                            <YAxis tick={{ fontSize:11 }} />
                            <Tooltip contentStyle={{ borderRadius:10, border:'none', boxShadow:'var(--sh)' }} />
                            <Legend />
                            <Bar dataKey="ยอดขาย" fill="#6C63FF" radius={[6,6,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Stat Cards */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16 }}>
                    {[
                      { color:'#00C897', icon:'💰', label:'ยอดขายรวม',  val:`฿${totalSales.toLocaleString()}` },
                      { color:'#F59E0B', icon:'⏳', label:'รอตรวจสอบ', val:pendingOrders },
                      { color:'#6C63FF', icon:'✅', label:'ส่งแล้ว',    val:completedOrders },
                      { color:'#FF6584', icon:'👤', label:'ลูกค้า',     val:totalUsers },
                    ].map((s,i) => (
                      <div key={i} className="scard" style={{ borderLeftColor:s.color }}>
                        <div className="si">{s.icon}</div>
                        <div className="sv" style={{ color:s.color }}>{s.val}</div>
                        <div className="sl">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== TAB: เพิ่มสินค้า ===== */}
              {adminTab === 'add' && (
                <div className="card fi">
                  <div className="card-body">
                    <h3 style={{ fontWeight:700, marginBottom:18 }}>{editingProduct ? `✏️ แก้ไขสินค้า: ${editingProduct.name}` : '➕ เพิ่มสินค้าใหม่'}</h3>
                    <form onSubmit={addOrUpdateProduct}>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:14 }}>
                        <div><label className="lbl">ชื่อสินค้า</label><input name="name" placeholder="ชื่อสินค้า" defaultValue={editingProduct?.name || ''} required className="inp" /></div>
                        <div><label className="lbl">หมวดหมู่</label><input name="category" placeholder="หมวดหมู่" defaultValue={editingProduct?.category || ''} required className="inp" /></div>
                        <div><label className="lbl">สต็อก</label><input name="stock" type="number" placeholder="0" defaultValue={editingProduct?.stock || 0} required className="inp" /></div>
                        <div><label className="lbl">ราคา</label><input name="price" type="number" placeholder="0.00" defaultValue={editingProduct?.price || ''} required className="inp" /></div>
                      </div>
                      <div style={{ marginBottom:14 }}><label className="lbl">รายละเอียด</label><input name="desc" placeholder="รายละเอียดสินค้า..." defaultValue={editingProduct?.description || ''} className="inp" /></div>
                      <div style={{ marginBottom:18 }}><label className="lbl">รูปภาพ</label><input name="image" type="file" onChange={e => setFile(e.target.files[0])} accept="image/*" style={{ fontSize:13 }} /></div>
                      <button type="submit" className="btn btn-ok btn-lg">💾 {editingProduct ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</button>
                      {editingProduct && <button type="button" onClick={() => setEditingProduct(null)} className="btn btn-ghost btn-lg" style={{ marginLeft:10 }}>ยกเลิก</button>}
                    </form>
                  </div>
                </div>
              )}

              {/* ===== TAB: สต็อก ===== */}
              {adminTab === 'stock' && (
                <div className="card fi">
                  <div style={{ overflowX:'auto' }}>
                    <table className="tbl">
                      <thead><tr><th>สินค้า</th><th>ราคา</th><th>สต็อก</th><th>จัดการ</th></tr></thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id}>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                {p.image && <img src={p.image} alt={p.name} style={{ width:42, height:42, objectFit:'cover', borderRadius:8, flexShrink:0 }} />}
                                <span style={{ fontWeight:600 }}>{p.name}</span>
                              </div>
                            </td>
                            <td style={{ fontWeight:700, color:'var(--err)' }}>฿{Number(p.price).toLocaleString()}</td>
                            <td>
                              <span className={`badge ${p.stock > 10 ? 'bdg-ok' : p.stock > 0 ? 'bdg-warn' : 'bdg-err'}`}>{p.stock} ชิ้น</span>
                            </td>
                            <td>
                              <div style={{ display:'flex', gap:6 }}>
                                <button onClick={() => { selectToEdit(p); setAdminTab('add'); }} className="btn btn-warn btn-sm">✏️ แก้ไข</button>
                                <button onClick={() => deleteProduct(p.id)} className="btn btn-err btn-sm">🗑️ ลบ</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== TAB: ออเดอร์ ===== */}
              {adminTab === 'orders' && (
                <div className="fi">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
                    <h3 style={{ fontWeight:700, margin:0 }}>🧾 รายการสั่งซื้อ ({orders.length} รายการ)</h3>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={exportToExcel} className="btn btn-ok btn-sm">📊 Excel</button>
                      <button onClick={exportToPDF} className="btn btn-err btn-sm">📄 PDF</button>
                    </div>
                  </div>
                  <div className="card" style={{ overflowX:'auto' }}>
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>ออเดอร์</th>
                          <th>ที่อยู่จัดส่ง</th>
                          <th>ราคารวม</th>
                          <th>หลักฐาน</th>
                          <th>สถานะ</th>
                          <th>พิมพ์</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => {
                          const ss = statusStyle(order.status);
                          return (
                            <tr key={order.id}>
                              <td style={{ fontWeight:700 }}>#{order.id}</td>
                              <td style={{ fontSize:13, maxWidth:200 }}>
                                <div style={{ fontWeight:600 }}>📍 {order.address || '—'}</div>
                                <div style={{ color:'var(--t2)', fontSize:12 }}>📞 {order.phone || '—'}</div>
                              </td>
                              <td style={{ fontWeight:700, color:'var(--err)' }}>฿{Number(order.total_price).toLocaleString()}</td>
                              <td>{order.slip_image ? <button onClick={() => window.open(order.slip_image,'_blank')} className="btn btn-sm" style={{ background:'#9b59b6', color:'#fff' }}>🖼️ ดูสลิป</button> : <span style={{ color:'var(--t2)', fontSize:12 }}>ยังไม่ส่ง</span>}</td>
                              <td>
                                <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)}
                                  style={{ padding:'6px 10px', borderRadius:50, border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:12, background:ss.bg, color:ss.color }}>
                                  <option value="รอดำเนินการ">รอดำเนินการ</option>
                                  <option value="ชำระเงินแล้ว">ชำระเงินแล้ว</option>
                                  <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                                  <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                                  <option value="ยกเลิก">ยกเลิก</option>
                                </select>
                              </td>
                              <td><button onClick={() => generatePDF(order)} className="btn btn-sm btn-dark">🖨️ บิล</button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== TAB: ผู้ใช้ ===== */}
              {adminTab === 'users' && (
                <div className="fi">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <h3 style={{ fontWeight:700, margin:0 }}>👥 จัดการผู้ใช้ <span style={{ fontSize:14, fontWeight:400, color:'var(--t2)' }}>({users.length} บัญชี)</span></h3>
                    <button onClick={fetchUsers} className="btn btn-ghost btn-sm">🔄 รีเฟรช</button>
                  </div>
                  <div className="card" style={{ overflowX:'auto' }}>
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>ข้อมูลผู้ใช้งาน</th>
                          <th>ระดับสิทธิ์</th>
                          <th>สถานะ</th>
                          <th>การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users && users.length > 0 ? (
                          users.map((user, index) => (
                            <tr key={user.id || index} style={{ background: index%2===0 ? '#fff' : '#FAFBFF' }}>
                              <td style={{ color:'var(--t2)', fontWeight:600, textAlign:'center' }}>{user.id}</td>
                              <td>
                                <div style={{ fontWeight:700, color:'var(--t1)', fontSize:14 }}>{user.username || 'กำลังโหลด...'}</div>
                                <div style={{ fontSize:12, color:'var(--t2)' }}>{user.email || '—'}</div>
                              </td>
                              <td>
                                <select value={user.role || 'customer'} onChange={e => updateUser(user.id, { role: e.target.value, status: user.status })}
                                  style={{ padding:'7px 12px', borderRadius:8, border:`2px solid ${user.role==='admin' ? '#6C63FF' : '#E2E6F3'}`, background: user.role==='admin' ? '#EEF0FF' : '#fff', color: user.role==='admin' ? '#6C63FF' : 'var(--t1)', fontFamily:'inherit', fontWeight:700, cursor:'pointer', fontSize:13 }}>
                                  <option value="customer">👤 Customer</option>
                                  <option value="admin">🔑 Admin</option>
                                </select>
                              </td>
                              <td>
                                <span style={{ padding:'5px 12px', borderRadius:50, fontSize:11, fontWeight:700,
                                  background: user.status==='suspended' ? '#FEE2E2' : '#D1FAE5',
                                  color:      user.status==='suspended' ? '#DC2626'  : '#059669',
                                  border:`1px solid ${user.status==='suspended' ? '#FECACA' : '#A7F3D0'}`
                                }}>
                                  {user.status === 'suspended' ? '🚫 ระงับ' : '✅ ปกติ'}
                                </span>
                              </td>
                              <td>
                                <button onClick={() => {
                                  const newStatus = user.status === 'active' ? 'suspended' : 'active';
                                  if (window.confirm(`${newStatus==='suspended' ? 'ระงับ' : 'ปลดระงับ'} บัญชี ${user.username || ''}?`)) {
                                    updateUser(user.id, { role: user.role, status: newStatus });
                                  }
                                }} className="btn btn-sm" style={{ background: user.status==='active' ? 'var(--err)' : 'var(--ok)', color:'#fff', border:'none' }}>
                                  {user.status === 'active' ? '🚫 ระงับ' : '✅ ปลดระงับ'}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={5} style={{ textAlign:'center', padding:30, color:'var(--t2)' }}>ไม่พบข้อมูลผู้ใช้งาน</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== TAB: รีวิว ===== */}
              {adminTab === 'reviews' && (
                <div className="card fi">
                  <div className="card-body">
                    <h2 style={{ fontWeight:800, marginBottom:20 }}>📝 จัดการรีวิวจากลูกค้า</h2>
                    <div style={{ overflowX:'auto' }}>
                      <table className="tbl">
                        <thead>
                          <tr><th>สินค้า</th><th>ลูกค้า</th><th>คะแนน</th><th>ความคิดเห็น</th><th>วันที่</th><th>จัดการ</th></tr>
                        </thead>
                        <tbody>
                          {allReviews.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign:'center', padding:30, color:'var(--t2)' }}>ยังไม่มีรีวิวในขณะนี้</td></tr>
                          ) : (
                            allReviews.map(review => (
                              <tr key={review.id}>
                                <td style={{ fontWeight:600 }}>{review.product_name}</td>
                                <td>{review.username}</td>
                                <td style={{ color:'#F59E0B', fontSize:16 }}>{'⭐'.repeat(review.rating)}</td>
                                <td style={{ maxWidth:240, fontSize:13 }}>{review.comment}</td>
                                <td style={{ fontSize:12, color:'var(--t2)' }}>{new Date(review.created_at).toLocaleDateString('th-TH')}</td>
                                <td>
                                  <button onClick={() => { if(window.confirm('ลบรีวิวนี้?')) deleteReview(review.id); }} className="btn btn-err btn-sm">🗑️ ลบ</button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : <Navigate to="/login" replace />
        } />

      </Routes>
    </div>
  );
}

export default App;