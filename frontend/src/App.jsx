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
// 🎨 ระบบสีกลาง (Design Tokens)
// เปรียบเหมือน "กล่องสีของช่างแต่งบ้าน" 
// เปลี่ยนที่นี่ที่เดียว ทั้งแอปเปลี่ยนตาม
// ============================================================
const C = {
  // สีหลัก
  primary:      '#6366f1',   // ม่วง Indigo
  primaryDark:  '#4f46e5',
  primaryLight: '#e0e7ff',
  // สีสถานะ
  success:      '#10b981',   // เขียว
  successLight: '#d1fae5',
  danger:       '#ef4444',   // แดง
  dangerLight:  '#fee2e2',
  warning:      '#f59e0b',   // เหลือง
  warningLight: '#fef3c7',
  info:         '#3b82f6',   // น้ำเงิน
  infoLight:    '#dbeafe',
  // สี Sidebar
  sidebar:      '#0f172a',   // น้ำเงินกรมท่าเข้มมาก
  sidebarHover: '#1e293b',
  // สีพื้น/ข้อความ
  bg:           '#f8fafc',
  surface:      '#ffffff',
  border:       '#e2e8f0',
  text:         '#1e293b',
  textSub:      '#64748b',
  textMuted:    '#94a3b8',
}

// ============================================================
// 🍞 Toast — ป๊อบอัพแจ้งเตือนแบบทันสมัย (ไม่ต้องกด OK)
// เปรียบเหมือน "ป้ายแจ้งเตือนที่ลอยขึ้นมาแล้วหายไปเอง"
// type: 'success' | 'error' | 'warning' | 'info'
// ============================================================
function Toast({ toasts, onRemove }) {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const colors = {
    success: C.success,
    error:   C.danger,
    warning: C.warning,
    info:    C.primary,
  };
  return (
    <div style={{
      position: 'fixed', top: '80px', right: '16px',
      zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '10px',
      maxWidth: '320px', width: 'calc(100% - 32px)',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: colors[t.type] || C.primary,
          color: '#fff', padding: '13px 16px', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'toastIn 0.3s ease',
          pointerEvents: 'auto',
          fontSize: '14px', fontWeight: '600',
        }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>{icons[t.type] || 'ℹ️'}</span>
          <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
          <button onClick={() => onRemove(t.id)} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
            width: '22px', height: '22px', cursor: 'pointer', color: '#fff',
            fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, lineHeight: 1,
          }}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 🛍️ CartPopup — ป๊อบอัพ "เพิ่มสินค้าลงตะกร้าแล้ว!"
// เปรียบเหมือน "ป้ายเล็กๆ ที่โผล่กลางจอแล้วหายไปใน 2 วินาที"
// ============================================================
function CartPopup({ popup }) {
  if (!popup) return null;
  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 88888, pointerEvents: 'none',
      animation: 'cartPopIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '22px 28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
        minWidth: '200px', border: `2px solid ${C.success}`,
      }}>
        {/* รูปสินค้า (ถ้ามี) */}
        {popup.image && (
          <img src={popup.image} alt={popup.name}
            style={{ width: '72px', height: '72px', borderRadius: '12px', objectFit: 'cover' }} />
        )}
        <span style={{ fontSize: '30px' }}>🛒</span>
        <span style={{ color: C.success, fontWeight: '800', fontSize: '15px' }}>เพิ่มลงตะกร้าแล้ว!</span>
        <span style={{ color: C.textSub, fontSize: '13px', textAlign: 'center', maxWidth: '160px', lineHeight: 1.4 }}>
          {popup.name}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// 🏷️ StatusBadge — ป้ายสีแสดงสถานะออเดอร์
// เปรียบเหมือน "สติกเกอร์สีบนกล่องพัสดุ" บอกว่าอยู่ขั้นไหน
// ============================================================
function StatusBadge({ status }) {
  const map = {
    'รอดำเนินการ': { bg: C.warningLight, color: C.warning,  icon: '⏳' },
    'ชำระเงินแล้ว': { bg: C.infoLight,    color: C.info,    icon: '💳' },
    'จัดส่งแล้ว':  { bg: C.successLight, color: C.success, icon: '🚚' },
    'ยกเลิก':      { bg: C.dangerLight,  color: C.danger,  icon: '❌' },
  };
  const s = map[status] || { bg: C.border, color: C.textSub, icon: '•' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '4px 10px', borderRadius: '999px',
      background: s.bg, color: s.color, fontSize: '11px', fontWeight: '700',
    }}>
      {s.icon} {status}
    </span>
  );
}

// ============================================================
// 🔍 ProductDetailPage — หน้ารายละเอียดสินค้า
// โครงสร้างเดิม — แต่งใหม่ให้ทันสมัย
// ============================================================
function ProductDetailPage({ products, addToCart }) {
  const { id } = useParams(); // ดึง ID จาก URL เช่น /product/5
  const navigate = useNavigate();
  
  // หาสินค้าที่ตรงกับ id (แปลงเป็น Number เพราะ useParams คืน String)
  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p style={{ fontSize: '48px' }}>😥</p>
        <h3 style={{ color: C.textSub }}>กำลังโหลด... หรือไม่พบสินค้านี้</h3>
        <button onClick={() => navigate('/')}
          style={{ marginTop: '20px', background: C.primary, color: '#fff',
            border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer',
            fontWeight: '700', fontSize: '15px', fontFamily: 'inherit' }}>
          กลับหน้าแรก
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(20px,4vw,40px)', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{
        background: 'none', border: `1.5px solid ${C.border}`, color: C.primary,
        fontSize: '14px', cursor: 'pointer', marginBottom: '20px',
        padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontFamily: 'inherit',
      }}>
        ← ย้อนกลับ
      </button>
      
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '32px', background: C.surface,
        padding: 'clamp(20px,4vw,30px)', borderRadius: '20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: `1px solid ${C.border}`,
      }}>
        {/* 🖼️ ฝั่งซ้าย: รูปภาพ */}
        <div style={{ flex: '1 1 300px' }}>
          <img src={product.image} alt={product.name}
            style={{ width: '100%', height: 'clamp(200px,40vw,360px)', borderRadius: '16px', objectFit: 'cover',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }} />
        </div>
        
        {/* 📝 ฝั่งขวา: รายละเอียด */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{
            background: C.primaryLight, color: C.primary, padding: '5px 12px',
            borderRadius: '999px', alignSelf: 'flex-start', fontSize: '12px', fontWeight: '700',
          }}>
            🏷️ {product.category || 'ไม่ระบุหมวดหมู่'}
          </span>
          <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', margin: 0, color: C.text, fontWeight: '800' }}>
            {product.name}
          </h1>
          <p style={{ fontSize: 'clamp(24px,4vw,34px)', fontWeight: '900', color: C.danger, margin: 0 }}>
            ฿{Number(product.price).toLocaleString()}
          </p>
          
          <div style={{ background: C.bg, padding: '14px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
            <p style={{ margin: 0, lineHeight: '1.7', color: C.textSub, fontSize: '14px' }}>
              <strong style={{ color: C.text }}>รายละเอียด:</strong><br />
              {product.description || 'ไม่มีรายละเอียดสินค้า'}
            </p>
          </div>

          <p style={{ color: product.stock > 0 ? C.success : C.danger, fontWeight: '700', fontSize: '15px', margin: 0 }}>
            📦 {product.stock > 0 ? `มีสินค้าพร้อมส่ง (${product.stock} ชิ้น)` : 'สินค้าหมดชั่วคราว'}
          </p>

          <button onClick={() => addToCart(product)} disabled={product.stock <= 0} style={{
            marginTop: 'auto', padding: '14px', fontSize: '16px', fontWeight: '700',
            border: 'none', borderRadius: '12px', cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
            background: product.stock > 0
              ? `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` : C.textMuted,
            color: 'white', fontFamily: 'inherit',
          }}>
            {product.stock > 0 ? '🛒 หยิบใส่ตะกร้า' : '❌ สินค้าหมด'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 👤 ProfilePage — หน้าโปรไฟล์ลูกค้า
// โครงสร้างเดิม — แต่งใหม่ให้สวยงาม
// ============================================================
function ProfilePage({ userId }) {
  const [profile, setProfile] = useState({
    username: '', email: '', address: '', phone: '', profile_picture: '', password: ''
  });
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

  // style input ใช้ร่วมกันในฟอร์ม
  const iStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: `1.5px solid ${C.border}`, fontSize: '14px', outline: 'none',
    fontFamily: 'inherit', color: C.text, boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: 'clamp(20px,4vw,40px)', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{
        background: 'none', border: `1.5px solid ${C.border}`, color: C.primary,
        fontSize: '14px', cursor: 'pointer', marginBottom: '20px',
        padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontFamily: 'inherit',
      }}>
        ← ย้อนกลับ
      </button>

      <div style={{
        background: C.surface, padding: 'clamp(20px,4vw,30px)', borderRadius: '20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: `1px solid ${C.border}`,
      }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 24px', color: C.text, fontSize: '22px', fontWeight: '800' }}>
          👤 โปรไฟล์ของฉัน
        </h2>
        
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* รูปโปรไฟล์ */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{
              width: '110px', height: '110px', margin: '0 auto', borderRadius: '50%',
              overflow: 'hidden', background: C.bg, border: `3px solid ${C.primary}`,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
            }}>
              {file
                ? <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : profile.profile_picture
                  ? <img src={profile.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '48px' }}>👤</span>}
            </div>
            <label style={{
              display: 'inline-block', marginTop: '10px', background: C.primary,
              color: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            }}>
              📸 เปลี่ยนรูป
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files[0])} />
            </label>
          </div>

          <div><label style={{ fontWeight: '700', color: C.textSub, fontSize: '13px' }}>👤 ชื่อผู้ใช้งาน</label>
            <input type="text" required value={profile.username || ''} onChange={(e) => setProfile({...profile, username: e.target.value})} style={{ ...iStyle, marginTop: '5px' }} /></div>
          <div><label style={{ fontWeight: '700', color: C.textSub, fontSize: '13px' }}>📧 อีเมล</label>
            <input type="email" required value={profile.email || ''} onChange={(e) => setProfile({...profile, email: e.target.value})} style={{ ...iStyle, marginTop: '5px' }} /></div>
          <div><label style={{ fontWeight: '700', color: C.textSub, fontSize: '13px', color: C.danger }}>🔐 รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)</label>
            <input type="password" value={profile.password || ''} onChange={(e) => setProfile({...profile, password: e.target.value})} style={{ ...iStyle, marginTop: '5px' }} /></div>
          <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '4px 0' }} />
          <div><label style={{ fontWeight: '700', color: C.textSub, fontSize: '13px' }}>🏠 ที่อยู่จัดส่ง</label>
            <textarea rows="3" value={profile.address || ''} onChange={(e) => setProfile({...profile, address: e.target.value})
            } style={{ ...iStyle, marginTop: '5px', resize: 'vertical', lineHeight: '1.5' }} /></div>
          <div><label style={{ fontWeight: '700', color: C.textSub, fontSize: '13px' }}>📞 เบอร์โทรศัพท์</label>
            <input type="text" value={profile.phone || ''} onChange={(e) => setProfile({...profile, phone: e.target.value})} style={{ ...iStyle, marginTop: '5px' }} /></div>

          <button type="submit" style={{
            background: `linear-gradient(135deg, ${C.success}, #059669)`, color: 'white',
            border: 'none', padding: '13px', borderRadius: '12px', cursor: 'pointer',
            fontWeight: '700', fontSize: '15px', marginTop: '4px', fontFamily: 'inherit',
          }}>
            💾 บันทึกข้อมูล
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// 🚀 App — Entry Point ของแอปทั้งหมด
// เปรียบเหมือน "ประตูทางเข้าร้าน" — ทุกอย่างเริ่มต้นที่นี่
// ============================================================
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// ============================================================
// 🏪 AppContent — ตัวหลักของแอป (ผู้จัดการร้าน)
// เก็บ State ทั้งหมดและส่งต่อให้แต่ละ "แผนก" (Component/Route)
// ============================================================
function AppContent() {
  const navigate = useNavigate();

  // ============================================================
  // 📦 State ทั้งหมด — เปรียบเหมือน "สมุดบัญชีร้าน"
  // ============================================================
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

  // ============================================================
  // 🍞 Toast Notification State
  // เปรียบเหมือน "กล่องจดหมายแจ้งเตือน" ที่มีหลายใบพร้อมกันได้
  // ============================================================
  const [toasts, setToasts] = useState([]);

  // สร้าง Toast ใหม่ — หายเองหลัง 3.5 วินาที
  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  // ============================================================
  // 🛍️ Cart Popup State — โผล่ขึ้นตอนเพิ่มสินค้าลงตะกร้า
  // ============================================================
  const [cartPopup, setCartPopup] = useState(null);

  // ============================================================
  // 📌 Sidebar State — เปิด/ปิดเมนูด้านซ้าย
  // เปรียบเหมือน "บานประตูเลื่อน"
  // ============================================================
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  // ============================================================
  // 🛰️ ดึงข้อมูลจาก Backend ตอนแอปเริ่มทำงาน
  // useEffect = "พนักงานที่ทำงานทันทีตอนร้านเปิด"
  // [] = ทำแค่ครั้งเดียวตอน mount
  // ============================================================
  useEffect(() => {
    axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
    if (isLoggedIn) fetchMyOrders();
    fetchOrders();

    // ดึงออเดอร์ใหม่ทุก 5 วินาที — เหมือน "เดินเช็คออเดอร์อัตโนมัติ"
    const orderInterval = setInterval(() => { fetchOrders(); }, 5000);
    // ล้างตัวตั้งเวลาเมื่อ Component ถูกลบ ป้องกัน memory leak
    return () => clearInterval(orderInterval);
  }, [isLoggedIn, userId]);

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

  // ============================================================
  // 📊 Export Excel (โครงสร้างเดิม ไม่แตะ)
  // ============================================================
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

  // ============================================================
  // 📄 Export PDF (โครงสร้างเดิม ไม่แตะ)
  // ============================================================
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

  // ============================================================
  // 🗑️ ลบประวัติออเดอร์ (โครงสร้างเดิม)
  // ============================================================
  const deleteOrderHistory = (orderId) => {
    if (window.confirm("คุณต้องการลบประวัติการสั่งซื้อนี้ทิ้งใช่หรือไม่?")) {
      axios.delete(`${API_URL}/orders/${orderId}`)
        .then(() => { toast("🗑️ ลบประวัติเรียบร้อย", 'info'); fetchMyOrders(); fetchOrders(); })
        .catch(() => toast("❌ ไม่สามารถลบได้", 'error'));
    }
  };

  const cancelOrder = (orderId) => {
    if (window.confirm("คุณต้องการยกเลิกออเดอร์นี้ใช่หรือไม่?")) {
      axios.delete(`${API_URL}/orders/${orderId}`)
        .then(() => { toast("ยกเลิกออเดอร์เรียบร้อย", 'info'); fetchMyOrders(); })
        .catch(() => toast("ไม่สามารถยกเลิกได้", 'error'));
    }
  };

  // ============================================================
  // 🖨️ สร้างใบเสร็จ PDF (โครงสร้างเดิม ไม่แตะ)
  // ============================================================
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
      const tableRows = items.map((item, index) => [
        index + 1, item.name, item.quantity,
        `฿${Number(item.price).toLocaleString()}`,
        `฿${(Number(item.price) * item.quantity).toLocaleString()}`
      ]);
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
    } catch (err) { toast("❌ เกิดข้อผิดพลาดในการดึงข้อมูลใบเสร็จ", 'error'); }
  };

  // ============================================================
  // 🔄 อัปเดตสถานะออเดอร์ (Admin) — โครงสร้างเดิม
  // ============================================================
  const updateOrderStatus = (orderId, newStatus) => {
    axios.put(`${API_URL}/orders/${orderId}`, { status: newStatus })
      .then(() => {
        toast("อัปเดตสถานะ: " + newStatus, 'success');
        fetchOrders();
        axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
      })
      .catch(err => toast("อัปเดตพลาด: " + err, 'error'));
  };

  // ============================================================
  // 🔐 Login — เปลี่ยน alert → Toast
  // ✅ แสดงป๊อบอัพสำเร็จ/ไม่สำเร็จ ตามที่ขอ
  // ============================================================
  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    axios.post(`${API_URL}/login`, { username, password })
      .then(res => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('userId', res.data.id);
        setIsLoggedIn(true);
        setUserRole(res.data.role);
        setUserId(res.data.id);
        // ✅ Toast แจ้งเข้าสู่ระบบสำเร็จ (แทน alert เดิม)
        toast(`🎉 ยินดีต้อนรับคุณ ${username}!`, 'success');
        // เปิด Sidebar อัตโนมัติบน Desktop
        if (window.innerWidth > 768) setIsSidebarOpen(true);
        if (res.data.role === 'admin') navigate('/admin');
        else navigate('/');
      })
      .catch(() => {
        // ✅ Toast แจ้งเข้าสู่ระบบไม่สำเร็จ
        toast('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
      });
  };

  // ============================================================
  // 📝 Register — โครงสร้างเดิม
  // ============================================================
  const handleRegister = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    if (password !== confirmPassword) return toast("รหัสผ่านไม่ตรงกันครับ!", 'error');
    axios.post(`${API_URL}/register`, { username, password })
      .then(res => { toast(res.data.message, 'success'); navigate('/login'); })
      .catch(err => toast(err.response?.data?.message || "เกิดข้อผิดพลาด", 'error'));
  };

  // ============================================================
  // 🛒 แปลงตะกร้า qty → array ชิ้นๆ (โครงสร้างเดิม)
  // เปรียบเหมือน "แพ็คพัสดุ: 2 ชิ้น = 2 กล่อง"
  // ============================================================
  const flatCart = [];
  cart.forEach(item => { for (let i = 0; i < item.qty; i++) flatCart.push(item); });

  // ============================================================
  // 🛒 เพิ่มสินค้าลงตะกร้า — เพิ่ม Popup แจ้งเตือน
  // ✅ แสดง CartPopup กลางจอ (แทน alert เดิม)
  // ============================================================
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.qty >= product.stock) {
          toast(`⚠️ สต็อกจำกัดเพียง ${product.stock} ชิ้น`, 'warning');
          return prevCart;
        }
        return prevCart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        return [...prevCart, { ...product, qty: 1 }];
      }
    });
    // ✅ แสดง Popup "เพิ่มสินค้าแล้ว!" กลางจอ หายเองใน 2 วินาที
    setCartPopup({ name: product.name, image: product.image });
    setTimeout(() => setCartPopup(null), 2000);
  };

  // เพิ่ม/ลดจำนวน (โครงสร้างเดิม)
  const updateQuantity = (id, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty < 1) return item;
        if (newQty > item.stock) { toast(`⚠️ สต็อกจำกัดเพียง ${item.stock} ชิ้น`, 'warning'); return item; }
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    if (window.confirm("คุณต้องการยกเลิกตะกร้าสินค้าทั้งหมดใช่หรือไม่?")) {
      setCart([]); toast('ล้างตะกร้าเรียบร้อย', 'info');
    }
  };
  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  // สั่งซื้อ (โครงสร้างเดิม)
  const checkout = () => {
    if (cart.length === 0) return toast("ตะกร้าว่างเปล่า!", 'warning');
    const orderData = { total_price: calculateTotal(), items_count: flatCart.length, user_id: userId, cartItems: flatCart };
    axios.post(`${API_URL}/orders`, orderData)
      .then(res => { setCurrentOrderId(res.data.orderId); setShowPayModal(true); fetchMyOrders(); })
      .catch(() => toast("สั่งซื้อไม่สำเร็จ", 'error'));
  };

  // ส่งหลักฐานการชำระเงิน (โครงสร้างเดิม)
  const handlePayment = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('address', address);
    formData.append('phone', phone);
    formData.append('slip', slipFile);
    axios.put(`${API_URL}/orders/pay/${currentOrderId}`, formData)
      .then(() => {
        toast("ส่งหลักฐานเรียบร้อย! รอแอดมินตรวจสอบ", 'success');
        setCart([]); localStorage.removeItem('cart');
        setShowPayModal(false); fetchMyOrders();
        navigate('/my-orders');
      })
      .catch(() => toast("เกิดข้อผิดพลาดในการส่งหลักฐาน", 'error'));
  };

  // คำนวณยอดรวม ราคา × จำนวน (โครงสร้างเดิม)
  const calculateTotal = () => cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

  // ลบสินค้า (Admin) (โครงสร้างเดิม)
  const deleteProduct = (id) => {
    if (window.confirm("คุณแน่ใจนะว่าจะลบ?")) {
      axios.delete(`${API_URL}/products/${id}`)
        .then(() => { toast("ลบเรียบร้อย!", 'info'); axios.get(`${API_URL}/products`).then(res => setProducts(res.data)); });
    }
  };

  const selectToEdit = (product) => { setEditingProduct(product); };

  // เพิ่ม/แก้ไขสินค้า (Admin) (โครงสร้างเดิม)
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
        .then(() => {
          toast("แก้ไขสินค้าเรียบร้อย!", 'success');
          setEditingProduct(null); setFile(null); e.target.reset();
          axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
        });
    } else {
      axios.post(`${API_URL}/products`, formData)
        .then(() => {
          toast("เพิ่มสินค้าใหม่แล้ว!", 'success');
          setFile(null); e.target.reset();
          axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
        });
    }
  };

  // ============================================================
  // 📊 คำนวณสถิติ Admin (โครงสร้างเดิม)
  // reduce = วนลูปสะสมค่า เปรียบเหมือน "นักบัญชีรวมยอด"
  // ============================================================
  const totalSales = orders.filter(o => o.status === 'ชำระเงินแล้ว' || o.status === 'จัดส่งแล้ว').reduce((sum, o) => sum + Number(o.total_price), 0);
  const pendingOrders = orders.filter(o => o.status === 'รอดำเนินการ').length;
  const completedOrders = orders.filter(o => o.status === 'จัดส่งแล้ว').length;
  const totalUsers = [...new Set(orders.map(o => o.user_id))].length;

  // ============================================================
  // 🔍 กรองสินค้าตามคำค้นหาและหมวดหมู่ (โครงสร้างเดิม)
  // filter = "ตะแกรงร่อน" — ผ่านได้ต้องตรงทั้ง 2 เงื่อนไข
  // ============================================================
  const filteredProducts = products.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
    return matchSearch && (selectedCategory === 'ทั้งหมด' ? true : matchCategory);
  });

  // ============================================================
  // 🚪 Logout (โครงสร้างเดิม)
  // ============================================================
  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole('user');
    setIsSidebarOpen(false);
    navigate('/login');
    toast('ออกจากระบบเรียบร้อย', 'info');
  };

  // ============================================================
  // 🎨 Input Style — ใช้ร่วมกันในทุก Form ของแอป
  // ============================================================
  const iStyle = {
    padding: '10px 12px', borderRadius: '8px',
    border: `1.5px solid ${C.border}`, fontSize: '14px',
    outline: 'none', fontFamily: 'inherit', color: C.text,
    background: C.surface, boxSizing: 'border-box',
  };

  // ============================================================
  // 🖥️ RENDER — ส่วนแสดงผลบนหน้าจอ
  // ============================================================
  return (
    <div style={{ fontFamily: "'Noto Sans Thai', 'Segoe UI', sans-serif", backgroundColor: C.bg, minHeight: '100vh' }}>

      {/* ============================================================
          🎨 Global CSS — Font, Animation, Scrollbar, Responsive
          ============================================================ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }

        /* Animation Toast — เลื่อนเข้าจากขวา */
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        /* Animation CartPopup — pop ขึ้นมากลางจอ */
        @keyframes cartPopIn {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          70%  { transform: translate(-50%, -50%) scale(1.06); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        /* Animation Modal */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ===== Responsive Mobile ===== */
        /* มือถือ (<768px): ปรับ Layout ให้เหมาะกับหน้าจอเล็ก */
        @media (max-width: 768px) {
          .nav-title    { font-size: 16px !important; }
          .product-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .cart-row     { flex-wrap: wrap !important; }
          .admin-stats  { grid-template-columns: 1fr 1fr !important; }
          .orders-table { font-size: 11px !important; }
          .sidebar-menu { width: 260px !important; }
        }
        @media (max-width: 480px) {
          .product-grid { grid-template-columns: 1fr !important; }
          .admin-stats  { grid-template-columns: 1fr !important; }
        }

        button:not(:disabled):active { transform: scale(0.97); }
        a { transition: opacity 0.15s; }
      `}</style>

      {/* ============================================================
          🍞 Toast Notifications — ลอยมุมขวาบน (เหนือทุกอย่าง)
          ============================================================ */}
      <Toast toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* ============================================================
          🛍️ CartPopup — โผล่กลางจอตอนเพิ่มสินค้าลงตะกร้า
          ============================================================ */}
      <CartPopup popup={cartPopup} />

      {/* ============================================================
          💳 Modal แจ้งชำระเงิน — ลอยเหนือทุกหน้า
          ============================================================ */}
      {showPayModal && (
        <div
          onClick={e => e.target === e.currentTarget && setShowPayModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 5000, padding: '20px',
          }}>
          <div style={{
            background: C.surface, padding: 'clamp(20px,4vw,32px)',
            borderRadius: '20px', width: '100%', maxWidth: '460px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)', animation: 'fadeUp 0.3s ease',
            border: `1px solid ${C.border}`,
          }}>
            <p style={{ fontSize: '11px', color: C.textMuted, margin: '0 0 4px' }}>ออเดอร์ #{currentOrderId}</p>
            <h2 style={{ margin: '0 0 6px', color: C.text, fontSize: '20px' }}>💰 แจ้งชำระเงิน</h2>
            <p style={{ fontSize: '13px', color: C.textSub, margin: '0 0 20px' }}>
              โอนมาที่ <strong style={{ color: C.primary }}>ธนาคารกสิกรไทย 000-0-00000-0</strong>
            </p>
            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏠 ที่อยู่จัดส่ง</label>
                <textarea required rows="3" value={address} onChange={(e) => setAddress(e.target.value)}
                  style={{ ...iStyle, width: '100%', marginTop: '6px', resize: 'none', lineHeight: '1.5' }}
                  placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด..." />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📞 เบอร์โทร</label>
                <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  style={{ ...iStyle, width: '100%', marginTop: '6px' }} placeholder="08x-xxx-xxxx" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📸 สลิปโอนเงิน</label>
                <input type="file" accept="image/*" required
                  style={{ ...iStyle, width: '100%', marginTop: '6px', cursor: 'pointer', padding: '8px' }}
                  onChange={(e) => setSlipFile(e.target.files[0])} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" onClick={() => setShowPayModal(false)} style={{
                  flex: 1, padding: '12px', background: C.dangerLight, color: C.danger,
                  border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit',
                }}>❌ ยกเลิก</button>
                <button type="submit" style={{
                  flex: 2, padding: '12px',
                  background: `linear-gradient(135deg, ${C.success}, #059669)`,
                  color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
                  fontWeight: '700', fontSize: '14px', fontFamily: 'inherit',
                }}>✅ ยืนยันชำระเงิน</button>
              </div>
              <button type="button" onClick={() => setShowPayModal(false)} style={{
                background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '13px', textDecoration: 'underline',
              }}>ไว้ทำทีหลัง</button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          📌 Navbar บนสุด — แถบหัวของทุกหน้า
          ============================================================ */}
      <nav style={{
        background: C.sidebar, padding: '0 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: 'white', position: 'sticky', top: 0, zIndex: 900,
        height: '60px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* ปุ่ม ☰ เปิด/ปิด Sidebar */}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px',
            color: 'white', fontSize: '20px', cursor: 'pointer',
            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>☰</button>
          <h2 className="nav-title" style={{ margin: 0, letterSpacing: '1px', fontSize: '18px', fontWeight: '900', color: '#f59e0b' }}>
            🛒 BIG SHOP
          </h2>
        </div>
        <div>
          {isLoggedIn
            ? <button onClick={logout} style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', padding: '7px 14px', borderRadius: '8px',
                cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'inherit',
              }}>🚪 ออกจากระบบ</button>
            : <button onClick={() => navigate('/login')} style={{
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                color: 'white', border: 'none', padding: '8px 16px',
                borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit',
              }}>🔐 เข้าสู่ระบบ</button>
          }
        </div>
      </nav>

      {/* ============================================================
          📌 Sidebar — แถบเมนูด้านซ้าย (เปิด/ปิดได้)
          เปรียบเหมือน "บานประตูเลื่อน" ที่ซ่อนเมนูทั้งหมด
          ============================================================ */}

      {/* Overlay สีดำจางๆ — กดเพื่อปิด Sidebar บนมือถือ */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.45)', zIndex: 998, backdropFilter: 'blur(2px)',
        }} />
      )}

      {/* ตัว Sidebar */}
      <div className="sidebar-menu" style={{
        position: 'fixed', top: 0,
        left: isSidebarOpen ? 0 : '-300px', // ซ่อนไปทางซ้ายเมื่อปิด
        width: '260px', height: '100vh',
        background: C.sidebar,
        boxShadow: isSidebarOpen ? '4px 0 24px rgba(0,0,0,0.2)' : 'none',
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 999, display: 'flex', flexDirection: 'column', overflowX: 'hidden',
      }}>
        {/* หัว Sidebar — โลโก้ + ปุ่มปิด */}
        <div style={{
          padding: '16px', background: 'rgba(0,0,0,0.2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: '900', fontSize: '17px', color: '#f59e0b', letterSpacing: '2px' }}>🛍 BIG SHOP</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              {userRole === 'admin' ? '⚙️ Admin Panel' : 'ช้อปใหญ่ จ่ายน้อย 🚀'}
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px',
            color: 'rgba(255,255,255,0.6)', fontSize: '16px', cursor: 'pointer',
            width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* รายการเมนูใน Sidebar */}
        <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflowY: 'auto' }}>

          {/* ============================================================
              เมนูสำหรับ "ลูกค้า" (role !== admin)
              ลำดับ: โปรไฟล์ → หน้าแรก → ตะกร้า → ประวัติสั่งซื้อ
              ============================================================ */}
          {userRole !== 'admin' && (
            <>
              {/* โปรไฟล์ — โชว์เฉพาะลูกค้าที่ล็อกอินแล้ว */}
              {isLoggedIn && (
                <Link to="/profile" onClick={() => setIsSidebarOpen(false)} style={{
                  textDecoration: 'none', color: 'rgba(255,255,255,0.7)',
                  fontSize: '15px', fontWeight: '500', padding: '10px 12px',
                  background: 'transparent', borderRadius: '10px', marginBottom: '1px',
                  display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = C.sidebarHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  👤 โปรไฟล์ของฉัน
                </Link>
              )}

              {/* 1️⃣ หน้าแรก */}
              <Link to="/" onClick={() => setIsSidebarOpen(false)} style={{
                textDecoration: 'none', color: 'rgba(255,255,255,0.8)',
                fontSize: '15px', fontWeight: '600', padding: '10px 12px',
                background: 'transparent', borderRadius: '10px', marginBottom: '1px',
                display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.sidebarHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                🏠 หน้าแรก
              </Link>

              {/* 2️⃣ ตะกร้าสินค้า + Badge จำนวน */}
              <Link to="/cart" onClick={() => setIsSidebarOpen(false)} style={{
                textDecoration: 'none', color: 'rgba(255,255,255,0.8)',
                fontSize: '15px', fontWeight: '600', padding: '10px 12px',
                background: 'transparent', borderRadius: '10px', marginBottom: '1px',
                display: 'flex', alignItems: 'center', gap: '10px',
                justifyContent: 'space-between', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.sidebarHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  🛒 ตะกร้าสินค้า
                </span>
                {/* Badge แสดงจำนวนสินค้าในตะกร้า */}
                {cart.length > 0 && (
                  <span style={{
                    background: C.danger, color: 'white', padding: '2px 8px',
                    borderRadius: '999px', fontSize: '12px', fontWeight: '800',
                  }}>{cart.length}</span>
                )}
              </Link>

              {/* 3️⃣ ประวัติการสั่งซื้อ — โชว์เฉพาะล็อกอินแล้ว */}
              {isLoggedIn && (
                <Link to="/my-orders" onClick={() => setIsSidebarOpen(false)} style={{
                  textDecoration: 'none', color: 'rgba(255,255,255,0.8)',
                  fontSize: '15px', fontWeight: '600', padding: '10px 12px',
                  background: 'transparent', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = C.sidebarHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  🧾 ประวัติการสั่งซื้อ
                </Link>
              )}
            </>
          )}

          {/* ============================================================
              เมนูสำหรับ "Admin" — กล่องเมนูย่อยระบบหลังบ้าน
              ============================================================ */}
          {isLoggedIn && userRole === 'admin' && (
            <>
              {/* ลิงก์ไปหน้าร้าน */}
              <Link to="/" onClick={() => setIsSidebarOpen(false)} style={{
                textDecoration: 'none', color: 'rgba(255,255,255,0.45)',
                fontSize: '14px', fontWeight: '500', padding: '10px 12px',
                borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.sidebarHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                🏪 หน้าร้าน
              </Link>

              {/* Label ระบบหลังบ้าน */}
              <div style={{
                fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '700',
                letterSpacing: '1px', padding: '10px 12px 4px', textTransform: 'uppercase',
              }}>ระบบหลังบ้าน</div>

              {/* เมนูย่อย Admin — เปลี่ยน adminTab เมื่อกด */}
              {[
                { tab: 'report', icon: '📊', label: 'รายงานสถิติ' },
                { tab: 'add',    icon: '➕', label: 'เพิ่มสินค้าใหม่' },
                { tab: 'stock',  icon: '📦', label: 'จัดการสต็อก' },
                { tab: 'orders', icon: '🧾', label: 'รายการสั่งซื้อ' },
              ].map(m => (
                <button key={m.tab}
                  onClick={() => { setAdminTab(m.tab); navigate('/admin'); setIsSidebarOpen(false); }}
                  style={{
                    textAlign: 'left', fontFamily: 'inherit',
                    background: adminTab === m.tab ? `rgba(99,102,241,0.25)` : 'transparent',
                    color: adminTab === m.tab ? '#a5b4fc' : 'rgba(255,255,255,0.65)',
                    border: 'none', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                    fontWeight: adminTab === m.tab ? '700' : '500', transition: 'all 0.15s',
                    fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                  }}
                  onMouseEnter={e => adminTab !== m.tab && (e.currentTarget.style.background = C.sidebarHover)}
                  onMouseLeave={e => adminTab !== m.tab && (e.currentTarget.style.background = 'transparent')}>
                  {m.icon} {m.label}
                </button>
              ))}
            </>
          )}
        </div>

        {/* ปุ่ม Login/Logout ด้านล่าง Sidebar */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          {isLoggedIn
            ? <button onClick={logout} style={{
                width: '100%', background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px',
                color: '#fca5a5', cursor: 'pointer', padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: '10px',
                fontSize: '14px', fontWeight: '600', fontFamily: 'inherit',
              }}>🚪 ออกจากระบบ</button>
            : <Link to="/login" onClick={() => setIsSidebarOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px',
                background: 'rgba(99,102,241,0.2)', color: '#a5b4fc',
                textDecoration: 'none', fontSize: '14px', fontWeight: '600',
              }}>🔐 เข้าสู่ระบบ</Link>
          }
        </div>
      </div>
      {/* 🟢 สิ้นสุด Sidebar */}

      {/* ============================================================
          📄 Routes — หน้าต่างๆ ของแอปทั้งหมด
          ============================================================ */}
      <Routes>

        {/* ===================================================
            🏠 หน้าแรก — Hero, ค้นหา, หมวดหมู่, สินค้า, Footer
            =================================================== */}
        <Route path="/" element={
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: C.bg }}>

            {/* Hero Banner */}
            <div style={{
              textAlign: 'center', padding: 'clamp(40px,8vw,80px) 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6366f1 100%)',
              color: 'white', position: 'relative', overflow: 'hidden',
            }}>
              {/* วงกลมตกแต่ง */}
              <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 10px' }}>ยินดีต้อนรับสู่</p>
              <h1 style={{ fontSize: 'clamp(28px,7vw,52px)', margin: '0 0 8px', fontWeight: '900', letterSpacing: '2px' }}>🛍️ BIG SHOP</h1>
              <p style={{ fontSize: 'clamp(14px,2.5vw,20px)', opacity: 0.9, margin: '0 0 4px' }}>"ช้อปใหญ่ จ่ายน้อย สอยทุกความคุ้ม!"</p>
              <p style={{ fontSize: '13px', opacity: 0.55, margin: '0 0 28px' }}>🔥 ดีลพิเศษทุกวัน • ส่งฟรีเมื่อซื้อครบ ฿500</p>
              {/* ช่องค้นหา */}
              <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto' }}>
                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', pointerEvents: 'none' }}>🔍</span>
                <input type="text" placeholder="ค้นหาสินค้าที่ใช่สำหรับคุณ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '14px 20px 14px 50px', width: '100%', borderRadius: '999px', border: 'none', fontSize: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', outline: 'none', fontFamily: 'inherit' }} />
              </div>
            </div>

            {/* แถบหมวดหมู่ */}
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '12px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                {['ทั้งหมด', ...new Set(products.map(p => p.category).filter(cat => cat && cat !== 'ทั้งหมด'))].map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                    padding: '7px 18px', borderRadius: '999px', cursor: 'pointer', fontWeight: '600',
                    background: selectedCategory === cat ? C.primary : C.surface,
                    color: selectedCategory === cat ? 'white' : C.textSub,
                    border: `1.5px solid ${selectedCategory === cat ? C.primary : C.border}`,
                    fontSize: '13px', whiteSpace: 'nowrap', transition: '0.2s', fontFamily: 'inherit',
                  }}>{cat}</button>
                ))}
              </div>
            </div>

            {/* Grid สินค้า */}
            <main style={{ flex: 1, padding: 'clamp(16px,3vw,24px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: C.text }}>
                  {selectedCategory === 'ทั้งหมด' ? 'สินค้าทั้งหมด' : `หมวด: ${selectedCategory}`}
                </h2>
                <span style={{ fontSize: '13px', color: C.textMuted }}>{filteredProducts.length} รายการ</span>
              </div>

              <div className="product-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '18px',
              }}>
                {filteredProducts.map(item => (
                  <div key={item.id} style={{
                    background: C.surface, borderRadius: '16px', overflow: 'hidden',
                    border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(99,102,241,0.14)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}>
                    {/* รูปสินค้า */}
                    <div style={{ height: '170px', background: C.bg, overflow: 'hidden', position: 'relative' }}>
                      {item.image
                        ? <img src={item.image} alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📦</div>}
                      {item.category && (
                        <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '10px', padding: '3px 8px', borderRadius: '999px', fontWeight: '600' }}>{item.category}</span>
                      )}
                    </div>
                    {/* ข้อมูลสินค้า */}
                    <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: C.text, lineHeight: 1.3 }}>{item.name}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: C.danger }}>฿{Number(item.price).toLocaleString()}</p>
                        <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: item.stock > 0 ? C.success : C.danger }}>
                          {item.stock > 0 ? `✅ ${item.stock} ชิ้น` : '❌ หมด'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <button onClick={() => navigate(`/product/${item.id}`)} style={{
                          flex: 1, padding: '8px', background: C.bg, color: C.textSub,
                          border: `1.5px solid ${C.border}`, borderRadius: '8px', cursor: 'pointer',
                          fontWeight: '600', fontSize: '12px', fontFamily: 'inherit',
                        }}>🔍 รายละเอียด</button>
                        <button onClick={() => addToCart(item)} disabled={item.stock <= 0} style={{
                          flex: 1, padding: '8px',
                          background: item.stock > 0 ? `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` : C.textMuted,
                          color: 'white', border: 'none', borderRadius: '8px',
                          cursor: item.stock > 0 ? 'pointer' : 'not-allowed',
                          fontWeight: '700', fontSize: '12px', fontFamily: 'inherit',
                        }}>{item.stock > 0 ? '🛒 ใส่ตะกร้า' : '❌ หมด'}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>

            {/* Footer */}
            <footer style={{ background: C.sidebar, color: 'rgba(255,255,255,0.7)', padding: 'clamp(24px,4vw,40px)' }}>
              <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px' }}>
                <div>
                  <div style={{ fontWeight: '900', fontSize: '18px', color: '#f59e0b', letterSpacing: '2px', marginBottom: '8px' }}>🛍️ BIG SHOP</div>
                  <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0 }}>สินค้าคุณภาพ ราคาโดน บริการดี จัดส่งทั่วไทย</p>
                </div>
                <div>
                  <h4 style={{ color: 'white', margin: '0 0 10px', fontSize: '14px' }}>เมนูหลัก</h4>
                  <Link to="/" style={{ display: 'block', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '13px', marginBottom: '5px' }}>🏠 หน้าแรก</Link>
                  <Link to="/cart" style={{ display: 'block', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '13px', marginBottom: '5px' }}>🛒 ตะกร้าสินค้า</Link>
                  {isLoggedIn && <Link to="/my-orders" style={{ display: 'block', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '13px' }}>🧾 ประวัติออเดอร์</Link>}
                </div>
                <div>
                  <h4 style={{ color: 'white', margin: '0 0 10px', fontSize: '14px' }}>ติดต่อเรา</h4>
                  <p style={{ fontSize: '13px', margin: '0 0 5px' }}>📞 093-112-1917</p>
                  <p style={{ fontSize: '13px', margin: '0 0 5px' }}>💬 Line: @phuwadet5617</p>
                  <p style={{ fontSize: '13px', margin: 0 }}>🕐 จ–ศ 9:00–18:00 น.</p>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '24px', paddingTop: '14px', textAlign: 'center', fontSize: '12px' }}>
                © 2026 BIG SHOP. All rights reserved.
              </div>
            </footer>
          </div>
        } />

        {/* โปรไฟล์ */}
        <Route path="/profile" element={isLoggedIn ? <ProfilePage userId={userId} /> : <Navigate to="/login" />} />

        {/* รายละเอียดสินค้า */}
        <Route path="/product/:id" element={<ProductDetailPage products={products} addToCart={addToCart} />} />

        {/* ===================================================
            🛒 หน้าตะกร้าสินค้า
            =================================================== */}
        <Route path="/cart" element={
          <div style={{ padding: 'clamp(16px,4vw,40px)', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: C.text }}>
                🛒 ตะกร้าสินค้า
                {cart.length > 0 && <span style={{ marginLeft: '10px', background: C.primaryLight, color: C.primary, padding: '3px 12px', borderRadius: '999px', fontSize: '14px', fontWeight: '700' }}>{cart.length}</span>}
              </h2>
              {cart.length > 0 && (
                <button onClick={clearCart} style={{ background: C.dangerLight, color: C.danger, border: `1.5px solid ${C.danger}`, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit' }}>
                  🗑️ ล้างตะกร้า
                </button>
              )}
            </div>
            <div style={{ background: C.surface, borderRadius: '16px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                  <p style={{ fontSize: '56px', margin: '0 0 12px' }}>🛒</p>
                  <p style={{ color: C.textSub, fontSize: '16px', margin: '0 0 20px' }}>ตะกร้าว่างเปล่า</p>
                  <Link to="/" style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: 'white', textDecoration: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', display: 'inline-block' }}>← กลับไปเลือกสินค้า</Link>
                </div>
              ) : (
                <div>
                  {cart.map((item) => (
                    <div key={item.id} className="cart-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: `1px solid ${C.border}`, padding: '16px 20px' }}>
                      <img src={item.image} alt={item.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                        <p style={{ margin: 0, color: C.danger, fontWeight: '800', fontSize: '15px' }}>฿{Number(item.price).toLocaleString()}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                        <button onClick={() => updateQuantity(item.id, -1)} style={{ background: C.bg, border: 'none', padding: '7px 12px', cursor: 'pointer', fontSize: '16px', fontWeight: '700' }}>−</button>
                        <span style={{ padding: '0 12px', fontWeight: '800', fontSize: '15px' }}>{item.qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} style={{ background: C.bg, border: 'none', padding: '7px 12px', cursor: 'pointer', fontSize: '16px', fontWeight: '700' }}>+</button>
                      </div>
                      <div style={{ width: '80px', textAlign: 'right', fontWeight: '800', color: C.text, flexShrink: 0 }}>฿{(item.price * item.qty).toLocaleString()}</div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: C.dangerLight, border: 'none', color: C.danger, cursor: 'pointer', fontSize: '14px', borderRadius: '8px', padding: '6px 10px', flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                  <div style={{ padding: '20px', background: C.bg, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ color: C.textSub, fontSize: '14px' }}>ยอดรวม ({cart.length} รายการ)</span>
                      <span style={{ fontSize: '24px', fontWeight: '900', color: C.text }}>฿{calculateTotal().toLocaleString()}</span>
                    </div>
                    <button onClick={() => {
                      if (isLoggedIn) {
                        // ดึงที่อยู่/เบอร์จากโปรไฟล์ก่อนเปิด Modal
                        axios.get(`${API_URL}/users/${userId}`)
                          .then(res => { setAddress(res.data.address || ''); setPhone(res.data.phone || ''); checkout(); })
                          .catch(() => checkout());
                      } else navigate('/login');
                    }} style={{
                      width: '100%', padding: '14px',
                      background: isLoggedIn ? `linear-gradient(135deg, ${C.success}, #059669)` : `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                      color: 'white', border: 'none', borderRadius: '12px',
                      fontSize: '16px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      {isLoggedIn ? "✅ ยืนยันการสั่งซื้อ" : "🔑 ล็อกอินเพื่อสั่งซื้อ"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        } />

        {/* ===================================================
            📋 หน้าประวัติการสั่งซื้อ
            =================================================== */}
        <Route path="/my-orders" element={
          <div style={{ padding: 'clamp(16px,4vw,30px)', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '900', color: C.text, margin: '0 0 20px' }}>📋 ประวัติการสั่งซื้อ</h1>
            <div style={{ background: C.surface, borderRadius: '16px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              {myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📭</p>
                  <p style={{ color: C.textSub }}>ยังไม่มีรายการสั่งซื้อ</p>
                </div>
              ) : (
                <div>
                  {myOrders.map(order => (
                    <div key={order.id} style={{ padding: '18px 20px', borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontWeight: '800', color: C.text, fontSize: '15px' }}>ออเดอร์ #{order.id}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '13px', color: C.textSub, flexWrap: 'wrap' }}>
                        <span>📅 {new Date(order.created_at).toLocaleDateString('th-TH')}</span>
                        <span style={{ fontWeight: '700', color: C.primary }}>฿{Number(order.total_price).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {order.status === 'รอดำเนินการ' && (
                          <button onClick={() => cancelOrder(order.id)} style={{ background: C.dangerLight, color: C.danger, border: `1.5px solid ${C.danger}`, padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: 'inherit' }}>ยกเลิก</button>
                        )}
                        <button onClick={() => { setCurrentOrderId(order.id); setShowPayModal(true); }} style={{ background: C.infoLight, color: C.info, border: `1.5px solid ${C.info}`, padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: 'inherit' }}>💳 จ่ายเงิน</button>
                        <button onClick={() => generatePDF(order)} style={{ background: C.successLight, color: C.success, border: `1.5px solid ${C.success}`, padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: 'inherit' }}>📄 บิล</button>
                        <button onClick={() => deleteOrderHistory(order.id)} style={{ background: C.dangerLight, color: C.danger, border: `1.5px solid ${C.danger}`, padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: 'inherit' }}>🗑️ ลบ</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        } />

        {/* ===================================================
            🔐 หน้า Login
            =================================================== */}
        <Route path="/login" element={
          isLoggedIn ? (
            userRole === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />
          ) : (
            <div style={{
              minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
              padding: '40px 20px', background: `linear-gradient(135deg, ${C.primary}22, ${C.bg})`,
            }}>
              <div style={{
                background: C.surface, padding: 'clamp(24px,5vw,40px)', borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(99,102,241,0.12)', width: '100%', maxWidth: '400px',
                border: `1px solid ${C.border}`, animation: 'fadeUp 0.3s ease',
              }}>
                <h2 style={{ marginBottom: '6px', fontSize: '24px', fontWeight: '900', color: C.text }}>🔐 เข้าสู่ระบบ</h2>
                <p style={{ color: C.textSub, fontSize: '14px', margin: '0 0 24px' }}>ยินดีต้อนรับกลับมา 👋</p>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.textSub, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ชื่อผู้ใช้งาน</label>
                    <input name="username" type="text" placeholder="username" required style={{ ...iStyle, width: '100%', padding: '11px 14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.textSub, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>รหัสผ่าน</label>
                    <input name="password" type="password" placeholder="••••••••" required style={{ ...iStyle, width: '100%', padding: '11px 14px' }} />
                  </div>
                  <button type="submit" style={{
                    background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                    color: 'white', border: 'none', padding: '13px', borderRadius: '12px',
                    cursor: 'pointer', fontWeight: '700', fontSize: '15px', fontFamily: 'inherit', marginTop: '4px',
                  }}>เข้าสู่ระบบ</button>
                </form>
                <p style={{ marginTop: '18px', textAlign: 'center', fontSize: '14px', color: C.textSub }}>
                  ยังไม่มีบัญชี? <Link to="/register" style={{ color: C.primary, fontWeight: '700', textDecoration: 'none' }}>สมัครสมาชิกฟรี</Link>
                </p>
              </div>
            </div>
          )
        } />

        {/* ===================================================
            📝 หน้า Register
            =================================================== */}
        <Route path="/register" element={
          <div style={{
            minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '40px 20px', background: `linear-gradient(135deg, ${C.success}22, ${C.bg})`,
          }}>
            <div style={{
              background: C.surface, padding: 'clamp(24px,5vw,40px)', borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(16,185,129,0.10)', width: '100%', maxWidth: '400px',
              border: `1px solid ${C.border}`,
            }}>
              <h2 style={{ marginBottom: '6px', fontSize: '24px', fontWeight: '900', color: C.text }}>📝 สมัครสมาชิก</h2>
              <p style={{ color: C.textSub, fontSize: '14px', margin: '0 0 24px' }}>สร้างบัญชีใหม่ฟรีวันนี้ ✨</p>
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { name: 'username', label: 'ชื่อผู้ใช้งาน', type: 'text', placeholder: 'username' },
                  { name: 'password', label: 'รหัสผ่าน', type: 'password', placeholder: '••••••••' },
                  { name: 'confirmPassword', label: 'ยืนยันรหัสผ่าน', type: 'password', placeholder: '••••••••' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.textSub, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                    <input name={f.name} type={f.type} placeholder={f.placeholder} required style={{ ...iStyle, width: '100%', padding: '11px 14px' }} />
                  </div>
                ))}
                <button type="submit" style={{
                  background: `linear-gradient(135deg, ${C.success}, #059669)`,
                  color: 'white', border: 'none', padding: '13px', borderRadius: '12px',
                  cursor: 'pointer', fontWeight: '700', fontSize: '15px', fontFamily: 'inherit', marginTop: '4px',
                }}>สมัครสมาชิก</button>
              </form>
              <p style={{ marginTop: '18px', textAlign: 'center', fontSize: '14px', color: C.textSub }}>
                มีบัญชีอยู่แล้ว? <Link to="/login" style={{ color: C.primary, fontWeight: '700', textDecoration: 'none' }}>เข้าสู่ระบบที่นี่</Link>
              </p>
            </div>
          </div>
        } />

        {/* ===================================================
            ⚙️ หน้า Admin — Dashboard + เมนูย่อย 4 แท็บ
            =================================================== */}
        <Route path="/admin" element={isLoggedIn && userRole === 'admin' ? (
          <div style={{ padding: 'clamp(16px,4vw,30px)', maxWidth: '1300px', margin: '0 auto' }}>

            {/* Header Admin */}
            <div style={{ marginBottom: '24px', borderBottom: `2px solid ${C.border}`, paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: C.text }}>⚙️ ระบบจัดการหลังบ้าน</h1>
                <p style={{ margin: '4px 0 0', color: C.textSub, fontSize: '13px' }}>
                  {adminTab === 'report' ? '📊 รายงานสถิติ' : adminTab === 'add' ? '➕ เพิ่มสินค้า' : adminTab === 'stock' ? '📦 จัดการสต็อก' : '🧾 รายการสั่งซื้อ'}
                </p>
              </div>
            </div>

            {/* ==============================
                แท็บ 1: 📊 รายงานสถิติ Dashboard
                ============================== */}
            {adminTab === 'report' && (
              <div>
                {/* กราฟยอดขายรายวัน */}
                <div style={{ background: C.surface, padding: '20px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: `1px solid ${C.border}` }}>
                  <h3 style={{ margin: '0 0 20px', color: C.text, fontSize: '16px', fontWeight: '700' }}>📈 สถิติยอดขายรายวัน</h3>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={Object.values(orders.reduce((acc, order) => {
                          if (order.status !== 'ยกเลิก' && order.status !== 'รอดำเนินการ') {
                            const date = new Date(order.created_at).toLocaleDateString('th-TH');
                            if (!acc[date]) acc[date] = { name: date, ยอดขาย: 0 };
                            acc[date].ยอดขาย += Number(order.total_price);
                          }
                          return acc;
                        }, {}))}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: C.primaryLight }} />
                        <Legend />
                        <Bar dataKey="ยอดขาย" fill={C.primary} radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* การ์ดสถิติ 4 ใบ */}
                <div className="admin-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
                  {[
                    { label: 'ยอดขายทั้งหมด',     value: `฿${totalSales.toLocaleString()}`,  icon: '💰', bg: 'linear-gradient(135deg, #10b981, #059669)' },
                    { label: 'ออเดอร์รอตรวจสอบ',  value: `${pendingOrders} รายการ`,          icon: '⏳', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
                    { label: 'จัดส่งสำเร็จ',       value: `${completedOrders} รายการ`,        icon: '✅', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
                    { label: 'ลูกค้าทั้งหมด',     value: `${totalUsers} คน`,                 icon: '👥', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, color: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
                      <p style={{ margin: '0 0 8px', fontSize: '13px', opacity: 0.85 }}>{s.icon} {s.label}</p>
                      <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>{s.value}</h2>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==============================
                แท็บ 2: ➕ เพิ่มสินค้าใหม่
                ============================== */}
            {adminTab === 'add' && (
              <div style={{ background: C.surface, padding: 'clamp(16px,4vw,24px)', borderRadius: '16px', border: `1px solid ${C.border}`, maxWidth: '700px' }}>
                <h3 style={{ margin: '0 0 20px', color: C.text, fontSize: '17px', fontWeight: '700' }}>
                  {editingProduct ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่'}
                </h3>
                <form onSubmit={addOrUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>ชื่อสินค้า *</label>
                      <input name="name" placeholder="ชื่อสินค้า" defaultValue={editingProduct?.name || ''} required style={{ ...iStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>หมวดหมู่ *</label>
                      <input name="category" placeholder="หมวดหมู่" defaultValue={editingProduct?.category || ''} required style={{ ...iStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>สต็อก *</label>
                      <input name="stock" type="number" placeholder="จำนวนสต็อก" defaultValue={editingProduct?.stock || 0} required style={{ ...iStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>ราคา (฿) *</label>
                      <input name="price" type="number" placeholder="ราคา" defaultValue={editingProduct?.price || ''} required style={{ ...iStyle, width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>รูปสินค้า</label>
                    <input name="image" type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*" style={{ ...iStyle, width: '100%', cursor: 'pointer', padding: '8px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>รายละเอียด</label>
                    <input name="desc" placeholder="รายละเอียดสินค้า" defaultValue={editingProduct?.description || ''} style={{ ...iStyle, width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{
                      flex: 1, padding: '12px',
                      background: editingProduct ? `linear-gradient(135deg, ${C.warning}, #d97706)` : `linear-gradient(135deg, ${C.success}, #059669)`,
                      color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
                      fontWeight: '700', fontSize: '14px', fontFamily: 'inherit',
                    }}>
                      {editingProduct ? '💾 ยืนยันการแก้ไข' : '➕ บันทึกสินค้า'}
                    </button>
                    {editingProduct && (
                      <button type="button" onClick={() => setEditingProduct(null)} style={{
                        padding: '12px 20px', background: C.bg, color: C.textSub,
                        border: `1.5px solid ${C.border}`, borderRadius: '10px', cursor: 'pointer',
                        fontWeight: '600', fontFamily: 'inherit',
                      }}>ยกเลิก</button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* ==============================
                แท็บ 3: 📦 จัดการสต็อกสินค้า
                ============================== */}
            {adminTab === 'stock' && (
              <div>
                <h3 style={{ margin: '0 0 16px', color: C.text, fontSize: '17px', fontWeight: '700' }}>
                  📦 จัดการสต็อกสินค้า ({products.length} รายการ)
                </h3>
                <div style={{ background: C.surface, borderRadius: '16px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: C.bg }}>
                          {['สินค้า', 'ราคา', 'สต็อก', 'จัดการ'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: h === 'สินค้า' ? 'left' : 'center', color: C.textSub, fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p, i) => (
                          <tr key={p.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? C.surface : C.bg }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {p.image
                                  ? <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                                  : <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                                }
                                <span style={{ fontWeight: '600', color: C.text }}>{p.name}</span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: '700', color: C.danger }}>฿{Number(p.price).toLocaleString()}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ background: p.stock > 0 ? C.successLight : C.dangerLight, color: p.stock > 0 ? C.success : C.danger, padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' }}>
                                {p.stock > 0 ? `${p.stock} ชิ้น` : 'หมด'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                              <button onClick={() => { selectToEdit(p); setAdminTab('add'); }} style={{ background: C.warningLight, color: C.warning, border: `1.5px solid ${C.warning}`, padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', marginRight: '6px', fontFamily: 'inherit' }}>✏️ แก้ไข</button>
                              <button onClick={() => deleteProduct(p.id)} style={{ background: C.dangerLight, color: C.danger, border: `1.5px solid ${C.danger}`, padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: 'inherit' }}>🗑️ ลบ</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==============================
                แท็บ 4: 🧾 รายการสั่งซื้อ
                ============================== */}
            {adminTab === 'orders' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ margin: 0, color: C.text, fontSize: '17px', fontWeight: '700' }}>🧾 รายการสั่งซื้อทั้งหมด</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={exportToExcel} style={{ background: C.successLight, color: C.success, border: `1.5px solid ${C.success}`, padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>📊 Excel</button>
                    <button onClick={exportToPDF} style={{ background: C.dangerLight, color: C.danger, border: `1.5px solid ${C.danger}`, padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>📄 PDF</button>
                  </div>
                </div>
                <div style={{ background: C.surface, borderRadius: '16px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="orders-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: C.bg }}>
                          {['ออเดอร์', 'ราคารวม', 'หลักฐาน', 'สถานะ', 'พิมพ์'].map(h => (
                            <th key={h} style={{ padding: '12px 10px', textAlign: 'center', color: C.textSub, fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, i) => (
                          <tr key={order.id} style={{ borderTop: `1px solid ${C.border}`, textAlign: 'center', background: i % 2 === 0 ? C.surface : C.bg }}>
                            <td style={{ padding: '12px 10px', fontWeight: '700', color: C.text }}>
                              #{order.id}
                              {order.address && (
                                <button onClick={() => alert(`📍 ${order.address}\n📞 ${order.phone}`)} style={{ marginLeft: '5px', background: C.primaryLight, border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '9px', color: C.primary, fontWeight: '700' }}>i</button>
                              )}
                            </td>
                            <td style={{ fontWeight: '700', color: C.danger }}>฿{Number(order.total_price).toLocaleString()}</td>
                            <td>
                              {/* รูปสลิป — ดึงจาก Cloud URL */}
                              {order.slip_image
                                ? <button onClick={() => window.open(order.slip_image, '_blank')} style={{ background: '#f3e8ff', color: '#7c3aed', border: '1.5px solid #7c3aed', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'inherit' }}>🖼️ ดูสลิป</button>
                                : <span style={{ color: C.textMuted, fontSize: '11px' }}>ยังไม่ส่ง</span>
                              }
                            </td>
                            <td>
                              {/* Dropdown เปลี่ยนสถานะ */}
                              <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} style={{
                                padding: '5px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '700',
                                background: order.status === 'จัดส่งแล้ว' ? C.successLight : order.status === 'ชำระเงินแล้ว' ? C.infoLight : C.warningLight,
                                border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'inherit',
                              }}>
                                <option>รอดำเนินการ</option>
                                <option>ชำระเงินแล้ว</option>
                                <option>จัดส่งแล้ว</option>
                                <option>ยกเลิก</option>
                              </select>
                            </td>
                            <td>
                              <button onClick={() => generatePDF(order)} style={{ background: C.bg, color: C.text, border: `1.5px solid ${C.border}`, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'inherit' }}>🖨️ บิล</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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