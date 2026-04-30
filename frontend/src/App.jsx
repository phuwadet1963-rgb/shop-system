// ============================================================
// 📦 IBIG SHOP — App.jsx (ปรับปรุงใหม่ทันสมัย + รองรับมือถือ)
// ✅ ฟังก์ชันทุกอย่างเหมือนเดิม ไม่มีตัดทิ้ง
// ✅ UI ใหม่หมด: โทนสี Dark-Luxury + Gradient สวยงาม
// ✅ Responsive รองรับทุกขนาดหน้าจอ (มือถือ / tablet / desktop)
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

// ============================================================
// 🎨 CSS แบบ Global — ฝังผ่าน <style> tag ใน component หลัก
// ใช้ CSS Variables เพื่อให้เปลี่ยนสีทั้งระบบได้ง่าย
// ============================================================
const GlobalStyles = () => (
  <style>{`
    /* ===== ตัวแปรสีหลักของระบบ ===== */
    :root {
      --primary: #0f0f1a;         /* พื้นหลังเข้ม */
      --secondary: #1a1a2e;       /* พื้นหลังรอง */
      --card: #16213e;            /* พื้นหลัง Card */
      --accent: #e94560;          /* สีหลัก (แดงชาด) */
      --accent2: #0f3460;         /* สีเน้น (น้ำเงินเข้ม) */
      --gold: #f5a623;            /* สีทอง (ราคา) */
      --green: #00b894;           /* สีเขียว (สำเร็จ) */
      --text: #eaeaea;            /* สีตัวอักษรหลัก */
      --text-muted: #8892a4;      /* สีตัวอักษรรอง */
      --border: rgba(255,255,255,0.07); /* สีขอบ */
      --radius: 14px;             /* ความโค้งมน */
      --shadow: 0 8px 32px rgba(0,0,0,0.35); /* เงา */
    }

    /* ===== Reset พื้นฐาน ===== */
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0; padding: 0;
      font-family: 'Sarabun', 'Noto Sans Thai', sans-serif;
      background: var(--primary);
      color: var(--text);
    }

    /* ===== Scrollbar สวย ===== */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--primary); }
    ::-webkit-scrollbar-thumb { background: var(--accent2); border-radius: 10px; }

    /* ===== Animation เลื่อนขึ้นเข้ามา ===== */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    /* ===== Card ทั่วไป ===== */
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      animation: fadeUp 0.4s ease both;
    }

    /* ===== ปุ่มหลัก ===== */
    .btn-primary {
      background: linear-gradient(135deg, var(--accent), #c0392b);
      color: white; border: none; border-radius: 8px;
      padding: 11px 22px; font-size: 15px; font-weight: 700;
      cursor: pointer; transition: all 0.25s;
      letter-spacing: 0.3px;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(233,69,96,0.4); }
    .btn-primary:active { transform: translateY(0); }

    /* ===== ปุ่มรอง ===== */
    .btn-secondary {
      background: rgba(255,255,255,0.07);
      color: var(--text); border: 1px solid var(--border);
      border-radius: 8px; padding: 10px 20px;
      font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.13); }

    /* ===== Input สวย ===== */
    .modern-input {
      width: 100%; padding: 12px 16px;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      border-radius: 8px; color: var(--text);
      font-size: 15px; font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    .modern-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(233,69,96,0.15);
    }
    .modern-input::placeholder { color: var(--text-muted); }

    /* ===== Badge / Tag ===== */
    .badge {
      display: inline-flex; align-items: center;
      padding: 3px 10px; border-radius: 20px;
      font-size: 12px; font-weight: 700;
    }

    /* ===== Product Card Hover Effect ===== */
    .product-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
      cursor: pointer;
    }
    .product-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(233,69,96,0.18);
      border-color: var(--accent);
    }

    /* ===== Sidebar Link ===== */
    .sidebar-link {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; border-radius: 10px;
      text-decoration: none; color: var(--text);
      font-size: 15px; font-weight: 600;
      transition: all 0.2s;
      background: rgba(255,255,255,0.03);
      border: 1px solid transparent;
    }
    .sidebar-link:hover {
      background: rgba(233,69,96,0.12);
      border-color: rgba(233,69,96,0.2);
      color: #fff;
    }

    /* ===== Table ทันสมัย ===== */
    .modern-table { width: 100%; border-collapse: collapse; }
    .modern-table th {
      background: var(--accent2); color: white;
      padding: 13px 16px; font-size: 13px; font-weight: 700;
      text-align: left; letter-spacing: 0.5px;
    }
    .modern-table td {
      padding: 12px 16px; font-size: 14px;
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }
    .modern-table tr:hover td { background: rgba(255,255,255,0.03); }

    /* ===== Select ===== */
    select.modern-input { cursor: pointer; }
    select option { background: var(--secondary); color: var(--text); }

    /* ===== Responsive: ซ่อนบางคอลัมน์บนมือถือ ===== */
    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
      .stack-mobile { flex-direction: column !important; }
      .full-mobile { width: 100% !important; }
    }
    @media (max-width: 480px) {
      .hide-sm { display: none !important; }
    }

    /* ===== Glassmorphism card ===== */
    .glass-card {
      background: rgba(22, 33, 62, 0.85);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: var(--radius);
    }

    /* ===== Hero gradient text ===== */
    .gradient-text {
      background: linear-gradient(135deg, #fff 0%, var(--gold) 60%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ===== Status Badge Colors ===== */
    .status-pending  { background: rgba(245,166,35,0.15); color: var(--gold); border: 1px solid rgba(245,166,35,0.3); }
    .status-paid     { background: rgba(0,184,148,0.15);  color: var(--green); border: 1px solid rgba(0,184,148,0.3); }
    .status-shipping { background: rgba(52,152,219,0.15); color: #74b9ff; border: 1px solid rgba(52,152,219,0.3); }
    .status-done     { background: rgba(0,184,148,0.2);   color: #00cec9;  border: 1px solid rgba(0,184,148,0.4); }
    .status-cancel   { background: rgba(233,69,96,0.15);  color: var(--accent); border: 1px solid rgba(233,69,96,0.3); }

    /* ===== Admin Tab ปุ่ม ===== */
    .admin-tab {
      padding: 10px 18px; border: none; border-radius: 8px;
      font-size: 13px; font-weight: 700; cursor: pointer;
      transition: all 0.2s; color: var(--text-muted);
      background: transparent;
    }
    .admin-tab.active {
      background: linear-gradient(135deg, var(--accent), #c0392b);
      color: white; box-shadow: 0 4px 12px rgba(233,69,96,0.3);
    }
    .admin-tab:hover:not(.active) { background: rgba(255,255,255,0.06); color: white; }
  `}</style>
);

// ============================================================
// 🔧 Helper: แปลงสถานะออเดอร์เป็น CSS class
// ============================================================
const getStatusClass = (status) => {
  if (status === 'รอดำเนินการ') return 'status-pending';
  if (status === 'ชำระเงินแล้ว') return 'status-paid';
  if (status === 'กำลังจัดส่ง') return 'status-shipping';
  if (status === 'จัดส่งแล้ว') return 'status-done';
  if (status === 'ยกเลิก') return 'status-cancel';
  return 'status-pending';
};

// ============================================================
// 📄 หน้ารายละเอียดสินค้า + รีวิว
// ✅ คงไว้ทุกฟังก์ชัน: โหลดรีวิว, ใส่ตะกร้า, รูปสินค้า
// ============================================================
function ProductDetailPage({ products, addToCart, productReviews, fetchProductReviews }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === Number(id));

  // 🔄 ดึงรีวิวทันทีที่เข้าหน้า หรือเมื่อ ID เปลี่ยน
  useEffect(() => {
    if (id) fetchProductReviews(id);
  }, [id, fetchProductReviews]);

  // ถ้าหาสินค้าไม่เจอ
  if (!product) return (
    <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '60px', marginBottom: '20px' }}>😥</div>
      <h3 style={{ color: 'var(--text)' }}>กำลังโหลด... หรือไม่พบสินค้านี้</h3>
      <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
        ← กลับหน้าแรก
      </button>
    </div>
  );

  // ⭐ แปลง rating เป็นดาว
  const renderStars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <div style={{ padding: '30px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* ปุ่มกลับ */}
      <button className="btn-secondary" onClick={() => navigate(-1)}
        style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ← ย้อนกลับ
      </button>

      {/* === Card รายละเอียดสินค้า === */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', padding: '30px' }}>

        {/* 🖼️ รูปสินค้า (ซ้าย) */}
        <div style={{ flex: '1 1 300px' }}>
          {product.image ? (
            <img src={product.image} alt={product.name}
              style={{ width: '100%', height: '360px', objectFit: 'cover', borderRadius: '10px' }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
            />
          ) : (
            <div style={{ width: '100%', height: '360px', background: 'rgba(255,255,255,0.05)',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '60px' }}>📦</div>
          )}
        </div>

        {/* 📝 รายละเอียด (ขวา) */}
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* หมวดหมู่ */}
          <span className="badge" style={{ background: 'rgba(233,69,96,0.15)', color: 'var(--accent)',
            border: '1px solid rgba(233,69,96,0.3)', alignSelf: 'flex-start' }}>
            🏷️ {product.category || 'ไม่ระบุ'}
          </span>

          {/* ชื่อสินค้า */}
          <h1 style={{ margin: 0, fontSize: 'clamp(22px, 4vw, 30px)', color: 'var(--text)' }}>
            {product.name}
          </h1>

          {/* ราคา */}
          <div style={{ fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: '800', color: 'var(--gold)' }}>
            ฿{Number(product.price).toLocaleString()}
          </div>

          {/* รายละเอียด */}
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '8px',
            border: '1px solid var(--border)', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '14px' }}>
            {product.description || 'ไม่มีรายละเอียดสินค้า'}
          </div>

          {/* สถานะสต็อก */}
          <div className={`badge ${product.stock > 0 ? 'status-paid' : 'status-cancel'}`}
            style={{ alignSelf: 'flex-start', fontSize: '14px', padding: '6px 14px' }}>
            {product.stock > 0 ? `📦 พร้อมส่ง (${product.stock} ชิ้น)` : '❌ สินค้าหมดชั่วคราว'}
          </div>

          {/* ปุ่มใส่ตะกร้า */}
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
            className={product.stock > 0 ? 'btn-primary' : ''}
            style={product.stock <= 0 ? {
              padding: '14px', fontSize: '16px', fontWeight: '700', border: 'none',
              borderRadius: '8px', background: '#444', color: '#888', cursor: 'not-allowed'
            } : { padding: '14px', fontSize: '16px' }}
          >
            {product.stock > 0 ? '🛒 หยิบใส่ตะกร้า' : '❌ สินค้าหมด'}
          </button>
        </div>
      </div>

      {/* === ส่วนรีวิว === */}
      <div className="card" style={{ marginTop: '24px', padding: '28px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          💬 รีวิวจากลูกค้า
          <span className="badge status-shipping" style={{ fontSize: '12px' }}>
            {productReviews.length} รีวิว
          </span>
        </h3>

        {productReviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
            ยังไม่มีรีวิวสำหรับสินค้านี้
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {productReviews.map((rev) => (
              <div key={rev.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.04)',
                borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <strong style={{ color: 'var(--text)' }}>👤 {rev.username}</strong>
                  <span style={{ color: 'var(--gold)', fontSize: '16px', letterSpacing: '2px' }}>
                    {renderStars(rev.rating)}
                  </span>
                </div>
                <p style={{ margin: '10px 0 8px', color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '14px' }}>
                  {rev.comment}
                </p>
                <small style={{ color: '#4a5568', fontSize: '12px' }}>
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
// 👤 หน้าโปรไฟล์ลูกค้า
// ✅ คงไว้: แก้ไขข้อมูล, เปลี่ยนรูปภาพ, เปลี่ยนรหัสผ่าน
// ============================================================
function ProfilePage({ userId }) {
  const [profile, setProfile] = useState({
    username: '', email: '', address: '', phone: '', profile_picture: '', password: ''
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // โหลดข้อมูลโปรไฟล์จาก API
  useEffect(() => {
    if (userId) {
      axios.get(`${API_URL}/users/${userId}`)
        .then(res => setProfile({ ...res.data, password: '' }))
        .catch(err => console.error("ดึงข้อมูลไม่สำเร็จ", err));
    }
  }, [userId]);

  // บันทึกข้อมูล (รองรับ multipart เพื่ออัปโหลดรูป)
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaving(true);
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
    .catch(() => alert('❌ เกิดข้อผิดพลาดในการบันทึก'))
    .finally(() => setSaving(false));
  };

  // ฟิลด์ input แบบ reuse
  const Field = ({ label, type = 'text', field, required, isTextarea }) => (
    <div>
      <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px',
        color: 'var(--text-muted)', fontSize: '13px' }}>{label}</label>
      {isTextarea ? (
        <textarea rows="3" required={required} value={profile[field] || ''}
          onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
          className="modern-input" style={{ resize: 'vertical' }} />
      ) : (
        <input type={type} required={required} value={profile[field] || ''}
          onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
          className="modern-input" />
      )}
    </div>
  );

  return (
    <div style={{ padding: '30px 20px', maxWidth: '560px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '32px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 28px', color: 'var(--text)' }}>
          👤 โปรไฟล์ของฉัน
        </h2>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* รูปโปรไฟล์ */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '110px', height: '110px', borderRadius: '50%', margin: '0 auto',
              overflow: 'hidden', background: 'rgba(255,255,255,0.08)',
              border: '3px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {file ? (
                <img src={URL.createObjectURL(file)} alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : profile.profile_picture ? (
                <img src={profile.profile_picture} alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} />
              ) : (
                <span style={{ fontSize: '44px' }}>👤</span>
              )}
            </div>
            <label style={{ display: 'inline-block', marginTop: '12px', cursor: 'pointer' }}>
              <span className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                📸 เปลี่ยนรูป
              </span>
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files[0])} />
            </label>
          </div>

          <Field label="👤 ชื่อผู้ใช้งาน" field="username" required />
          <Field label="📧 อีเมล" type="email" field="email" required />
          
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px',
              color: '#e74c3c', fontSize: '13px' }}>
              🔐 รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)
            </label>
            <input type="password" value={profile.password || ''}
              onChange={(e) => setProfile({ ...profile, password: e.target.value })}
              className="modern-input" />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

          <Field label="🏠 ที่อยู่จัดส่ง" field="address" isTextarea />
          <Field label="📞 เบอร์โทรศัพท์" field="phone" />

          <button type="submit" className="btn-primary"
            style={{ padding: '14px', fontSize: '16px', opacity: saving ? 0.7 : 1 }}
            disabled={saving}>
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// 🏠 App (Root) — ห่อด้วย BrowserRouter
// ============================================================
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// ============================================================
// 🧠 AppContent — Logic หลักทั้งหมดอยู่ที่นี่
// ============================================================
function AppContent() {
  const navigate = useNavigate();

  // ===== State ทั้งหมด (เหมือนเดิมทุกตัว) =====
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
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
  const [selectedProduct, setSelectedProduct] = useState(null); // เก็บว่าจะรีวิวสินค้าไหน
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [allReviews, setAllReviews] = useState([]);         // รีวิวทั้งหมด (Admin)
  const [productReviews, setProductReviews] = useState([]); // รีวิวต่อสินค้า (User)
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [dateFilter, setDateFilter] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [profile, setProfile] = useState({ username: '', email: '', profile_picture: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ปิด sidebar ตั้งต้นบนมือถือ

  // ===== โหลดข้อมูลเมื่อ Login / Component Mount =====
  useEffect(() => {
    axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
    if (isLoggedIn) fetchMyOrders();
    fetchOrders();
    // 🔄 Auto-refresh ทุก 5 วินาที เพื่ออัปเดตออเดอร์ใหม่
    const orderInterval = setInterval(() => { fetchOrders(); }, 5000);
    return () => clearInterval(orderInterval);
  }, [isLoggedIn, userId]);

  // โหลดโปรไฟล์ผู้ใช้เมื่อ login
  useEffect(() => {
    if (userId) {
      axios.get(`${API_URL}/users/${userId}`)
        .then(res => setProfile(res.data))
        .catch(err => console.error(err));
    }
  }, [userId]);

  // โหลดข้อมูลผู้ใช้ทั้งหมดเมื่อเข้า Tab users (Admin)
  useEffect(() => {
    if (adminTab === 'users') fetchUsers();
  }, [adminTab]);

  // โหลดรีวิวทั้งหมดเมื่อเข้า Tab reviews (Admin)
  useEffect(() => {
    if (adminTab === 'reviews') fetchAdminReviews();
  }, [adminTab]);

  // ===== ฟังก์ชัน Fetch ข้อมูล =====
  const fetchOrders = () => {
    axios.get(`${API_URL}/orders`)
      .then(res => setOrders(res.data))
      .catch(err => console.log("ดึงข้อมูลออเดอร์พลาด:", err));
  };

  const fetchMyOrders = () => {
    if (!userId) return;
    axios.get(`${API_URL}/my-orders/${userId}`)
      .then(res => setMyOrders(res.data))
      .catch(err => console.log("ดึงประวัติสั่งซื้อพลาด:", err));
  };

  // ดึงรีวิวของสินค้าตามรหัส (แสดงในหน้ารายละเอียด)
  const fetchProductReviews = async (productId) => {
    try {
      const res = await axios.get(`${API_URL}/reviews/${productId}`);
      setProductReviews(res.data);
    } catch (err) { console.error("Error fetching reviews:", err); }
  };

  // ดึงรีวิวทั้งหมดสำหรับ Admin
  const fetchAdminReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/reviews`);
      setAllReviews(res.data);
    } catch (err) { console.error("ดึงข้อมูลรีวิวไม่สำเร็จ:", err); }
  };

  // ดึงรายชื่อผู้ใช้ทั้งหมด
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      if (Array.isArray(response.data)) setUsers(response.data);
    } catch (error) { console.error('Fetch users error:', error); }
  };

  // ===== ฟังก์ชัน Export =====
  const exportToExcel = () => {
    if (orders.length === 0) { alert("ไม่มีข้อมูลออเดอร์สำหรับ Export"); return; }
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

  const exportToPDF = () => {
    if (orders.length === 0) { alert("ไม่มีข้อมูลออเดอร์สำหรับ Export"); return; }
    const doc = new jsPDF();
    doc.addFileToVFS("THSarabunNew.ttf", fontBase64);
    doc.addFont("THSarabunNew.ttf", "ThaiFont", "normal");
    doc.setFont("ThaiFont"); doc.setFontSize(20);
    doc.text("รายงานสรุปยอดขายทั้งหมด - BIG SHOP", 105, 20, { align: "center" });
    const tableColumn = ["หมายเลขออเดอร์", "จำนวนชิ้น", "ยอดรวม (บาท)", "วันที่สั่งซื้อ", "สถานะ"];
    const tableRows = orders.map(order => [
      `#${order.id}`, order.items_count, order.total_price,
      new Date(order.created_at).toLocaleString('th-TH'), order.status
    ]);
    autoTable(doc, {
      startY: 30, head: [tableColumn], body: tableRows,
      styles: { font: 'ThaiFont', fontSize: 14 },
      headStyles: { fillColor: [44, 62, 80], font: 'ThaiFont', fontStyle: 'normal' }
    });
    doc.save("BIG_SHOP_Sales_Report.pdf");
  };

  // ===== ฟังก์ชันออเดอร์ / ตะกร้า =====
  const deleteOrderHistory = (orderId) => {
    if (window.confirm("คุณต้องการลบประวัติการสั่งซื้อนี้ทิ้งใช่หรือไม่?")) {
      axios.delete(`${API_URL}/orders/${orderId}`)
        .then(() => { alert("🗑️ ลบประวัติการสั่งซื้อเรียบร้อย"); fetchMyOrders(); fetchOrders(); })
        .catch(() => alert("❌ ไม่สามารถลบได้"));
    }
  };

  const cancelOrder = (orderId) => {
    if (window.confirm("คุณต้องการยกเลิกออเดอร์นี้ใช่หรือไม่?")) {
      axios.delete(`${API_URL}/orders/${orderId}`)
        .then(() => { alert("ยกเลิกออเดอร์เรียบร้อย"); fetchMyOrders(); })
        .catch(() => alert("ไม่สามารถยกเลิกได้"));
    }
  };

  // ฟิลเตอร์ออเดอร์ Admin (ค้นหา / กรองสถานะ / กรองวันที่)
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(orderSearchTerm) ||
      (order.address && order.address.toLowerCase().includes(orderSearchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ทั้งหมด' || order.status === statusFilter;
    const matchesDate = !dateFilter || (order.created_at && order.created_at.startsWith(dateFilter));
    return matchesSearch && matchesStatus && matchesDate;
  });

  // สร้าง PDF ใบเสร็จต่อออเดอร์
  const generatePDF = async (order) => {
    try {
      const res = await axios.get(`${API_URL}/orders/${order.id}/items`);
      const items = res.data;
      const doc = new jsPDF();
      doc.addFileToVFS("THSarabunNew.ttf", fontBase64);
      doc.addFont("THSarabunNew.ttf", "ThaiFont", "normal");
      doc.setFont("ThaiFont", "normal"); doc.setFontSize(26);
      doc.text("BIG SHOP", 105, 20, { align: "center" });
      doc.setFontSize(16); doc.text("ใบเสร็จรับเงิน / Receipt", 105, 28, { align: "center" });
      doc.setLineWidth(0.5); doc.line(15, 32, 195, 32); doc.setFontSize(14);
      doc.text(`หมายเลขคำสั่งซื้อ: #${order.id}`, 15, 42);
      doc.text(`วันที่สั่งซื้อ: ${order.created_at ? new Date(order.created_at).toLocaleDateString('th-TH') : new Date().toLocaleDateString('th-TH')}`, 15, 49);
      doc.text(`สถานะ: ${order.status}`, 15, 56);
      const tableRows = items.map((item, i) => [i+1, item.name, item.quantity,
        `฿${Number(item.price).toLocaleString()}`, `฿${(Number(item.price)*item.quantity).toLocaleString()}`]);
      autoTable(doc, {
        startY: 62,
        head: [['ลำดับ', 'รายการสินค้า', 'จำนวน', 'ราคา/ชิ้น', 'รวมสุทธิ']],
        body: tableRows,
        foot: [['', '', '', 'ยอดรวมทั้งสิ้น', `฿${Number(order.total_price).toLocaleString()}`]],
        styles: { font: 'ThaiFont', fontStyle: 'normal', fontSize: 14 },
        headStyles: { fillColor: [44, 62, 80], textColor: 255, halign: 'center' },
        footStyles: { fillColor: [236, 240, 241], textColor: 20 },
        columnStyles: { 0: { halign: 'center', cellWidth: 20 }, 2: { halign: 'center', cellWidth: 25 },
          3: { halign: 'right', cellWidth: 35 }, 4: { halign: 'right', cellWidth: 35 } }
      });
      const finalY = doc.lastAutoTable.finalY || 100;
      doc.setFontSize(14); doc.setTextColor(100);
      doc.text("ขอบคุณที่ใช้บริการ BIG SHOP", 105, finalY + 15, { align: "center" });
      window.open(doc.output('bloburl'), '_blank');
    } catch { alert("❌ เกิดข้อผิดพลาดในการดึงข้อมูลใบเสร็จ"); }
  };

  // อัปเดตสถานะออเดอร์ (Admin)
  const updateOrderStatus = (orderId, newStatus) => {
    let trackingNum = null, transport = null;
    if (newStatus === "จัดส่งแล้ว") {
      transport = prompt("ระบุบริษัทขนส่ง (เช่น Kerry, Flash, ไปรษณีย์ไทย):");
      trackingNum = prompt("ระบุเลขพัสดุ:");
      if (!transport || !trackingNum) { alert("❌ ต้องระบุข้อมูลการส่งให้ครบถ้วน!"); return; }
    }
    axios.put(`${API_URL}/orders/${orderId}`, {
      status: newStatus, tracking_number: trackingNum, shipping_company: transport
    })
    .then(() => {
      alert("✅ อัปเดตสถานะเป็น: " + newStatus);
      fetchOrders();
      axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
    })
    .catch(err => alert("อัปเดตพลาด: " + err));
  };

  // Login
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
    .catch(() => alert("ชื่อหรือรหัสผ่านผิดครับ!"));
  };

  // Register
  const handleRegister = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    if (password !== confirmPassword) return alert("รหัสผ่านไม่ตรงกันครับ!");
    axios.post(`${API_URL}/register`, { username, password })
      .then(res => { alert(res.data.message); navigate('/login'); })
      .catch(err => alert(err.response?.data?.message || "เกิดข้อผิดพลาด"));
  };

  // Logout
  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false); setUserRole('user'); setIsSidebarOpen(false);
    navigate('/login');
  };

  // ===== ฟังก์ชันตะกร้า =====
  const flatCart = [];
  cart.forEach(item => { for (let i = 0; i < item.qty; i++) flatCart.push(item); });

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.qty >= product.stock) {
          alert(`⚠️ สินค้านี้มีสต็อกจำกัดเพียง ${product.stock} ชิ้น`);
          return prevCart;
        }
        return prevCart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        return [...prevCart, { ...product, qty: 1 }];
      }
    });
    alert(`🛒 เพิ่ม "${product.name}" ลงตะกร้าแล้ว!`);
  };

  const updateQuantity = (id, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty < 1) return item;
        if (newQty > item.stock) { alert(`⚠️ สต็อกจำกัดเพียง ${item.stock} ชิ้น`); return item; }
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => { if (window.confirm("ยืนยันยกเลิกตะกร้าทั้งหมด?")) setCart([]); };
  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const calculateTotal = () => cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

  // ชำระเงิน: สร้างออเดอร์ใหม่
  const checkout = () => {
    if (cart.length === 0) return alert("ตะกร้าว่างเปล่า!");
    const orderData = {
      total_price: calculateTotal(), items_count: flatCart.length,
      user_id: userId, cartItems: flatCart
    };
    axios.post(`${API_URL}/orders`, orderData)
      .then(res => { setCurrentOrderId(res.data.orderId); setShowPayModal(true); fetchMyOrders(); })
      .catch(() => alert("สั่งซื้อไม่สำเร็จ"));
  };

  // ส่งสลิปชำระเงิน
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
      .catch(() => alert("เกิดข้อผิดพลาดในการส่งหลักฐาน"));
  };

  // ===== ฟังก์ชัน Admin สินค้า =====
  const deleteProduct = (id) => {
    if (window.confirm("คุณแน่ใจนะว่าจะลบ?")) {
      axios.delete(`${API_URL}/products/${id}`)
        .then(() => {
          alert("ลบเรียบร้อย!");
          axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
        });
    }
  };

  const selectToEdit = (product) => setEditingProduct(product);

  // เพิ่ม / แก้ไขสินค้า
  const addOrUpdateProduct = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', e.target.name.value);
    formData.append('price', e.target.price.value);
    formData.append('stock', e.target.stock.value);
    formData.append('description', e.target.desc.value);
    formData.append('category', e.target.category.value);
    if (file) formData.append('image', file);

    const url = editingProduct
      ? axios.put(`${API_URL}/products/${editingProduct.id}`, formData)
      : axios.post(`${API_URL}/products`, formData);

    url.then(() => {
      alert(editingProduct ? "แก้ไขเรียบร้อย!" : "เพิ่มสินค้าแล้ว!");
      setEditingProduct(null); setFile(null); e.target.reset();
      axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
    });
  };

  // อัปเดตข้อมูลผู้ใช้ (Admin)
  const updateUser = async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/special-admin-update/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.status === 200) { await fetchUsers(); alert("✅ อัปเดตข้อมูลเรียบร้อย"); }
    } catch (error) {
      console.error("Update Error:", error);
      alert("❌ อัปเดตไม่สำเร็จ: " + error.message);
    }
  };

  // ลบรีวิว (Admin)
  const deleteReview = async (id) => {
    try {
      await axios.delete(`${API_URL}/admin/reviews/${id}`);
      alert("ลบรีวิวเรียบร้อย");
      fetchAdminReviews();
    } catch { alert("ลบไม่สำเร็จ"); }
  };

  // ===== สถิติ Admin =====
  const totalSales = orders.filter(o => o.status === 'ชำระเงินแล้ว' || o.status === 'จัดส่งแล้ว')
    .reduce((sum, o) => sum + Number(o.total_price), 0);
  const pendingOrders = orders.filter(o => o.status === 'รอดำเนินการ').length;
  const completedOrders = orders.filter(o => o.status === 'จัดส่งแล้ว').length;
  const totalUsers = [...new Set(orders.map(o => o.user_id))].length;

  // ฟิลเตอร์สินค้าหน้าแรก
  const filteredProducts = products.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // หมวดหมู่ทั้งหมด
  const categories = ['ทั้งหมด', ...new Set(products.map(p => p.category).filter(Boolean))];

  // ===== ปุ่มนำทางใน Sidebar (Admin Tab) =====
  const adminMenuItems = [
    { key: 'report', icon: '📊', label: 'รายงานสถิติ' },
    { key: 'add',    icon: '➕', label: 'เพิ่มสินค้าใหม่' },
    { key: 'stock',  icon: '📦', label: 'จัดการสต็อก' },
    { key: 'orders', icon: '🧾', label: 'รายการสั่งซื้อ' },
    { key: 'users',  icon: '👥', label: 'จัดการผู้ใช้' },
    { key: 'reviews',icon: '📝', label: 'จัดการรีวิว' },
  ];

  // ===== ตรวจสอบขนาดหน้าจอ (เปิด sidebar อัตโนมัติบน desktop) =====
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) setIsSidebarOpen(false); // ไม่บังคับเปิดบน desktop
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================================
  // 🎨 RENDER
  // ============================================================
  return (
    <div style={{ fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif",
      backgroundColor: 'var(--primary)', minHeight: '100vh', color: 'var(--text)' }}>
      
      {/* ===== Global Styles ===== */}
      <GlobalStyles />

      {/* ============================================================ */}
      {/* 💳 Modal แจ้งชำระเงิน */}
      {/* ============================================================ */}
      {showPayModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 2000, padding: '16px', backdropFilter: 'blur(6px)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '460px',
            padding: '32px', animation: 'fadeUp 0.3s ease' }}>
            
            <h2 style={{ textAlign: 'center', color: 'var(--green)', margin: '0 0 6px' }}>
              💰 แจ้งชำระเงิน
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 24px' }}>
              ออเดอร์ #{currentOrderId} · โอนมาที่: <strong style={{ color: 'var(--gold)' }}>ธ.กสิกรไทย 000-0-00000-0</strong>
            </p>

            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  🏠 ที่อยู่จัดส่ง
                </label>
                <textarea required rows="3" value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="modern-input" style={{ resize: 'vertical' }}
                  placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด..." />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  📞 เบอร์โทรศัพท์
                </label>
                <input type="text" required value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="modern-input" placeholder="08x-xxx-xxxx" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  📸 สลิปโอนเงิน
                </label>
                <input type="file" accept="image/*" required
                  onChange={(e) => setSlipFile(e.target.files[0])}
                  style={{ color: 'var(--text)', background: 'rgba(255,255,255,0.05)',
                    padding: '10px', borderRadius: '8px', width: '100%',
                    border: '1px solid var(--border)' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowPayModal(false)}
                  className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
                  ❌ ยกเลิก
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  ✅ ยืนยันชำระเงิน
                </button>
              </div>
              <button type="button" onClick={() => setShowPayModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
                ไว้ทำทีหลัง (ไปที่ประวัติสั่งซื้อ)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ⭐ Modal รีวิวสินค้า */}
      {/* ============================================================ */}
      {showReviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 2000, padding: '16px', backdropFilter: 'blur(6px)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
            <h2 style={{ textAlign: 'center', margin: '0 0 20px' }}>⭐ รีวิวสินค้า</h2>

            {/* เลือกดาว */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                คะแนนความพึงพอใจ
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1,2,3,4,5].map(star => (
                  <button key={star} type="button"
                    onClick={() => setRating(star)}
                    style={{ background: 'none', border: 'none', fontSize: '28px',
                      cursor: 'pointer', color: star <= rating ? 'var(--gold)' : 'rgba(255,255,255,0.2)',
                      transition: 'transform 0.1s' }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                    ★
                  </button>
                ))}
              </div>
            </div>

            <textarea placeholder="เขียนรีวิวของคุณที่นี่..."
              className="modern-input" rows="4"
              style={{ resize: 'vertical', marginBottom: '20px' }}
              value={comment} onChange={(e) => setComment(e.target.value)} />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowReviewModal(false)}
                className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
                ยกเลิก
              </button>
              <button className="btn-primary" style={{ flex: 1, padding: '12px' }}
                onClick={async () => {
                  try {
                    if (!selectedProduct) return alert("ไม่พบรหัสสินค้า");
                    await axios.post(`${API_URL}/reviews`, {
                      product_id: selectedProduct, user_id: userId,
                      rating: rating, comment: comment
                    });
                    alert("✅ ขอบคุณสำหรับรีวิวครับ!");
                    setShowReviewModal(false); setComment(""); setRating(5);
                  } catch (err) { console.error(err); alert("❌ รีวิวไม่สำเร็จ"); }
                }}>
                ส่งรีวิว ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 🔝 Navbar ด้านบน */}
      {/* ============================================================ */}
      <nav style={{ background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(10px)',
        padding: '14px 20px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', position: 'sticky', top: 0, zIndex: 900,
        borderBottom: '1px solid var(--border)' }}>

        {/* Logo + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => setIsSidebarOpen(true)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
              color: 'var(--text)', fontSize: '20px', width: '40px', height: '40px',
              borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', transition: 'background 0.2s' }}>
            ☰
          </button>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h2 style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: '800',
              background: 'linear-gradient(135deg, #fff, var(--gold))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🛒 IBIG SHOP
            </h2>
          </Link>
        </div>

        {/* Cart + Auth ด้านขวา */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* ปุ่มตะกร้า (เฉพาะ user) */}
          {userRole !== 'admin' && (
            <Link to="/cart" style={{ textDecoration: 'none', position: 'relative' }}>
              <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                color: 'var(--text)', padding: '8px 14px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🛒
                {cart.length > 0 && (
                  <span style={{ background: 'var(--accent)', color: 'white', fontSize: '11px',
                    fontWeight: '700', padding: '2px 7px', borderRadius: '20px',
                    animation: 'pulse 1.5s infinite' }}>
                    {cart.reduce((a, b) => a + b.qty, 0)}
                  </span>
                )}
              </button>
            </Link>
          )}

          {/* ปุ่ม Login / Logout */}
          {isLoggedIn ? (
            <button onClick={logout} className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}>
              ออกจากระบบ
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}>
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </nav>

      {/* ============================================================ */}
      {/* 📂 Sidebar (Drawer) */}
      {/* ============================================================ */}
      {/* Overlay ด้านหลัง Sidebar */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 998, backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s' }} />
      )}

      <div style={{ position: 'fixed', top: 0, left: isSidebarOpen ? 0 : '-300px',
        width: '270px', height: '100vh', background: 'var(--secondary)',
        borderRight: '1px solid var(--border)',
        boxShadow: isSidebarOpen ? '8px 0 30px rgba(0,0,0,0.5)' : 'none',
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)', zIndex: 999,
        display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* Header Sidebar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--card)' }}>
          <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text)' }}>เมนูหลัก</span>
          <button onClick={() => setIsSidebarOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: '20px', cursor: 'pointer' }}>✖</button>
        </div>

        {/* Profile ใน Sidebar */}
        {isLoggedIn && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '50%',
              overflow: 'hidden', background: 'rgba(255,255,255,0.08)',
              border: '2px solid var(--accent)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {profile.profile_picture ? (
                <img src={profile.profile_picture} alt="avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              ) : <span style={{ fontSize: '22px' }}>👤</span>}
            </div>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '14px' }}>
                {profile.username || 'ผู้ใช้งาน'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {profile.email || ''}
              </div>
              <span className="badge" style={{ marginTop: '4px', fontSize: '10px',
                background: userRole === 'admin' ? 'rgba(245,166,35,0.15)' : 'rgba(0,184,148,0.15)',
                color: userRole === 'admin' ? 'var(--gold)' : 'var(--green)',
                border: `1px solid ${userRole === 'admin' ? 'rgba(245,166,35,0.3)' : 'rgba(0,184,148,0.3)'}` }}>
                {userRole === 'admin' ? '🔑 Admin' : '👤 Customer'}
              </span>
            </div>
          </div>
        )}

        {/* เนื้อหาเมนู */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          
          {/* โปรไฟล์ (User เท่านั้น) */}
          {isLoggedIn && userRole !== 'admin' && (
            <Link to="/profile" onClick={() => setIsSidebarOpen(false)} className="sidebar-link">
              👤 โปรไฟล์ของฉัน
            </Link>
          )}

          {/* หน้าแรก */}
          <Link to="/" onClick={() => { setIsSidebarOpen(false); setSelectedCategory('ทั้งหมด'); }}
            className="sidebar-link">
            🏠 หน้าแรก
          </Link>

          {/* หมวดหมู่สินค้า (พับ/กาง) */}
          <div>
            <button onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              style={{ width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.03)',
                border: '1px solid transparent', borderRadius: '10px', padding: '12px 16px',
                color: 'var(--text)', fontSize: '15px', fontWeight: '600',
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center' }}>
              <span>📦 หมวดหมู่สินค้า</span>
              <span style={{ transition: 'transform 0.2s',
                transform: isCategoryOpen ? 'rotate(180deg)' : 'none', fontSize: '12px' }}>▼</span>
            </button>
            {/* รายการหมวดหมู่ (ซ่อน/แสดง) */}
            {isCategoryOpen && (
              <div style={{ paddingLeft: '12px', marginTop: '6px',
                display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {categories.map(cat => (
                  <button key={cat}
                    onClick={() => { setSelectedCategory(cat); setIsSidebarOpen(false); navigate('/'); }}
                    style={{ textAlign: 'left', background: selectedCategory === cat
                      ? 'rgba(233,69,96,0.15)' : 'transparent',
                      color: selectedCategory === cat ? 'var(--accent)' : 'var(--text-muted)',
                      border: `1px solid ${selectedCategory === cat ? 'rgba(233,69,96,0.3)' : 'transparent'}`,
                      padding: '9px 14px', borderRadius: '8px', cursor: 'pointer',
                      fontWeight: selectedCategory === cat ? '700' : '500', fontSize: '14px',
                      transition: 'all 0.2s' }}>
                    {selectedCategory === cat ? '● ' : '○ '}{cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ตะกร้า + ประวัติสั่งซื้อ (User) */}
          {userRole !== 'admin' && (
            <>
              <Link to="/cart" onClick={() => setIsSidebarOpen(false)} className="sidebar-link">
                🛒 ตะกร้าสินค้า
                {cart.length > 0 && (
                  <span className="badge" style={{ marginLeft: 'auto', background: 'var(--accent)',
                    color: 'white', fontSize: '11px' }}>
                    {cart.reduce((a, b) => a + b.qty, 0)}
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

          {/* เมนู Admin */}
          {isLoggedIn && userRole === 'admin' && (
            <div style={{ marginTop: '8px', background: 'rgba(0,184,148,0.05)',
              border: '1px solid rgba(0,184,148,0.15)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ color: 'var(--green)', fontSize: '12px', fontWeight: '700',
                marginBottom: '10px', letterSpacing: '1px' }}>⚙️ ระบบหลังบ้าน</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {adminMenuItems.map(item => (
                  <button key={item.key}
                    onClick={() => { setAdminTab(item.key); navigate('/admin'); setIsSidebarOpen(false); }}
                    style={{ textAlign: 'left', background: adminTab === item.key
                      ? 'rgba(0,184,148,0.15)' : 'transparent',
                      color: adminTab === item.key ? 'var(--green)' : 'var(--text-muted)',
                      border: `1px solid ${adminTab === item.key ? 'rgba(0,184,148,0.3)' : 'transparent'}`,
                      padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                      fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }}>
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🗺️ Routes */}
      {/* ============================================================ */}
      <Routes>

        {/* ===== หน้าแรก: แสดงสินค้า ===== */}
        <Route path="/" element={
          <div>
            {/* Hero Banner */}
            <div style={{ padding: 'clamp(40px, 8vw, 80px) 20px',
              background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0f0f1a 100%)',
              textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', width: '400px', height: '400px',
                background: 'radial-gradient(circle, rgba(233,69,96,0.12) 0%, transparent 70%)',
                top: '-100px', right: '-100px', borderRadius: '50%', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(15,52,96,0.3) 0%, transparent 70%)',
                bottom: '-50px', left: '-50px', borderRadius: '50%', pointerEvents: 'none' }} />

              <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', margin: '0 0 10px',
                fontWeight: '900', letterSpacing: '-1px' }}>
                <span className="gradient-text">🛍️ IBIG SHOP</span>
              </h1>
              <p style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', color: 'var(--text-muted)', margin: '0 0 28px' }}>
                "ช้อปใหญ่ จ่ายน้อย สอยทุกความคุ้ม!"
              </p>

              {/* ช่องค้นหา */}
              <div style={{ position: 'relative', maxWidth: '580px', margin: '0 auto' }}>
                <span style={{ position: 'absolute', left: '18px', top: '50%',
                  transform: 'translateY(-50%)', fontSize: '18px', pointerEvents: 'none' }}>🔍</span>
                <input type="text" placeholder="ค้นหาสินค้าที่ใช่สำหรับคุณ..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-input"
                  style={{ paddingLeft: '50px', borderRadius: '50px', fontSize: '15px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} />
              </div>

              {/* จำนวนสินค้าที่พบ */}
              {searchTerm && (
                <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  พบ <strong style={{ color: 'var(--accent)' }}>{filteredProducts.length}</strong> รายการ
                </p>
              )}
            </div>

            {/* Grid สินค้า */}
            <div style={{ padding: '30px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
              gap: '20px', maxWidth: '1300px', margin: '0 auto' }}>
              {filteredProducts.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center',
                  padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '50px', marginBottom: '16px' }}>😔</div>
                  <p>ไม่พบสินค้าที่ค้นหา</p>
                </div>
              ) : filteredProducts.map((item, index) => (
                <div key={item.id} className="product-card"
                  style={{ animationDelay: `${index * 0.04}s` }}>
                  
                  {/* รูปสินค้า */}
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name}
                        style={{ width: '100%', height: '200px', objectFit: 'cover',
                          transition: 'transform 0.4s' }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div style={{ height: '200px', background: 'rgba(255,255,255,0.04)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '60px' }}>📦</div>
                    )}
                    {/* สต็อกหมด overlay */}
                    {item.stock <= 0 && (
                      <div style={{ position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.6)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center' }}>
                        <span className="badge status-cancel" style={{ fontSize: '14px', padding: '8px 16px' }}>
                          สินค้าหมด
                        </span>
                      </div>
                    )}
                    {/* Badge หมวดหมู่ */}
                    {item.category && (
  <span 
    className="badge status-shipping" 
    style={{ 
      position: 'absolute', 
      top: '10px', 
      left: '10px',
      background: 'rgba(15, 52, 96, 0.9)',
      color: '#74b9ff',
      border: '1px solid rgba(52, 152, 219, 0.4)',
      fontSize: '11px',
      fontWeight: '700',
      padding: '3px 8px',
      borderRadius: '20px'
    }}
  >
    {item.category}
  </span>
)}
                  </div>

                  {/* ข้อมูลสินค้า */}
                  <div style={{ padding: '18px' }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '700',
                      color: 'var(--text)', lineHeight: '1.3' }}>
                      {item.name}
                    </h3>
                    <p style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: '800',
                      color: 'var(--gold)' }}>
                      ฿{Number(item.price).toLocaleString()}
                    </p>
                    <p style={{ margin: '0 0 14px', fontSize: '12px',
                      color: item.stock > 0 ? 'var(--green)' : 'var(--accent)', fontWeight: '600' }}>
                      {item.stock > 0 ? `✅ คงเหลือ ${item.stock} ชิ้น` : '❌ สินค้าหมด'}
                    </p>

                    {/* ปุ่มดูรายละเอียด + ใส่ตะกร้า */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => navigate(`/product/${item.id}`)}
                        className="btn-secondary" style={{ flex: 1, padding: '9px', fontSize: '13px' }}>
                        🔍 รายละเอียด
                      </button>
                      <button onClick={() => addToCart(item)} disabled={item.stock <= 0}
                        style={{ flex: 1, padding: '9px', fontSize: '13px', border: 'none',
                          borderRadius: '8px', fontWeight: '700', cursor: item.stock > 0 ? 'pointer' : 'not-allowed',
                          background: item.stock > 0
                            ? 'linear-gradient(135deg, var(--accent), #c0392b)' : '#333',
                          color: item.stock > 0 ? 'white' : '#666',
                          transition: 'all 0.2s' }}>
                        {item.stock > 0 ? '🛒 ใส่ตะกร้า' : 'หมด'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <footer style={{ marginTop: '40px', padding: 'clamp(24px, 5vw, 48px) 20px',
              background: 'var(--secondary)', borderTop: '1px solid var(--border)',
              textAlign: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px',
                color: 'var(--text)' }}>🛍️ IBIG SHOP</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 16px' }}>
                ติดต่อเรา: 093-112-1917 | Line: @phuwadet5617
              </p>
              <div style={{ width: '40px', height: '2px',
                background: 'var(--accent)', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '12px', color: '#4a5568', margin: 0 }}>
                © 2026 IBIG SHOP. All rights reserved.
              </p>
            </footer>
          </div>
        } />

        {/* ===== หน้าโปรไฟล์ ===== */}
        <Route path="/profile" element={
          isLoggedIn ? <ProfilePage userId={userId} /> : <Navigate to="/login" replace />
        } />

        {/* ===== หน้ารายละเอียดสินค้า ===== */}
        <Route path="/product/:id" element={
          <ProductDetailPage products={products} addToCart={addToCart}
            productReviews={productReviews} fetchProductReviews={fetchProductReviews} />
        } />

        {/* ===== หน้าตะกร้าสินค้า ===== */}
        <Route path="/cart" element={
          <div style={{ padding: '24px 16px', maxWidth: '860px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0, color: 'var(--text)' }}>🛒 ตะกร้าสินค้า</h2>
              {cart.length > 0 && (
                <button onClick={clearCart} className="btn-secondary"
                  style={{ color: 'var(--accent)', borderColor: 'rgba(233,69,96,0.3)', fontSize: '13px' }}>
                  🗑️ ล้างตะกร้าทั้งหมด
                </button>
              )}
            </div>

            <div className="card" style={{ padding: '20px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '60px', marginBottom: '16px' }}>🛒</div>
                  <p>ตะกร้าว่างเปล่า</p>
                  <button onClick={() => navigate('/')} className="btn-primary"
                    style={{ marginTop: '16px' }}>เลือกซื้อสินค้า</button>
                </div>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center',
                      gap: '14px', borderBottom: '1px solid var(--border)', padding: '14px 0',
                      flexWrap: 'wrap' }}>
                      <img src={item.image} alt={item.name}
                        style={{ width: '72px', height: '72px', objectFit: 'cover',
                          borderRadius: '8px', flexShrink: 0,
                          border: '1px solid var(--border)' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/72'; }} />

                      <div style={{ flex: 1, minWidth: '120px' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: 'var(--text)' }}>
                          {item.name}
                        </h4>
                        <p style={{ margin: 0, color: 'var(--gold)', fontWeight: '700', fontSize: '16px' }}>
                          ฿{Number(item.price).toLocaleString()}
                        </p>
                      </div>

                      {/* ตัวเลือกจำนวน */}
                      <div style={{ display: 'flex', alignItems: 'center',
                        border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                        <button onClick={() => updateQuantity(item.id, -1)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: 'none',
                            color: 'var(--text)', padding: '8px 14px', cursor: 'pointer',
                            fontSize: '16px' }}>-</button>
                        <span style={{ padding: '8px 16px', minWidth: '40px', textAlign: 'center',
                          fontWeight: '700' }}>{item.qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: 'none',
                            color: 'var(--text)', padding: '8px 14px', cursor: 'pointer',
                            fontSize: '16px' }}>+</button>
                      </div>

                      <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text)',
                        minWidth: '80px', textAlign: 'right' }}>
                        ฿{(item.price * item.qty).toLocaleString()}
                      </div>

                      <button onClick={() => removeFromCart(item.id)}
                        style={{ background: 'none', border: 'none',
                          color: 'var(--accent)', fontSize: '20px', cursor: 'pointer' }}>✖</button>
                    </div>
                  ))}

                  {/* ยอดรวม + ปุ่มชำระเงิน */}
                  <div style={{ marginTop: '24px', textAlign: 'right' }}>
                    <p style={{ margin: '0 0 16px', fontSize: '20px' }}>
                      รวมทั้งสิ้น:{' '}
                      <strong style={{ fontSize: '26px', color: 'var(--gold)' }}>
                        ฿{calculateTotal().toLocaleString()}
                      </strong>
                    </p>
                    <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}
                      onClick={() => {
                        if (isLoggedIn) {
                          axios.get(`${API_URL}/users/${userId}`)
                            .then(res => { setAddress(res.data.address || ''); setPhone(res.data.phone || ''); checkout(); });
                        } else { navigate('/login'); }
                      }}>
                      {isLoggedIn ? '✅ ยืนยันการสั่งซื้อ' : '🔑 ล็อกอินเพื่อสั่งซื้อ'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        } />

        {/* ===== หน้าประวัติการสั่งซื้อ ===== */}
        <Route path="/my-orders" element={
          <div style={{ padding: '24px 16px', maxWidth: '960px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', margin: '0 0 24px', color: 'var(--text)' }}>
              📋 ประวัติการสั่งซื้อของฉัน
            </h2>
            <div className="card" style={{ padding: '8px', overflowX: 'auto' }}>
              {myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '50px', marginBottom: '12px' }}>📭</div>
                  <p>ยังไม่มีรายการสั่งซื้อ</p>
                  <button onClick={() => navigate('/')} className="btn-primary"
                    style={{ marginTop: '12px' }}>เลือกซื้อสินค้า</button>
                </div>
              ) : (
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>ออเดอร์</th>
                      <th>วันที่สั่ง</th>
                      <th>ราคารวม</th>
                      <th>สถานะ</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.map(order => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: '700' }}>#{order.id}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                          {new Date(order.created_at).toLocaleDateString('th-TH')}
                        </td>
                        <td style={{ color: 'var(--gold)', fontWeight: '700' }}>
                          ฿{Number(order.total_price).toLocaleString()}
                        </td>
                        <td>
                          <span className={`badge ${getStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {/* ปุ่มทั้งหมด: ยกเลิก, จ่ายเงิน, บิล, ตามพัสดุ, รีวิว, ลบ */}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {order.status === 'รอดำเนินการ' && (
                              <button onClick={() => cancelOrder(order.id)}
                                style={{ background: 'rgba(233,69,96,0.15)', color: 'var(--accent)',
                                  border: '1px solid rgba(233,69,96,0.3)', padding: '5px 10px',
                                  borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                ยกเลิก
                              </button>
                            )}
                            <button onClick={() => { setCurrentOrderId(order.id); setShowPayModal(true); }}
                              style={{ background: 'rgba(52,152,219,0.15)', color: '#74b9ff',
                                border: '1px solid rgba(52,152,219,0.3)', padding: '5px 10px',
                                borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                              💳 จ่ายเงิน
                            </button>
                            <button onClick={() => generatePDF(order)}
                              style={{ background: 'rgba(0,184,148,0.15)', color: 'var(--green)',
                                border: '1px solid rgba(0,184,148,0.3)', padding: '5px 10px',
                                borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                              📄 บิล
                            </button>

                            {/* ปุ่มตามพัสดุ (แสดงเมื่อมีเลขพัสดุ) */}
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
                              }}
                              style={{ background: 'rgba(245,166,35,0.15)', color: 'var(--gold)',
                                border: '1px solid rgba(245,166,35,0.3)', padding: '5px 10px',
                                borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                🚚 ตามพัสดุ
                              </button>
                            )}

                            {/* ปุ่มรีวิว (จัดส่งแล้ว) */}
                            {order.status === 'จัดส่งแล้ว' && (
                              <button onClick={() => {
                                console.log("product_id:", order.product_id, "order:", order);
                                setSelectedProduct(order.product_id);
                                setShowReviewModal(true);
                              }}
                              style={{ background: 'rgba(108,92,231,0.15)', color: '#a29bfe',
                                border: '1px solid rgba(108,92,231,0.3)', padding: '5px 10px',
                                borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                ⭐ รีวิว
                              </button>
                            )}

                            <button onClick={() => deleteOrderHistory(order.id)}
                              style={{ background: 'rgba(233,69,96,0.1)', color: 'var(--accent)',
                                border: '1px solid rgba(233,69,96,0.2)', padding: '5px 10px',
                                borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        } />

        {/* ===== หน้า Login ===== */}
        <Route path="/login" element={
          isLoggedIn ? (userRole === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />) : (
            <div style={{ minHeight: '80vh', display: 'flex',
              justifyContent: 'center', alignItems: 'center', padding: '24px 16px' }}>
              <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '36px 32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔐</div>
                  <h2 style={{ margin: 0, color: 'var(--text)' }}>เข้าสู่ระบบ</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
                    ยินดีต้อนรับกลับมา!
                  </p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px',
                      fontSize: '13px', color: 'var(--text-muted)' }}>ชื่อผู้ใช้งาน</label>
                    <input name="username" type="text" placeholder="Username" required
                      className="modern-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px',
                      fontSize: '13px', color: 'var(--text-muted)' }}>รหัสผ่าน</label>
                    <input name="password" type="password" placeholder="Password" required
                      className="modern-input" />
                  </div>
                  <button type="submit" className="btn-primary"
                    style={{ padding: '13px', fontSize: '16px', marginTop: '8px' }}>
                    เข้าสู่ระบบ →
                  </button>
                </form>
                <p style={{ marginTop: '20px', textAlign: 'center',
                  color: 'var(--text-muted)', fontSize: '14px' }}>
                  ยังไม่มีบัญชี?{' '}
                  <Link to="/register" style={{ color: 'var(--accent)', fontWeight: '700' }}>
                    สมัครสมาชิกฟรี
                  </Link>
                </p>
              </div>
            </div>
          )
        } />

        {/* ===== หน้า Register ===== */}
        <Route path="/register" element={
          <div style={{ minHeight: '80vh', display: 'flex',
            justifyContent: 'center', alignItems: 'center', padding: '24px 16px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '36px 32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>📝</div>
                <h2 style={{ margin: 0, color: 'var(--text)' }}>สมัครสมาชิกใหม่</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
                  เริ่มช้อปกับเราวันนี้!
                </p>
              </div>

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { name: 'username', label: 'ชื่อผู้ใช้งาน', type: 'text', placeholder: 'Username' },
                  { name: 'password', label: 'รหัสผ่าน', type: 'password', placeholder: 'Password' },
                  { name: 'confirmPassword', label: 'ยืนยันรหัสผ่าน', type: 'password', placeholder: 'Confirm Password' },
                ].map(field => (
                  <div key={field.name}>
                    <label style={{ display: 'block', marginBottom: '6px',
                      fontSize: '13px', color: 'var(--text-muted)' }}>{field.label}</label>
                    <input name={field.name} type={field.type} placeholder={field.placeholder}
                      required className="modern-input" />
                  </div>
                ))}
                <button type="submit" className="btn-primary"
                  style={{ padding: '13px', fontSize: '16px', marginTop: '8px',
                    background: 'linear-gradient(135deg, var(--green), #00967d)' }}>
                  สมัครสมาชิก ✨
                </button>
              </form>
              <p style={{ marginTop: '20px', textAlign: 'center',
                color: 'var(--text-muted)', fontSize: '14px' }}>
                มีบัญชีอยู่แล้ว?{' '}
                <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '700' }}>
                  เข้าสู่ระบบที่นี่
                </Link>
              </p>
            </div>
          </div>
        } />

        {/* ===== หน้า Admin ===== */}
        <Route path="/admin" element={
          isLoggedIn && userRole === 'admin' ? (
            <div style={{ padding: '24px 16px', maxWidth: '1200px', margin: '0 auto' }}>
              <h1 style={{ margin: '0 0 20px', color: 'var(--text)' }}>
                ⚙️ ระบบจัดการหลังบ้าน
              </h1>

              {/* Admin Tabs */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap',
                marginBottom: '24px', background: 'var(--card)',
                padding: '8px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                {adminMenuItems.map(item => (
                  <button key={item.key}
                    className={`admin-tab ${adminTab === item.key ? 'active' : ''}`}
                    onClick={() => setAdminTab(item.key)}>
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>

              {/* ===== Tab: รายงานสถิติ ===== */}
              {adminTab === 'report' && (
                <div style={{ animation: 'fadeUp 0.3s ease' }}>
                  {/* KPI Cards */}
                  <div style={{ display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px', marginBottom: '28px' }}>
                    {[
                      { label: 'ยอดขายรวม', value: `฿${totalSales.toLocaleString()}`, icon: '💰', color: 'var(--green)' },
                      { label: 'รอตรวจสอบ', value: pendingOrders, icon: '⏳', color: 'var(--gold)' },
                      { label: 'จัดส่งแล้ว', value: completedOrders, icon: '✅', color: '#74b9ff' },
                      { label: 'ลูกค้าทั้งหมด', value: totalUsers, icon: '👤', color: '#a29bfe' },
                    ].map((kpi, i) => (
                      <div key={i} className="card" style={{ padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{kpi.icon}</div>
                        <div style={{ fontSize: '26px', fontWeight: '800', color: kpi.color }}>
                          {kpi.value}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {kpi.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* กราฟยอดขาย */}
                  <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 20px', color: 'var(--text)' }}>📈 สถิติยอดขายรายวัน</h3>
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
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                          <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                          <Legend />
                          <Bar dataKey="ยอดขาย" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== Tab: เพิ่ม/แก้ไขสินค้า ===== */}
              {adminTab === 'add' && (
                <div className="card" style={{ padding: '28px', animation: 'fadeUp 0.3s ease' }}>
                  <h3 style={{ margin: '0 0 24px', color: 'var(--text)' }}>
                    {editingProduct ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่'}
                  </h3>
                  <form onSubmit={addOrUpdateProduct}>
                    <div style={{ display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px', marginBottom: '20px' }}>
                      {[
                        { name: 'name', placeholder: 'ชื่อสินค้า', label: '📦 ชื่อสินค้า' },
                        { name: 'category', placeholder: 'หมวดหมู่', label: '🏷️ หมวดหมู่' },
                        { name: 'stock', placeholder: 'จำนวนสต็อก', label: '📊 สต็อก', type: 'number' },
                        { name: 'price', placeholder: 'ราคา (บาท)', label: '💰 ราคา', type: 'number' },
                      ].map(field => (
                        <div key={field.name}>
                          <label style={{ display: 'block', marginBottom: '6px',
                            fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                            {field.label}
                          </label>
                          <input name={field.name} type={field.type || 'text'}
                            placeholder={field.placeholder} required
                            defaultValue={editingProduct?.[field.name === 'desc' ? 'description' : field.name] || ''}
                            className="modern-input" />
                        </div>
                      ))}

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px',
                          fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                          🖼️ รูปสินค้า
                        </label>
                        <input name="image" type="file" accept="image/*"
                          onChange={(e) => setFile(e.target.files[0])}
                          style={{ color: 'var(--text)', background: 'rgba(255,255,255,0.05)',
                            padding: '10px', borderRadius: '8px', width: '100%',
                            border: '1px solid var(--border)', fontSize: '13px' }} />
                      </div>

                      <div style={{ gridColumn: '1/-1' }}>
                        <label style={{ display: 'block', marginBottom: '6px',
                          fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                          📝 รายละเอียด
                        </label>
                        <textarea name="desc" placeholder="รายละเอียดสินค้า..."
                          defaultValue={editingProduct?.description || ''}
                          className="modern-input" rows="3" style={{ resize: 'vertical' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button type="submit" className="btn-primary" style={{ padding: '12px 28px' }}>
                        💾 บันทึก
                      </button>
                      {editingProduct && (
                        <button type="button" className="btn-secondary"
                          style={{ padding: '12px 20px' }}
                          onClick={() => { setEditingProduct(null); setFile(null); }}>
                          ยกเลิก
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* ===== Tab: จัดการสต็อก ===== */}
              {adminTab === 'stock' && (
                <div style={{ animation: 'fadeUp 0.3s ease' }}>
                  <h3 style={{ color: 'var(--text)', margin: '0 0 16px' }}>📦 จัดการสต็อกสินค้า</h3>
                  <div className="card" style={{ overflowX: 'auto' }}>
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>สินค้า</th>
                          <th>ราคา</th>
                          <th className="hide-mobile">หมวดหมู่</th>
                          <th>สต็อก</th>
                          <th>จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {p.image && (
                                  <img src={p.image} alt={p.name}
                                    style={{ width: '40px', height: '40px', objectFit: 'cover',
                                      borderRadius: '6px', border: '1px solid var(--border)', flexShrink: 0 }} />
                                )}
                                <span style={{ fontWeight: '600', fontSize: '14px' }}>{p.name}</span>
                              </div>
                            </td>
                            <td style={{ color: 'var(--gold)', fontWeight: '700' }}>
                              ฿{Number(p.price).toLocaleString()}
                            </td>
                            <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                              {p.category || '—'}
                            </td>
                            <td>
                              <span className={`badge ${p.stock > 5 ? 'status-paid' : p.stock > 0 ? 'status-pending' : 'status-cancel'}`}>
                                {p.stock} ชิ้น
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => { selectToEdit(p); setAdminTab('add'); }}
                                  style={{ background: 'rgba(245,166,35,0.15)', color: 'var(--gold)',
                                    border: '1px solid rgba(245,166,35,0.3)', padding: '6px 12px',
                                    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                  ✏️ แก้ไข
                                </button>
                                <button onClick={() => deleteProduct(p.id)}
                                  style={{ background: 'rgba(233,69,96,0.15)', color: 'var(--accent)',
                                    border: '1px solid rgba(233,69,96,0.3)', padding: '6px 12px',
                                    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                  🗑️ ลบ
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== Tab: รายการสั่งซื้อ ===== */}
              {adminTab === 'orders' && (
                <div style={{ animation: 'fadeUp 0.3s ease' }}>
                  {/* ปุ่ม Export */}
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text)' }}>🧾 รายการสั่งซื้อ</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={exportToExcel}
                        style={{ background: 'rgba(0,184,148,0.15)', color: 'var(--green)',
                          border: '1px solid rgba(0,184,148,0.3)', padding: '8px 16px',
                          borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                        📊 Excel
                      </button>
                      <button onClick={exportToPDF}
                        style={{ background: 'rgba(233,69,96,0.15)', color: 'var(--accent)',
                          border: '1px solid rgba(233,69,96,0.3)', padding: '8px 16px',
                          borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                        📄 PDF
                      </button>
                    </div>
                  </div>

                  {/* ตัวกรอง */}
                  <div className="card" style={{ padding: '16px', marginBottom: '16px',
                    display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input type="text" placeholder="🔍 ค้นหาเลขที่ออเดอร์หรือที่อยู่..."
                      value={orderSearchTerm} onChange={(e) => setOrderSearchTerm(e.target.value)}
                      className="modern-input" style={{ flex: '1 1 200px', minWidth: 0 }} />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                      className="modern-input" style={{ flex: '0 1 160px' }}>
                      <option value="ทั้งหมด">ทุกสถานะ</option>
                      <option value="รอดำเนินการ">รอดำเนินการ</option>
                      <option value="ชำระเงินแล้ว">ชำระเงินแล้ว</option>
                      <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                      <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                      <option value="ยกเลิก">ยกเลิก</option>
                    </select>
                    <input type="date" value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="modern-input" style={{ flex: '0 1 160px' }} />
                    <button onClick={() => { setOrderSearchTerm(''); setStatusFilter('ทั้งหมด'); setDateFilter(''); }}
                      className="btn-secondary" style={{ fontSize: '13px', padding: '10px 16px' }}>
                      ล้างค่า
                    </button>
                  </div>

                  {/* ตารางออเดอร์ */}
                  <div className="card" style={{ overflowX: 'auto' }}>
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>ออเดอร์</th>
                          <th className="hide-mobile">ที่อยู่จัดส่ง</th>
                          <th>ราคารวม</th>
                          <th className="hide-mobile">หลักฐาน</th>
                          <th>สถานะ</th>
                          <th>พิมพ์</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map(order => (
                          <tr key={order.id}>
                            <td>
                              <div style={{ fontWeight: '700', color: 'var(--text)' }}>#{order.id}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                                {order.created_at ? new Date(order.created_at).toLocaleString('th-TH', {
                                  year: 'numeric', month: 'short', day: 'numeric',
                                  hour: '2-digit', minute: '2-digit'
                                }) : 'ไม่ระบุ'}
                              </div>
                            </td>
                            <td className="hide-mobile" style={{ maxWidth: '220px' }}>
                              <div style={{ color: 'var(--text)', fontSize: '13px' }}>
                                📍 {order.address}
                              </div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                📞 {order.phone}
                              </div>
                            </td>
                            <td style={{ color: 'var(--gold)', fontWeight: '700' }}>
                              ฿{Number(order.total_price).toLocaleString()}
                            </td>
                            <td className="hide-mobile">
                              {order.slip_image ? (
                                <button onClick={() => window.open(order.slip_image, '_blank')}
                                  style={{ background: 'rgba(108,92,231,0.15)', color: '#a29bfe',
                                    border: '1px solid rgba(108,92,231,0.3)', padding: '6px 12px',
                                    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                  🖼️ ดูสลิป
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>ยังไม่ส่ง</span>
                              )}
                            </td>
                            <td>
                              {/* Dropdown เปลี่ยนสถานะ */}
                              <select value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="modern-input"
                                style={{ padding: '6px 10px', fontSize: '12px', minWidth: '130px' }}>
                                <option value="รอดำเนินการ">รอดำเนินการ</option>
                                <option value="ชำระเงินแล้ว">ชำระเงินแล้ว</option>
                                <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                                <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                                <option value="ยกเลิก">ยกเลิก</option>
                              </select>
                            </td>
                            <td>
                              <button onClick={() => generatePDF(order)}
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text)',
                                  border: '1px solid var(--border)', padding: '6px 12px',
                                  borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
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

              {/* ===== Tab: จัดการผู้ใช้ ===== */}
              {adminTab === 'users' && (
                <div style={{ animation: 'fadeUp 0.3s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text)' }}>
                      👥 จัดการผู้ใช้{' '}
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '400' }}>
                        ({users.length} บัญชี)
                      </span>
                    </h3>
                  </div>

                  <div className="card" style={{ overflowX: 'auto' }}>
                    <table className="modern-table">
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
                        {users && users.length > 0 ? users.map((user, index) => (
                          <tr key={user.id || index}>
                            <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{user.id}</td>
                            <td>
                              {/* ป้องกันชื่อหายโดยใช้ค่าสำรองถ้า username เป็น null */}
                              <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '14px' }}>
                                {user.username || "กำลังโหลด..."}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {user.email || "—"}
                              </div>
                            </td>
                            <td>
                              {/* Dropdown เปลี่ยน Role */}
                              <select value={user.role || 'customer'}
                                onChange={(e) => updateUser(user.id, { role: e.target.value, status: user.status })}
                                className="modern-input"
                                style={{ padding: '6px 10px', fontSize: '12px' }}>
                                <option value="customer">👤 Customer</option>
                                <option value="admin">🔑 Admin</option>
                              </select>
                            </td>
                            <td>
                              <span className={`badge ${user.status === 'suspended' ? 'status-cancel' : 'status-paid'}`}>
                                {user.status === 'suspended' ? 'ถูกระงับ' : 'ใช้งานปกติ'}
                              </span>
                            </td>
                            <td>
                              {/* ปุ่มระงับ / ปลดระงับ */}
                              <button
                                onClick={() => {
                                  const newStatus = user.status === 'active' ? 'suspended' : 'active';
                                  if (window.confirm(`ยืนยัน${newStatus === 'suspended' ? 'ระงับ' : 'ปลดระงับ'}บัญชี ${user.username || ''}?`)) {
                                    updateUser(user.id, { role: user.role, status: newStatus });
                                  }
                                }}
                                style={{ background: user.status === 'active'
                                  ? 'rgba(233,69,96,0.15)' : 'rgba(0,184,148,0.15)',
                                  color: user.status === 'active' ? 'var(--accent)' : 'var(--green)',
                                  border: `1px solid ${user.status === 'active' ? 'rgba(233,69,96,0.3)' : 'rgba(0,184,148,0.3)'}`,
                                  padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
                                  fontSize: '12px', fontWeight: '700' }}>
                                {user.status === 'active' ? '🚫 ระงับ' : '✅ ปลดระงับ'}
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '30px',
                              color: 'var(--text-muted)' }}>ไม่พบข้อมูลผู้ใช้งาน</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== Tab: จัดการรีวิว ===== */}
              {adminTab === 'reviews' && (
                <div style={{ animation: 'fadeUp 0.3s ease' }}>
                  <h3 style={{ margin: '0 0 16px', color: 'var(--text)' }}>📝 จัดการรีวิวจากลูกค้า</h3>
                  <div className="card" style={{ overflowX: 'auto' }}>
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>สินค้า</th>
                          <th>ลูกค้า</th>
                          <th>คะแนน</th>
                          <th className="hide-mobile">ความคิดเห็น</th>
                          <th className="hide-mobile">วันที่</th>
                          <th>จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allReviews.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px',
                              color: 'var(--text-muted)' }}>ยังไม่มีรีวิวในขณะนี้</td>
                          </tr>
                        ) : allReviews.map(review => (
                          <tr key={review.id}>
                            <td style={{ fontWeight: '600', fontSize: '13px' }}>{review.product_name}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{review.username}</td>
                            <td style={{ color: 'var(--gold)', letterSpacing: '2px' }}>
                              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </td>
                            <td className="hide-mobile" style={{ color: 'var(--text-muted)',
                              fontSize: '13px', maxWidth: '200px' }}>
                              {review.comment}
                            </td>
                            <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                              {new Date(review.created_at).toLocaleDateString('th-TH')}
                            </td>
                            <td>
                              <button onClick={() => {
                                if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?')) deleteReview(review.id);
                              }}
                              style={{ background: 'rgba(233,69,96,0.15)', color: 'var(--accent)',
                                border: '1px solid rgba(233,69,96,0.3)', padding: '6px 12px',
                                borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
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

            </div>
          ) : <Navigate to="/login" replace />
        } />

      </Routes>
    </div>
  );
}

export default App;