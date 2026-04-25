// ============================================================
// 📦 App.jsx — ระบบร้านค้าออนไลน์ BIG SHOP
// เปรียบเหมือน "ห้างสรรพสินค้า" ที่มีทั้งฝั่งลูกค้าและฝั่งผู้จัดการ
// ============================================================

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import {
  BrowserRouter as Router,
  Routes, Route, Link,
  useNavigate, Navigate, useParams
} from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fontBase64 } from './ThaiFont';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import API_URL from './config';

// ============================================================
// 🎨 CSS Variables & Global Styles (ฉีดลง <head> ครั้งเดียว)
// เหมือนการกำหนด "ธีมสี" ของห้างทั้งหมดก่อนเปิด
// ============================================================
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&family=Sarabun:wght@300;400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    /* สีหลัก — เหมือนป้ายสีของห้าง */
    --primary:        #6C63FF;
    --primary-dark:   #5A52D5;
    --primary-light:  #EEF0FF;
    --secondary:      #FF6584;
    --success:        #00C897;
    --warning:        #FFB020;
    --danger:         #FF4757;
    --info:           #0AB4E8;

    /* โทนสีพื้นหลัง */
    --bg:             #F4F5FB;
    --surface:        #FFFFFF;
    --surface2:       #F8F9FF;

    /* ตัวอักษร */
    --text:           #1A1A2E;
    --text-muted:     #6E7A99;
    --text-light:     #A5ADCC;

    /* เงา — ระดับความ "นูน" ของกล่อง */
    --shadow-sm:   0 2px 8px rgba(108,99,255,.08);
    --shadow-md:   0 8px 24px rgba(108,99,255,.12);
    --shadow-lg:   0 16px 48px rgba(108,99,255,.18);

    /* ขอบมน */
    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-xl: 28px;

    /* ความกว้าง Sidebar */
    --sidebar-w: 260px;

    font-family: 'Prompt', 'Sarabun', sans-serif;
  }

  body { background: var(--bg); color: var(--text); }

  /* ปุ่มทั่วไป — เหมือนปุ่มกดทุกปุ่มในห้าง */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px; border: none; border-radius: var(--radius-sm);
    font-family: inherit; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all .2s ease;
    text-decoration: none;
  }
  .btn:hover { transform: translateY(-1px); }
  .btn:active { transform: translateY(0); }

  .btn-primary   { background: var(--primary);  color: #fff; box-shadow: 0 4px 12px rgba(108,99,255,.3); }
  .btn-primary:hover { background: var(--primary-dark); }
  .btn-success   { background: var(--success);  color: #fff; box-shadow: 0 4px 12px rgba(0,200,151,.25); }
  .btn-danger    { background: var(--danger);   color: #fff; box-shadow: 0 4px 12px rgba(255,71,87,.25); }
  .btn-warning   { background: var(--warning);  color: #fff; }
  .btn-ghost     { background: transparent; color: var(--primary); border: 1.5px solid var(--primary); }
  .btn-ghost:hover { background: var(--primary-light); }
  .btn-sm        { padding: 6px 14px; font-size: 12px; }
  .btn-lg        { padding: 14px 28px; font-size: 16px; }
  .btn-full      { width: 100%; justify-content: center; }

  /* การ์ด */
  .card {
    background: var(--surface); border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .card-body { padding: 24px; }

  /* Badge สถานะ */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
  }
  .badge-success { background: #DCFFF4; color: #00A87A; }
  .badge-warning { background: #FFF3DC; color: #CC8800; }
  .badge-danger  { background: #FFECEE; color: #CC2233; }
  .badge-info    { background: #DCF4FF; color: #006EAA; }
  .badge-purple  { background: #F0EEFF; color: #5A52D5; }

  /* Input ทั่วไป */
  .form-input {
    width: 100%; padding: 12px 16px;
    border: 1.5px solid #E4E7F0; border-radius: var(--radius-sm);
    font-family: inherit; font-size: 14px; color: var(--text);
    background: var(--surface); transition: border .2s;
    outline: none;
  }
  .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(108,99,255,.12); }
  .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }

  /* Table */
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table thead th {
    background: #F0EEFF; color: var(--primary-dark);
    padding: 12px 16px; font-size: 12px; font-weight: 700;
    text-align: left; text-transform: uppercase; letter-spacing: .5px;
  }
  .data-table tbody tr { border-bottom: 1px solid #F0F1F9; transition: background .15s; }
  .data-table tbody tr:hover { background: var(--surface2); }
  .data-table tbody td { padding: 14px 16px; font-size: 14px; vertical-align: middle; }

  /* Stat Card (Dashboard) */
  .stat-card {
    background: var(--surface); border-radius: var(--radius-md);
    padding: 24px; box-shadow: var(--shadow-sm);
    display: flex; flex-direction: column; gap: 8px;
    border-left: 4px solid transparent;
    transition: transform .2s, box-shadow .2s;
  }
  .stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .stat-card .stat-value { font-size: 32px; font-weight: 800; }
  .stat-card .stat-label { font-size: 13px; color: var(--text-muted); font-weight: 500; }
  .stat-card .stat-icon { font-size: 28px; }

  /* Animation */
  @keyframes fadeInUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideInLeft {
    from { opacity:0; transform:translateX(-20px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
  @keyframes bounceIn {
    0%   { transform:scale(.5); opacity:0; }
    70%  { transform:scale(1.1); }
    100% { transform:scale(1);  opacity:1; }
  }

  .fade-in-up { animation: fadeInUp .4s ease both; }
  .fade-in    { animation: fadeIn .3s ease both; }

  /* Toast Notification — ป้ายแจ้งเตือนแบบชั่วคราว */
  .toast-container {
    position: fixed; bottom: 24px; right: 24px;
    display: flex; flex-direction: column; gap: 10px;
    z-index: 9999;
  }
  .toast {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 20px; border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg); font-size: 14px; font-weight: 500;
    animation: bounceIn .4s ease both;
    min-width: 280px; max-width: 380px;
    color: #fff;
  }
  .toast-success { background: linear-gradient(135deg, #00C897, #00A87A); }
  .toast-error   { background: linear-gradient(135deg, #FF4757, #CC2233); }
  .toast-info    { background: linear-gradient(135deg, #6C63FF, #5A52D5); }
  .toast-warning { background: linear-gradient(135deg, #FFB020, #CC8800); }

  /* Layout สำหรับ Mobile */
  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
    .mobile-full { width: 100% !important; }
    .grid-cols-auto { grid-template-columns: 1fr !important; }
    .card-body { padding: 16px; }
    .stat-card { padding: 16px; }
  }
`;

// ============================================================
// 🔔 Toast System — ระบบแจ้งเตือนป็อบอัพมุมขวาล่าง
// เหมือน "เสียงไดนาโม" แจ้งลูกค้าเมื่อเพิ่มสินค้าลงตะกร้า
// ============================================================
function Toast({ toasts, removeToast }) {
  const iconMap = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: 20 }}>{iconMap[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// Hook สำหรับใช้ Toast ทั่วทั้ง App
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, addToast, removeToast };
}

// ============================================================
// 📄 หน้ารายละเอียดสินค้า (Product Detail)
// เหมือน "ป้ายข้อมูลสินค้าขนาดใหญ่" ในห้าง
// ============================================================
function ProductDetailPage({ products, addToCart, toast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === Number(id));
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 60 }}>😕</div>
        <h3 style={{ color: 'var(--text-muted)', marginTop: 16 }}>ไม่พบสินค้านี้</h3>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>กลับหน้าแรก</button>
      </div>
    );
  }

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product, true); // ส่ง silent=true เพื่อไม่แสดง toast ซ้ำ
    toast(`🛒 เพิ่ม "${product.name}" × ${qty} ลงตะกร้าแล้ว!`, 'success');
  };

  return (
    <div style={{ padding: '32px 20px', maxWidth: 1000, margin: '0 auto' }} className="fade-in-up">
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>⬅ ย้อนกลับ</button>
      <div className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
          {/* รูปสินค้า */}
          <div style={{ flex: '1 1 360px', background: '#F8F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
            {product.image
              ? <img src={product.image} alt={product.name} style={{ width: '100%', height: 380, objectFit: 'cover' }} onError={e => { e.target.src = 'https://placehold.co/400x380?text=No+Image'; }} />
              : <div style={{ fontSize: 80 }}>📦</div>
            }
          </div>

          {/* รายละเอียด */}
          <div className="card-body" style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className="badge badge-purple">🏷️ {product.category || 'ไม่ระบุ'}</span>
            <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3 }}>{product.name}</h1>
            <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--danger)' }}>฿{Number(product.price).toLocaleString()}</div>

            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>{product.description || 'ไม่มีรายละเอียดสินค้า'}</p>

            <div className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`} style={{ alignSelf: 'flex-start', fontSize: 14, padding: '8px 14px' }}>
              📦 {product.stock > 0 ? `มีสินค้า ${product.stock} ชิ้น` : 'สินค้าหมด'}
            </div>

            {/* ปุ่มเพิ่มจำนวน */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>จำนวน:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E4E7F0', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 40, border: 'none', background: '#F8F9FF', cursor: 'pointer', fontSize: 18 }}>−</button>
                  <span style={{ width: 40, textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: 40, height: 40, border: 'none', background: '#F8F9FF', cursor: 'pointer', fontSize: 18 }}>+</button>
                </div>
              </div>
            )}

            <button onClick={handleAdd} disabled={product.stock <= 0} className={`btn btn-lg ${product.stock > 0 ? 'btn-primary' : ''}`}
              style={{ marginTop: 'auto', background: product.stock <= 0 ? '#C8CBD9' : undefined, cursor: product.stock <= 0 ? 'not-allowed' : 'pointer' }}>
              {product.stock > 0 ? '🛒 หยิบใส่ตะกร้า' : '❌ สินค้าหมด'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 👤 หน้าโปรไฟล์ลูกค้า
// เหมือน "บัตรสมาชิกห้าง" — ดู/แก้ไขข้อมูลส่วนตัว
// ✅ แก้ไข: รูปโปรไฟล์จาก Cloudinary แสดงผลได้ถูกต้อง
// ============================================================
function ProfilePage({ userId, toast }) {
  const [profile, setProfile] = useState({ username: '', email: '', address: '', phone: '', profile_picture: '', password: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // URL ตัวอย่างก่อนอัปโหลด
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // โหลดข้อมูลโปรไฟล์จาก server เมื่อเปิดหน้า
  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_URL}/users/${userId}`)
      .then(res => {
        setProfile({ ...res.data, password: '' });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  // เมื่อเลือกไฟล์รูป → สร้าง preview URL ให้ดูก่อน
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f)); // สร้าง URL ชั่วคราวในเบราว์เซอร์
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', profile.username || '');
    formData.append('email', profile.email || '');
    formData.append('address', profile.address || '');
    formData.append('phone', profile.phone || '');
    if (profile.password) formData.append('password', profile.password);
    if (file) formData.append('profile_picture', file);

    try {
      const res = await axios.put(`${API_URL}/users/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // ✅ แก้ไขหลัก: โหลดข้อมูลใหม่จาก server โดยตรง (ไม่ reload หน้า)
      // เพราะ backend ส่ง Cloudinary URL กลับมาเก็บใน DB
      const refreshed = await axios.get(`${API_URL}/users/${userId}`);
      setProfile({ ...refreshed.data, password: '' });
      setFile(null);
      setPreview(null); // ล้าง preview
      toast('✅ บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!', 'success');
    } catch {
      toast('❌ เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
  };

  // รูปที่จะแสดง (ลำดับความสำคัญ: preview > Cloudinary URL > icon เริ่มต้น)
  const avatarSrc = preview || profile.profile_picture || null;

  if (loading) return (
    <div style={{ padding: 80, textAlign: 'center' }}>
      <div style={{ fontSize: 40, animation: 'pulse 1s infinite' }}>⏳</div>
      <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>กำลังโหลดข้อมูล...</p>
    </div>
  );

  return (
    <div style={{ padding: '32px 20px', maxWidth: 640, margin: '0 auto' }} className="fade-in-up">
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>⬅ ย้อนกลับ</button>

      <div className="card">
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', padding: '32px 24px', textAlign: 'center' }}>
          {/* รูปโปรไฟล์ */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              width: 110, height: 110, borderRadius: '50%', overflow: 'hidden',
              border: '4px solid rgba(255,255,255,.4)', background: '#eee',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
            }}>
              {avatarSrc
                ? (
                  // ✅ แสดงรูปจาก Cloudinary URL หรือ preview
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      // ถ้าโหลดรูปไม่ได้ → แสดง icon แทน
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                )
                : null
              }
              <div style={{
                display: avatarSrc ? 'none' : 'flex',
                width: '100%', height: '100%',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 48, color: '#aaa'
              }}>👤</div>
            </div>

            {/* ปุ่มเปลี่ยนรูป */}
            <label style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 34, height: 34, borderRadius: '50%',
              background: 'var(--secondary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 16, border: '2px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,.2)'
            }}>
              📸
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </label>
          </div>

          <h2 style={{ color: '#fff', marginTop: 14, fontWeight: 700 }}>{profile.username || 'ผู้ใช้งาน'}</h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13 }}>{profile.email || ''}</p>
        </div>

        <div className="card-body">
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">👤 ชื่อผู้ใช้งาน</label>
              <input className="form-input" required value={profile.username || ''} onChange={e => setProfile({ ...profile, username: e.target.value })} />
            </div>
            <div>
              <label className="form-label">📧 อีเมล</label>
              <input className="form-input" type="email" required value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <div>
              <label className="form-label" style={{ color: 'var(--danger)' }}>🔐 รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่เปลี่ยน)</label>
              <input className="form-input" type="password" value={profile.password || ''} onChange={e => setProfile({ ...profile, password: e.target.value })} style={{ borderColor: 'rgba(255,71,87,.3)' }} />
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #F0F1F9' }} />
            <div>
              <label className="form-label">🏠 ที่อยู่จัดส่ง</label>
              <textarea className="form-input" rows={3} value={profile.address || ''} onChange={e => setProfile({ ...profile, address: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className="form-label">📞 เบอร์โทรศัพท์</label>
              <input className="form-input" type="text" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" style={{ marginTop: 8 }}>
              💾 บันทึกข้อมูล
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 📱 Sidebar ลูกค้า — เมนูฝั่งซ้ายสำหรับลูกค้า
// เหมือน "แผนผังห้าง" — บอกทางไปทุกชั้น
// ============================================================
function CustomerSidebar({ isOpen, onClose, cart, userRole, isLoggedIn, adminTab, setAdminTab, navigate }) {
  const menuItems = [
    { to: '/', icon: '🏠', label: 'หน้าแรก' },
    { to: '/cart', icon: '🛒', label: 'ตะกร้าสินค้า', badge: cart.length },
    ...(isLoggedIn ? [
      { to: '/my-orders', icon: '📋', label: 'ประวัติการสั่งซื้อ' },
      { to: '/profile', icon: '👤', label: 'โปรไฟล์ของฉัน' },
    ] : []),
  ];

  return (
    <>
      {/* Overlay — ม่านปิดหลัง Sidebar */}
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 998, backdropFilter: 'blur(3px)' }} />}

      {/* ตัว Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: isOpen ? 0 : 'calc(-1 * var(--sidebar-w))',
        width: 'var(--sidebar-w)', height: '100vh',
        background: 'var(--surface)', boxShadow: 'var(--shadow-lg)',
        transition: 'left .3s cubic-bezier(.4,0,.2,1)', zIndex: 999,
        display: 'flex', flexDirection: 'column', overflowY: 'auto'
      }}>
        {/* Header Sidebar */}
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>🛍️ BIG SHOP</div>
            <div style={{ fontSize: 12, opacity: .7, marginTop: 2 }}>ช้อปสนุก จ่ายน้อย</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        {/* เมนู */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', padding: '0 12px', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>เมนูหลัก</div>
          {menuItems.map(item => (
            <Link key={item.to} to={item.to} onClick={onClose} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 4,
              textDecoration: 'none', color: 'var(--text)', fontWeight: 600,
              transition: 'all .2s', background: 'transparent',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text)'; }}
            >
              <span>{item.icon} {item.label}</span>
              {item.badge > 0 && <span className="badge badge-danger" style={{ fontSize: 11 }}>{item.badge}</span>}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

// ============================================================
// ⚙️ Sidebar แอดมิน — เมนูหลังบ้าน
// เหมือน "ห้องควบคุมส่วนกลาง" ของห้าง
// ============================================================
function AdminSidebar({ isOpen, onClose, adminTab, setAdminTab, navigate, logout }) {
  const menuItems = [
    { tab: 'report', icon: '📊', label: 'รายงาน & สถิติ', desc: 'ดู Dashboard ภาพรวม' },
    { tab: 'add',    icon: '➕', label: 'เพิ่มสินค้า',    desc: 'เพิ่มหรือแก้ไขสินค้า' },
    { tab: 'stock',  icon: '📦', label: 'จัดการสต็อก',    desc: 'ปรับจำนวนสินค้า' },
    { tab: 'orders', icon: '🧾', label: 'รายการสั่งซื้อ', desc: 'ดูและอัปเดตออเดอร์' },
    { tab: 'users',  icon: '👥', label: 'จัดการผู้ใช้',  desc: 'ดูและจัดการบัญชี' },
  ];

  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 998, backdropFilter: 'blur(3px)' }} />}
      <aside style={{
        position: 'fixed', top: 0, left: isOpen ? 0 : 'calc(-1 * var(--sidebar-w))',
        width: 'var(--sidebar-w)', height: '100vh',
        background: '#1A1A2E', boxShadow: 'var(--shadow-lg)',
        transition: 'left .3s cubic-bezier(.4,0,.2,1)', zIndex: 999,
        display: 'flex', flexDirection: 'column', overflowY: 'auto'
      }}>
        {/* Admin Header */}
        <div style={{ padding: '20px 24px', background: 'rgba(108,99,255,.2)', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>⚙️ Admin Panel</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>BIG SHOP Management</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', padding: '0 12px', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>เมนูหลังบ้าน</div>
          {menuItems.map(item => (
            <button key={item.tab} onClick={() => { setAdminTab(item.tab); navigate('/admin'); onClose(); }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 4,
                border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all .2s',
                background: adminTab === item.tab ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'rgba(255,255,255,.04)',
                color: adminTab === item.tab ? '#fff' : 'rgba(255,255,255,.6)',
              }}
              onMouseEnter={e => { if (adminTab !== item.tab) e.currentTarget.style.background = 'rgba(108,99,255,.2)'; }}
              onMouseLeave={e => { if (adminTab !== item.tab) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
            >
              <span style={{ fontSize: 14, fontWeight: 700 }}>{item.icon} {item.label}</span>
              <span style={{ fontSize: 11, opacity: .7, marginTop: 2 }}>{item.desc}</span>
            </button>
          ))}
        </nav>

        {/* ปุ่ม Logout ด้านล่าง */}
        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <button onClick={logout} style={{
            width: '100%', padding: '12px', background: 'rgba(255,71,87,.15)',
            color: '#FF4757', border: '1px solid rgba(255,71,87,.3)', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14
          }}>
            🚪 ออกจากระบบ
          </button>
        </div>
      </aside>
    </>
  );
}

// ============================================================
// 🏗️ App หลัก — โครงสร้างใหญ่ของทั้งระบบ
// ============================================================
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// ============================================================
// 🏪 AppContent — ตัวร้านค้าหลักทั้งหมด (State + Logic + UI)
// ============================================================
function AppContent() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  // --- State หลักของแอป ---
  // เหมือน "ข้อมูลในคอมพิวเตอร์ของห้าง" ที่อัปเดตตลอดเวลา
  const [products, setProducts]         = useState([]);
  const [cart, setCart]                 = useState([]);
  const [orders, setOrders]             = useState([]);
  const [myOrders, setMyOrders]         = useState([]);
  const [users, setUsers]               = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [file, setFile]                 = useState(null);
  const [isLoggedIn, setIsLoggedIn]     = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole]         = useState(localStorage.getItem('role') || 'customer');
  const [userId, setUserId]             = useState(localStorage.getItem('userId') || null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [address, setAddress]           = useState('');
  const [phone, setPhone]               = useState('');
  const [slipFile, setSlipFile]         = useState(null);
  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [adminTab, setAdminTab]         = useState('report');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- โหลดข้อมูลเริ่มต้น ---
  useEffect(() => {
    // ฉีดสไตล์ CSS ลงหน้าเว็บ (ทำแค่ครั้งเดียว)
    const style = document.createElement('style');
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
    if (isLoggedIn) { fetchMyOrders(); fetchUsers(); }
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // รีเฟรชออเดอร์ทุก 5 วินาที
    return () => clearInterval(interval);
  }, [isLoggedIn, userId]);

  // --- ฟังก์ชันดึงข้อมูล (Data Fetching) ---
  const fetchOrders = () => {
    axios.get(`${API_URL}/orders`).then(res => setOrders(res.data)).catch(console.error);
  };

  const fetchMyOrders = () => {
    if (!userId) return;
    axios.get(`${API_URL}/my-orders/${userId}`).then(res => setMyOrders(res.data)).catch(console.error);
  };

  const fetchUsers = async () => {
    try {
      // ✅ แก้ไข: ใช้ API_URL และ endpoint ที่ถูกต้อง (ดึงผู้ใช้ทั้งหมด ไม่ใช่ id เดียว)
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (Array.isArray(res.data)) setUsers(res.data);
    } catch (err) { console.error('fetchUsers error:', err); }
  };

  // --- ฟังก์ชันตะกร้าสินค้า ---
  // เปรียบเหมือน "รถเข็นของห้าง" — เพิ่ม/ลบ/แก้ไขสินค้า
  const addToCart = useCallback((product, silent = false) => {
    setCart(prevCart => {
      const found = prevCart.find(i => i.id === product.id);
      if (found) {
        if (found.qty >= product.stock) {
          addToast(`⚠️ สต็อกคงเหลือเพียง ${product.stock} ชิ้น`, 'warning');
          return prevCart;
        }
        return prevCart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
    if (!silent) addToast(`🛒 เพิ่ม "${product.name}" ลงตะกร้าแล้ว!`, 'success');
  }, [addToast]);

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQty = item.qty + delta;
      if (newQty < 1) return item;
      if (newQty > item.stock) { addToast(`⚠️ สต็อกจำกัด ${item.stock} ชิ้น`, 'warning'); return item; }
      return { ...item, qty: newQty };
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => { if (window.confirm('ยืนยันยกเลิกรายการทั้งหมด?')) setCart([]); };
  const calculateTotal = () => cart.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const flatCart = cart.flatMap(i => Array(i.qty).fill(i)); // แปลงตะกร้าเป็นรายการชิ้น

  // --- Login / Register / Logout ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const { username, password } = e.target;
    try {
      const res = await axios.post(`${API_URL}/login`, { username: username.value, password: password.value });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('userId', res.data.id);
      setIsLoggedIn(true);
      setUserRole(res.data.role);
      setUserId(res.data.id);
      // ✅ แจ้งเตือนด้วย Toast แทน alert
      addToast(`🎉 ยินดีต้อนรับ คุณ ${username.value}!`, 'success', 4000);
      setTimeout(() => navigate(res.data.role === 'admin' ? '/admin' : '/'), 300);
    } catch {
      addToast('❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, password, confirmPassword } = e.target;
    if (password.value !== confirmPassword.value) {
      addToast('❌ รหัสผ่านไม่ตรงกัน', 'error'); return;
    }
    try {
      const res = await axios.post(`${API_URL}/register`, { username: username.value, password: password.value });
      addToast('✅ สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ', 'success');
      navigate('/login');
    } catch (err) {
      addToast(err.response?.data?.message || '❌ เกิดข้อผิดพลาด', 'error');
    }
  };

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole('customer');
    setUserId(null);
    setIsSidebarOpen(false);
    addToast('👋 ออกจากระบบแล้ว', 'info');
    navigate('/login');
  };

  // --- สั่งซื้อ & ชำระเงิน ---
  const checkout = async () => {
    if (cart.length === 0) { addToast('ตะกร้าว่างอยู่ครับ!', 'warning'); return; }
    try {
      const userRes = await axios.get(`${API_URL}/users/${userId}`);
      setAddress(userRes.data.address || '');
      setPhone(userRes.data.phone || '');
      const orderRes = await axios.post(`${API_URL}/orders`, {
        total_price: calculateTotal(), items_count: flatCart.length, user_id: userId, cartItems: flatCart
      });
      setCurrentOrderId(orderRes.data.orderId);
      setShowPayModal(true);
      fetchMyOrders();
    } catch { addToast('❌ สั่งซื้อไม่สำเร็จ', 'error'); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('address', address);
    formData.append('phone', phone);
    formData.append('slip', slipFile);
    try {
      await axios.put(`${API_URL}/orders/pay/${currentOrderId}`, formData);
      addToast('✅ ส่งหลักฐานการชำระเงินแล้ว! รอแอดมินตรวจสอบ', 'success', 5000);
      setCart([]); setShowPayModal(false);
      fetchMyOrders(); navigate('/my-orders');
    } catch { addToast('❌ เกิดข้อผิดพลาดในการส่งหลักฐาน', 'error'); }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('ยืนยันยกเลิกออเดอร์?')) return;
    try {
      await axios.delete(`${API_URL}/orders/${orderId}`);
      addToast('🗑️ ยกเลิกออเดอร์แล้ว', 'info');
      fetchMyOrders();
    } catch { addToast('❌ ไม่สามารถยกเลิกได้', 'error'); }
  };

  const deleteOrderHistory = async (orderId) => {
    if (!window.confirm('ลบประวัตินี้ทิ้งถาวรใช่หรือไม่?')) return;
    try {
      await axios.delete(`${API_URL}/orders/${orderId}`);
      addToast('🗑️ ลบประวัติแล้ว', 'success');
      fetchMyOrders(); fetchOrders();
    } catch { addToast('❌ ลบไม่ได้', 'error'); }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}`, { status });
      addToast(`✅ อัปเดตสถานะเป็น: ${status}`, 'success');
      fetchOrders();
      axios.get(`${API_URL}/products`).then(r => setProducts(r.data));
    } catch { addToast('❌ อัปเดตสถานะพลาด', 'error'); }
  };

  // --- จัดการสินค้า (Admin) ---
  const addOrUpdateProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    ['name', 'price', 'stock', 'category'].forEach(k => formData.append(k, e.target[k].value));
    formData.append('description', e.target.desc.value);
    if (file) formData.append('image', file);

    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.id}`, formData);
        addToast('✅ แก้ไขสินค้าแล้ว', 'success');
      } else {
        await axios.post(`${API_URL}/products`, formData);
        addToast('✅ เพิ่มสินค้าใหม่แล้ว', 'success');
      }
      setEditingProduct(null); setFile(null); e.target.reset();
      axios.get(`${API_URL}/products`).then(r => setProducts(r.data));
    } catch { addToast('❌ บันทึกสินค้าพลาด', 'error'); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('แน่ใจนะว่าจะลบสินค้านี้?')) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      addToast('🗑️ ลบสินค้าแล้ว', 'success');
      axios.get(`${API_URL}/products`).then(r => setProducts(r.data));
    } catch { addToast('❌ ลบสินค้าไม่ได้', 'error'); }
  };

  const updateUser = async (id, data) => {
    try {
      await axios.put(`${API_URL}/special-admin-update/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      addToast('✅ อัปเดตผู้ใช้สำเร็จ', 'success');
      fetchUsers();
    } catch (err) { addToast('❌ อัปเดตพลาด: ' + err.message, 'error'); }
  };

  // --- Export ---
  const exportToExcel = () => {
    if (!orders.length) { addToast('ไม่มีข้อมูลสำหรับ Export', 'warning'); return; }
    const data = orders.map(o => ({
      'หมายเลขออเดอร์': `#${o.id}`,
      'จำนวนชิ้น': o.items_count,
      'ยอดรวม (บาท)': o.total_price,
      'วันที่สั่ง': new Date(o.created_at).toLocaleString('th-TH'),
      'สถานะ': o.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ยอดขาย');
    XLSX.writeFile(wb, 'BIG_SHOP_Sales.xlsx');
  };

  const exportToPDF = () => {
    if (!orders.length) { addToast('ไม่มีข้อมูลสำหรับ Export', 'warning'); return; }
    const doc = new jsPDF();
    doc.addFileToVFS('THSarabunNew.ttf', fontBase64);
    doc.addFont('THSarabunNew.ttf', 'ThaiFont', 'normal');
    doc.setFont('ThaiFont'); doc.setFontSize(20);
    doc.text('รายงานสรุปยอดขาย - BIG SHOP', 105, 20, { align: 'center' });
    autoTable(doc, {
      startY: 30,
      head: [['ออเดอร์', 'จำนวน', 'ยอดรวม', 'วันที่', 'สถานะ']],
      body: orders.map(o => [`#${o.id}`, o.items_count, `฿${o.total_price}`, new Date(o.created_at).toLocaleDateString('th-TH'), o.status]),
      styles: { font: 'ThaiFont', fontSize: 13 },
      headStyles: { fillColor: [108, 99, 255] }
    });
    doc.save('BIG_SHOP_Report.pdf');
  };

  const generatePDF = async (order) => {
    try {
      const res = await axios.get(`${API_URL}/orders/${order.id}/items`);
      const items = res.data;
      const doc = new jsPDF();
      doc.addFileToVFS('THSarabunNew.ttf', fontBase64);
      doc.addFont('THSarabunNew.ttf', 'ThaiFont', 'normal');
      doc.setFont('ThaiFont', 'normal');
      doc.setFontSize(26); doc.text('BIG SHOP', 105, 20, { align: 'center' });
      doc.setFontSize(16); doc.text('ใบเสร็จรับเงิน / Receipt', 105, 28, { align: 'center' });
      doc.line(15, 32, 195, 32);
      doc.setFontSize(14);
      doc.text(`หมายเลขคำสั่งซื้อ: #${order.id}`, 15, 42);
      doc.text(`วันที่: ${new Date(order.created_at || Date.now()).toLocaleDateString('th-TH')}`, 15, 49);
      doc.text(`สถานะ: ${order.status}`, 15, 56);
      autoTable(doc, {
        startY: 62,
        head: [['#', 'สินค้า', 'จำนวน', 'ราคา/ชิ้น', 'รวม']],
        body: items.map((it, i) => [i + 1, it.name, it.quantity, `฿${Number(it.price).toLocaleString()}`, `฿${(Number(it.price) * it.quantity).toLocaleString()}`]),
        foot: [['', '', '', 'รวมทั้งสิ้น', `฿${Number(order.total_price).toLocaleString()}`]],
        styles: { font: 'ThaiFont', fontSize: 13 },
        headStyles: { fillColor: [108, 99, 255] }
      });
      const y = doc.lastAutoTable.finalY;
      doc.setFontSize(14); doc.setTextColor(100);
      doc.text('ขอบคุณที่ใช้บริการ BIG SHOP 🛍️', 105, y + 15, { align: 'center' });
      window.open(doc.output('bloburl'), '_blank');
    } catch { addToast('❌ เกิดข้อผิดพลาดในการสร้างใบเสร็จ', 'error'); }
  };

  // --- คำนวณสถิติ Dashboard ---
  const totalSales = orders.filter(o => ['ชำระเงินแล้ว', 'จัดส่งแล้ว'].includes(o.status)).reduce((s, o) => s + Number(o.total_price), 0);
  const pendingOrders   = orders.filter(o => o.status === 'รอดำเนินการ').length;
  const completedOrders = orders.filter(o => o.status === 'จัดส่งแล้ว').length;
  const totalUsersCount = [...new Set(orders.map(o => o.user_id))].length;
  const cancelledOrders = orders.filter(o => o.status === 'ยกเลิก').length;

  // ข้อมูลกราฟยอดขายรายวัน
  const salesChartData = Object.values(
    orders
      .filter(o => !['ยกเลิก', 'รอดำเนินการ'].includes(o.status))
      .reduce((acc, o) => {
        const d = new Date(o.created_at).toLocaleDateString('th-TH');
        if (!acc[d]) acc[d] = { name: d, ยอดขาย: 0, จำนวนออเดอร์: 0 };
        acc[d].ยอดขาย += Number(o.total_price);
        acc[d].จำนวนออเดอร์++;
        return acc;
      }, {})
  ).slice(-14); // แสดง 14 วันล่าสุด

  // สินค้าที่กรองตาม search และ category
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCat = selectedCategory === 'ทั้งหมด' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const statusColor = (s) => ({ 'จัดส่งแล้ว': '#badge-success', 'รอดำเนินการ': 'badge-warning', 'ยกเลิก': 'badge-danger', 'ชำระเงินแล้ว': 'badge-info', 'กำลังจัดส่ง': 'badge-purple' }[s] || 'badge-info');

  // ============================================================
  // 🖼️ Render — ส่วนแสดงผล (View)
  // เหมือน "หน้าตาห้าง" ที่ลูกค้ามองเห็น
  // ============================================================
  return (
    <div style={{ fontFamily: "'Prompt', 'Sarabun', sans-serif", backgroundColor: 'var(--bg)', minHeight: '100vh' }}>

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Modal ชำระเงิน */}
      {showPayModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card fade-in-up" style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ background: 'linear-gradient(135deg, #00C897, #00A87A)', padding: '24px', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>💰</div>
              <h2 style={{ fontWeight: 800 }}>แจ้งชำระเงิน</h2>
              <p style={{ opacity: .8, fontSize: 14 }}>ออเดอร์ #{currentOrderId}</p>
            </div>
            <div className="card-body">
              <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
                💳 กรุณาโอนเงินมาที่: <strong>ธนาคารกสิกรไทย 000-0-00000-0</strong>
              </p>
              <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">🏠 ที่อยู่จัดส่ง</label>
                  <textarea className="form-input" required rows={3} value={address} onChange={e => setAddress(e.target.value)} placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด..." style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label className="form-label">📞 เบอร์โทรศัพท์</label>
                  <input className="form-input" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="08x-xxx-xxxx" />
                </div>
                <div>
                  <label className="form-label">📸 สลิปโอนเงิน</label>
                  <input type="file" accept="image/*" required onChange={e => setSlipFile(e.target.files[0])} style={{ width: '100%', padding: '8px 0', fontSize: 14 }} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowPayModal(false)} className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}>ยกเลิก</button>
                  <button type="submit" className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }}>✅ ยืนยันชำระ</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ====== Navbar ====== */}
      <nav style={{
        background: '#1A1A2E', padding: '0 20px',
        height: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 900, boxShadow: '0 2px 20px rgba(0,0,0,.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'rgba(255,255,255,.08)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☰</button>
          <Link to={userRole === 'admin' ? '/admin' : '/'} style={{ color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>
            🛍️ BIG SHOP
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isLoggedIn ? (
            <>
              {userRole !== 'admin' && (
                <Link to="/cart" style={{ position: 'relative', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '8px 14px', background: 'rgba(255,255,255,.08)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 14 }}>
                  🛒 <span className="hide-mobile" style={{ marginLeft: 6 }}>ตะกร้า</span>
                  {cart.length > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cart.length}</span>}
                </Link>
              )}
              <button onClick={logout} style={{ background: 'rgba(255,71,87,.2)', border: '1px solid rgba(255,71,87,.4)', color: '#FF6B7A', padding: '8px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 14 }}>
                🚪 <span className="hide-mobile">ออกจากระบบ</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate('/login')} className="btn btn-ghost btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>เข้าสู่ระบบ</button>
              <button onClick={() => navigate('/register')} className="btn btn-primary btn-sm">สมัครสมาชิก</button>
            </div>
          )}
        </div>
      </nav>

      {/* ====== Sidebar (เลือกตาม role) ====== */}
      {userRole === 'admin' && isLoggedIn
        ? <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} adminTab={adminTab} setAdminTab={setAdminTab} navigate={navigate} logout={logout} />
        : <CustomerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} cart={cart} userRole={userRole} isLoggedIn={isLoggedIn} adminTab={adminTab} setAdminTab={setAdminTab} navigate={navigate} />
      }

      {/* ====== Routes (หน้าต่างๆ) ====== */}
      <Routes>

        {/* ===== หน้าแรก (Home) ===== */}
        <Route path="/" element={
          <div>
            {/* Hero Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1A1A2E 0%, #6C63FF 60%, #FF6584 100%)',
              padding: '80px 20px 60px', textAlign: 'center', color: '#fff',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* ลวดลาย decorative */}
              <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
              <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />

              <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>🛍️ BIG1919 SHOP</h1>
              <p style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', opacity: .85, marginTop: 12 }}>"ช้อปใหญ่ จ่ายน้อย สอยทุกความคุ้ม!"</p>
              <div style={{ marginTop: 32, position: 'relative', maxWidth: 600, margin: '32px auto 0' }}>
                <input type="text" placeholder="🔍 ค้นหาสินค้าที่ใช่สำหรับคุณ..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '16px 24px', borderRadius: 50, border: 'none', fontSize: 16, boxShadow: '0 10px 30px rgba(0,0,0,.25)', outline: 'none' }} />
              </div>
            </div>

            {/* หมวดหมู่สินค้า */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, padding: '24px 20px', flexWrap: 'wrap' }}>
              {['ทั้งหมด', ...new Set(products.map(p => p.category).filter(Boolean))].map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className="btn" style={{
                  background: selectedCategory === cat ? 'var(--primary)' : 'var(--surface)',
                  color: selectedCategory === cat ? '#fff' : 'var(--text)',
                  boxShadow: selectedCategory === cat ? '0 4px 12px rgba(108,99,255,.3)' : 'var(--shadow-sm)',
                  border: 'none'
                }}>{cat}</button>
              ))}
            </div>

            {/* กริดสินค้า */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, padding: '0 20px 40px' }}>
              {filteredProducts.map((item, i) => (
                <div key={item.id} className="card fade-in-up" style={{ animationDelay: `${i * 0.05}s`, transition: 'transform .2s, box-shadow .2s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  {item.image
                    ? <img src={item.image} alt={item.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                    : <div style={{ height: 200, background: '#F0EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>📦</div>
                  }
                  <div className="card-body" style={{ padding: 16 }}>
                    {item.category && <span className="badge badge-purple" style={{ marginBottom: 8, fontSize: 11 }}>{item.category}</span>}
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: '6px 0', lineHeight: 1.4 }}>{item.name}</h3>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--danger)', margin: '6px 0' }}>฿{Number(item.price).toLocaleString()}</div>
                    <div className={`badge ${item.stock > 0 ? 'badge-success' : 'badge-danger'}`} style={{ marginBottom: 12, fontSize: 11 }}>
                      {item.stock > 0 ? `📦 เหลือ ${item.stock} ชิ้น` : '❌ หมด'}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => navigate(`/product/${item.id}`)} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>รายละเอียด</button>
                      <button onClick={() => addToCart(item)} disabled={item.stock <= 0} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', opacity: item.stock <= 0 ? .5 : 1, cursor: item.stock <= 0 ? 'not-allowed' : 'pointer' }}>
                        {item.stock > 0 ? '🛒 หยิบ' : 'หมด'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 64 }}>🔍</div>
                <h3 style={{ marginTop: 16 }}>ไม่พบสินค้าที่ค้นหา</h3>
              </div>
            )}

            {/* Footer */}
            <footer style={{ marginTop: 40, padding: '40px 20px', background: '#1A1A2E', color: '#fff', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>🛍️ BIG SHOP</div>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>ติดต่อเรา: 093-112-1917 | Line: @phuwadet5617</p>
              <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 12, marginTop: 16 }}>© 2026 BIG SHOP. All rights reserved.</p>
            </footer>
          </div>
        } />

        {/* ===== หน้าโปรไฟล์ ===== */}
        <Route path="/profile" element={isLoggedIn ? <ProfilePage userId={userId} toast={addToast} /> : <Navigate to="/login" />} />

        {/* ===== หน้ารายละเอียดสินค้า ===== */}
        <Route path="/product/:id" element={<ProductDetailPage products={products} addToCart={addToCart} toast={addToast} />} />

        {/* ===== หน้าตะกร้า ===== */}
        <Route path="/cart" element={
          <div style={{ padding: '32px 20px', maxWidth: 860, margin: '0 auto' }} className="fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontWeight: 800 }}>🛒 ตะกร้าสินค้า</h2>
              {cart.length > 0 && <button className="btn btn-danger btn-sm" onClick={clearCart}>🗑️ ล้างทั้งหมด</button>}
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 80 }}>🛒</div>
                <h3 style={{ marginTop: 16 }}>ตะกร้าว่างเปล่า</h3>
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>เลือกสินค้า</button>
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #F0F1F9', padding: '16px 0' }}>
                      <img src={item.image} alt={item.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-sm)', background: '#F8F9FF' }} onError={e => e.target.style.display = 'none'} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</div>
                        <div style={{ color: 'var(--danger)', fontWeight: 700 }}>฿{Number(item.price).toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E4E7F0', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <button onClick={() => updateQuantity(item.id, -1)} style={{ width: 36, height: 36, border: 'none', background: '#F8F9FF', cursor: 'pointer', fontSize: 16 }}>−</button>
                        <span style={{ width: 36, textAlign: 'center', fontWeight: 700 }}>{item.qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} style={{ width: 36, height: 36, border: 'none', background: '#F8F9FF', cursor: 'pointer', fontSize: 16 }}>+</button>
                      </div>
                      <div style={{ fontWeight: 700, width: 80, textAlign: 'right' }}>฿{(item.price * item.qty).toLocaleString()}</div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 18 }}>✕</button>
                    </div>
                  ))}

                  <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <h3 style={{ fontWeight: 800, fontSize: 20 }}>รวมทั้งหมด: <span style={{ color: 'var(--danger)' }}>฿{calculateTotal().toLocaleString()}</span></h3>
                    <button onClick={() => {
                      if (isLoggedIn) checkout();
                      else { addToast('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ', 'warning'); navigate('/login'); }
                    }} className="btn btn-success btn-lg">{isLoggedIn ? '✅ ยืนยันการสั่งซื้อ' : '🔑 เข้าสู่ระบบเพื่อสั่งซื้อ'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        } />

        {/* ===== หน้าประวัติการสั่งซื้อ ===== */}
        <Route path="/my-orders" element={
          <div style={{ padding: '32px 20px', maxWidth: 960, margin: '0 auto' }} className="fade-in-up">
            <h2 style={{ fontWeight: 800, marginBottom: 24 }}>📋 ประวัติการสั่งซื้อ</h2>
            {myOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 64 }}>📋</div>
                <h3 style={{ marginTop: 16 }}>ยังไม่มีรายการสั่งซื้อ</h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myOrders.map(order => (
                  <div key={order.id} className="card fade-in">
                    <div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16 }}>ออเดอร์ #{order.id}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{new Date(order.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                          <div style={{ fontWeight: 800, color: 'var(--danger)', fontSize: 18, marginTop: 4 }}>฿{Number(order.total_price).toLocaleString()}</div>
                        </div>
                        <div>
                          <span className={`badge ${order.status === 'จัดส่งแล้ว' ? 'badge-success' : order.status === 'ยกเลิก' ? 'badge-danger' : order.status === 'ชำระเงินแล้ว' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: 13, padding: '6px 14px' }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {order.status === 'รอดำเนินการ' && <button onClick={() => cancelOrder(order.id)} className="btn btn-danger btn-sm">ยกเลิก</button>}
                        <button onClick={() => { setCurrentOrderId(order.id); setShowPayModal(true); }} className="btn btn-primary btn-sm">💳 ชำระเงิน</button>
                        <button onClick={() => generatePDF(order)} className="btn btn-sm" style={{ background: '#27ae60', color: '#fff' }}>📄 ใบเสร็จ</button>
                        <button onClick={() => deleteOrderHistory(order.id)} className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff' }}>🗑️ ลบ</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        } />

        {/* ===== หน้า Login ===== */}
        <Route path="/login" element={
          isLoggedIn
            ? <Navigate to={userRole === 'admin' ? '/admin' : '/'} replace />
            : (
              <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'linear-gradient(135deg, #1A1A2E 0%, #6C63FF 100%)' }}>
                <div className="card fade-in-up" style={{ width: '100%', maxWidth: 420 }}>
                  <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', padding: '32px 24px', textAlign: 'center', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', color: '#fff' }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
                    <h2 style={{ fontWeight: 800 }}>เข้าสู่ระบบ</h2>
                    <p style={{ opacity: .8, fontSize: 14 }}>ยินดีต้อนรับกลับมา!</p>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label className="form-label">ชื่อผู้ใช้งาน</label>
                        <input name="username" className="form-input" placeholder="Username" required />
                      </div>
                      <div>
                        <label className="form-label">รหัสผ่าน</label>
                        <input name="password" type="password" className="form-input" placeholder="Password" required />
                      </div>
                      <button type="submit" className="btn btn-primary btn-lg btn-full" style={{ marginTop: 8 }}>เข้าสู่ระบบ</button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
                      ยังไม่มีบัญชี? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>สมัครสมาชิกฟรี</Link>
                    </p>
                  </div>
                </div>
              </div>
            )
        } />

        {/* ===== หน้า Register ===== */}
        <Route path="/register" element={
          <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'linear-gradient(135deg, #1A1A2E 0%, #00C897 100%)' }}>
            <div className="card fade-in-up" style={{ width: '100%', maxWidth: 420 }}>
              <div style={{ background: 'linear-gradient(135deg, #00C897, #00A87A)', padding: '32px 24px', textAlign: 'center', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', color: '#fff' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>📝</div>
                <h2 style={{ fontWeight: 800 }}>สมัครสมาชิก</h2>
                <p style={{ opacity: .8, fontSize: 14 }}>สร้างบัญชีใหม่ฟรี!</p>
              </div>
              <div className="card-body">
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="form-label">ชื่อผู้ใช้งาน</label>
                    <input name="username" className="form-input" placeholder="Username" required />
                  </div>
                  <div>
                    <label className="form-label">รหัสผ่าน</label>
                    <input name="password" type="password" className="form-input" placeholder="Password" required />
                  </div>
                  <div>
                    <label className="form-label">ยืนยันรหัสผ่าน</label>
                    <input name="confirmPassword" type="password" className="form-input" placeholder="Confirm Password" required />
                  </div>
                  <button type="submit" className="btn btn-success btn-lg btn-full" style={{ marginTop: 8 }}>สมัครสมาชิก</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
                  มีบัญชีอยู่แล้ว? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>เข้าสู่ระบบ</Link>
                </p>
              </div>
            </div>
          </div>
        } />

        {/* ===== หน้า Admin (หลังบ้าน) ===== */}
        <Route path="/admin" element={
          isLoggedIn && userRole === 'admin' ? (
            <div style={{ padding: '24px 20px', maxWidth: 1400, margin: '0 auto' }}>

              {/* Header Admin */}
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontWeight: 900, fontSize: 28, color: 'var(--text)' }}>
                  {adminTab === 'report' && '📊 รายงาน & สถิติ'}
                  {adminTab === 'add'    && '➕ เพิ่ม/แก้ไขสินค้า'}
                  {adminTab === 'stock'  && '📦 จัดการสต็อก'}
                  {adminTab === 'orders' && '🧾 รายการสั่งซื้อ'}
                  {adminTab === 'users'  && '👥 จัดการผู้ใช้'}
                </h1>
                {/* Tab Switcher แบบ pill — ทางลัด */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                  {[
                    { tab: 'report', icon: '📊', label: 'รายงาน' },
                    { tab: 'add',    icon: '➕', label: 'สินค้า' },
                    { tab: 'stock',  icon: '📦', label: 'สต็อก' },
                    { tab: 'orders', icon: '🧾', label: 'ออเดอร์' },
                    { tab: 'users',  icon: '👥', label: 'ผู้ใช้' },
                  ].map(t => (
                    <button key={t.tab} onClick={() => setAdminTab(t.tab)} className="btn btn-sm"
                      style={{ background: adminTab === t.tab ? 'var(--primary)' : 'var(--surface)', color: adminTab === t.tab ? '#fff' : 'var(--text)', boxShadow: 'var(--shadow-sm)', border: 'none' }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* === Tab: Dashboard / Report === */}
              {adminTab === 'report' && (
                <div className="fade-in">
                  {/* Stat Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                    {[
                      { icon: '💰', label: 'ยอดขายรวม', value: `฿${totalSales.toLocaleString()}`, color: '#00C897', textColor: '#00C897' },
                      { icon: '⏳', label: 'รอดำเนินการ', value: pendingOrders, color: '#FFB020', textColor: '#FFB020' },
                      { icon: '✅', label: 'จัดส่งแล้ว', value: completedOrders, color: '#6C63FF', textColor: '#6C63FF' },
                      { icon: '👥', label: 'ลูกค้า', value: totalUsersCount, color: '#FF6584', textColor: '#FF6584' },
                      { icon: '❌', label: 'ยกเลิก', value: cancelledOrders, color: '#FF4757', textColor: '#FF4757' },
                      { icon: '📦', label: 'สินค้าทั้งหมด', value: products.length, color: '#0AB4E8', textColor: '#0AB4E8' },
                    ].map((s, i) => (
                      <div key={i} className="stat-card" style={{ borderLeftColor: s.color }}>
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-value" style={{ color: s.textColor }}>{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* กราฟยอดขาย */}
                  <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-body">
                      <h3 style={{ fontWeight: 700, marginBottom: 20 }}>📈 ยอดขายรายวัน (14 วันล่าสุด)</h3>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <BarChart data={salesChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F9" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,.1)' }} />
                            <Legend />
                            <Bar dataKey="ยอดขาย" fill="#6C63FF" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="จำนวนออเดอร์" fill="#FF6584" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === Tab: เพิ่ม/แก้ไขสินค้า === */}
              {adminTab === 'add' && (
                <div className="card fade-in">
                  <div className="card-body">
                    <h3 style={{ fontWeight: 700, marginBottom: 20 }}>
                      {editingProduct ? `✏️ แก้ไขสินค้า: ${editingProduct.name}` : '➕ เพิ่มสินค้าใหม่'}
                    </h3>
                    {editingProduct && (
                      <div style={{ padding: '12px 16px', background: '#FFF3DC', borderRadius: 'var(--radius-sm)', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#CC8800', fontWeight: 600, fontSize: 14 }}>⚠️ กำลังแก้ไขสินค้าที่มีอยู่</span>
                        <button onClick={() => setEditingProduct(null)} className="btn btn-sm" style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none' }}>ยกเลิก</button>
                      </div>
                    )}
                    <form onSubmit={addOrUpdateProduct}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                        <div>
                          <label className="form-label">ชื่อสินค้า *</label>
                          <input name="name" className="form-input" placeholder="ชื่อสินค้า" defaultValue={editingProduct?.name || ''} required />
                        </div>
                        <div>
                          <label className="form-label">หมวดหมู่ *</label>
                          <input name="category" className="form-input" placeholder="เช่น อิเล็กทรอนิกส์" defaultValue={editingProduct?.category || ''} required />
                        </div>
                        <div>
                          <label className="form-label">ราคา (บาท) *</label>
                          <input name="price" type="number" className="form-input" placeholder="0.00" defaultValue={editingProduct?.price || ''} required />
                        </div>
                        <div>
                          <label className="form-label">จำนวนสต็อก *</label>
                          <input name="stock" type="number" className="form-input" placeholder="0" defaultValue={editingProduct?.stock || 0} required />
                        </div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label className="form-label">รายละเอียดสินค้า</label>
                        <textarea name="desc" className="form-input" rows={3} placeholder="อธิบายสินค้า..." defaultValue={editingProduct?.description || ''} style={{ resize: 'vertical' }} />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label className="form-label">รูปภาพสินค้า</label>
                        {editingProduct?.image && <img src={editingProduct.image} alt="current" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8, display: 'block' }} />}
                        <input name="image" type="file" onChange={e => setFile(e.target.files[0])} accept="image/*" style={{ fontSize: 14 }} />
                      </div>
                      <button type="submit" className="btn btn-primary btn-lg">💾 {editingProduct ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</button>
                    </form>
                  </div>
                </div>
              )}

              {/* === Tab: จัดการสต็อก === */}
              {adminTab === 'stock' && (
                <div className="card fade-in">
                  <div className="card-body" style={{ padding: 0 }}>
                    <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontWeight: 700 }}>📦 รายการสินค้าทั้งหมด ({products.length} รายการ)</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>สินค้า</th>
                            <th>ราคา</th>
                            <th>สต็อก</th>
                            <th>หมวดหมู่</th>
                            <th>จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(p => (
                            <tr key={p.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  {p.image && <img src={p.image} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />}
                                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                                </div>
                              </td>
                              <td style={{ fontWeight: 700, color: 'var(--danger)' }}>฿{Number(p.price).toLocaleString()}</td>
                              <td>
                                <span className={`badge ${p.stock > 10 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                                  {p.stock} ชิ้น
                                </span>
                              </td>
                              <td><span className="badge badge-purple">{p.category}</span></td>
                              <td>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => { setEditingProduct(p); setAdminTab('add'); }} className="btn btn-warning btn-sm">✏️ แก้ไข</button>
                                  <button onClick={() => deleteProduct(p.id)} className="btn btn-danger btn-sm">🗑️ ลบ</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* === Tab: รายการสั่งซื้อ === */}
              {adminTab === 'orders' && (
                <div className="fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                    <h3 style={{ fontWeight: 700 }}>🧾 รายการสั่งซื้อทั้งหมด ({orders.length} รายการ)</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={exportToExcel} className="btn btn-success btn-sm">📊 Export Excel</button>
                      <button onClick={exportToPDF} className="btn btn-danger btn-sm">📄 Export PDF</button>
                    </div>
                  </div>
                  <div className="card">
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table">
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
                          {orders.map(order => (
                            <tr key={order.id}>
                              <td style={{ fontWeight: 700 }}>#{order.id}</td>
                              <td>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>📍 {order.address || '-'}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>📞 {order.phone || '-'}</div>
                              </td>
                              <td style={{ fontWeight: 700, color: 'var(--danger)' }}>฿{Number(order.total_price).toLocaleString()}</td>
                              <td>
                                {order.slip_image
                                  ? <button onClick={() => window.open(order.slip_image, '_blank')} className="btn btn-sm" style={{ background: '#9b59b6', color: '#fff', border: 'none' }}>🖼️ ดูสลิป</button>
                                  : <span style={{ color: 'var(--text-light)', fontSize: 13 }}>ยังไม่มี</span>
                                }
                              </td>
                              <td>
                                <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)}
                                  style={{
                                    padding: '6px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                                    fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
                                    background: order.status === 'จัดส่งแล้ว' ? '#DCFFF4' : order.status === 'ยกเลิก' ? '#FFECEE' : '#FFF3DC',
                                    color: order.status === 'จัดส่งแล้ว' ? '#00A87A' : order.status === 'ยกเลิก' ? '#CC2233' : '#CC8800'
                                  }}>
                                  {['รอดำเนินการ', 'ชำระเงินแล้ว', 'กำลังจัดส่ง', 'จัดส่งแล้ว', 'ยกเลิก'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </td>
                              <td>
                                <button onClick={() => generatePDF(order)} className="btn btn-sm" style={{ background: '#34495e', color: '#fff', border: 'none' }}>🖨️ บิล</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* === Tab: จัดการผู้ใช้ === */}
              {adminTab === 'users' && (
                <div className="fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontWeight: 700 }}>👥 ผู้ใช้งานทั้งหมด ({users.length} บัญชี)</h3>
                    <button onClick={fetchUsers} className="btn btn-sm btn-ghost">🔄 รีเฟรช</button>
                  </div>
                  <div className="card">
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>ข้อมูลผู้ใช้</th>
                            <th>สิทธิ์</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.length > 0 ? users.map((user, i) => (
                            <tr key={user.id || i}>
                              <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{user.id}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                    {user.profile_picture
                                      ? <img src={user.profile_picture} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                      : '👤'
                                    }
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 700 }}>{user.username || 'ไม่ระบุ'}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email || '—'}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <select value={user.role || 'customer'} onChange={e => updateUser(user.id, { role: e.target.value, status: user.status })}
                                  style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #E4E7F0', background: user.role === 'admin' ? '#FFF3DC' : 'var(--surface)', fontFamily: 'inherit', cursor: 'pointer' }}>
                                  <option value="customer">👤 Customer</option>
                                  <option value="admin">🔑 Admin</option>
                                </select>
                              </td>
                              <td>
                                <span className={`badge ${user.status === 'suspended' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: 12 }}>
                                  {user.status === 'suspended' ? '🚫 ถูกระงับ' : '✅ ปกติ'}
                                </span>
                              </td>
                              <td>
                                <button
                                  onClick={() => {
                                    const ns = user.status === 'active' ? 'suspended' : 'active';
                                    if (window.confirm(`${ns === 'suspended' ? 'ระงับ' : 'ปลดระงับ'} บัญชี ${user.username}?`)) updateUser(user.id, { role: user.role, status: ns });
                                  }}
                                  className="btn btn-sm"
                                  style={{ background: user.status === 'active' ? 'var(--danger)' : 'var(--success)', color: '#fff', border: 'none' }}>
                                  {user.status === 'active' ? '🚫 ระงับ' : '✅ ปลดระงับ'}
                                </button>
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>ไม่พบข้อมูลผู้ใช้</td></tr>
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