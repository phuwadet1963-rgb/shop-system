// ============================================================
// App.jsx — IBIG SHOP  (ตกแต่งใหม่ทันสมัย, รองรับมือถือ)
// ⚡ ทุกฟังก์ชันเหมือนเดิม 100% เปลี่ยนแค่ style
// ธีม: Dark Premium — ดำ/เทา/ทอง ตามภาพ Hero หน้าแรก
// ============================================================

import { useEffect, useState } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fontBase64 } from './ThaiFont';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API_URL from './config';
import heroBg from './assets/1.webp'

// ============================================================
// 🎨 CSS GLOBAL — ธีม Dark Premium + Responsive Mobile
// ใส่ไว้ที่นี่เพื่อให้ทุก component ใช้ได้
// ============================================================
const GlobalStyles = () => (
  <style>{`
    /* ── CSS Variables (สีหลักทั้งหมดของธีม) ────────────── */
    :root {
      --bg:        #0f0f1a;        /* พื้นหลังหลัก: ดำน้ำเงินเข้ม */
      --surface:   #1a1a2e;        /* พื้นหลัง card: ดำน้ำเงิน */
      --surface2:  #16213e;        /* พื้นหลัง card ชั้น 2 */
      --border:    rgba(255,255,255,0.08);  /* เส้นขอบบางๆ */
      --text:      #f0f0f0;        /* ข้อความหลัก: ขาวนวล */
      --text-muted:#8892a4;        /* ข้อความรอง: เทา */
      --gold:      #d4a843;        /* สีทอง (accent หลัก) */
      --gold-light:#f5c842;        /* ทองสว่างสำหรับ hover */
      --accent:    #e05252;        /* แดงสำหรับราคา/alert */
      --green:     #2ecc71;        /* เขียวสำหรับสต็อก/success */
      --blue:      #3b82f6;        /* น้ำเงินสำหรับปุ่มทั่วไป */
      --radius:    12px;           /* ความโค้งมน */
      --shadow:    0 8px 32px rgba(0,0,0,0.4);
    }

    /* ── Reset & Base ─────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Sarabun', 'Noto Sans Thai', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Scrollbar ────────────────────────────────────────── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 3px; }

    /* ── ปุ่มหลัก (btn-primary) ───────────────────────────── */
    .btn-primary {
      background: linear-gradient(135deg, var(--gold), #b8860b);
      color: #0f0f1a !important;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, var(--gold-light), var(--gold));
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(212,168,67,0.4);
    }

    /* ── ปุ่มรอง (btn-ghost) ──────────────────────────────── */
    .btn-ghost {
      background: rgba(255,255,255,0.06);
      color: var(--text) !important;
      border: 1px solid var(--border) !important;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-ghost:hover {
      background: rgba(255,255,255,0.12);
      border-color: var(--gold) !important;
      color: var(--gold) !important;
    }

    /* ── Card ─────────────────────────────────────────────── */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    /* ── Input / Select / Textarea ────────────────────────── */
    .input-dark {
      background: rgba(255,255,255,0.06);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      padding: 10px 14px;
      width: 100%;
      font-family: inherit;
      font-size: 15px;
      transition: border-color 0.2s;
      outline: none;
    }
    .input-dark::placeholder { color: var(--text-muted); }
    .input-dark:focus { border-color: var(--gold); background: rgba(212,168,67,0.05); }

    /* ── Sidebar ──────────────────────────────────────────── */
    .sidebar {
      background: #11111e !important;
      border-right: 1px solid var(--border);
    }
    /* เมนูใน Sidebar */
    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 15px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-muted);
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
    }
    .sidebar-link:hover, .sidebar-link.active {
      background: rgba(212,168,67,0.12);
      color: var(--gold);
    }

    /* ── Product Card ─────────────────────────────────────── */
    /* กริดสินค้า: 4 คอลัมน์ desktop, 2 คอลัมน์ mobile */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 20px;
      padding: 0 24px 40px;
      margin-top: 30px;
    }
    .product-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--gold);
      border-color: var(--gold);
    }
    .product-card img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      display: block;
    }

    /* ── Badge ────────────────────────────────────────────── */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }
    .badge-gold  { background: rgba(212,168,67,0.15); color: var(--gold); border: 1px solid rgba(212,168,67,0.3); }
    .badge-green { background: rgba(46,204,113,0.15); color: #2ecc71; border: 1px solid rgba(46,204,113,0.3); }
    .badge-red   { background: rgba(224,82,82,0.15);  color: #e05252; border: 1px solid rgba(224,82,82,0.3); }
    .badge-blue  { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }

    /* ── Table ────────────────────────────────────────────── */
    .dark-table { width: 100%; border-collapse: collapse; }
    .dark-table thead tr {
      background: linear-gradient(135deg, #1e2a3a, #16213e);
      color: var(--text-muted);
      font-size: 13px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .dark-table th { padding: 14px 16px; text-align: left; font-weight: 600; }
    .dark-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; }
    .dark-table tbody tr { transition: background 0.15s; }
    .dark-table tbody tr:hover { background: rgba(255,255,255,0.03); }

    /* ── Animations ───────────────────────────────────────── */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%,100% { transform: scale(1); }
      50%      { transform: scale(1.12); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    .fade-in { animation: fadeIn 0.35s ease forwards; }

    /* ── Modal Overlay ────────────────────────────────────── */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.75);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
      padding: 16px;
    }
    .modal-box {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 30px;
      width: 100%;
      max-width: 460px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.6);
      animation: fadeIn 0.25s ease;
    }

    /* ── Admin Tab Buttons ────────────────────────────────── */
    .admin-tab-btn {
      width: 100%;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 14px;
      background: transparent;
      color: var(--text-muted);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 4px;
      transition: all 0.2s;
    }
    .admin-tab-btn:hover { background: rgba(212,168,67,0.08); color: var(--gold); }
    .admin-tab-btn.active { background: rgba(212,168,67,0.15); color: var(--gold); }

    /* ── Status Badge สำหรับออเดอร์ ──────────────────────── */
    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    /* ── Form Label ───────────────────────────────────────── */
    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 6px;
      letter-spacing: 0.3px;
    }

    /* ── Section Heading ──────────────────────────────────── */
    .section-heading {
      font-size: 20px;
      font-weight: 800;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
    }
    .section-heading::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    /* ── Responsive: Mobile ───────────────────────────────── */
    @media (max-width: 768px) {
      /* กริดสินค้า 2 คอลัมน์ */
      .product-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 12px !important;
        padding: 0 12px 24px !important;
      }
      .product-card img { height: 44vw !important; }
      .product-card h3 { font-size: 13px !important; }
      .product-card .price { font-size: 14px !important; }
      .product-card .stock { font-size: 11px !important; }
      /* ปุ่มในการ์ดบนมือถือ: เรียงแนวตั้ง */
      .product-card .btn-group { flex-direction: column !important; gap: 6px !important; }

      /* ซ่อน sidebar header text บนมือถือ */
      .nav-brand-text { font-size: 16px !important; }

      /* Admin table scroll ซ้ายขวาได้ */
      .admin-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    }
  `}</style>
);

// ============================================================
// 📄 ProductDetailPage — หน้ารายละเอียดสินค้า
// ฟังก์ชันเหมือนเดิม เปลี่ยนแค่ layout ให้ดูดีขึ้น
// ============================================================
function ProductDetailPage({ products, addToCart, productReviews, fetchProductReviews }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find(p => p.id === Number(id));

  // 🔄 ดึงรีวิวทันทีที่เข้าหน้านี้ หรือเมื่อ ID สินค้าเปลี่ยน
  useEffect(() => {
    if (id) fetchProductReviews(id);
  }, [id, fetchProductReviews]);

  // กำลังโหลดหรือไม่พบสินค้า
  if (!product) return (
    <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '60px', marginBottom: '16px' }}>🔍</div>
      <h3 style={{ color: 'var(--text)', marginBottom: '12px' }}>กำลังโหลด... หรือไม่พบสินค้านี้</h3>
      <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '10px 24px' }}>
        ← กลับหน้าแรก
      </button>
    </div>
  );

  return (
    <div style={{ padding: '30px 20px', maxWidth: '1000px', margin: '0 auto' }} className="fade-in">

      {/* ── ปุ่มย้อนกลับ ── */}
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        ← กลับ
      </button>

      {/* ── Card หลัก: รูป + รายละเอียด ── */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '0', overflow: 'hidden' }}>

        {/* ฝั่งซ้าย: รูปสินค้า */}
        <div style={{ flex: '1 1 380px', minHeight: '340px', background: 'var(--surface2)' }}>
          {product.image ? (
            <img
              src={product.image} alt={product.name}
              style={{ width: '100%', height: '100%', minHeight: '340px', objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
            />
          ) : (
            <div style={{ width: '100%', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>
              📦
            </div>
          )}
        </div>

        {/* ฝั่งขวา: รายละเอียด */}
        <div style={{ flex: '1 1 340px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* หมวดหมู่ */}
          <span className="badge badge-gold" style={{ alignSelf: 'flex-start' }}>
            🏷️ {product.category || 'ไม่ระบุ'}
          </span>

          {/* ชื่อสินค้า */}
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '800', lineHeight: '1.3', color: 'var(--text)' }}>
            {product.name}
          </h1>

          {/* ราคา */}
          <div style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: '900', color: 'var(--gold)' }}>
            ฿{Number(product.price).toLocaleString()}
          </div>

          {/* รายละเอียด */}
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <p style={{ margin: 0, lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '14px' }}>
              {product.description || 'ไม่มีรายละเอียดสินค้า'}
            </p>
          </div>

          {/* สต็อก */}
          <p style={{ color: product.stock > 0 ? 'var(--green)' : 'var(--accent)', fontWeight: '700', fontSize: '15px' }}>
            📦 {product.stock > 0 ? `มีสินค้าพร้อมส่ง (${product.stock} ชิ้น)` : 'สินค้าหมดชั่วคราว'}
          </p>

          {/* ปุ่มหยิบใส่ตะกร้า */}
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
            className={product.stock > 0 ? 'btn-primary' : ''}
            style={{
              marginTop: 'auto',
              padding: '15px',
              fontSize: '17px',
              fontWeight: '700',
              borderRadius: '10px',
              border: 'none',
              cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
              background: product.stock > 0 ? undefined : 'rgba(255,255,255,0.08)',
              color: product.stock > 0 ? undefined : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            {product.stock > 0 ? '🛒 หยิบใส่ตะกร้า' : '❌ สินค้าหมด'}
          </button>
        </div>
      </div>

      {/* ── ส่วนรีวิวจากลูกค้า ── */}
      <div className="card" style={{ marginTop: '24px', padding: '28px' }}>
        <h3 className="section-heading">💬 รีวิวจากลูกค้า ({productReviews.length})</h3>

        {productReviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
            ยังไม่มีรีวิวสำหรับสินค้านี้
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {productReviews.map((rev) => (
              <div key={rev.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text)' }}>👤 {rev.username}</strong>
                  <span style={{ color: '#f1c40f', fontSize: '16px' }}>{'⭐'.repeat(rev.rating)}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 6px' }}>{rev.comment}</p>
                <small style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                  🗓️ {new Date(rev.created_at).toLocaleDateString('th-TH')}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 👤 ProfilePage — หน้าข้อมูลโปรไฟล์ลูกค้า
// ฟังก์ชันเหมือนเดิม ออกแบบใหม่ให้ทันสมัย
// ============================================================
function ProfilePage({ userId }) {
  const [profile, setProfile] = useState({ username: '', email: '', address: '', phone: '', profile_picture: '', password: '' });
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  // โหลดข้อมูลโปรไฟล์เมื่อเปิดหน้า
  useEffect(() => {
    if (userId) {
      axios.get(`${API_URL}/users/${userId}`)
        .then(res => setProfile({ ...res.data, password: '' }))
        .catch(err => console.error("ดึงข้อมูลไม่สำเร็จ", err));
    }
  }, [userId]);

  // ฟังก์ชันบันทึกโปรไฟล์ (ส่ง FormData รองรับ upload รูป)
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', profile.username || '');
    formData.append('email', profile.email || '');
    formData.append('address', profile.address || '');
    formData.append('phone', profile.phone || '');
    formData.append('password', profile.password || '');
    if (file) formData.append('profile_picture', file);

    axios.put(`${API_URL}/users/${userId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => { alert('✅ บันทึกข้อมูลโปรไฟล์เรียบร้อย!'); window.location.reload(); })
      .catch(() => alert('❌ เกิดข้อผิดพลาดในการบันทึก'));
  };

  return (
    <div style={{ padding: '30px 16px', maxWidth: '600px', margin: '0 auto' }} className="fade-in">
      <div className="card" style={{ padding: '32px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--text)', marginBottom: '28px', fontWeight: '800', fontSize: '22px' }}>
          👤 ข้อมูลของฉัน
        </h2>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* รูปโปรไฟล์ */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{
              width: '110px', height: '110px', margin: '0 auto 12px',
              borderRadius: '50%', overflow: 'hidden',
              background: 'var(--surface2)',
              border: '3px solid var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(212,168,67,0.3)'
            }}>
              {file ? (
                <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : profile.profile_picture ? (
                <img src={profile.profile_picture} alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} />
              ) : (
                <span style={{ fontSize: '44px' }}>👤</span>
              )}
            </div>
            <label style={{
              display: 'inline-block', padding: '8px 18px',
              background: 'rgba(212,168,67,0.12)', color: 'var(--gold)',
              border: '1px solid rgba(212,168,67,0.3)',
              borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
            }}>
              📸 เปลี่ยนรูป
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
            </label>
          </div>

          {/* ชื่อผู้ใช้งาน */}
          <div>
            <label className="form-label">👤 ชื่อผู้ใช้งาน</label>
            <input type="text" required value={profile.username || ''} className="input-dark"
              onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
          </div>

          {/* อีเมล */}
          <div>
            <label className="form-label">📧 อีเมล</label>
            <input type="email" required value={profile.email || ''} className="input-dark"
              onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </div>

          {/* รหัสผ่านใหม่ */}
          <div>
            <label className="form-label" style={{ color: 'var(--accent)' }}>🔐 รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่เปลี่ยน)</label>
            <input type="password" value={profile.password || ''} className="input-dark"
              style={{ borderColor: 'rgba(224,82,82,0.3)' }}
              onChange={(e) => setProfile({ ...profile, password: e.target.value })} />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

          {/* ที่อยู่จัดส่ง */}
          <div>
            <label className="form-label">🏠 ที่อยู่จัดส่ง</label>
            <textarea rows="3" value={profile.address || ''} className="input-dark"
              style={{ resize: 'vertical' }}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
          </div>

          {/* เบอร์โทร */}
          <div>
            <label className="form-label">📞 เบอร์โทรศัพท์</label>
            <input type="text" value={profile.phone || ''} className="input-dark"
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </div>

          {/* ปุ่มบันทึก */}
          <button type="submit" className="btn-primary"
            style={{ padding: '14px', fontSize: '16px', borderRadius: '10px', marginTop: '4px' }}>
            💾 บันทึกข้อมูล
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// 📁 CategoryManagement — จัดการหมวดหมู่ (สำหรับ Admin)
// ฟังก์ชันเหมือนเดิม ออกแบบใหม่
// ============================================================
function CategoryManagement({ categories, fetchCats }) {
  const [newCatName, setNewCatName] = useState('');

  // เพิ่มหมวดหมู่ใหม่
  const handleAddCategory = async () => {
    if (!newCatName) return alert("กรุณากรอกชื่อหมวดหมู่");
    try {
      await axios.post(`${API_URL}/admin/categories`, { name: newCatName });
      setNewCatName('');
      if (fetchCats) fetchCats(); // อัปเดตรายการ
    } catch (err) { alert("เพิ่มไม่สำเร็จ"); }
  };

  // ลบหมวดหมู่
  const handleDeleteCategory = async (id) => {
    if (window.confirm("ยืนยันการลบหมวดหมู่?")) {
      try {
        await axios.delete(`${API_URL}/admin/categories/${id}`);
        if (fetchCats) fetchCats();
      } catch (err) { alert("ลบไม่สำเร็จ"); }
    }
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 className="section-heading">📁 จัดการหมวดหมู่สินค้า</h3>

      {/* Input + ปุ่มเพิ่ม */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input type="text" placeholder="ชื่อหมวดหมู่ใหม่..." value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)} className="input-dark" style={{ flex: 1 }} />
        <button onClick={handleAddCategory} className="btn-primary"
          style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>
          ➕ เพิ่ม
        </button>
      </div>

      {/* ตารางรายการหมวดหมู่ */}
      <div style={{ overflow: 'hidden', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <table className="dark-table">
          <thead>
            <tr>
              <th>ชื่อหมวดหมู่</th>
              <th style={{ textAlign: 'center', width: '100px' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {categories && categories.length > 0 ? (
              categories.map(cat => (
                <tr key={cat.id}>
                  <td style={{ color: 'var(--text)' }}>{cat.name}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleDeleteCategory(cat.id)}
                      style={{ padding: '5px 12px', background: 'rgba(224,82,82,0.15)', color: 'var(--accent)', border: '1px solid rgba(224,82,82,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                      🗑️ ลบ
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  ไม่มีข้อมูลหมวดหมู่
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// 📋 OrderDetailPage — หน้ารายละเอียดออเดอร์ (ลูกค้า)
// ฟังก์ชันเหมือนเดิม ออกแบบใหม่
// ============================================================
function OrderDetailPage({ userId }) {
  const { id } = useParams(); // ดึง order id จาก URL
  const navigate = useNavigate();
  const [orderDetail, setOrderDetail] = useState(null);
  const [items, setItems] = useState([]);

  // ดึงรายละเอียดออเดอร์จาก server
  useEffect(() => {
    axios.get(`${API_URL}/orders/${id}/items`)
      .then(res => { setOrderDetail(res.data.order); setItems(res.data.items); })
      .catch(() => alert('ไม่พบข้อมูลออเดอร์'));
  }, [id]);

  if (!orderDetail) return (
    <p style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>กำลังโหลด...</p>
  );

  return (
    <div style={{ padding: '30px 16px', maxWidth: '700px', margin: '0 auto' }} className="fade-in">

      <button onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '20px', fontSize: '15px' }}>
        ← กลับ
      </button>

      <h2 style={{ color: 'var(--text)', marginBottom: '20px', fontWeight: '800' }}>
        📋 รายละเอียดออเดอร์ #{id}
      </h2>

      {/* ข้อมูลออเดอร์ */}
      <div className="card" style={{ padding: '22px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gap: '10px' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            📅 วันที่สั่ง: <span style={{ color: 'var(--text)' }}>{new Date(orderDetail.created_at).toLocaleDateString('th-TH')}</span>
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            📦 สถานะ: <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{orderDetail.status}</span>
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            🏠 ที่อยู่จัดส่ง: <span style={{ color: 'var(--text)' }}>{orderDetail.address || 'ไม่ระบุ'}</span>
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            📞 เบอร์โทร: <span style={{ color: 'var(--text)' }}>{orderDetail.phone || 'ไม่ระบุ'}</span>
          </p>
          <p style={{ fontSize: '22px', fontWeight: '900', color: 'var(--gold)' }}>
            💰 ราคารวม: ฿{Number(orderDetail.total_price).toLocaleString()}
          </p>
        </div>
      </div>

      {/* รายการสินค้าในออเดอร์ */}
      <h3 style={{ color: 'var(--text)', marginBottom: '14px', fontWeight: '700' }}>🛍️ สินค้าในออเดอร์</h3>
      {items.map(item => (
        <div key={item.id} className="card" style={{ padding: '14px', marginBottom: '10px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <img src={item.image} alt={item.name}
            style={{ width: '68px', height: '68px', objectFit: 'cover', borderRadius: '8px', background: 'var(--surface2)' }}
            onError={e => e.target.style.display = 'none'} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text)' }}>{item.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>จำนวน: {item.quantity} ชิ้น</div>
            <div style={{ color: 'var(--gold)', fontWeight: '700', fontSize: '14px' }}>฿{item.price} / ชิ้น</div>
          </div>
          <div style={{ fontWeight: '800', color: 'var(--text)', fontSize: '15px' }}>
            ฿{(item.price * item.quantity).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 🏠 App Root + AppContent (หน้าหลัก + Routing)
// ============================================================
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const navigate = useNavigate();

  // ── State ทั้งหมด (เหมือนเดิมทุกตัว) ──────────────────────
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  // ตะกร้า: โหลดจาก localStorage เพื่อคงไว้เมื่อ refresh
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  // ซิงค์ตะกร้ากับ localStorage ทุกครั้งที่เปลี่ยน
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);

  const [showConfirmClear, setShowConfirmClear] = useState(false);
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
  const [selectedProduct, setSelectedProduct] = useState(null); // ไว้รีวิวสินค้าตัวไหน
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [allReviews, setAllReviews] = useState([]); // รีวิวทั้งหมด (admin)
  const [productReviews, setProductReviews] = useState([]); // รีวิวของสินค้าชิ้นนั้น
  const [orderSearchTerm, setOrderSearchTerm] = useState(''); // ค้นหาออเดอร์
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด'); // กรองตามสถานะ
  const [dateFilter, setDateFilter] = useState(''); // กรองตามวันที่
  const [isCategoryOpen, setIsCategoryOpen] = useState(false); // พับ/กางเมนูหมวดหมู่
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [profile, setProfile] = useState({ username: '', email: '', profile_picture: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile-first: ปิดตั้งต้น

  // ── ดึงหมวดหมู่ ────────────────────────────────────────────
  const fetchCats = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };
  useEffect(() => { fetchCats(); }, []);

  // ── โหลดสินค้า, ออเดอร์ และ polling ────────────────────────
  useEffect(() => {
    axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
    if (isLoggedIn) fetchMyOrders();
    fetchOrders();
    // Poll ออเดอร์ใหม่ทุก 5 วินาที (real-time update สำหรับ Admin)
    const orderInterval = setInterval(() => { fetchOrders(); }, 5000);
    return () => clearInterval(orderInterval);
  }, [isLoggedIn, userId]);

  // ── โหลดโปรไฟล์เมื่อ login ────────────────────────────────
  useEffect(() => {
    if (userId) {
      axios.get(`${API_URL}/users/${userId}`)
        .then(res => setProfile(res.data))
        .catch(err => console.error(err));
    }
  }, [userId]);

  // ── ดึงออเดอร์ทั้งหมด (Admin) ─────────────────────────────
  const fetchOrders = () => {
    axios.get(`${API_URL}/orders`)
      .then(res => { setOrders(res.data); })
      .catch(err => console.log("ดึงข้อมูลออเดอร์พลาด:", err));
  };

  // ── ดึงออเดอร์ของ user คนนี้ ──────────────────────────────
  const fetchMyOrders = () => {
    if (!userId) return;
    axios.get(`${API_URL}/my-orders/${userId}`)
      .then(res => setMyOrders(res.data))
      .catch(err => console.log("ดึงประวัติสั่งซื้อพลาด:", err));
  };

  // ── ดึงรีวิวของสินค้าชิ้นนั้น ─────────────────────────────
  const fetchProductReviews = async (productId) => {
    try {
      const res = await axios.get(`${API_URL}/reviews/${productId}`);
      setProductReviews(res.data);
    } catch (err) { console.error("Error fetching reviews:", err); }
  };

  // ── ดึงรีวิวทั้งหมด (Admin) ───────────────────────────────
  const fetchAdminReviews = async () => {
    try {
      const res = await axios.get('https://shop-system-backend.onrender.com/api/admin/reviews');
      setAllReviews(res.data);
    } catch (err) { console.error("ดึงข้อมูลรีวิวไม่สำเร็จ:", err); }
  };
  useEffect(() => {
    if (adminTab === 'reviews') fetchAdminReviews();
  }, [adminTab]);

  // ── ลบรีวิว (Admin) ───────────────────────────────────────
  const deleteReview = async (id) => {
    try {
      await axios.delete(`https://shop-system-backend.onrender.com/api/admin/reviews/${id}`);
      alert("ลบรีวิวเรียบร้อยแล้ว");
      fetchAdminReviews();
    } catch (err) { alert("ลบไม่สำเร็จ"); }
  };

  // ── Export Excel ───────────────────────────────────────────
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "ยอดขายทั้งหมด");
    XLSX.writeFile(workbook, "BIG_SHOP_Sales_Report.xlsx");
  };

  // ── Export PDF (รายงานยอดขาย) ─────────────────────────────
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
      tableRows.push([`#${order.id}`, order.items_count, order.total_price, new Date(order.created_at).toLocaleString('th-TH'), order.status]);
    });
    autoTable(doc, {
      startY: 30, head: [tableColumn], body: tableRows,
      styles: { font: 'ThaiFont', fontSize: 14 },
      headStyles: { fillColor: [44, 62, 80], font: 'ThaiFont', fontStyle: 'normal' }
    });
    doc.save("BIG_SHOP_Sales_Report.pdf");
  };

  // ── ลบประวัติออเดอร์ ───────────────────────────────────────
  const deleteOrderHistory = (orderId) => {
    if (window.confirm("คุณต้องการลบประวัติการสั่งซื้อนี้ทิ้งใช่หรือไม่?")) {
      axios.delete(`${API_URL}/orders/${orderId}`)
        .then(() => { alert("🗑️ ลบประวัติการสั่งซื้อเรียบร้อยแล้ว"); fetchMyOrders(); fetchOrders(); })
        .catch(err => alert("❌ ไม่สามารถลบได้"));
    }
  };

  // ── ยกเลิกออเดอร์ ─────────────────────────────────────────
  const cancelOrder = (orderId) => {
    if (window.confirm("คุณต้องการยกเลิกออเดอร์นี้ใช่หรือไม่?")) {
      axios.delete(`${API_URL}/orders/${orderId}`)
        .then(() => { alert("ยกเลิกออเดอร์เรียบร้อยแล้ว"); fetchMyOrders(); })
        .catch(err => alert("ไม่สามารถยกเลิกได้"));
    }
  };

  // ── Filter ออเดอร์ (Admin) ─────────────────────────────────
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(orderSearchTerm) ||
      (order.address && order.address.toLowerCase().includes(orderSearchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ทั้งหมด' || order.status === statusFilter;
    const matchesDate = !dateFilter || (order.created_at && order.created_at.startsWith(dateFilter));
    return matchesSearch && matchesStatus && matchesDate;
  });

  // ── สร้าง PDF ใบเสร็จรายออเดอร์ ───────────────────────────
  const generatePDF = async (order) => {
    try {
      const res = await axios.get(`${API_URL}/orders/${order.id}/items`);
      const items = res.data;
      const doc = new jsPDF();
      doc.addFileToVFS("THSarabunNew.ttf", fontBase64);
      doc.addFont("THSarabunNew.ttf", "ThaiFont", "normal");
      doc.setFont("ThaiFont", "normal");
      doc.setFontSize(26); doc.text("BIG SHOP", 105, 20, { align: "center" });
      doc.setFontSize(16); doc.text("ใบเสร็จรับเงิน / Receipt", 105, 28, { align: "center" });
      doc.setLineWidth(0.5); doc.line(15, 32, 195, 32);
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
      doc.setFontSize(14); doc.setTextColor(100);
      doc.text("ขอบคุณที่ใช้บริการ BIG SHOP", 105, finalY + 15, { align: "center" });
      window.open(doc.output('bloburl'), '_blank');
    } catch (err) { alert("❌ เกิดข้อผิดพลาดในการดึงข้อมูลใบเสร็จ"); }
  };

  // ── อัปเดตสถานะออเดอร์ (Admin) ────────────────────────────
  const updateOrderStatus = (orderId, newStatus) => {
    let trackingNum = null;
    let transport = null;
    // ถ้าเลือก "จัดส่งแล้ว" จะถามข้อมูลขนส่งเพิ่ม
    if (newStatus === "จัดส่งแล้ว") {
      transport = prompt("ระบุบริษัทขนส่ง (เช่น Kerry, Flash, ไปรษณีย์ไทย):");
      trackingNum = prompt("ระบุเลขพัสดุ:");
      if (!transport || !trackingNum) { alert("❌ ต้องระบุข้อมูลการส่งให้ครบถ้วน!"); return; }
    }
    axios.put(`${API_URL}/orders/${orderId}`, { status: newStatus, tracking_number: trackingNum, shipping_company: transport })
      .then(() => { alert("✅ อัปเดตสถานะเป็น: " + newStatus); fetchOrders(); axios.get(`${API_URL}/products`).then(res => setProducts(res.data)); })
      .catch(err => alert("อัปเดตพลาด: " + err));
  };

  // ── Login ──────────────────────────────────────────────────
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

  // ── Register ───────────────────────────────────────────────
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

  // ── ตะกร้า: flatCart (ใช้ส่ง order) ──────────────────────
  const flatCart = [];
  cart.forEach(item => { for (let i = 0; i < item.qty; i++) flatCart.push(item); });

  // เพิ่มสินค้าลงตะกร้า (เช็คสต็อก)
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.qty >= product.stock) { alert(`⚠️ สินค้านี้มีสต็อกจำกัดเพียง ${product.stock} ชิ้นครับ`); return prevCart; }
        return prevCart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        return [...prevCart, { ...product, qty: 1 }];
      }
    });
    alert(`🛒 เพิ่ม "${product.name}" ลงตะกร้าแล้ว!`);
  };

  // เปลี่ยนจำนวนสินค้าในตะกร้า
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

  const clearCart = () => setShowConfirmClear(true); // เปิด popup ยืนยัน
  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  // ── Checkout (สร้างออเดอร์) ────────────────────────────────
  const checkout = () => {
    if (cart.length === 0) return alert("ตะกร้าว่างเปล่า!");
    const orderData = { total_price: calculateTotal(), items_count: flatCart.length, user_id: userId, cartItems: flatCart };
    axios.post(`${API_URL}/orders`, orderData)
      .then(res => { setCurrentOrderId(res.data.orderId); setShowPayModal(true); fetchMyOrders(); })
      .catch(() => alert("สั่งซื้อไม่สำเร็จ"));
  };

  // ── ส่งหลักฐานการชำระเงิน ─────────────────────────────────
  const handlePayment = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('address', address);
    formData.append('phone', phone);
    formData.append('slip', slipFile);
    axios.put(`${API_URL}/orders/pay/${currentOrderId}`, formData)
      .then(() => {
        alert("ส่งหลักฐานเรียบร้อย! รอแอดมินตรวจสอบนะครับ");
        setCart([]); localStorage.removeItem('cart');
        setShowPayModal(false); fetchMyOrders(); navigate('/my-orders');
      })
      .catch(err => alert("เกิดข้อผิดพลาดในการส่งหลักฐาน"));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

  // ── ลบสินค้า (Admin) ──────────────────────────────────────
  const deleteProduct = (id) => {
    if (window.confirm("คุณแน่ใจนะว่าจะลบ?")) {
      axios.delete(`${API_URL}/products/${id}`)
        .then(() => { alert("ลบเรียบร้อย!"); axios.get(`${API_URL}/products`).then(res => setProducts(res.data)); });
    }
  };

  const selectToEdit = (product) => { setEditingProduct(product); };

  // ── ดึง Users (Admin) ──────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      if (Array.isArray(response.data)) setUsers(response.data);
    } catch (error) { console.error('Fetch users error:', error); }
  };
  // โหลด users เมื่อเปิด tab users
  useEffect(() => {
    if (adminTab === 'users') fetchUsers();
  }, [adminTab]);

  // ── อัปเดต User (Admin) ────────────────────────────────────
  const updateUser = async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/special-admin-update/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.status === 200) { await fetchUsers(); alert("✅ อัปเดตข้อมูลเรียบร้อยครับบิ๊ก"); }
    } catch (error) { console.error("Update Error:", error); alert("❌ อัปเดตไม่สำเร็จ: " + error.message); }
  };

  // ── เพิ่ม/แก้ไขสินค้า (Admin) ─────────────────────────────
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

  // ── สถิติ Admin Dashboard ──────────────────────────────────
  const totalSales = orders.filter(o => o.status === 'ชำระเงินแล้ว' || o.status === 'จัดส่งแล้ว').reduce((sum, o) => sum + Number(o.total_price), 0);
  const pendingOrders = orders.filter(o => o.status === 'รอดำเนินการ').length;
  const completedOrders = orders.filter(o => o.status === 'จัดส่งแล้ว').length;
  const totalUsers = [...new Set(orders.map(o => o.user_id))].length;

  // ── Filter สินค้า (ค้นหา + หมวดหมู่) ──────────────────────
  const filteredProducts = products.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
    return matchSearch && (selectedCategory === 'ทั้งหมด' ? true : matchCategory);
  });

  // ── Logout ─────────────────────────────────────────────────
  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false); setUserRole('user'); setIsSidebarOpen(false);
    navigate('/login');
  };

  // ── Helper: สีของ status badge ────────────────────────────
  const getStatusStyle = (status) => {
    switch (status) {
      case 'จัดส่งแล้ว':   return { background: 'rgba(46,204,113,0.15)', color: '#2ecc71', border: '1px solid rgba(46,204,113,0.3)' };
      case 'กำลังจัดส่ง': return { background: 'rgba(155,89,182,0.15)', color: '#a78bfa', border: '1px solid rgba(155,89,182,0.3)' };
      case 'ชำระเงินแล้ว': return { background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' };
      case 'ยกเลิก':       return { background: 'rgba(224,82,82,0.15)', color: '#e05252', border: '1px solid rgba(224,82,82,0.3)' };
      default:              return { background: 'rgba(212,168,67,0.15)', color: 'var(--gold)', border: '1px solid rgba(212,168,67,0.3)' };
    }
  };

  // ─────────────────────────────────────────────────────────
  // 🎨 RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Sarabun','Noto Sans Thai',sans-serif", backgroundColor: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      {/* ── Global CSS ── */}
      <GlobalStyles />

      {/* ════════════════════════════════════════════════════════
          💰 Modal: แจ้งชำระเงิน
          ════════════════════════════════════════════════════════ */}
      {showPayModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '480px' }}>
            <h2 style={{ textAlign: 'center', color: 'var(--green)', marginBottom: '6px', fontWeight: '800' }}>
              💰 แจ้งชำระเงิน
            </h2>
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              ออเดอร์ #{currentOrderId} • โอนมาที่: <strong style={{ color: 'var(--gold)' }}>ธนาคารกสิกรไทย 000-0-00000-0</strong>
            </p>

            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">🏠 ที่อยู่จัดส่ง</label>
                <textarea required rows="3" value={address} onChange={(e) => setAddress(e.target.value)}
                  onFocus={() => { if (!address && profile.address) setAddress(profile.address); }}
                  className="input-dark" style={{ resize: 'vertical' }}
                  placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด..." />
              </div>
              <div>
                <label className="form-label">📞 เบอร์โทรศัพท์</label>
                <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => { if (!phone && profile.phone) setPhone(profile.phone); }}
                  className="input-dark" placeholder="08x-xxx-xxxx" />
              </div>
              <div>
                <label className="form-label">📸 อัปโหลดสลิปโอนเงิน</label>
                <input type="file" accept="image/*" required className="input-dark"
                  onChange={(e) => setSlipFile(e.target.files[0])} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowPayModal(false)}
                  style={{ flex: 1, padding: '13px', background: 'rgba(224,82,82,0.15)', color: 'var(--accent)', border: '1px solid rgba(224,82,82,0.3)', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>
                  ❌ ยกเลิก
                </button>
                <button type="submit" className="btn-primary"
                  style={{ flex: 1, padding: '13px', fontSize: '15px', borderRadius: '10px' }}>
                  ✅ ยืนยันชำระเงิน
                </button>
              </div>
              <button type="button" onClick={() => setShowPayModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>
                ไว้ทำทีหลัง (ไปที่หน้าประวัติสั่งซื้อ)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ⭐ Modal: รีวิวสินค้า
          ════════════════════════════════════════════════════════ */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 style={{ textAlign: 'center', color: 'var(--gold)', marginBottom: '20px', fontWeight: '800' }}>
              ⭐ รีวิวสินค้า
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">คะแนนความพึงพอใจ</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)} className="input-dark">
                <option value="5">⭐⭐⭐⭐⭐ (ดีมาก)</option>
                <option value="4">⭐⭐⭐⭐ (ดี)</option>
                <option value="3">⭐⭐⭐ (ปานกลาง)</option>
                <option value="2">⭐⭐ (พอใช้)</option>
                <option value="1">⭐ (ควรปรับปรุง)</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">ความคิดเห็น</label>
              <textarea placeholder="เขียนรีวิวของคุณที่นี่..."
                style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowReviewModal(false)}
                className="btn-ghost" style={{ flex: 1, padding: '11px' }}>
                ยกเลิก
              </button>
              <button onClick={async () => {
                try {
                  if (!selectedProduct) return alert("ไม่พบรหัสสินค้า");
                  await axios.post(`https://shop-system-backend.onrender.com/api/reviews`, {
                    product_id: selectedProduct, user_id: userId, rating: rating, comment: comment
                  });
                  alert("✅ ขอบคุณสำหรับรีวิวครับ!");
                  setShowReviewModal(false); setComment(""); setRating(5);
                } catch (err) { console.error(err); alert("❌ รีวิวไม่สำเร็จ กรุณาลองใหม่"); }
              }} className="btn-primary" style={{ flex: 1, padding: '11px' }}>
                ส่งรีวิว ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          🗑️ Modal: ยืนยันล้างตะกร้า
          ════════════════════════════════════════════════════════ */}
      {showConfirmClear && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>🗑️</div>
            <h2 style={{ color: 'var(--accent)', marginBottom: '8px', fontWeight: '800' }}>
              ยืนยันการล้างตะกร้า
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
              สินค้า <strong style={{ color: 'var(--text)' }}>{cart.length} รายการ</strong> จะถูกลบออกทั้งหมด<br />ไม่สามารถย้อนกลับได้
            </p>

            {/* แสดงรายการในตะกร้า */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', marginBottom: '20px', maxHeight: '140px', overflowY: 'auto', textAlign: 'left' }}>
              {cart.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <span>• {item.name}</span>
                  <span style={{ color: 'var(--accent)' }}>x{item.quantity}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowConfirmClear(false)}
                className="btn-ghost" style={{ flex: 1, padding: '12px' }}>
                ยกเลิก
              </button>
              <button onClick={() => { setCart([]); setShowConfirmClear(false); }}
                style={{ flex: 1, padding: '12px', background: 'rgba(224,82,82,0.15)', color: 'var(--accent)', border: '1px solid rgba(224,82,82,0.3)', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>
                ล้างตะกร้า 🗑️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          🧭 Navbar (Sticky Top)
          ════════════════════════════════════════════════════════ */}
      <nav style={{
        background: 'rgba(15,15,26,0.95)',
        backdropFilter: 'blur(12px)',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        borderBottom: '1px solid var(--border)'
      }}>
        {/* Logo + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* ปุ่ม Hamburger: เปิด Sidebar */}
          <button onClick={() => setIsSidebarOpen(true)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '18px', width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
            ☰
          </button>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h2 className="nav-brand-text" style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: '900', background: 'linear-gradient(135deg, #fff, var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🛒 IBIG SHOP
            </h2>
          </Link>
        </div>

        {/* ปุ่มขวา: ตะกร้า + Login/Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* ตะกร้า (เฉพาะ user ที่ไม่ใช่ admin) */}
          {userRole !== 'admin' && (
            <Link to="/cart" style={{ textDecoration: 'none', position: 'relative' }}>
              <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🛒
                {cart.length > 0 && (
                  <span style={{ background: 'var(--accent)', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 7px', borderRadius: '20px', animation: 'pulse 1.5s infinite' }}>
                    {cart.reduce((a, b) => a + b.qty, 0)}
                  </span>
                )}
              </button>
            </Link>
          )}

          {/* ปุ่ม Login / Logout */}
          {isLoggedIn ? (
            <button onClick={logout} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              ออกจากระบบ
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════
          🗂️ Sidebar (Drawer)
          ════════════════════════════════════════════════════════ */}

      {/* Backdrop: กดข้างนอกเพื่อปิด Sidebar */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 998, backdropFilter: 'blur(3px)' }} />
      )}

      {/* Sidebar Drawer */}
      <div className="sidebar" style={{
        position: 'fixed', top: 0,
        left: isSidebarOpen ? 0 : '-280px',
        width: '265px',
        height: '100vh',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}>

        {/* Header Sidebar */}
        <div style={{ padding: '18px 20px', background: 'rgba(212,168,67,0.08)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '800', fontSize: '16px', background: 'linear-gradient(135deg,#fff,var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🛒 IBIG SHOP
          </span>
          <button onClick={() => setIsSidebarOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {/* Profile Section (เฉพาะตอน Login) */}
        {isLoggedIn && (
          <div style={{ padding: '18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: 'var(--surface2)', border: '2px solid var(--gold)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {profile.profile_picture ? (
                <img src={profile.profile_picture} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : <span style={{ fontSize: '22px' }}>👤</span>}
            </div>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '15px' }}>{profile.username || 'ผู้ใช้งาน'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{profile.email || ''}</div>
            </div>
          </div>
        )}

        {/* เมนูลิงก์ */}
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>

          {/* ข้อมูลของฉัน (เฉพาะ user) */}
          {isLoggedIn && userRole !== 'admin' && (
            <Link to="/profile" onClick={() => setIsSidebarOpen(false)} className="sidebar-link">
              👤 ข้อมูลของฉัน
            </Link>
          )}

          {/* หน้าแรก */}
          <Link to="/" onClick={() => { setIsSidebarOpen(false); setSelectedCategory('ทั้งหมด'); }} className="sidebar-link">
            🏠 หน้าแรก
          </Link>

          {/* หมวดหมู่สินค้า (แบบพับได้) */}
          <div>
            <div onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="sidebar-link" style={{ justifyContent: 'space-between', color: 'var(--text-muted)', userSelect: 'none' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>📦 หมวดหมู่สินค้า</span>
              <span style={{ fontSize: '12px', transition: 'transform 0.2s', transform: isCategoryOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
            </div>
            {/* รายการหมวดหมู่ (กาง/พับ) */}
            {isCategoryOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px', paddingLeft: '14px' }}>
                {['ทั้งหมด', ...new Set(products.map(p => p.category).filter(cat => cat))].map(cat => (
                  <div key={cat}
                    onClick={() => { setSelectedCategory(cat); setIsSidebarOpen(false); navigate('/'); }}
                    style={{
                      padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                      color: selectedCategory === cat ? 'var(--gold)' : 'var(--text-muted)',
                      background: selectedCategory === cat ? 'rgba(212,168,67,0.12)' : 'transparent',
                      fontWeight: selectedCategory === cat ? '700' : '500',
                      transition: '0.2s'
                    }}>
                    {selectedCategory === cat ? '▸' : '•'} {cat}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* เมนู User (ตะกร้า + ประวัติ) */}
          {userRole !== 'admin' && (
            <>
              <Link to="/cart" onClick={() => setIsSidebarOpen(false)} className="sidebar-link"
                style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🛒 ตะกร้าสินค้า</span>
                {cart.length > 0 && (
                  <span style={{ background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                    {cart.length}
                  </span>
                )}
              </Link>
              {isLoggedIn && (
                <Link to="/my-orders" onClick={() => setIsSidebarOpen(false)} className="sidebar-link">
                  🧾 ประวัติการสั่งซื้อ
                </Link>
              )}
            </>
          )}

          {/* เมนู Admin (ระบบหลังบ้าน) */}
          {isLoggedIn && userRole === 'admin' && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700', padding: '6px 12px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
                ⚙️ ระบบหลังบ้าน
              </div>
              {[
                { tab: 'report',     icon: '📊', label: 'รายงานสถิติ' },
                { tab: 'add',        icon: '➕', label: 'เพิ่มสินค้าใหม่' },
                { tab: 'stock',      icon: '📦', label: 'จัดการสต็อก' },
                { tab: 'categories', icon: '📁', label: 'จัดการหมวดหมู่' },
                { tab: 'orders',     icon: '🧾', label: 'รายการสั่งซื้อ' },
                { tab: 'users',      icon: '👥', label: 'จัดการผู้ใช้' },
                { tab: 'reviews',    icon: '📝', label: 'จัดการรีวิว' },
              ].map(({ tab, icon, label }) => (
                <button key={tab} className={`admin-tab-btn ${adminTab === tab ? 'active' : ''}`}
                  onClick={() => { setAdminTab(tab); navigate('/admin'); setIsSidebarOpen(false); }}>
                  {icon} {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          🗺️ Routes (ทุก Route เหมือนเดิม ปรับ style)
          ════════════════════════════════════════════════════════ */}
      <Routes>

        {/* ════════════ 🏠 หน้าแรก (ยึดตาม Hero Image เดิม) ════════════ */}
        <Route path="/" element={
          <div>
            {/* Hero Section — ใช้ภาพ heroBg เหมือนเดิม */}
            <div style={{
              textAlign: 'center',
              padding: 'clamp(80px, 20vw, 200px) 20px',
              background: `linear-gradient(to bottom, rgba(15,15,26,0.35) 0%, rgba(15,15,26,0.7) 100%), url(${heroBg}) center/cover no-repeat`,
              color: 'white',
              position: 'relative'
            }}>
              <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3.8rem)', margin: 0, fontWeight: '900', letterSpacing: '-1px', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                🛍️ IBIG SHOP
              </h1>
              <p style={{ fontSize: 'clamp(0.95rem, 3vw, 1.25rem)', opacity: 0.9, marginTop: '10px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                "ช้อปใหญ่ จ่ายน้อย สอยทุกความคุ้ม!"
              </p>
              {/* Search Bar */}
              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '560px' }}>
                  <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', pointerEvents: 'none' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="ค้นหาสินค้าที่ใช่สำหรับคุณ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      paddingLeft: '50px', paddingRight: '20px', paddingTop: '15px', paddingBottom: '15px',
                      width: '100%',
                      borderRadius: '50px',
                      border: '2px solid rgba(212,168,67,0.4)',
                      fontSize: 'clamp(14px, 3vw, 17px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                      background: 'rgba(15,15,26,0.85)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(212,168,67,0.4)'}
                  />
                </div>
              </div>
            </div>

            {/* ── กริดสินค้า ── */}
            <div className="product-grid">
              {filteredProducts.map(item => (
                <div key={item.id} className="product-card">
                  {/* รูปสินค้า */}
                  {item.image
                    ? <img src={item.image} alt={item.name} />
                    : <div style={{ height: '220px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>📦</div>
                  }
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
                    {/* ชื่อสินค้า (ตัดที่ 3 บรรทัด) */}
                    <h3 style={{ color: 'var(--text)', fontSize: 'clamp(13px, 2.5vw, 15px)', fontWeight: '700', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '4.2em', margin: 0 }}>
                      {item.name}
                    </h3>
                    {/* ราคา */}
                    <p className="price" style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: '900', color: 'var(--gold)', margin: 0 }}>
                      ฿{Number(item.price).toLocaleString()}
                    </p>
                    {/* สต็อก */}
                    <p className="stock" style={{ color: item.stock > 0 ? 'var(--green)' : 'var(--accent)', fontWeight: '600', fontSize: 'clamp(11px, 2vw, 13px)', margin: 0 }}>
                      {item.stock > 0 ? `📦 ${item.stock} ชิ้น` : '❌ หมด'}
                    </p>
                    {/* ปุ่ม */}
                    <div className="btn-group" style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                      <button onClick={() => navigate(`/product/${item.id}`)}
                        className="btn-ghost"
                        style={{ flex: 1, padding: '9px 6px', fontSize: 'clamp(11px, 2vw, 13px)', borderRadius: '8px' }}>
                        🔍 ดูสินค้า
                      </button>
                      <button onClick={() => addToCart(item)} disabled={item.stock <= 0}
                        className={item.stock > 0 ? 'btn-primary' : ''}
                        style={{
                          flex: 1, padding: '9px 6px', fontSize: 'clamp(11px, 2vw, 13px)', borderRadius: '8px', border: 'none',
                          background: item.stock > 0 ? undefined : 'rgba(255,255,255,0.06)',
                          color: item.stock > 0 ? undefined : 'var(--text-muted)',
                          cursor: item.stock > 0 ? 'pointer' : 'not-allowed'
                        }}>
                        {item.stock > 0 ? '🛒 ใส่ตะกร้า' : 'หมด'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <footer style={{ marginTop: '60px', padding: '50px 20px', background: '#0a0a14', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', textAlign: 'center' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--gold)', marginBottom: '8px' }}>🛍️ IBIG SHOP</p>
              <p style={{ fontSize: '14px', marginBottom: '6px' }}>ติดต่อเรา: 093-112-1917 | Line: @phuwadet5617</p>
              <hr style={{ width: '40px', margin: '16px auto', borderColor: 'var(--border)' }} />
              <p style={{ fontSize: '12px', opacity: 0.4 }}>© 2026 IBIG SHOP. All rights reserved.</p>
            </footer>
          </div>
        } />

        {/* ════════════ 👤 หน้าโปรไฟล์ ════════════ */}
        <Route path="/profile" element={isLoggedIn ? <ProfilePage userId={userId} /> : <Navigate to="/login" />} />

        {/* ════════════ 📦 หน้ารายละเอียดสินค้า ════════════ */}
        <Route path="/product/:id" element={
          <ProductDetailPage products={products} addToCart={addToCart} productReviews={productReviews} fetchProductReviews={fetchProductReviews} />
        } />

        {/* ════════════ 🛒 หน้าตะกร้าสินค้า ════════════ */}
        <Route path="/cart" element={
          <div style={{ padding: '30px 16px', maxWidth: '820px', margin: '0 auto' }} className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: '800', color: 'var(--text)' }}>🛒 ตะกร้าสินค้า</h2>
              {cart.length > 0 && (
                <button onClick={clearCart}
                  style={{ background: 'rgba(224,82,82,0.15)', color: 'var(--accent)', border: '1px solid rgba(224,82,82,0.3)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  🗑️ ล้างตะกร้า
                </button>
              )}
            </div>

            <div className="card" style={{ padding: '20px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '56px', marginBottom: '14px' }}>🛒</div>
                  <p>ตะกร้าว่างเปล่า</p>
                </div>
              ) : (
                <div>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid var(--border)', padding: '14px 0' }}>
                      <img src={item.image} alt={item.name}
                        style={{ width: '68px', height: '68px', objectFit: 'cover', borderRadius: '8px', background: 'var(--surface2)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: '0 0 4px', color: 'var(--text)', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                        <p style={{ margin: 0, color: 'var(--gold)', fontWeight: '700' }}>฿{Number(item.price).toLocaleString()}</p>
                      </div>
                      {/* ปุ่มเพิ่ม/ลดจำนวน */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                        <button onClick={() => updateQuantity(item.id, -1)}
                          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text)', padding: '8px 13px', cursor: 'pointer', fontSize: '16px' }}>-</button>
                        <span style={{ padding: '0 13px', color: 'var(--text)', fontWeight: '700', minWidth: '30px', textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}
                          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text)', padding: '8px 13px', cursor: 'pointer', fontSize: '16px' }}>+</button>
                      </div>
                      {/* ราคารวม */}
                      <div style={{ width: '80px', textAlign: 'right', fontWeight: '800', color: 'var(--text)', flexShrink: 0 }}>
                        ฿{(item.price * item.qty).toLocaleString()}
                      </div>
                      {/* ลบออก */}
                      <button onClick={() => removeFromCart(item.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '18px', cursor: 'pointer', flexShrink: 0 }}>✖</button>
                    </div>
                  ))}

                  {/* สรุปราคา */}
                  <div style={{ marginTop: '24px', textAlign: 'right', borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {cart.reduce((a, b) => a + b.qty, 0)} ชิ้น
                    </div>
                    <h2 style={{ color: 'var(--text)', marginBottom: '16px' }}>
                      รวม: <span style={{ color: 'var(--gold)', fontWeight: '900' }}>฿{calculateTotal().toLocaleString()}</span>
                    </h2>
                    <button
                      onClick={() => {
                        if (isLoggedIn) {
                          axios.get(`${API_URL}/users/${userId}`).then(res => { setAddress(res.data.address || ''); setPhone(res.data.phone || ''); checkout(); });
                        } else { navigate('/login'); }
                      }}
                      className="btn-primary"
                      style={{ padding: '15px 40px', fontSize: '17px', borderRadius: '10px' }}>
                      {isLoggedIn ? "✅ ยืนยันการสั่งซื้อ" : "🔑 ล็อกอินเพื่อสั่งซื้อ"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        } />

        {/* ════════════ 📋 รายละเอียดออเดอร์ ════════════ */}
        <Route path="/order/:id" element={<OrderDetailPage userId={userId} />} />

        {/* ════════════ 🧾 ประวัติการสั่งซื้อ ════════════ */}
        <Route path="/my-orders" element={
          <div style={{ padding: '30px 16px', maxWidth: '900px', margin: '0 auto' }} className="fade-in">
            <h1 style={{ textAlign: 'center', fontWeight: '800', marginBottom: '24px', color: 'var(--text)' }}>
              📋 ประวัติการสั่งซื้อของฉัน
            </h1>

            {myOrders.length === 0 ? (
              <div className="card" style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '56px', marginBottom: '14px' }}>📭</div>
                <p>ยังไม่มีรายการสั่งซื้อ</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {myOrders.map(order => (
                  <div key={order.id} className="card" style={{ padding: '20px', borderLeft: `4px solid ${order.status === 'จัดส่งแล้ว' ? 'var(--green)' : order.status === 'ชำระเงินแล้ว' ? 'var(--blue)' : order.status === 'กำลังจัดส่ง' ? '#9b59b6' : 'var(--gold)'}` }}>

                    {/* เลขออเดอร์ + วันที่ */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <span onClick={() => navigate(`/order/${order.id}`)}
                        style={{ fontWeight: '700', fontSize: '16px', color: 'var(--blue)', cursor: 'pointer', textDecoration: 'underline' }}>
                        ออเดอร์ #{order.id} 🔍
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        📅 {new Date(order.created_at).toLocaleDateString('th-TH')}
                      </span>
                    </div>

                    {/* ราคา + สถานะ */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--gold)' }}>฿{order.total_price}</span>
                      <span className="status-badge" style={getStatusStyle(order.status)}>{order.status}</span>
                    </div>

                    {/* ปุ่มจัดการ */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {order.status === 'รอดำเนินการ' && (
                        <button onClick={() => cancelOrder(order.id)}
                          style={{ padding: '7px 14px', background: 'rgba(224,82,82,0.15)', color: 'var(--accent)', border: '1px solid rgba(224,82,82,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                          ยกเลิก
                        </button>
                      )}
                      <button onClick={() => { setCurrentOrderId(order.id); setAddress(profile.address || ''); setPhone(profile.phone || ''); setShowPayModal(true); }}
                        style={{ padding: '7px 14px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                        💳 จ่ายเงิน
                      </button>
                      <button onClick={() => generatePDF(order)}
                        style={{ padding: '7px 14px', background: 'rgba(46,204,113,0.15)', color: 'var(--green)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                        📄 บิล
                      </button>

                      {/* ตามพัสดุ */}
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
                        }} style={{ padding: '7px 14px', background: 'rgba(255,152,0,0.15)', color: '#ff9800', border: '1px solid rgba(255,152,0,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                          🚚 ตามพัสดุ
                        </button>
                      )}

                      {/* รีวิว (เฉพาะจัดส่งแล้ว) */}
                      {order.status === 'จัดส่งแล้ว' && (
                        <button onClick={() => { console.log("product_id ที่ได้:", order.product_id); setSelectedProduct(order.product_id); setShowReviewModal(true); }}
                          style={{ padding: '7px 14px', background: 'rgba(108,92,231,0.15)', color: '#a78bfa', border: '1px solid rgba(108,92,231,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                          ⭐ รีวิว
                        </button>
                      )}

                      {/* ลบประวัติ */}
                      <button onClick={() => deleteOrderHistory(order.id)}
                        style={{ padding: '7px 14px', background: 'rgba(224,82,82,0.1)', color: 'var(--accent)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                        🗑️ ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        } />

        {/* ════════════ 🔐 หน้า Login ════════════ */}
        <Route path="/login" element={
          isLoggedIn ? (userRole === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />) : (
            <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px 16px' }}>
              <div className="card" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '28px', color: 'var(--text)', fontWeight: '800' }}>🔐 เข้าสู่ระบบ</h2>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="form-label">ชื่อผู้ใช้งาน</label>
                    <input name="username" type="text" placeholder="Username" required className="input-dark" />
                  </div>
                  <div>
                    <label className="form-label">รหัสผ่าน</label>
                    <input name="password" type="password" placeholder="Password" required className="input-dark" />
                  </div>
                  <button type="submit" className="btn-primary"
                    style={{ padding: '13px', fontSize: '16px', borderRadius: '10px', marginTop: '4px' }}>
                    เข้าสู่ระบบ
                  </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  ยังไม่มีบัญชี? <Link to="/register" style={{ color: 'var(--gold)', fontWeight: '700', textDecoration: 'none' }}>สมัครสมาชิกฟรี</Link>
                </p>
              </div>
            </div>
          )
        } />

        {/* ════════════ 📝 หน้า Register ════════════ */}
        <Route path="/register" element={
          <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px 16px' }}>
            <div className="card" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '28px', color: 'var(--green)', fontWeight: '800' }}>📝 สมัครสมาชิกใหม่</h2>
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">ชื่อผู้ใช้งาน</label>
                  <input name="username" placeholder="Username" required className="input-dark" />
                </div>
                <div>
                  <label className="form-label">รหัสผ่าน</label>
                  <input name="password" type="password" placeholder="Password" required className="input-dark" />
                </div>
                <div>
                  <label className="form-label">ยืนยันรหัสผ่าน</label>
                  <input name="confirmPassword" type="password" placeholder="Confirm Password" required className="input-dark" />
                </div>
                <button type="submit" className="btn-primary"
                  style={{ padding: '13px', fontSize: '16px', borderRadius: '10px', marginTop: '4px', background: 'linear-gradient(135deg, var(--green), #27ae60)' }}>
                  สมัครสมาชิก
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
                มีบัญชีอยู่แล้ว? <Link to="/login" style={{ color: 'var(--gold)', fontWeight: '700', textDecoration: 'none' }}>เข้าสู่ระบบที่นี่</Link>
              </p>
            </div>
          </div>
        } />

        {/* ════════════ ⚙️ หน้า Admin Dashboard ════════════ */}
        <Route path="/admin" element={isLoggedIn && userRole === 'admin' ? (
          <div style={{ padding: '24px 16px', minHeight: '80vh' }} className="fade-in">

            {/* หัวข้อ */}
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <h1 style={{ fontWeight: '900', color: 'var(--text)', fontSize: 'clamp(18px, 4vw, 26px)' }}>
                ⚙️ ระบบจัดการหลังบ้าน
              </h1>
            </div>

            {/* Tab: รายงานสถิติ */}
            {adminTab === 'report' && (
              <div className="fade-in">
                {/* กราฟยอดขาย */}
                <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                  <h3 className="section-heading">📈 สถิติยอดขาย</h3>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                      <BarChart data={Object.values(orders.reduce((acc, order) => {
                        if (order.status !== 'ยกเลิก' && order.status !== 'รอดำเนินการ') {
                          const date = new Date(order.created_at).toLocaleDateString('th-TH');
                          if (!acc[date]) acc[date] = { name: date, ยอดขาย: 0 };
                          acc[date].ยอดขาย += Number(order.total_price);
                        }
                        return acc;
                      }, {}))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} />
                        <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
                        <Legend />
                        <Bar dataKey="ยอดขาย" fill="var(--gold)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  {[
                    { icon: '💰', label: 'ยอดขาย', value: `฿${totalSales.toLocaleString()}`, color: 'var(--green)' },
                    { icon: '⏳', label: 'รอตรวจสอบ', value: pendingOrders, color: 'var(--gold)' },
                    { icon: '✅', label: 'ส่งแล้ว', value: completedOrders, color: '#60a5fa' },
                    { icon: '👤', label: 'ลูกค้า', value: totalUsers, color: '#a78bfa' },
                  ].map(({ icon, label, value, color }) => (
                    <div key={label} className="card" style={{ padding: '22px', textAlign: 'center', borderTop: `3px solid ${color}` }}>
                      <div style={{ fontSize: '28px', marginBottom: '6px' }}>{icon}</div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 6px' }}>{label}</p>
                      <h2 style={{ color, fontWeight: '900', fontSize: '26px', margin: 0 }}>{value}</h2>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: เพิ่ม/แก้ไขสินค้า */}
            {adminTab === 'add' && (
              <div className="card" style={{ padding: '26px' }}>
                <h3 className="section-heading">
                  {editingProduct ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่'}
                </h3>
                <form onSubmit={addOrUpdateProduct} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <input name="name" placeholder="ชื่อสินค้า" defaultValue={editingProduct?.name || ''} required className="input-dark" style={{ minWidth: '200px', flex: '1 1 200px' }} />
                  {/* Dropdown หมวดหมู่ดึงจาก DB */}
                  <select name="category" defaultValue={editingProduct?.category || ''} required className="input-dark" style={{ flex: '1 1 150px' }}>
                    <option value="">-- เลือกหมวดหมู่ --</option>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                  <input name="stock" type="number" placeholder="สต็อก" defaultValue={editingProduct?.stock || 0} required className="input-dark" style={{ flex: '1 1 100px' }} />
                  <input name="price" type="number" placeholder="ราคา (฿)" defaultValue={editingProduct?.price || ''} required className="input-dark" style={{ flex: '1 1 100px' }} />
                  <input name="image" type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*" className="input-dark" style={{ flex: '1 1 200px' }} />
                  <input name="desc" placeholder="รายละเอียดสินค้า" defaultValue={editingProduct?.description || ''} className="input-dark" style={{ flex: '2 1 300px' }} />
                  <button type="submit" className="btn-primary" style={{ padding: '10px 24px', fontSize: '15px', alignSelf: 'flex-end' }}>
                    💾 บันทึก
                  </button>
                </form>
              </div>
            )}

            {/* Tab: จัดการสต็อก */}
            {adminTab === 'stock' && (
              <div>
                <h3 className="section-heading">📦 จัดการสต็อก</h3>
                <div className="admin-table-wrap" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <table className="dark-table">
                    <thead>
                      <tr>
                        <th>สินค้า</th>
                        <th>ราคา</th>
                        <th style={{ textAlign: 'center' }}>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {p.image && <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />}
                            <span style={{ color: 'var(--text)' }}>{p.name}</span>
                          </td>
                          <td style={{ color: 'var(--gold)', fontWeight: '700' }}>฿{p.price}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button onClick={() => { selectToEdit(p); setAdminTab('add'); }}
                              style={{ background: 'rgba(212,168,67,0.15)', color: 'var(--gold)', border: '1px solid rgba(212,168,67,0.3)', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginRight: '6px' }}>
                              ✏️ แก้ไข
                            </button>
                            <button onClick={() => deleteProduct(p.id)}
                              style={{ background: 'rgba(224,82,82,0.15)', color: 'var(--accent)', border: '1px solid rgba(224,82,82,0.3)', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                              🗑️ ลบ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: จัดการหมวดหมู่ */}
            {adminTab === 'categories' && (
              <CategoryManagement categories={categories} fetchCats={fetchCats} />
            )}

            {/* Tab: รายการสั่งซื้อ */}
            {adminTab === 'orders' && (
              <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 className="section-heading" style={{ margin: 0, flex: 1 }}>🧾 รายการสั่งซื้อ</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={exportToExcel}
                      style={{ background: 'rgba(46,204,113,0.15)', color: 'var(--green)', border: '1px solid rgba(46,204,113,0.3)', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                      📊 Excel
                    </button>
                    <button onClick={exportToPDF}
                      style={{ background: 'rgba(224,82,82,0.15)', color: 'var(--accent)', border: '1px solid rgba(224,82,82,0.3)', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                      📄 PDF
                    </button>
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="card" style={{ padding: '16px', marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input type="text" placeholder="🔍 ค้นหาเลขที่ออเดอร์หรือที่อยู่..."
                    value={orderSearchTerm} onChange={(e) => setOrderSearchTerm(e.target.value)}
                    className="input-dark" style={{ flex: '1 1 200px', minWidth: '180px' }} />
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-dark" style={{ flex: '0 0 auto' }}>
                    <option value="ทั้งหมด">ทุกสถานะ</option>
                    <option value="รอดำเนินการ">รอดำเนินการ</option>
                    <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                    <option value="ยกเลิก">ยกเลิก</option>
                  </select>
                  <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input-dark" style={{ flex: '0 0 auto' }} />
                  <button onClick={() => { setOrderSearchTerm(''); setStatusFilter('ทั้งหมด'); setDateFilter(''); }}
                    className="btn-ghost" style={{ padding: '10px 14px', fontSize: '13px' }}>
                    ล้างค่า
                  </button>
                </div>

                {/* ตารางออเดอร์ */}
                <div className="admin-table-wrap" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <table className="dark-table">
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
                      {filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <div style={{ fontWeight: '700', color: 'var(--text)' }}>#{order.id}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                              {order.created_at ? new Date(order.created_at).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'ไม่ระบุวันที่'}
                            </div>
                          </td>
                          <td style={{ maxWidth: '200px' }}>
                            <div style={{ color: 'var(--text)', fontSize: '13px' }}>📍 {order.address}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>📞 {order.phone}</div>
                          </td>
                          <td style={{ color: 'var(--gold)', fontWeight: '800' }}>฿{order.total_price}</td>
                          <td>
                            {order.slip_image
                              ? <button onClick={() => window.open(order.slip_image, '_blank')}
                                  style={{ background: 'rgba(155,89,182,0.15)', color: '#a78bfa', border: '1px solid rgba(155,89,182,0.3)', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                                  🖼️ ดูสลิป
                                </button>
                              : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>ยังไม่ส่ง</span>
                            }
                          </td>
                          <td>
                            <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="input-dark" style={{ padding: '6px 10px', fontSize: '12px', minWidth: '130px' }}>
                              <option value="รอดำเนินการ">รอดำเนินการ</option>
                              <option value="ชำระเงินแล้ว">ชำระเงินแล้ว</option>
                              <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                              <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                              <option value="ยกเลิก">ยกเลิก</option>
                            </select>
                          </td>
                          <td>
                            <button onClick={() => generatePDF(order)}
                              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text)', border: '1px solid var(--border)', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                              🖨️ บิล
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: จัดการผู้ใช้ */}
            {adminTab === 'users' && (
              <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h3 className="section-heading" style={{ flex: 1, margin: 0 }}>
                    👥 จัดการผู้ใช้
                    <span style={{ fontSize: '13px', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '8px' }}>({users.length} บัญชี)</span>
                  </h3>
                </div>

                <div className="admin-table-wrap" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <table className="dark-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>ID</th>
                        <th>ข้อมูลผู้ใช้งาน</th>
                        <th>ระดับสิทธิ์</th>
                        <th>สถานะ</th>
                        <th style={{ textAlign: 'center' }}>การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users && users.length > 0 ? (
                        users.map((user, index) => (
                          <tr key={user.id || index}>
                            <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{user.id}</td>
                            <td>
                              {/* ป้องกันชื่อหาย: ใช้ค่าสำรองถ้า null */}
                              <div style={{ fontWeight: '700', color: 'var(--text)' }}>{user.username || "กำลังโหลด..."}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email || "---"}</div>
                            </td>
                            <td>
                              <select value={user.role || 'customer'}
                                onChange={(e) => updateUser(user.id, { role: e.target.value, status: user.status })}
                                className="input-dark" style={{ padding: '6px 10px', fontSize: '13px', maxWidth: '140px' }}>
                                <option value="customer">👤 Customer</option>
                                <option value="admin">🔑 Admin</option>
                              </select>
                            </td>
                            <td>
                              <span className="status-badge"
                                style={user.status === 'suspended'
                                  ? { background: 'rgba(224,82,82,0.15)', color: 'var(--accent)', border: '1px solid rgba(224,82,82,0.3)' }
                                  : { background: 'rgba(46,204,113,0.15)', color: 'var(--green)', border: '1px solid rgba(46,204,113,0.3)' }}>
                                {user.status === 'suspended' ? 'ถูกระงับ' : 'ใช้งานปกติ'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button onClick={() => {
                                const newStatus = user.status === 'active' ? 'suspended' : 'active';
                                if (window.confirm(`คุณแน่ใจหรือไม่ที่จะ ${newStatus === 'suspended' ? 'ระงับ' : 'ปลดระงับ'} บัญชี ${user.username || ''}?`)) {
                                  updateUser(user.id, { role: user.role, status: newStatus });
                                }
                              }} style={{
                                background: user.status === 'active' ? 'rgba(224,82,82,0.15)' : 'rgba(46,204,113,0.15)',
                                color: user.status === 'active' ? 'var(--accent)' : 'var(--green)',
                                border: `1px solid ${user.status === 'active' ? 'rgba(224,82,82,0.3)' : 'rgba(46,204,113,0.3)'}`,
                                padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px'
                              }}>
                                {user.status === 'active' ? '🚫 ระงับ' : '✅ ปลดระงับ'}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                            ไม่พบข้อมูลผู้ใช้งาน
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: จัดการรีวิว */}
            {adminTab === 'reviews' && (
              <div className="fade-in">
                <h3 className="section-heading">📝 จัดการรีวิวจากลูกค้า</h3>
                <div className="admin-table-wrap" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <table className="dark-table">
                    <thead>
                      <tr>
                        <th>สินค้า</th>
                        <th>ลูกค้า</th>
                        <th>คะแนน</th>
                        <th>ความคิดเห็น</th>
                        <th>วันที่</th>
                        <th style={{ textAlign: 'center' }}>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allReviews.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                            ยังไม่มีรีวิวในขณะนี้
                          </td>
                        </tr>
                      ) : (
                        allReviews.map((review) => (
                          <tr key={review.id}>
                            <td style={{ color: 'var(--text)', fontWeight: '600' }}>{review.product_name}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{review.username}</td>
                            <td style={{ color: '#f1c40f', letterSpacing: '-2px' }}>{'⭐'.repeat(review.rating)}</td>
                            <td style={{ color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {review.comment}
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                              {new Date(review.created_at).toLocaleDateString('th-TH')}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button onClick={() => { if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?')) deleteReview(review.id); }}
                                style={{ background: 'rgba(224,82,82,0.15)', color: 'var(--accent)', border: '1px solid rgba(224,82,82,0.3)', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                                🗑️ ลบ
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        ) : <Navigate to="/login" replace />} />

      </Routes>
    </div>
  );
}

export default App;