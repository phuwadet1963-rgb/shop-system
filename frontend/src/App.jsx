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
// 🎨 CSS GLOBAL STYLES — ฉีดลง <head> เมื่อ component แรก mount
// ใส่ไว้ที่นี่เพื่อให้สไตล์ทำงานได้โดยไม่ต้องแยกไฟล์ CSS
// ============================================================
const injectGlobalStyles = () => {
  if (document.getElementById('ibig-styles')) return; // ป้องกันเพิ่มซ้ำ
  const style = document.createElement('style');
  style.id = 'ibig-styles';
  style.textContent = `
    /* ── นำเข้าฟอนต์ Sarabun จาก Google Fonts ── */
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Kanit:wght@400;600;700;800&display=swap');

    /* ── CSS Variables: ธีมสีหลักของร้าน ── */
    :root {
      --bg: #0d0d14;
      --surface: #16161f;
      --surface2: #1e1e2a;
      --border: rgba(255,255,255,0.08);
      --text: #f0f0f5;
      --text-muted: #8888a8;
      --gold: #f5c842;
      --accent: #6c5ce7;
      --accent2: #00cec9;
      --danger: #ff4757;
      --success: #2ed573;
      --warning: #ffa502;
      --radius: 14px;
      --shadow: 0 8px 32px rgba(0,0,0,0.4);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Sarabun', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }

    /* ── แอนิเมชัน Fade In ── */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.15); }
    }
    @keyframes slideIn {
      from { transform: translateX(-20px); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* ── ปุ่มสไตล์หลัก ── */
    .btn-primary {
      background: linear-gradient(135deg, var(--accent), #a29bfe);
      color: white;
      border: none;
      border-radius: 10px;
      font-family: 'Sarabun', sans-serif;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.3px;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(108,92,231,0.4);
    }

    /* ── Card Glass Effect ── */
    .glass-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      backdrop-filter: blur(10px);
    }

    /* ── Input Style ── */
    .modern-input {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text);
      padding: 12px 16px;
      font-family: 'Sarabun', sans-serif;
      font-size: 15px;
      width: 100%;
      transition: border-color 0.2s;
      outline: none;
    }
    .modern-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(108,92,231,0.15);
    }
    .modern-input::placeholder { color: var(--text-muted); }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--surface); }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 99px; }

    /* ── Product Card Hover ── */
    .product-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      animation: fadeIn 0.4s ease both;
    }
    .product-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.5);
      border-color: rgba(108,92,231,0.4);
    }

    /* ── Badge ── */
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    /* ── Sidebar Nav Item ── */
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: 10px;
      text-decoration: none; color: var(--text-muted);
      font-weight: 500; font-size: 15px;
      transition: all 0.2s ease;
      border: none; background: transparent; cursor: pointer;
      width: 100%; text-align: left;
    }
    .nav-item:hover {
      background: rgba(108,92,231,0.15);
      color: var(--text);
    }
    .nav-item.active {
      background: linear-gradient(135deg, rgba(108,92,231,0.25), rgba(162,155,254,0.15));
      color: #a29bfe;
      border-left: 3px solid var(--accent);
    }

    /* ── Admin Tab Button ── */
    .admin-tab {
      padding: 9px 14px; border-radius: 8px;
      border: none; cursor: pointer; font-family: 'Sarabun', sans-serif;
      font-size: 14px; font-weight: 600;
      transition: all 0.2s ease;
      display: flex; align-items: center; gap: 6px;
      white-space: nowrap;
    }
    .admin-tab.active {
      background: var(--accent); color: white;
      box-shadow: 0 4px 12px rgba(108,92,231,0.4);
    }
    .admin-tab:not(.active) {
      background: var(--surface2); color: var(--text-muted);
    }
    .admin-tab:not(.active):hover {
      background: rgba(108,92,231,0.2); color: var(--text);
    }

    /* ── Table ── */
    .modern-table { width: 100%; border-collapse: collapse; }
    .modern-table th {
      background: var(--surface2); color: var(--text-muted);
      padding: 14px 16px; font-size: 13px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px;
      text-align: left;
    }
    .modern-table td {
      padding: 14px 16px; border-bottom: 1px solid var(--border);
      font-size: 14px; color: var(--text);
    }
    .modern-table tr:hover td { background: rgba(255,255,255,0.02); }

    /* ── Status Badge ── */
    .status-waiting  { background: rgba(255,165,2,0.15);  color: var(--warning); }
    .status-paid     { background: rgba(0,206,201,0.15);  color: var(--accent2); }
    .status-shipping { background: rgba(108,92,231,0.15); color: #a29bfe; }
    .status-done     { background: rgba(46,213,115,0.15); color: var(--success); }
    .status-cancel   { background: rgba(255,71,87,0.15);  color: var(--danger); }

    /* ── Mobile Responsive ── */
    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
      .mobile-stack { flex-direction: column !important; }
      .mobile-full  { width: 100% !important; }
      .product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
    }
    @media (max-width: 480px) {
      .product-grid { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(style);
};

// ============================================================
// 🧩 HELPER: แปลงสถานะเป็น CSS Class
// ============================================================
const getStatusClass = (status) => {
  if (status === 'รอดำเนินการ') return 'status-waiting';
  if (status === 'ชำระเงินแล้ว') return 'status-paid';
  if (status === 'กำลังจัดส่ง')  return 'status-shipping';
  if (status === 'จัดส่งแล้ว')   return 'status-done';
  if (status === 'ยกเลิก')        return 'status-cancel';
  return '';
};

// ============================================================
// 📄 COMPONENT: ProductDetailPage — หน้ารายละเอียดสินค้า
// Props: products (array), addToCart (fn), productReviews (array), fetchProductReviews (fn)
// ============================================================
function ProductDetailPage({ products, addToCart, productReviews, fetchProductReviews }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === Number(id));

  // 🔄 ดึงรีวิวทุกครั้งที่ id เปลี่ยน
  useEffect(() => {
    if (id) fetchProductReviews(id);
  }, [id, fetchProductReviews]);

  if (!product) return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
      <h3 style={{ color: 'var(--text-muted)', marginBottom: 24 }}>ไม่พบสินค้านี้</h3>
      <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '12px 28px' }}>← กลับหน้าแรก</button>
    </div>
  );

  return (
    <div style={{ padding: '32px 20px', maxWidth: 1000, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>

      {/* ── Card หลัก: รูป + รายละเอียด ── */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: 32, padding: 32 }}>

        {/* 🖼️ รูปสินค้า */}
        <div style={{ flex: '1 1 320px' }}>
          {product.image ? (
            <img src={product.image} alt={product.name}
              style={{ width: '100%', height: 380, objectFit: 'cover', borderRadius: 12 }}
              onError={e => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
            />
          ) : (
            <div style={{ width: '100%', height: 380, background: 'var(--surface2)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, color: 'var(--text-muted)' }}>
              📦
            </div>
          )}
        </div>

        {/* 📝 รายละเอียดสินค้า */}
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* หมวดหมู่ */}
          <span className="badge" style={{ background: 'rgba(108,92,231,0.2)', color: '#a29bfe', alignSelf: 'flex-start' }}>
            🏷️ {product.category || 'ไม่ระบุหมวดหมู่'}
          </span>

          {/* ชื่อสินค้า */}
          <h1 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 700, lineHeight: 1.3 }}>
            {product.name}
          </h1>

          {/* ราคา */}
          <div style={{ fontFamily: 'Kanit, sans-serif', fontSize: 38, fontWeight: 800, color: 'var(--gold)' }}>
            ฿{Number(product.price).toLocaleString()}
          </div>

          {/* รายละเอียด */}
          <div style={{ background: 'var(--surface2)', padding: '14px 16px', borderRadius: 10, lineHeight: 1.7, color: 'var(--text-muted)', fontSize: 15 }}>
            {product.description || 'ไม่มีรายละเอียดสินค้า'}
          </div>

          {/* สถานะสต็อก */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: product.stock > 0 ? 'var(--success)' : 'var(--danger)',
              boxShadow: `0 0 8px ${product.stock > 0 ? 'var(--success)' : 'var(--danger)'}`
            }} />
            <span style={{ fontWeight: 600, color: product.stock > 0 ? 'var(--success)' : 'var(--danger)', fontSize: 15 }}>
              {product.stock > 0 ? `มีสินค้าพร้อมส่ง (${product.stock} ชิ้น)` : 'สินค้าหมดชั่วคราว'}
            </span>
          </div>

          {/* ปุ่มใส่ตะกร้า */}
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
            className={product.stock > 0 ? 'btn-primary' : ''}
            style={{
              marginTop: 'auto', padding: '15px', fontSize: 17, fontWeight: 700,
              borderRadius: 12, border: 'none', cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
              background: product.stock <= 0 ? 'var(--surface2)' : undefined,
              color: product.stock <= 0 ? 'var(--text-muted)' : undefined,
            }}
          >
            {product.stock > 0 ? '🛒 หยิบใส่ตะกร้า' : '❌ สินค้าหมด'}
          </button>
        </div>
      </div>

      {/* ── Section รีวิว ── */}
      <div className="glass-card" style={{ marginTop: 24, padding: 28 }}>
        <h3 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          💬 รีวิวจากลูกค้า
          <span className="badge" style={{ background: 'rgba(108,92,231,0.2)', color: '#a29bfe', fontSize: 14 }}>
            {productReviews.length}
          </span>
        </h3>

        {productReviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>ยังไม่มีรีวิวสำหรับสินค้านี้</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {productReviews.map(rev => (
              <div key={rev.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong style={{ color: 'var(--text)' }}>👤 {rev.username}</strong>
                  <span style={{ color: '#f5c842', fontSize: 16, letterSpacing: 2 }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>{rev.comment}</p>
                <small style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
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
// 👤 COMPONENT: ProfilePage — หน้าแก้ไขข้อมูลส่วนตัว
// Props: userId (string/number)
// ============================================================
function ProfilePage({ userId }) {
  const [profile, setProfile] = useState({ username: '', email: '', address: '', phone: '', profile_picture: '', password: '' });
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  // โหลดข้อมูล profile เมื่อมี userId
  useEffect(() => {
    if (userId) {
      axios.get(`${API_URL}/users/${userId}`)
        .then(res => setProfile({ ...res.data, password: '' }))
        .catch(err => console.error("ดึงข้อมูลไม่สำเร็จ", err));
    }
  }, [userId]);

  // บันทึกข้อมูล profile (รองรับอัปโหลดรูป Cloudinary)
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

  // helper: label + input สำหรับแต่ละช่อง
  const Field = ({ label, children }) => (
    <div>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ padding: '32px 20px', maxWidth: 560, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
      <div className="glass-card" style={{ padding: 32 }}>
        <h2 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 24, textAlign: 'center', marginBottom: 28, color: 'var(--text)' }}>
          👤 ข้อมูลของฉัน
        </h2>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* รูปโปรไฟล์ */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 110, height: 110, margin: '0 auto 12px', borderRadius: '50%',
              overflow: 'hidden', background: 'var(--surface2)',
              border: '3px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(108,92,231,0.3)'
            }}>
              {file ? (
                <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : profile.profile_picture ? (
                <img src={profile.profile_picture} alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.src = 'https://via.placeholder.com/150'; }}
                />
              ) : (
                <span style={{ fontSize: 48 }}>👤</span>
              )}
            </div>
            <label style={{
              display: 'inline-block', background: 'rgba(108,92,231,0.2)', color: '#a29bfe',
              padding: '8px 18px', borderRadius: 20, cursor: 'pointer', fontSize: 14, fontWeight: 600,
              border: '1px solid rgba(108,92,231,0.3)', transition: 'all 0.2s'
            }}>
              📸 เปลี่ยนรูปโปรไฟล์
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
            </label>
          </div>

          <Field label="👤 ชื่อผู้ใช้งาน">
            <input type="text" required value={profile.username || ''} className="modern-input"
              onChange={e => setProfile({ ...profile, username: e.target.value })} placeholder="ชื่อผู้ใช้งาน" />
          </Field>

          <Field label="📧 อีเมล">
            <input type="email" required value={profile.email || ''} className="modern-input"
              onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="อีเมลของคุณ" />
          </Field>

          <Field label="🔐 รหัสผ่านใหม่ (ว่างไว้ถ้าไม่เปลี่ยน)">
            <input type="password" value={profile.password || ''} className="modern-input"
              onChange={e => setProfile({ ...profile, password: e.target.value })} placeholder="••••••••" />
          </Field>

          <div style={{ height: 1, background: 'var(--border)' }} />

          <Field label="🏠 ที่อยู่จัดส่ง">
            <textarea rows="3" value={profile.address || ''} className="modern-input"
              onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด..." />
          </Field>

          <Field label="📞 เบอร์โทรศัพท์">
            <input type="text" value={profile.phone || ''} className="modern-input"
              onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="08x-xxx-xxxx" />
          </Field>

          <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: 16 }}>
            💾 บันทึกข้อมูล
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// 📁 COMPONENT: CategoryManagement — จัดการหมวดหมู่สินค้า (Admin)
// Props: categories (array), fetchCats (fn)
// ============================================================
function CategoryManagement({ categories, fetchCats }) {
  const [newCatName, setNewCatName] = useState('');

  // เพิ่มหมวดหมู่ใหม่
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return alert("กรุณากรอกชื่อหมวดหมู่");
    try {
      await axios.post(`${API_URL}/admin/categories`, { name: newCatName });
      setNewCatName('');
      if (fetchCats) fetchCats();
    } catch { alert("เพิ่มไม่สำเร็จ"); }
  };

  // ลบหมวดหมู่
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("ยืนยันการลบหมวดหมู่?")) return;
    try {
      await axios.delete(`${API_URL}/admin/categories/${id}`);
      if (fetchCats) fetchCats();
    } catch { alert("ลบไม่สำเร็จ"); }
  };

  return (
    <div className="glass-card" style={{ padding: 28, animation: 'fadeIn 0.3s ease' }}>
      <h3 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        📁 จัดการหมวดหมู่สินค้า
      </h3>

      {/* ช่องเพิ่มหมวดหมู่ */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input type="text" placeholder="ชื่อหมวดหมู่ใหม่..." value={newCatName}
          onChange={e => setNewCatName(e.target.value)} className="modern-input"
          onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
          style={{ flex: 1 }} />
        <button onClick={handleAddCategory} className="btn-primary" style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>
          ➕ เพิ่ม
        </button>
      </div>

      {/* ตารางหมวดหมู่ */}
      <table className="modern-table">
        <thead>
          <tr>
            <th>ชื่อหมวดหมู่</th>
            <th style={{ textAlign: 'center', width: 100 }}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {categories && categories.length > 0 ? categories.map(cat => (
            <tr key={cat.id}>
              <td style={{ fontWeight: 500 }}>{cat.name}</td>
              <td style={{ textAlign: 'center' }}>
                <button onClick={() => handleDeleteCategory(cat.id)}
                  style={{ background: 'rgba(255,71,87,0.15)', color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.3)', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  🗑️ ลบ
                </button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="2" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>ไม่มีข้อมูลหมวดหมู่</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// 📋 COMPONENT: OrderDetailPage — หน้ารายละเอียดออเดอร์
// Props: userId (string/number)
// ============================================================
function OrderDetailPage({ userId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderDetail, setOrderDetail] = useState(null);
  const [items, setItems] = useState([]);

  // ดึงรายละเอียดออเดอร์ตาม ID
  useEffect(() => {
    axios.get(`${API_URL}/orders/${id}/items`)
      .then(res => { setOrderDetail(res.data.order); setItems(res.data.items); })
      .catch(() => alert('ไม่พบข้อมูลออเดอร์'));
  }, [id]);

  if (!orderDetail) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
      <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
    </div>
  );

  const statusColor = orderDetail.status === 'จัดส่งแล้ว' ? 'var(--success)' :
                      orderDetail.status === 'กำลังจัดส่ง' ? '#a29bfe' :
                      orderDetail.status === 'ชำระเงินแล้ว' ? 'var(--accent2)' : 'var(--warning)';

  return (
    <div style={{ padding: '32px 20px', maxWidth: 720, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/my-orders')}
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 14 }}>
          ← กลับ
        </button>
        <h2 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 24 }}>ออเดอร์ #{id}</h2>
      </div>

      {/* ข้อมูลออเดอร์ */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>วันที่สั่งซื้อ</div>
            <div style={{ fontWeight: 600 }}>📅 {new Date(orderDetail.created_at).toLocaleDateString('th-TH')}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>สถานะ</div>
            <span className={`badge ${getStatusClass(orderDetail.status)}`}>{orderDetail.status}</span>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>ที่อยู่จัดส่ง</div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>🏠 {orderDetail.address || 'ไม่ระบุ'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>เบอร์โทร</div>
            <div style={{ fontWeight: 500 }}>📞 {orderDetail.phone || 'ไม่ระบุ'}</div>
          </div>
        </div>
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>ยอดรวมทั้งสิ้น</span>
          <span style={{ float: 'right', fontFamily: 'Kanit, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>
            ฿{Number(orderDetail.total_price).toLocaleString()}
          </span>
        </div>
      </div>

      {/* รายการสินค้า */}
      <h3 style={{ fontFamily: 'Kanit, sans-serif', marginBottom: 14 }}>🛍️ สินค้าในออเดอร์</h3>
      {items.map(item => (
        <div key={item.id} className="glass-card" style={{ padding: '14px 18px', marginBottom: 10, display: 'flex', gap: 14, alignItems: 'center' }}>
          <img src={item.image} alt={item.name}
            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, background: 'var(--surface2)' }}
            onError={e => e.target.style.display = 'none'} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>จำนวน {item.quantity} ชิ้น × <span style={{ color: 'var(--gold)' }}>฿{Number(item.price).toLocaleString()}</span></div>
          </div>
          <div style={{ fontFamily: 'Kanit, sans-serif', fontWeight: 700, color: 'var(--gold)', fontSize: 16 }}>
            ฿{(item.price * item.quantity).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 🏠 APP ROOT
// ============================================================
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// ============================================================
// 🧠 COMPONENT: AppContent — Logic หลักทั้งหมดอยู่ที่นี่
// ============================================================
function AppContent() {
  const navigate = useNavigate();

  // ── State หลัก ──
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [showConfirmClear, setShowConfirmClear] = useState(false);
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [allReviews, setAllReviews] = useState([]);
  const [productReviews, setProductReviews] = useState([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [dateFilter, setDateFilter] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [profile, setProfile] = useState({ username: '', email: '', profile_picture: '', address: '', phone: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ← Default false ทำงานได้ทั้ง mobile และ desktop

  // ── ฉีด Global CSS ครั้งเดียว ──
  useEffect(() => { injectGlobalStyles(); }, []);

  // ── บันทึกตะกร้าลง localStorage ทุกครั้งที่ cart เปลี่ยน ──
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);

  // ── โหลดข้อมูลสินค้า / ออเดอร์ เมื่อ login state เปลี่ยน ──
  useEffect(() => {
    axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
    if (isLoggedIn) fetchMyOrders();
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // auto-refresh ทุก 5 วิ
    return () => clearInterval(interval);
  }, [isLoggedIn, userId]);

  // ── โหลดหมวดหมู่ เมื่อ mount ──
  useEffect(() => { fetchCats(); }, []);

  // ── โหลด profile เมื่อ userId มีค่า ──
  useEffect(() => {
    if (userId) {
      axios.get(`${API_URL}/users/${userId}`)
        .then(res => setProfile(res.data))
        .catch(err => console.error(err));
    }
  }, [userId]);

  // ── โหลดข้อมูลตาม Admin Tab ──
  useEffect(() => {
    if (adminTab === 'reviews') fetchAdminReviews();
    if (adminTab === 'users') fetchUsers();
  }, [adminTab]);

  // ── ดึงออเดอร์ทั้งหมด (Admin) ──
  const fetchOrders = () => {
    axios.get(`${API_URL}/orders`)
      .then(res => setOrders(res.data))
      .catch(err => console.log("ดึงข้อมูลออเดอร์พลาด:", err));
  };

  // ── ดึงออเดอร์ของ User ──
  const fetchMyOrders = () => {
    if (!userId) return;
    axios.get(`${API_URL}/my-orders/${userId}`)
      .then(res => setMyOrders(res.data))
      .catch(err => console.log("ดึงประวัติสั่งซื้อพลาด:", err));
  };

  // ── ดึงหมวดหมู่สินค้า ──
  const fetchCats = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data);
    } catch { console.error("ดึงหมวดหมู่ไม่สำเร็จ"); }
  };

  // ── ดึงรีวิวตามสินค้า ──
  const fetchProductReviews = async (productId) => {
    try {
      const res = await axios.get(`${API_URL}/reviews/${productId}`);
      setProductReviews(res.data);
    } catch { console.error("ดึงรีวิวไม่สำเร็จ"); }
  };

  // ── ดึงรีวิวทั้งหมด (Admin) ──
  const fetchAdminReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/reviews`);
      setAllReviews(res.data);
    } catch { console.error("ดึงรีวิวทั้งหมดไม่สำเร็จ"); }
  };

  // ── ลบรีวิว (Admin) ──
  const deleteReview = async (id) => {
    try {
      await axios.delete(`${API_URL}/admin/reviews/${id}`);
      alert("ลบรีวิวเรียบร้อยแล้ว");
      fetchAdminReviews();
    } catch { alert("ลบไม่สำเร็จ"); }
  };

  // ── ดึง Users (Admin) ──
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`);
      if (Array.isArray(res.data)) setUsers(res.data);
    } catch { console.error('Fetch users error'); }
  };

  // ── อัปเดต User (Admin) ──
  const updateUser = async (id, data) => {
    try {
      const res = await axios.put(`${API_URL}/special-admin-update/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.status === 200) { await fetchUsers(); alert("✅ อัปเดตข้อมูลเรียบร้อย"); }
    } catch (err) { alert("❌ อัปเดตไม่สำเร็จ: " + err.message); }
  };

  // ── Login ──
  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = e.target;
    axios.post(`${API_URL}/login`, { username: username.value, password: password.value })
      .then(res => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('userId', res.data.id);
        setIsLoggedIn(true);
        setUserRole(res.data.role);
        setUserId(res.data.id);
        alert(`ยินดีต้อนรับครับคุณ ${username.value}!`);
        navigate(res.data.role === 'admin' ? '/admin' : '/');
      })
      .catch(() => alert("ชื่อหรือรหัสผ่านผิดครับ!"));
  };

  // ── Register ──
  const handleRegister = (e) => {
    e.preventDefault();
    const { username, password, confirmPassword } = e.target;
    if (password.value !== confirmPassword.value) return alert("รหัสผ่านไม่ตรงกันครับ!");
    axios.post(`${API_URL}/register`, { username: username.value, password: password.value })
      .then(res => { alert(res.data.message); navigate('/login'); })
      .catch(err => alert(err.response?.data?.message || "เกิดข้อผิดพลาด"));
  };

  // ── Logout ──
  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole('user');
    setIsSidebarOpen(false);
    navigate('/login');
  };

  // ── เพิ่มสินค้าลงตะกร้า ──
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) { alert(`⚠️ สินค้าหมดสต็อก (${product.stock} ชิ้น)`); return prev; }
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    alert(`🛒 เพิ่ม "${product.name}" ลงตะกร้าแล้ว!`);
  };

  // ── อัปเดตจำนวนสินค้าในตะกร้า ──
  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQty = item.qty + delta;
      if (newQty < 1) return item;
      if (newQty > item.stock) { alert(`⚠️ สต็อกมีเพียง ${item.stock} ชิ้น`); return item; }
      return { ...item, qty: newQty };
    }));
  };

  const clearCart = () => setShowConfirmClear(true);
  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));
  const calculateTotal = () => cart.reduce((sum, i) => sum + (Number(i.price) * i.qty), 0);

  // ── FlatCart: กระจาย qty เป็นรายชิ้น (ใช้ตอน checkout) ──
  const flatCart = [];
  cart.forEach(item => { for (let i = 0; i < item.qty; i++) flatCart.push(item); });

  // ── Checkout ──
  const checkout = () => {
    if (!cart.length) return alert("ตะกร้าว่างเปล่า!");
    axios.post(`${API_URL}/orders`, { total_price: calculateTotal(), items_count: flatCart.length, user_id: userId, cartItems: flatCart })
      .then(res => { setCurrentOrderId(res.data.orderId); setShowPayModal(true); fetchMyOrders(); })
      .catch(() => alert("สั่งซื้อไม่สำเร็จ"));
  };

  // ── แจ้งชำระเงิน (อัปโหลดสลิป) ──
  const handlePayment = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('address', address);
    formData.append('phone', phone);
    formData.append('slip', slipFile);
    axios.put(`${API_URL}/orders/pay/${currentOrderId}`, formData)
      .then(() => {
        alert("✅ ส่งหลักฐานเรียบร้อย! รอแอดมินตรวจสอบนะครับ");
        setCart([]);
        localStorage.removeItem('cart');
        setShowPayModal(false);
        fetchMyOrders();
        navigate('/my-orders');
      })
      .catch(() => alert("เกิดข้อผิดพลาดในการส่งหลักฐาน"));
  };

  // ── อัปเดตสถานะออเดอร์ (Admin) ──
  const updateOrderStatus = (orderId, newStatus) => {
    let trackingNum = null, transport = null;
    if (newStatus === "จัดส่งแล้ว") {
      transport = prompt("ระบุบริษัทขนส่ง (เช่น Kerry, Flash, ไปรษณีย์ไทย):");
      trackingNum = prompt("ระบุเลขพัสดุ:");
      if (!transport || !trackingNum) { alert("❌ ต้องระบุข้อมูลการส่งให้ครบถ้วน!"); return; }
    }
    axios.put(`${API_URL}/orders/${orderId}`, { status: newStatus, tracking_number: trackingNum, shipping_company: transport })
      .then(() => {
        alert("✅ อัปเดตสถานะเป็น: " + newStatus);
        fetchOrders();
        axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
      })
      .catch(err => alert("อัปเดตพลาด: " + err));
  };

  // ── ลบสินค้า (Admin) ──
  const deleteProduct = (id) => {
    if (!window.confirm("คุณแน่ใจนะว่าจะลบ?")) return;
    axios.delete(`${API_URL}/products/${id}`)
      .then(() => { alert("ลบเรียบร้อย!"); axios.get(`${API_URL}/products`).then(res => setProducts(res.data)); });
  };

  const selectToEdit = (product) => setEditingProduct(product);

  // ── เพิ่ม/แก้ไขสินค้า (Admin) ──
  const addOrUpdateProduct = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', e.target.name.value);
    formData.append('price', e.target.price.value);
    formData.append('stock', e.target.stock.value);
    formData.append('description', e.target.desc.value);
    formData.append('category', e.target.category.value);
    if (file) formData.append('image', file);

    const url = editingProduct ? `${API_URL}/products/${editingProduct.id}` : `${API_URL}/products`;
    const method = editingProduct ? axios.put : axios.post;
    method(url, formData)
      .then(() => {
        alert(editingProduct ? "แก้ไขเรียบร้อย!" : "เพิ่มสินค้าแล้ว!");
        setEditingProduct(null); setFile(null); e.target.reset();
        axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
      });
  };

  // ── ลบออเดอร์ (User) ──
  const deleteOrderHistory = (orderId) => {
    if (!window.confirm("คุณต้องการลบประวัติการสั่งซื้อนี้ทิ้งใช่หรือไม่?")) return;
    axios.delete(`${API_URL}/orders/${orderId}`)
      .then(() => { alert("🗑️ ลบเรียบร้อย"); fetchMyOrders(); fetchOrders(); })
      .catch(() => alert("❌ ไม่สามารถลบได้"));
  };

  // ── ยกเลิกออเดอร์ (User) ──
  const cancelOrder = (orderId) => {
    if (!window.confirm("คุณต้องการยกเลิกออเดอร์นี้ใช่หรือไม่?")) return;
    axios.delete(`${API_URL}/orders/${orderId}`)
      .then(() => { alert("ยกเลิกออเดอร์เรียบร้อยแล้ว"); fetchMyOrders(); })
      .catch(() => alert("ไม่สามารถยกเลิกได้"));
  };

  // ── Export Excel ──
  const exportToExcel = () => {
    if (!orders.length) { alert("ไม่มีข้อมูลออเดอร์"); return; }
    const data = orders.map(o => ({
      "หมายเลขออเดอร์": `#${o.id}`,
      "จำนวนชิ้น": o.items_count,
      "ยอดรวม (บาท)": o.total_price,
      "วันที่สั่งซื้อ": new Date(o.created_at).toLocaleString('th-TH'),
      "สถานะ": o.status
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "ยอดขาย");
    XLSX.writeFile(wb, "IBIG_SHOP_Sales.xlsx");
  };

  // ── Export PDF รายงาน ──
  const exportToPDF = () => {
    if (!orders.length) { alert("ไม่มีข้อมูลออเดอร์"); return; }
    const doc = new jsPDF();
    doc.addFileToVFS("THSarabunNew.ttf", fontBase64);
    doc.addFont("THSarabunNew.ttf", "ThaiFont", "normal");
    doc.setFont("ThaiFont");
    doc.setFontSize(20);
    doc.text("รายงานสรุปยอดขายทั้งหมด - IBIG SHOP", 105, 20, { align: "center" });
    const rows = orders.map(o => [`#${o.id}`, o.items_count, o.total_price, new Date(o.created_at).toLocaleString('th-TH'), o.status]);
    autoTable(doc, {
      startY: 30,
      head: [["หมายเลขออเดอร์", "จำนวนชิ้น", "ยอดรวม", "วันที่", "สถานะ"]],
      body: rows,
      styles: { font: 'ThaiFont', fontSize: 13 },
      headStyles: { fillColor: [44, 62, 80], font: 'ThaiFont', fontStyle: 'normal' }
    });
    doc.save("IBIG_SHOP_Report.pdf");
  };

  // ── พิมพ์ใบเสร็จ PDF รายออเดอร์ ──
  const generatePDF = async (order) => {
    try {
      const res = await axios.get(`${API_URL}/orders/${order.id}/items`);
      const items = res.data;
      const doc = new jsPDF();
      doc.addFileToVFS("THSarabunNew.ttf", fontBase64);
      doc.addFont("THSarabunNew.ttf", "ThaiFont", "normal");
      doc.setFont("ThaiFont", "normal");
      doc.setFontSize(26); doc.text("IBIG SHOP", 105, 20, { align: "center" });
      doc.setFontSize(16); doc.text("ใบเสร็จรับเงิน / Receipt", 105, 28, { align: "center" });
      doc.setLineWidth(0.5); doc.line(15, 32, 195, 32);
      doc.setFontSize(14);
      doc.text(`หมายเลขคำสั่งซื้อ: #${order.id}`, 15, 42);
      doc.text(`วันที่สั่งซื้อ: ${order.created_at ? new Date(order.created_at).toLocaleDateString('th-TH') : '-'}`, 15, 49);
      doc.text(`สถานะ: ${order.status}`, 15, 56);
      autoTable(doc, {
        startY: 62,
        head: [['ลำดับ', 'รายการสินค้า', 'จำนวน', 'ราคา/ชิ้น', 'รวม']],
        body: items.map((item, i) => [i + 1, item.name, item.quantity, `฿${Number(item.price).toLocaleString()}`, `฿${(Number(item.price) * item.quantity).toLocaleString()}`]),
        foot: [['', '', '', 'ยอดรวม', `฿${Number(order.total_price).toLocaleString()}`]],
        styles: { font: 'ThaiFont', fontStyle: 'normal', fontSize: 13 },
        headStyles: { fillColor: [44, 62, 80], textColor: 255 },
        footStyles: { fillColor: [236, 240, 241], textColor: 20 },
      });
      const finalY = doc.lastAutoTable.finalY || 100;
      doc.setFontSize(14); doc.setTextColor(100);
      doc.text("ขอบคุณที่ใช้บริการ IBIG SHOP", 105, finalY + 15, { align: "center" });
      window.open(doc.output('bloburl'), '_blank');
    } catch { alert("❌ เกิดข้อผิดพลาดในการสร้างใบเสร็จ"); }
  };

  // ── กรองออเดอร์สำหรับ Admin ──
  const filteredOrders = orders.filter(o => {
    const matchSearch = o.id.toString().includes(orderSearchTerm) ||
                        (o.address && o.address.toLowerCase().includes(orderSearchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'ทั้งหมด' || o.status === statusFilter;
    const matchDate   = !dateFilter || (o.created_at && o.created_at.startsWith(dateFilter));
    return matchSearch && matchStatus && matchDate;
  });

  // ── กรองสินค้าหน้าแรก ──
  const filteredProducts = products.filter(item => {
    const matchSearch   = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // ── สถิติ Admin Dashboard ──
  const totalSales    = orders.filter(o => o.status === 'ชำระเงินแล้ว' || o.status === 'จัดส่งแล้ว').reduce((s, o) => s + Number(o.total_price), 0);
  const pendingOrders = orders.filter(o => o.status === 'รอดำเนินการ').length;
  const completedOrders = orders.filter(o => o.status === 'จัดส่งแล้ว').length;
  const totalUsers    = [...new Set(orders.map(o => o.user_id))].length;

  // ── Chart Data สำหรับกราฟยอดขาย ──
  const chartData = Object.values(
    orders.reduce((acc, o) => {
      if (o.status !== 'ยกเลิก' && o.status !== 'รอดำเนินการ') {
        const date = new Date(o.created_at).toLocaleDateString('th-TH');
        if (!acc[date]) acc[date] = { name: date, ยอดขาย: 0 };
        acc[date].ยอดขาย += Number(o.total_price);
      }
      return acc;
    }, {})
  );

  // ── ตรวจสอบ tracking URL ──
  const getTrackingUrl = (company, trackNum) => {
    const c = (company || '').toLowerCase();
    if (c.includes('kerry'))  return `https://th.kerryexpress.com/th/track/?track=${trackNum}`;
    if (c.includes('flash'))  return `https://www.flashexpress.co.th/tracking/?se=${trackNum}`;
    if (c.includes('thai') || c.includes('ไปรษณีย์')) return `https://track.thailandpost.co.th/?trackNumber=${trackNum}`;
    return `https://www.google.com/search?q=เช็คพัสดุ+${trackNum}`;
  };

  // ============================================================
  // 🎨 RENDER
  // ============================================================
  return (
    <div style={{ fontFamily: 'Sarabun, sans-serif', background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      {/* ══════════════════════════════════════════════
          💳 MODAL: แจ้งชำระเงิน
      ══════════════════════════════════════════════ */}
      {showPayModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 440, padding: 32, animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontFamily: 'Kanit, sans-serif', color: 'var(--success)', textAlign: 'center', marginBottom: 6 }}>
              💰 แจ้งชำระเงิน
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
              ออเดอร์ #{currentOrderId} — โอนไปที่: <strong style={{ color: 'var(--gold)' }}>กสิกรไทย 000-0-00000-0</strong>
            </p>
            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>🏠 ที่อยู่จัดส่ง</label>
                <textarea required rows="3" value={address} className="modern-input"
                  onChange={e => setAddress(e.target.value)}
                  onFocus={() => { if (!address && profile.address) setAddress(profile.address); }}
                  placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด..." />
              </div>
              <div>
                <label style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>📞 เบอร์โทรศัพท์</label>
                <input type="text" required value={phone} className="modern-input"
                  onChange={e => setPhone(e.target.value)}
                  onFocus={() => { if (!phone && profile.phone) setPhone(profile.phone); }}
                  placeholder="08x-xxx-xxxx" />
              </div>
              <div>
                <label style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>📸 อัปโหลดสลิปโอนเงิน</label>
                <input type="file" accept="image/*" required onChange={e => setSlipFile(e.target.files[0])}
                  style={{ color: 'var(--text)', width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowPayModal(false)}
                  style={{ flex: 1, padding: '12px', background: 'rgba(255,71,87,0.15)', color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>
                  ❌ ยกเลิก
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: 15 }}>
                  ✅ ยืนยันชำระเงิน
                </button>
              </div>
              <button type="button" onClick={() => setShowPayModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>
                ไว้ทำทีหลัง (ดูประวัติสั่งซื้อ)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          ⭐ MODAL: เขียนรีวิวสินค้า
      ══════════════════════════════════════════════ */}
      {showReviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 400, padding: 32, animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontFamily: 'Kanit, sans-serif', textAlign: 'center', marginBottom: 24 }}>⭐ รีวิวสินค้า</h2>

            {/* Rating Stars — interactive */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 10, display: 'block' }}>คะแนนความพึงพอใจ</label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRating(star)}
                    style={{ background: 'none', border: 'none', fontSize: 32, cursor: 'pointer',
                      filter: star <= rating ? 'none' : 'grayscale(1) opacity(0.3)', transition: 'all 0.15s' }}>
                    ⭐
                  </button>
                ))}
              </div>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
                {rating === 5 ? 'ดีมาก 🎉' : rating === 4 ? 'ดี 👍' : rating === 3 ? 'ปานกลาง 😐' : rating === 2 ? 'พอใช้ 😕' : 'ควรปรับปรุง 😢'}
              </div>
            </div>

            <textarea
              placeholder="เขียนรีวิวของคุณที่นี่..."
              className="modern-input"
              rows="4" value={comment}
              onChange={e => setComment(e.target.value)}
              style={{ resize: 'vertical' }}
            />

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowReviewModal(false)}
                style={{ flex: 1, padding: '12px', background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
                ยกเลิก
              </button>
              <button className="btn-primary" style={{ flex: 1, padding: '12px' }}
                onClick={async () => {
                  try {
                    if (!selectedProduct) return alert("ไม่พบรหัสสินค้า");
                    await axios.post(`${API_URL}/reviews`, { product_id: selectedProduct, user_id: userId, rating, comment });
                    alert("✅ ขอบคุณสำหรับรีวิวครับ!");
                    setShowReviewModal(false); setComment(''); setRating(5);
                  } catch { alert("❌ รีวิวไม่สำเร็จ กรุณาลองใหม่"); }
                }}>
                ส่งรีวิว
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          🗑️ MODAL: ยืนยันล้างตะกร้า
      ══════════════════════════════════════════════ */}
      {showConfirmClear && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 360, padding: '36px 28px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🗑️</div>
            <h2 style={{ color: 'var(--danger)', marginBottom: 8, fontFamily: 'Kanit, sans-serif' }}>ยืนยันการล้างตะกร้า</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 15 }}>
              สินค้า <strong style={{ color: 'var(--text)' }}>{cart.length} รายการ</strong> จะถูกลบออกทั้งหมด
            </p>
            <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, maxHeight: 130, overflowY: 'auto', textAlign: 'left' }}>
              {cart.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)' }}>• {item.name}</span>
                  <span style={{ color: 'var(--danger)' }}>x{item.qty}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowConfirmClear(false)}
                style={{ flex: 1, padding: '12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--text)', fontWeight: 600 }}>
                ยกเลิก
              </button>
              <button onClick={() => { setCart([]); setShowConfirmClear(false); }}
                style={{ flex: 1, padding: '12px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
                ล้างตะกร้า 🗑️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          🔝 NAVBAR
      ══════════════════════════════════════════════ */}
      <nav style={{
        background: 'rgba(13,13,20,0.92)', backdropFilter: 'blur(16px)',
        padding: '0 20px', height: 64,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 900,
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
      }}>

        {/* ซ้าย: Hamburger + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setIsSidebarOpen(true)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', width: 40, height: 40, borderRadius: 10, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            ☰
          </button>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'Kanit, sans-serif', fontWeight: 800,
              fontSize: 'clamp(16px, 4vw, 22px)',
              background: 'linear-gradient(135deg, #fff 30%, var(--gold))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              🛒 IBIG SHOP
            </span>
          </Link>
        </div>

        {/* ขวา: ตะกร้า + Login/Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {userRole !== 'admin' && (
            <Link to="/cart" style={{ textDecoration: 'none', position: 'relative' }}>
              <button style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text)', padding: '8px 14px', borderRadius: 10,
                cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s'
              }}>
                🛒
                {cart.length > 0 && (
                  <span style={{
                    background: 'var(--accent)', color: 'white', fontSize: 11,
                    fontWeight: 700, padding: '2px 7px', borderRadius: 20, animation: 'pulse 1.5s infinite'
                  }}>
                    {cart.reduce((a, b) => a + b.qty, 0)}
                  </span>
                )}
              </button>
            </Link>
          )}
          {isLoggedIn ? (
            <button onClick={logout} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>ออกจากระบบ</button>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>เข้าสู่ระบบ</button>
          )}
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          📱 SIDEBAR OVERLAY (กดพื้นที่ว่างเพื่อปิด)
      ══════════════════════════════════════════════ */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 998, backdropFilter: 'blur(3px)' }} />
      )}

      {/* ══════════════════════════════════════════════
          📱 SIDEBAR MENU
      ══════════════════════════════════════════════ */}
      <div style={{
        position: 'fixed', top: 0, left: isSidebarOpen ? 0 : '-300px',
        width: 270, height: '100vh',
        background: 'rgba(22,22,31,0.98)', backdropFilter: 'blur(20px)',
        boxShadow: '4px 0 30px rgba(0,0,0,0.5)',
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 999, display: 'flex', flexDirection: 'column',
        borderRight: '1px solid var(--border)'
      }}>

        {/* Header Sidebar */}
        <div style={{ padding: '20px 20px 16px', background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(0,206,201,0.08))', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Kanit, sans-serif', fontWeight: 700, fontSize: 18 }}>🛒 IBIG SHOP</span>
          <button onClick={() => setIsSidebarOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Profile Preview (เมื่อ login) */}
        {isLoggedIn && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', background: 'var(--surface2)', border: '2px solid var(--accent)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {profile.profile_picture
                ? <img src={profile.profile_picture} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 22 }}>👤</span>}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{profile.username || 'ผู้ใช้งาน'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{profile.email || ''}</div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div style={{ padding: '12px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* โปรไฟล์ (เฉพาะ user) */}
          {isLoggedIn && userRole !== 'admin' && (
            <Link to="/profile" onClick={() => setIsSidebarOpen(false)} className="nav-item">
              👤 ข้อมูลของฉัน
            </Link>
          )}

          {/* หน้าแรก */}
          <Link to="/" onClick={() => { setIsSidebarOpen(false); setSelectedCategory('ทั้งหมด'); }} className="nav-item">
            🏠 หน้าแรก
          </Link>

          {/* หมวดหมู่สินค้า (พับได้) */}
          <div>
            <div onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="nav-item" style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}>
              <span>📦 หมวดหมู่สินค้า</span>
              <span style={{ transition: 'transform 0.2s', transform: isCategoryOpen ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>▶</span>
            </div>
            {isCategoryOpen && (
              <div style={{ paddingLeft: 12, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2, animation: 'fadeIn 0.2s ease' }}>
                {['ทั้งหมด', ...new Set(products.map(p => p.category).filter(Boolean))].map(cat => (
                  <div key={cat} onClick={() => { setSelectedCategory(cat); setIsSidebarOpen(false); navigate('/'); }}
                    style={{
                      padding: '9px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
                      color: selectedCategory === cat ? '#a29bfe' : 'var(--text-muted)',
                      background: selectedCategory === cat ? 'rgba(108,92,231,0.15)' : 'transparent',
                      fontWeight: selectedCategory === cat ? 600 : 400,
                      transition: 'all 0.2s'
                    }}>
                    • {cat}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* เมนู User */}
          {userRole !== 'admin' && (
            <>
              <Link to="/cart" onClick={() => setIsSidebarOpen(false)} className="nav-item">
                🛒 ตะกร้าสินค้า
                <span style={{ marginLeft: 'auto', background: 'var(--danger)', color: 'white', padding: '1px 8px', borderRadius: 20, fontSize: 12 }}>
                  {cart.length}
                </span>
              </Link>
              {isLoggedIn && (
                <Link to="/my-orders" onClick={() => setIsSidebarOpen(false)} className="nav-item">
                  🧾 ประวัติการสั่งซื้อ
                </Link>
              )}
            </>
          )}

          {/* เมนู Admin */}
          {isLoggedIn && userRole === 'admin' && (
            <div style={{ marginTop: 8, background: 'rgba(26,188,156,0.05)', borderRadius: 10, padding: '10px 8px', border: '1px solid rgba(26,188,156,0.15)' }}>
              <div style={{ color: '#1abc9c', fontSize: 13, fontWeight: 700, marginBottom: 8, paddingLeft: 8, letterSpacing: 0.5 }}>⚙️ ระบบหลังบ้าน</div>
              {[
                { key: 'report', label: '📊 รายงานสถิติ' },
                { key: 'add',    label: '➕ เพิ่มสินค้าใหม่' },
                { key: 'stock',  label: '📦 จัดการสต็อก' },
                { key: 'categories', label: '📁 จัดการหมวดหมู่' },
                { key: 'orders', label: '🧾 รายการสั่งซื้อ' },
                { key: 'users',  label: '👥 จัดการผู้ใช้' },
                { key: 'reviews', label: '📝 จัดการรีวิว' },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => { setAdminTab(key); navigate('/admin'); setIsSidebarOpen(false); }}
                  className={`admin-tab ${adminTab === key ? 'active' : ''}`}
                  style={{ width: '100%', marginBottom: 4, textAlign: 'left' }}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          📱 PAGE ROUTES
      ══════════════════════════════════════════════ */}
      <Routes>

        {/* ── หน้าแรก: แสดงสินค้า ── */}
        <Route path="/" element={
          <div>

            {/* Hero Banner */}
            <div style={{
              textAlign: 'center', padding: 'clamp(40px, 8vw, 80px) 20px',
              background: 'linear-gradient(135deg, #1a0533 0%, #0d1b4d 50%, #0d0d14 100%)',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Decorative glows */}
              <div style={{ position: 'absolute', top: -60, left: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(108,92,231,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -40, right: '15%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(245,200,66,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

              <h1 style={{
                fontFamily: 'Kanit, sans-serif',
                fontSize: 'clamp(28px, 7vw, 56px)', fontWeight: 800,
                background: 'linear-gradient(135deg, #ffffff 30%, var(--gold))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: 12, letterSpacing: '-1px', position: 'relative'
              }}>
                🛍️ IBIG SHOP
              </h1>
              <p style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', color: 'rgba(255,255,255,0.6)', marginBottom: 28, position: 'relative' }}>
                "ช้อปใหญ่ จ่ายน้อย สอยทุกความคุ้ม!"
              </p>

              {/* ช่องค้นหา */}
              <div style={{ position: 'relative', display: 'inline-block', width: '90%', maxWidth: 580 }}>
                <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--text-muted)' }}>🔍</span>
                <input
                  type="text"
                  placeholder="ค้นหาสินค้าที่ใช่สำหรับคุณ..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%', padding: '16px 20px 16px 50px',
                    borderRadius: 50, border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
                    color: 'white', fontSize: 16,
                    outline: 'none', fontFamily: 'Sarabun, sans-serif'
                  }}
                />
              </div>
            </div>

            {/* แสดงหมวดหมู่แบบ Chips */}
            {categories.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '20px 20px 0', justifyContent: 'center' }}>
                {['ทั้งหมด', ...categories.map(c => c.name)].map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '7px 16px', borderRadius: 20, border: '1px solid var(--border)',
                      background: selectedCategory === cat ? 'var(--accent)' : 'var(--surface)',
                      color: selectedCategory === cat ? 'white' : 'var(--text-muted)',
                      cursor: 'pointer', fontFamily: 'Sarabun, sans-serif', fontSize: 14, fontWeight: 600,
                      transition: 'all 0.2s',
                      boxShadow: selectedCategory === cat ? '0 4px 12px rgba(108,92,231,0.3)' : 'none'
                    }}>
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Grid สินค้า */}
            <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, padding: '24px 20px' }}>
              {filteredProducts.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <p style={{ fontSize: 18 }}>ไม่พบสินค้าที่ค้นหา</p>
                </div>
              ) : filteredProducts.map((item, idx) => (
                <div key={item.id} className="product-card" style={{ animationDelay: `${idx * 0.05}s` }}>

                  {/* รูปสินค้า */}
                  <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                          onError={e => { e.target.style.display = 'none'; }} />
                      : <div style={{ height: '100%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>📦</div>}
                    {/* Badge หมวดหมู่ */}
                    {item.category && (
                      <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', color: 'var(--gold)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                        {item.category}
                      </span>
                    )}
                    {/* Badge สินค้าหมด */}
                    {item.stock <= 0 && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ background: 'var(--danger)', color: 'white', padding: '6px 16px', borderRadius: 20, fontWeight: 700, fontSize: 14 }}>สินค้าหมด</span>
                      </div>
                    )}
                  </div>

                  {/* ข้อมูลสินค้า */}
                  <div style={{ padding: '16px 18px 18px' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, lineHeight: 1.4, color: 'var(--text)' }}>{item.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontFamily: 'Kanit, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--gold)' }}>
                        ฿{Number(item.price).toLocaleString()}
                      </span>
                      <span style={{ fontSize: 12, color: item.stock > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {item.stock > 0 ? `เหลือ ${item.stock} ชิ้น` : 'หมด'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => navigate(`/product/${item.id}`)}
                        style={{ flex: 1, padding: '9px', background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}>
                        🔍 รายละเอียด
                      </button>
                      <button onClick={() => addToCart(item)} disabled={item.stock <= 0}
                        className={item.stock > 0 ? 'btn-primary' : ''}
                        style={{ flex: 1, padding: '9px', fontSize: 13,
                          ...(item.stock <= 0 ? { background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'not-allowed' } : {}) }}>
                        {item.stock > 0 ? '🛒 ใส่ตะกร้า' : 'หมด'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <footer style={{ marginTop: 60, padding: '48px 20px', background: 'var(--surface)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Kanit, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>🛍️ IBIG SHOP</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>ติดต่อเรา: 093-112-1917 | Line: @phuwadet5617</p>
              <div style={{ width: 40, height: 2, background: 'var(--accent)', margin: '16px auto' }} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>© 2026 IBIG SHOP. All rights reserved.</p>
            </footer>
          </div>
        } />

        {/* ── โปรไฟล์ ── */}
        <Route path="/profile" element={isLoggedIn ? <ProfilePage userId={userId} /> : <Navigate to="/login" />} />

        {/* ── รายละเอียดสินค้า ── */}
        <Route path="/product/:id" element={
          <ProductDetailPage products={products} addToCart={addToCart} productReviews={productReviews} fetchProductReviews={fetchProductReviews} />
        } />

        {/* ── ตะกร้าสินค้า ── */}
        <Route path="/cart" element={
          <div style={{ padding: 'clamp(20px, 4vw, 40px)', maxWidth: 820, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 28 }}>🛒 ตะกร้าสินค้า</h2>
              {cart.length > 0 && (
                <button onClick={clearCart}
                  style={{ background: 'rgba(255,71,87,0.15)', color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.3)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  🗑️ ล้างตะกร้า
                </button>
              )}
            </div>

            <div className="glass-card" style={{ padding: 24 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 56, marginBottom: 12 }}>🛒</div>
                  <p style={{ fontSize: 18, marginBottom: 20 }}>ตะกร้าว่างเปล่า</p>
                  <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>เลือกซื้อสินค้า</button>
                </div>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
                      <img src={item.image} alt={item.name}
                        style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, background: 'var(--surface2)', flexShrink: 0 }}
                        onError={e => e.target.style.display = 'none'} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                        <div style={{ color: 'var(--gold)', fontFamily: 'Kanit, sans-serif', fontWeight: 700 }}>฿{Number(item.price).toLocaleString()}</div>
                      </div>
                      {/* ปุ่ม +/- จำนวน */}
                      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <button onClick={() => updateQuantity(item.id, -1)}
                          style={{ background: 'none', border: 'none', color: 'var(--text)', padding: '8px 14px', cursor: 'pointer', fontSize: 16, borderRadius: '10px 0 0 10px' }}>−</button>
                        <span style={{ padding: '0 12px', fontWeight: 700, minWidth: 30, textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}
                          style={{ background: 'none', border: 'none', color: 'var(--text)', padding: '8px 14px', cursor: 'pointer', fontSize: 16, borderRadius: '0 10px 10px 0' }}>+</button>
                      </div>
                      {/* ราคารวม */}
                      <div style={{ fontFamily: 'Kanit, sans-serif', fontWeight: 700, color: 'var(--gold)', minWidth: 80, textAlign: 'right' }}>
                        ฿{(item.price * item.qty).toLocaleString()}
                      </div>
                      {/* ลบ */}
                      <button onClick={() => removeFromCart(item.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1, flexShrink: 0 }}>✕</button>
                    </div>
                  ))}

                  {/* สรุปราคา + ยืนยัน */}
                  <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 4 }}>ยอดรวมทั้งสิ้น</div>
                      <div style={{ fontFamily: 'Kanit, sans-serif', fontSize: 32, fontWeight: 800, color: 'var(--gold)' }}>
                        ฿{calculateTotal().toLocaleString()}
                      </div>
                    </div>
                    <button className="btn-primary"
                      style={{ padding: '14px 32px', fontSize: 16 }}
                      onClick={() => {
                        if (isLoggedIn) {
                          axios.get(`${API_URL}/users/${userId}`)
                            .then(res => { setAddress(res.data.address || ''); setPhone(res.data.phone || ''); checkout(); });
                        } else navigate('/login');
                      }}>
                      {isLoggedIn ? "✅ ยืนยันการสั่งซื้อ" : "🔑 ล็อกอินเพื่อสั่งซื้อ"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        } />

        {/* ── รายละเอียดออเดอร์ ── */}
        <Route path="/order/:id" element={<OrderDetailPage userId={userId} />} />

        {/* ── ประวัติการสั่งซื้อ ── */}
        <Route path="/my-orders" element={
          <div style={{ padding: 'clamp(20px, 4vw, 40px)', maxWidth: 880, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
            <h1 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 28, textAlign: 'center', marginBottom: 28 }}>📋 ประวัติการสั่งซื้อของฉัน</h1>

            {myOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>📦</div>
                <p style={{ fontSize: 18, marginBottom: 20 }}>ยังไม่มีรายการสั่งซื้อ</p>
                <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '12px 28px' }}>เลือกซื้อสินค้า</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {myOrders.map(order => {
                  // เลือกสีเส้นซ้ายตามสถานะ
                  const borderColor = order.status === 'รอดำเนินการ' ? 'var(--warning)' :
                                      order.status === 'ชำระเงินแล้ว' ? 'var(--accent2)' :
                                      order.status === 'กำลังจัดส่ง' ? '#a29bfe' : 'var(--success)';
                  return (
                    <div key={order.id} className="glass-card" style={{ padding: '20px 24px', borderLeft: `4px solid ${borderColor}`, animation: 'fadeIn 0.3s ease' }}>

                      {/* บรรทัดบน: เลขออเดอร์ + วันที่ */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                        <span onClick={() => navigate(`/order/${order.id}`)}
                          style={{ fontWeight: 700, fontSize: 16, color: '#a29bfe', cursor: 'pointer', textDecoration: 'underline' }}>
                          ออเดอร์ #{order.id} 🔍
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          📅 {new Date(order.created_at).toLocaleDateString('th-TH')}
                        </span>
                      </div>

                      {/* บรรทัดกลาง: ราคา + สถานะ */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'Kanit, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>
                          ฿{Number(order.total_price).toLocaleString()}
                        </span>
                        <span className={`badge ${getStatusClass(order.status)}`}>{order.status}</span>
                      </div>

                      {/* ปุ่มจัดการ */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {order.status === 'รอดำเนินการ' && (
                          <button onClick={() => cancelOrder(order.id)}
                            style={{ background: 'rgba(255,71,87,0.15)', color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.3)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                            ยกเลิก
                          </button>
                        )}
                        <button onClick={() => { setCurrentOrderId(order.id); setAddress(profile.address || ''); setPhone(profile.phone || ''); setShowPayModal(true); }}
                          style={{ background: 'rgba(0,206,201,0.15)', color: 'var(--accent2)', border: '1px solid rgba(0,206,201,0.3)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                          💳 จ่ายเงิน
                        </button>
                        <button onClick={() => generatePDF(order)}
                          style={{ background: 'rgba(46,213,115,0.15)', color: 'var(--success)', border: '1px solid rgba(46,213,115,0.3)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                          📄 บิล
                        </button>
                        {order.tracking_number && (
                          <button onClick={() => window.open(getTrackingUrl(order.shipping_company, order.tracking_number), '_blank')}
                            style={{ background: 'rgba(255,165,2,0.15)', color: 'var(--warning)', border: '1px solid rgba(255,165,2,0.3)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                            🚚 ตามพัสดุ
                          </button>
                        )}
                        {order.status === 'จัดส่งแล้ว' && (
                          <button onClick={() => { setSelectedProduct(order.product_id); setShowReviewModal(true); }}
                            style={{ background: 'rgba(108,92,231,0.15)', color: '#a29bfe', border: '1px solid rgba(108,92,231,0.3)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                            ⭐ รีวิว
                          </button>
                        )}
                        <button onClick={() => deleteOrderHistory(order.id)}
                          style={{ background: 'rgba(255,71,87,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.2)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                          🗑️ ลบ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        } />

        {/* ── Login ── */}
        <Route path="/login" element={
          isLoggedIn ? (userRole === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />) : (
            <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <div className="glass-card" style={{ width: '100%', maxWidth: 400, padding: 40, animation: 'fadeIn 0.4s ease' }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{ fontFamily: 'Kanit, sans-serif', fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #fff, var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🛒 IBIG SHOP</div>
                  <h2 style={{ marginTop: 8, color: 'var(--text-muted)', fontWeight: 400, fontSize: 16 }}>เข้าสู่ระบบเพื่อเริ่มช้อปปิ้ง</h2>
                </div>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 14, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>ชื่อผู้ใช้งาน</label>
                    <input name="username" type="text" placeholder="Username" required className="modern-input" />
                  </div>
                  <div>
                    <label style={{ fontSize: 14, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>รหัสผ่าน</label>
                    <input name="password" type="password" placeholder="••••••••" required className="modern-input" />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: 16, marginTop: 4 }}>
                    🔐 เข้าสู่ระบบ
                  </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
                  ยังไม่มีบัญชี? <Link to="/register" style={{ color: '#a29bfe', fontWeight: 600 }}>สมัครสมาชิกฟรี</Link>
                </p>
              </div>
            </div>
          )
        } />

        {/* ── Register ── */}
        <Route path="/register" element={
          <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: 400, padding: 40, animation: 'fadeIn 0.4s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontFamily: 'Kanit, sans-serif', fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #fff, var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🛒 IBIG SHOP</div>
                <h2 style={{ marginTop: 8, color: 'var(--success)', fontWeight: 600, fontSize: 18 }}>📝 สมัครสมาชิกใหม่</h2>
              </div>
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 14, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>ชื่อผู้ใช้งาน</label>
                  <input name="username" placeholder="Username" required className="modern-input" />
                </div>
                <div>
                  <label style={{ fontSize: 14, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>รหัสผ่าน</label>
                  <input name="password" type="password" placeholder="••••••••" required className="modern-input" />
                </div>
                <div>
                  <label style={{ fontSize: 14, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>ยืนยันรหัสผ่าน</label>
                  <input name="confirmPassword" type="password" placeholder="••••••••" required className="modern-input" />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: 16, marginTop: 4, background: 'linear-gradient(135deg, #00b894, #00cec9)' }}>
                  ✅ สมัครสมาชิก
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
                มีบัญชีอยู่แล้ว? <Link to="/login" style={{ color: '#a29bfe', fontWeight: 600 }}>เข้าสู่ระบบที่นี่</Link>
              </p>
            </div>
          </div>
        } />

        {/* ── Admin Dashboard ── */}
        <Route path="/admin" element={isLoggedIn && userRole === 'admin' ? (
          <div style={{ padding: 'clamp(16px, 3vw, 32px)', animation: 'fadeIn 0.4s ease' }}>

            {/* Header Admin */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 26, marginBottom: 4 }}>⚙️ ระบบจัดการหลังบ้าน</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>IBIG SHOP Admin Dashboard</p>
            </div>

            

            {/* ── Tab: รายงานสถิติ ── */}
            {adminTab === 'report' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
                  {[
                    { label: 'ยอดขายรวม', value: `฿${totalSales.toLocaleString()}`, color: '#00b894', icon: '💰' },
                    { label: 'รอตรวจสอบ', value: pendingOrders, color: 'var(--warning)', icon: '⏳' },
                    { label: 'จัดส่งแล้ว', value: completedOrders, color: 'var(--accent2)', icon: '✅' },
                    { label: 'ลูกค้าทั้งหมด', value: totalUsers, color: '#a29bfe', icon: '👤' },
                  ].map(({ label, value, color, icon }) => (
                    <div key={label} className="glass-card" style={{ padding: '20px 22px', borderTop: `3px solid ${color}` }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontFamily: 'Kanit, sans-serif', fontSize: 26, fontWeight: 800, color }}>{value}</div>
                    </div>
                  ))}
                </div>
                {/* กราฟยอดขาย */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: 'Kanit, sans-serif', marginBottom: 20 }}>📈 สถิติยอดขาย</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#8888a8', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#8888a8', fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)' }} />
                      <Legend />
                      <Bar dataKey="ยอดขาย" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6c5ce7" />
                          <stop offset="100%" stopColor="#a29bfe" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── Tab: เพิ่ม/แก้ไขสินค้า ── */}
            {adminTab === 'add' && (
              <div className="glass-card" style={{ padding: 28, animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 20, marginBottom: 24 }}>
                  {editingProduct ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่'}
                </h3>
                <form onSubmit={addOrUpdateProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>ชื่อสินค้า *</label>
                    <input name="name" placeholder="ชื่อสินค้า" defaultValue={editingProduct?.name || ''} required className="modern-input" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>หมวดหมู่ *</label>
                    <select name="category" defaultValue={editingProduct?.category || ''} required className="modern-input">
                      <option value="">-- เลือกหมวดหมู่ --</option>
                      {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>สต็อก *</label>
                    <input name="stock" type="number" placeholder="จำนวน" defaultValue={editingProduct?.stock || 0} required className="modern-input" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>ราคา (บาท) *</label>
                    <input name="price" type="number" placeholder="ราคา" defaultValue={editingProduct?.price || ''} required className="modern-input" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>รูปภาพสินค้า</label>
                    <input name="image" type="file" onChange={e => setFile(e.target.files[0])} accept="image/*"
                      style={{ color: 'var(--text)', width: '100%', fontSize: 14 }} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>รายละเอียด</label>
                    <input name="desc" placeholder="รายละเอียดสินค้า" defaultValue={editingProduct?.description || ''} className="modern-input" />
                  </div>
                  <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="submit" className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
                      {editingProduct ? '💾 บันทึกการแก้ไข' : '➕ เพิ่มสินค้า'}
                    </button>
                    {editingProduct && (
                      <button type="button" onClick={() => { setEditingProduct(null); setFile(null); }}
                        style={{ padding: '12px 20px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 15 }}>
                        ยกเลิก
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* ── Tab: จัดการสต็อก ── */}
            {adminTab === 'stock' && (
              <div className="glass-card" style={{ padding: 24, animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 20, marginBottom: 20 }}>📦 จัดการสต็อกสินค้า</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>สินค้า</th>
                        <th>ราคา</th>
                        <th>สต็อก</th>
                        <th style={{ textAlign: 'center' }}>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {p.image && <img src={p.image} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />}
                              <div>
                                <div style={{ fontWeight: 600 }}>{p.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.category}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ color: 'var(--gold)', fontWeight: 700 }}>฿{Number(p.price).toLocaleString()}</td>
                          <td>
                            <span className={`badge ${p.stock > 10 ? 'status-done' : p.stock > 0 ? 'status-waiting' : 'status-cancel'}`}>
                              {p.stock} ชิ้น
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                              <button onClick={() => { selectToEdit(p); setAdminTab('add'); }}
                                style={{ background: 'rgba(245,200,66,0.15)', color: 'var(--gold)', border: '1px solid rgba(245,200,66,0.3)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                                ✏️ แก้ไข
                              </button>
                              <button onClick={() => deleteProduct(p.id)}
                                style={{ background: 'rgba(255,71,87,0.15)', color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.3)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
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

            {/* ── Tab: หมวดหมู่ ── */}
            {adminTab === 'categories' && (
              <CategoryManagement categories={categories} fetchCats={fetchCats} />
            )}

            {/* ── Tab: รายการออเดอร์ ── */}
            {adminTab === 'orders' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {/* Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <h3 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 20 }}>🧾 รายการสั่งซื้อ</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={exportToExcel} style={{ background: 'rgba(46,213,115,0.15)', color: 'var(--success)', border: '1px solid rgba(46,213,115,0.3)', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                      📊 Excel
                    </button>
                    <button onClick={exportToPDF} style={{ background: 'rgba(255,71,87,0.15)', color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.3)', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                      📄 PDF
                    </button>
                  </div>
                </div>

                {/* ตัวกรอง */}
                <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input type="text" placeholder="🔍 ค้นหาเลขที่ออเดอร์หรือที่อยู่..."
                    value={orderSearchTerm} onChange={e => setOrderSearchTerm(e.target.value)}
                    className="modern-input" style={{ flex: '1 1 200px' }} />
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="modern-input" style={{ width: 'auto', flex: '0 0 auto' }}>
                    <option value="ทั้งหมด">ทุกสถานะ</option>
                    <option value="รอดำเนินการ">รอดำเนินการ</option>
                    <option value="ชำระเงินแล้ว">ชำระเงินแล้ว</option>
                    <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                    <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                    <option value="ยกเลิก">ยกเลิก</option>
                  </select>
                  <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                    className="modern-input" style={{ width: 'auto', flex: '0 0 auto' }} />
                  <button onClick={() => { setOrderSearchTerm(''); setStatusFilter('ทั้งหมด'); setDateFilter(''); }}
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>
                    ล้าง
                  </button>
                </div>

                {/* ตารางออเดอร์ */}
                <div className="glass-card" style={{ overflowX: 'auto' }}>
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>ออเดอร์</th>
                        <th>ที่อยู่จัดส่ง</th>
                        <th>ราคารวม</th>
                        <th>หลักฐาน</th>
                        <th>สถานะ</th>
                        <th style={{ textAlign: 'center' }}>พิมพ์</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#a29bfe' }}>#{order.id}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                              {order.created_at ? new Date(order.created_at).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                            </div>
                          </td>
                          <td style={{ maxWidth: 200 }}>
                            <div style={{ fontSize: 13 }}>📍 {order.address || '-'}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📞 {order.phone || '-'}</div>
                          </td>
                          <td style={{ color: 'var(--gold)', fontFamily: 'Kanit, sans-serif', fontWeight: 700 }}>
                            ฿{Number(order.total_price).toLocaleString()}
                          </td>
                          <td>
                            {order.slip_image
                              ? <button onClick={() => window.open(order.slip_image, '_blank')}
                                  style={{ background: 'rgba(108,92,231,0.15)', color: '#a29bfe', border: '1px solid rgba(108,92,231,0.3)', padding: '5px 10px', borderRadius: 7, cursor: 'pointer', fontSize: 12 }}>
                                  🖼️ ดูสลิป
                                </button>
                              : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>ยังไม่ส่ง</span>}
                          </td>
                          <td>
                            <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)}
                              className={`badge ${getStatusClass(order.status)}`}
                              style={{ border: 'none', cursor: 'pointer', fontFamily: 'Sarabun, sans-serif', fontWeight: 600, fontSize: 13 }}>
                              <option value="รอดำเนินการ">รอดำเนินการ</option>
                              <option value="ชำระเงินแล้ว">ชำระเงินแล้ว</option>
                              <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                              <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                              <option value="ยกเลิก">ยกเลิก</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button onClick={() => generatePDF(order)}
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '5px 10px', borderRadius: 7, cursor: 'pointer', fontSize: 12 }}>
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

            {/* ── Tab: จัดการผู้ใช้ ── */}
            {adminTab === 'users' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 20 }}>
                    👥 จัดการผู้ใช้ <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>({users.length} บัญชี)</span>
                  </h3>
                </div>
                <div className="glass-card" style={{ overflowX: 'auto' }}>
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>ข้อมูลผู้ใช้</th>
                        <th>สิทธิ์</th>
                        <th>สถานะ</th>
                        <th style={{ textAlign: 'center' }}>การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? users.map((user, idx) => (
                        <tr key={user.id || idx}>
                          <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user.id}</td>
                          <td>
                            {/* ป้องกัน null โดยใช้ fallback value */}
                            <div style={{ fontWeight: 600 }}>{user.username || 'กำลังโหลด...'}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email || '---'}</div>
                          </td>
                          <td>
                            <select value={user.role || 'customer'}
                              onChange={e => updateUser(user.id, { role: e.target.value, status: user.status })}
                              style={{
                                background: user.role === 'admin' ? 'rgba(245,200,66,0.15)' : 'var(--surface2)',
                                color: user.role === 'admin' ? 'var(--gold)' : 'var(--text-muted)',
                                border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px',
                                cursor: 'pointer', fontFamily: 'Sarabun, sans-serif', fontSize: 13
                              }}>
                              <option value="customer">👤 Customer</option>
                              <option value="admin">🔑 Admin</option>
                            </select>
                          </td>
                          <td>
                            <span className={`badge ${user.status === 'suspended' ? 'status-cancel' : 'status-done'}`}>
                              {user.status === 'suspended' ? 'ถูกระงับ' : 'ใช้งานปกติ'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button onClick={() => {
                              const newStatus = user.status === 'active' ? 'suspended' : 'active';
                              if (window.confirm(`คุณแน่ใจหรือไม่ที่จะ ${newStatus === 'suspended' ? 'ระงับ' : 'ปลดระงับ'} บัญชี ${user.username || ''}?`)) {
                                updateUser(user.id, { role: user.role, status: newStatus });
                              }
                            }}
                              style={{
                                background: user.status === 'active' ? 'rgba(255,71,87,0.15)' : 'rgba(46,213,115,0.15)',
                                color: user.status === 'active' ? 'var(--danger)' : 'var(--success)',
                                border: `1px solid ${user.status === 'active' ? 'rgba(255,71,87,0.3)' : 'rgba(46,213,115,0.3)'}`,
                                padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600
                              }}>
                              {user.status === 'active' ? '🚫 ระงับ' : '✅ ปลดระงับ'}
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>ไม่พบข้อมูลผู้ใช้งาน</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Tab: จัดการรีวิว ── */}
            {adminTab === 'reviews' && (
              <div className="glass-card" style={{ padding: 24, animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 20, marginBottom: 20 }}>📝 จัดการรีวิวจากลูกค้า</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="modern-table">
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
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>ยังไม่มีรีวิวในขณะนี้</td></tr>
                      ) : allReviews.map(review => (
                        <tr key={review.id}>
                          <td style={{ fontWeight: 600 }}>{review.product_name}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{review.username}</td>
                          <td style={{ color: '#f5c842', letterSpacing: 2 }}>{'★'.repeat(review.rating)}</td>
                          <td style={{ maxWidth: 200, color: 'var(--text-muted)', fontSize: 13 }}>{review.comment}</td>
                          <td style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {new Date(review.created_at).toLocaleDateString('th-TH')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button onClick={() => {
                              if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?')) deleteReview(review.id);
                            }}
                              style={{ background: 'rgba(255,71,87,0.15)', color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.3)', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
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
        ) : <Navigate to="/login" replace />} />

      </Routes>
    </div>
  );
}

export default App;