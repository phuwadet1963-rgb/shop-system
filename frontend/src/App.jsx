import { useEffect, useState } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fontBase64 } from './ThaiFont';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API_URL from './config'; // หรือใส่ path ให้ตรงกับที่ไฟล์ config.js อยู่

// 🟢 [แก้ไข]: คอมโพเนนต์สำหรับหน้ารายละเอียดสินค้า พร้อมระบบโหลดรีวิวอัตโนมัติ
function ProductDetailPage({ products, addToCart, productReviews, fetchProductReviews }) {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const product = products.find(p => p.id === Number(id));

  // 🔄 ดึงรีวิวทันทีที่เข้าหน้านี้ หรือเมื่อ ID สินค้าเปลี่ยน
  useEffect(() => {
    if (id) {
      fetchProductReviews(id);
    }
  }, [id, fetchProductReviews]);

  if (!product) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h3>กำลังโหลด... หรือไม่พบสินค้านี้ 😥</h3>
        <button onClick={() => navigate('/')}>กลับหน้าแรก</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0', background: 'white', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {/* 🖼️ ฝั่งซ้าย: รูปสินค้า */}
        <div style={{ flex: '1 1 380px', position: 'relative' }}>
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
            />
          ) : (
            <div style={{ width: '100%', height: '420px', background: 'linear-gradient(135deg,#f5f7fa,#c3cfe2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px' }}>📦</div>
          )}
          <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: '5px 14px', borderRadius: '30px', fontSize: '13px', fontWeight: '700', color: '#555', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            🏷️ {product.category || 'ไม่ระบุหมวดหมู่'}
          </div>
        </div>
        
        {/* 📝 ฝั่งขวา: รายละเอียด */}
        <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', padding: '36px 32px' }}>
          <h1 style={{ fontSize: '26px', margin: '0 0 10px 0', color: '#1a1a2e', lineHeight: '1.3', fontWeight: '800' }}>{product.name}</h1>
          <div style={{ fontSize: '38px', fontWeight: '900', color: '#e74c3c', margin: '0 0 20px 0', letterSpacing: '-1px' }}>฿{Number(product.price).toLocaleString()}</div>
          
          <div style={{ background: '#f8f9fa', padding: '16px 18px', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #6a11cb' }}>
            <p style={{ margin: 0, lineHeight: '1.7', color: '#555', fontSize: '14px' }}>
              {product.description || 'ไม่มีรายละเอียดสินค้า'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', padding: '12px 16px', background: product.stock > 0 ? '#f0fff4' : '#fff5f5', borderRadius: '10px', border: `1px solid ${product.stock > 0 ? '#9ae6b4' : '#fed7d7'}` }}>
            <span style={{ fontSize: '20px' }}>{product.stock > 0 ? '✅' : '❌'}</span>
            <span style={{ color: product.stock > 0 ? '#276749' : '#c53030', fontWeight: '700', fontSize: '15px' }}>
              {product.stock > 0 ? `พร้อมส่ง · เหลือ ${product.stock} ชิ้น` : 'สินค้าหมดชั่วคราว'}
            </span>
          </div>

          <button 
            onClick={() => addToCart(product)} 
            disabled={product.stock <= 0} 
            style={{ 
              marginTop: 'auto', padding: '16px', fontSize: '17px', fontWeight: '800', border: 'none', borderRadius: '12px', cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
              background: product.stock > 0 ? 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' : '#d1d5db', 
              color: 'white', boxShadow: product.stock > 0 ? '0 6px 20px rgba(106,17,203,0.35)' : 'none',
              transition: 'all 0.2s', letterSpacing: '0.5px'
            }}
          >
            {product.stock > 0 ? '🛒 หยิบใส่ตะกร้า' : '❌ สินค้าหมด'}
          </button>
        </div>
      </div>

      {/* ⭐ รีวิวจากลูกค้า */}
      <div style={{ marginTop: '24px', background: 'white', padding: '28px 30px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '800', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💬 รีวิวจากลูกค้า <span style={{ background: '#eef2ff', color: '#6a11cb', padding: '2px 10px', borderRadius: '20px', fontSize: '14px' }}>{productReviews.length}</span>
        </h3>
        
        {productReviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af', background: '#f9fafb', borderRadius: '12px' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>💭</div>
            <p style={{ margin: 0, fontSize: '15px' }}>ยังไม่มีรีวิวสำหรับสินค้านี้</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {productReviews.map((rev) => (
              <div key={rev.id} style={{ background: '#f9fafb', padding: '16px 18px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#6a11cb,#2575fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '14px' }}>
                      {rev.username?.charAt(0)?.toUpperCase()}
                    </div>
                    <strong style={{ fontSize: '15px', color: '#1a1a2e' }}>{rev.username}</strong>
                  </div>
                  <span style={{ color: '#f59e0b', fontSize: '16px', letterSpacing: '1px' }}>{'⭐'.repeat(rev.rating)}</span>
                </div>
                <p style={{ margin: '0 0 8px 42px', color: '#4b5563', lineHeight: '1.6', fontSize: '14px' }}>{rev.comment}</p>
                <small style={{ marginLeft: '42px', color: '#9ca3af', fontSize: '12px' }}>{new Date(rev.created_at).toLocaleDateString('th-TH')}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 🟢 หน้าโปรไฟล์ลูกค้า (แก้ไขให้รองรับรูปภาพจาก Cloud)
function ProfilePage({ userId }) {
  const [profile, setProfile] = useState({ username: '', email: '', address: '', phone: '', profile_picture: '', password: '' });
  const [file, setFile] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
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
    
    if (file) {
      formData.append('profile_picture', file);
    }

    // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
    axios.put(`${API_URL}/users/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(() => {
      alert('✅ บันทึกข้อมูลโปรไฟล์เรียบร้อย!');
      window.location.reload(); 
    })
    .catch(() => alert('❌ เกิดข้อผิดพลาดในการบันทึก'));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '560px', margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {/* Header Banner */}
        <div style={{ background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', padding: '30px 20px 60px', textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '22px', fontWeight: '800', letterSpacing: '0.5px' }}>โปรไฟล์ของฉัน</h2>
        </div>

        <div style={{ padding: '0 28px 28px', marginTop: '-44px' }}>
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '90px', height: '90px', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', background: '#eee', border: '4px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {file ? (
                <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : profile.profile_picture ? (
                <img src={profile.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} />
              ) : (
                <span style={{ fontSize: '40px' }}>👤</span>
              )}
            </div>
            <label style={{ display: 'inline-block', marginTop: '10px', background: 'linear-gradient(135deg,#6a11cb,#2575fc)', color: 'white', padding: '7px 18px', borderRadius: '30px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', boxShadow: '0 3px 10px rgba(106,17,203,0.3)' }}>
              📸 เปลี่ยนรูปภาพ
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
            </label>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: '👤 ชื่อผู้ใช้งาน', type: 'text', key: 'username', required: true },
              { label: '📧 อีเมล', type: 'email', key: 'email', required: true },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>{f.label}</label>
                <input type={f.type} required={f.required} value={profile[f.key] || ''} onChange={(e) => setProfile({...profile, [f.key]: e.target.value})}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '15px', boxSizing: 'border-box', outline: 'none', transition: '0.2s' }} />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#e74c3c', marginBottom: '6px' }}>🔐 รหัสผ่านใหม่ <span style={{ fontWeight: '400', color: '#9ca3af' }}>(เว้นว่างถ้าไม่เปลี่ยน)</span></label>
              <input type="password" value={profile.password || ''} onChange={(e) => setProfile({...profile, password: e.target.value})}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #fecaca', fontSize: '15px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

            <div>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>🏠 ที่อยู่จัดส่ง</label>
              <textarea rows="3" value={profile.address || ''} onChange={(e) => setProfile({...profile, address: e.target.value})}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '15px', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>📞 เบอร์โทรศัพท์</label>
              <input type="text" value={profile.phone || ''} onChange={(e) => setProfile({...profile, phone: e.target.value})}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '15px', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" style={{ background: 'linear-gradient(135deg,#6a11cb,#2575fc)', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '16px', marginTop: '6px', boxShadow: '0 6px 20px rgba(106,17,203,0.3)', letterSpacing: '0.5px' }}>
              💾 บันทึกข้อมูล
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const navigate = useNavigate();
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
  const [selectedProduct, setSelectedProduct] = useState(null); // เก็บว่าจะรีวิวสินค้าตัวไหน
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [allReviews, setAllReviews] = useState([]); // เก็บรายการรีวิวทั้งหมด
  const [productReviews, setProductReviews] = useState([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState(''); // ค้นหาเลขที่หรือชื่อ
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด'); // กรองตามสถานะ
  const [dateFilter, setDateFilter] = useState(''); // กรองตามวันที่ (YYYY-MM-DD)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false); // ควบคุมการพับเมนู

  useEffect(() => {
    // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
    axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
    if (isLoggedIn) fetchMyOrders();
    fetchOrders(); 

    const orderInterval = setInterval(() => {
      fetchOrders(); 
    }, 5000);
    return () => clearInterval(orderInterval);
  }, [isLoggedIn, userId]);

  const fetchOrders = () => {
    // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
    axios.get(`${API_URL}/orders`)
      .then(res => {
        setOrders(res.data); 
      })
      .catch(err => console.log("ดึงข้อมูลออเดอร์พลาด:", err));
  };

  const fetchMyOrders = () => {
    if (!userId) return;
    // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
    axios.get(`${API_URL}/my-orders/${userId}`)
      .then(res => setMyOrders(res.data))
      .catch(err => console.log("ดึงประวัติสั่งซื้อพลาด:", err));
  };

// ฟังก์ชันดึงรีวิว (เรียกใช้เมื่อเปิดดูรายละเอียดสินค้า)
const fetchProductReviews = async (productId) => {
    try {
        const res = await axios.get(`${API_URL}/reviews/${productId}`);
        setProductReviews(res.data);
    } catch (err) {
        console.error("Error fetching reviews:", err);
    }
};

  const exportToExcel = () => {
    if (orders.length === 0) {
      alert("ไม่มีข้อมูลออเดอร์สำหรับ Export ครับ");
      return;
    }
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
    if (orders.length === 0) {
      alert("ไม่มีข้อมูลออเดอร์สำหรับ Export ครับ");
      return;
    }
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
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      styles: { font: 'ThaiFont', fontSize: 14 },
      headStyles: { fillColor: [44, 62, 80], font: 'ThaiFont', fontStyle: 'normal' } 
    });
    doc.save("BIG_SHOP_Sales_Report.pdf");
  };
  
  const deleteOrderHistory = (orderId) => {
    if (window.confirm("คุณต้องการลบประวัติการสั่งซื้อนี้ทิ้งใช่หรือไม่?")) {
      // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
      axios.delete(`${API_URL}/orders/${orderId}`)
        .then(() => {
          alert("🗑️ ลบประวัติการสั่งซื้อเรียบร้อยแล้ว");
          fetchMyOrders(); 
          fetchOrders();
        })
        .catch(err => alert("❌ ไม่สามารถลบได้"));
    }
  };

  const cancelOrder = (orderId) => {
    if (window.confirm("คุณต้องการยกเลิกออเดอร์นี้ใช่หรือไม่?")) {
      // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
      axios.delete(`${API_URL}/orders/${orderId}`)
        .then(() => {
          alert("ยกเลิกออเดอร์เรียบร้อยแล้ว");
          fetchMyOrders();
        })
        .catch(err => alert("ไม่สามารถยกเลิกได้"));
    }
  };

const filteredOrders = orders.filter(order => {
    // 1. กรองตาม Search Term (เลขที่ออเดอร์ หรือ ข้อมูลที่อยู่)
    const matchesSearch = order.id.toString().includes(orderSearchTerm) || 
                          (order.address && order.address.toLowerCase().includes(orderSearchTerm.toLowerCase()));
    
    // 2. กรองตามสถานะ
    const matchesStatus = statusFilter === 'ทั้งหมด' || order.status === statusFilter;
    
    // 3. กรองตามวันที่
    const matchesDate = !dateFilter || (order.created_at && order.created_at.startsWith(dateFilter));

    return matchesSearch && matchesStatus && matchesDate;
});

  const generatePDF = async (order) => {
    try {
      // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
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

    // 1. ถ้าเลือกเป็น 'จัดส่งแล้ว' ให้ถามข้อมูลเพิ่ม
    if (newStatus === "จัดส่งแล้ว") {
        transport = prompt("ระบุบริษัทขนส่ง (เช่น Kerry, Flash, ไปรษณีย์ไทย):");
        trackingNum = prompt("ระบุเลขพัสดุ:");

        if (!transport || !trackingNum) {
            alert("❌ ต้องระบุข้อมูลการส่งให้ครบถ้วน!");
            return; // หยุดทำงานถ้ากรอกไม่ครบ
        }
    }

    // 2. ส่งข้อมูลไปที่ Backend (ส่ง status, tracking_number และ shipping_company ไปด้วย)
    axios.put(`${API_URL}/orders/${orderId}`, { 
        status: newStatus,
        tracking_number: trackingNum,
        shipping_company: transport
    })
    .then(() => {
        alert("✅ อัปเดตสถานะเป็น: " + newStatus);
        fetchOrders();
        axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
    })
    .catch(err => alert("อัปเดตพลาด: " + err));
};

  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
    axios.post(`${API_URL}/login`, { username, password })
    .then(res => {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('userId', res.data.id);
      setIsLoggedIn(true);
      setUserRole(res.data.role);
      setUserId(res.data.id);
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
    // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
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
    // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
    axios.post(`${API_URL}/orders`, orderData)
      .then(res => {
        setCurrentOrderId(res.data.orderId);
        setShowPayModal(true);
        fetchMyOrders();
      })
      .catch(() => alert("สั่งซื้อไม่สำเร็จ"));
  };

// 1. วางฟังก์ชันไว้ข้างบน (ก่อน useEffect)
const fetchAdminReviews = async () => {
    try {
        const res = await axios.get('https://shop-system-backend.onrender.com/api/admin/reviews');
        setAllReviews(res.data);
    } catch (err) {
        console.error("ดึงข้อมูลรีวิวไม่สำเร็จ:", err);
    }
};

const deleteReview = async (id) => {
    try {
        await axios.delete(`https://shop-system-backend.onrender.com/api/admin/reviews/${id}`);
        alert("ลบรีวิวเรียบร้อยแล้ว");
        fetchAdminReviews(); // ดึงใหม่ทันที
    } catch (err) {
        alert("ลบไม่สำเร็จ");
    }
};

// 2. ใน useEffect ให้เรียกใช้แบบนี้
useEffect(() => {
    if (adminTab === 'reviews') {
        fetchAdminReviews();
    }
    // ... เงื่อนไขอื่นๆ ของบิ๊ก
}, [adminTab]);

  const handlePayment = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('address', address);
    formData.append('phone', phone);
    formData.append('slip', slipFile);
    // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
    axios.put(`${API_URL}/orders/pay/${currentOrderId}`, formData)
      .then(() => {
        alert("ส่งหลักฐานเรียบร้อย! รอแอดมินตรวจสอบนะครับ");
        setCart([]);
        localStorage.removeItem('cart');
        setShowPayModal(false);
        fetchMyOrders();
        navigate('/my-orders');
      })
      .catch(err => alert("เกิดข้อผิดพลาดในการส่งหลักฐาน"));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

  const deleteProduct = (id) => {
    if (window.confirm("คุณแน่ใจนะว่าจะลบ?")) {
      // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
      axios.delete(`${API_URL}/products/${id}`)
        .then(() => {
          alert("ลบเรียบร้อย!");
          // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
          axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
        });
    }
  };

  const selectToEdit = (product) => { setEditingProduct(product); };

  const [users, setUsers] = useState([]);

// 1. ฟังก์ชันดึงข้อมูล (ใช้ API_URL เพื่อให้รันได้ทุกที่)
const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`); // ใช้ตัวแปรกลางที่เราตั้งไว้
    if (Array.isArray(response.data)) {
      setUsers(response.data);
    }
  } catch (error) {
    console.error('Fetch users error:', error);
  }
};

// 🌟 [ส่วนที่เพิ่มใหม่]: สั่งให้โหลดข้อมูลทันทีที่เปิดหน้าจัดการผู้ใช้
useEffect(() => {
  if (adminTab === 'users') {
    fetchUsers();
  }
}, [adminTab]); // พอบิ๊กกดเปลี่ยน Tab มาที่ users ปุ๊บ มันจะวิ่งไปดึงข้อมูลปั๊บ!

// 2. ฟังก์ชันอัปเดตข้อมูล (เสถียร 100%)
const updateUser = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/special-admin-update/${id}`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    if (response.status === 200) {
      // พอกดอัปเดตสำเร็จ สั่ง fetchUsers อีกรอบเพื่อให้ข้อมูลในตารางเปลี่ยนทันที
      await fetchUsers(); 
      alert("✅ อัปเดตข้อมูลเรียบร้อยครับบิ๊ก");
    }
  } catch (error) {
    console.error("Update Error:", error);
    alert("❌ อัปเดตไม่สำเร็จ: " + error.message);
  }
};

  const addOrUpdateProduct = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', e.target.name.value);
    formData.append('price', e.target.price.value);
    formData.append('stock', e.target.stock.value);
    formData.append('description', e.target.desc.value);
    formData.append('category', e.target.category.value)
    if (file) formData.append('image', file); 

    if (editingProduct) {
      // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
      axios.put(`${API_URL}/products/${editingProduct.id}`, formData)
        .then(() => {
          alert("แก้ไขเรียบร้อย!");
          setEditingProduct(null); setFile(null); e.target.reset(); 
          // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
          axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
        });
    } else {
      // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
      axios.post(`${API_URL}/products`, formData)
        .then(() => {
          alert("เพิ่มสินค้าแล้ว!");
          setFile(null); e.target.reset();
          // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
          axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
        });
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

// เพิ่ม state นี้ใน App component หลัก (ใกล้กับ userId state)
const [profile, setProfile] = useState({ username: '', email: '', profile_picture: '' });

// โหลดข้อมูลเมื่อ login สำเร็จหรือมี userId
useEffect(() => {
  if (userId) {
    axios.get(`${API_URL}/users/${userId}`)
      .then(res => setProfile(res.data))
      .catch(err => console.error(err));
  }
}, [userId]);

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole('user');
    setIsSidebarOpen(false);
    navigate('/login');
  };
  
  return (
  <div style={{ fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif", backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
    {showPayModal && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(10,10,30,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: '16px', boxSizing: 'border-box' }}>
        <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '450px', position: 'relative', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ background: 'linear-gradient(135deg,#6a11cb,#2575fc)', padding: '24px 28px', textAlign: 'center' }}>
            <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '800' }}>💰 แจ้งชำระเงิน</h2>
            <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>ออเดอร์ #{currentOrderId}</p>
          </div>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ background: '#f0fff4', border: '1px dashed #68d391', borderRadius: '10px', padding: '12px 16px', marginBottom: '18px', textAlign: 'center', fontSize: '14px', color: '#276749' }}>
              🏦 โอนเงินมาที่: <strong>ธนาคารกสิกรไทย 000-0-00000-0</strong>
            </div>
          <form onSubmit={handlePayment}>
            <div style={{ marginBottom: '14px' }}><label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>🏠 ที่อยู่จัดส่ง</label><textarea required rows="3" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', boxSizing: 'border-box', fontSize: '14px', resize: 'none' }} placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด..." /></div>
            <div style={{ marginBottom: '14px' }}><label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>📞 เบอร์โทรศัพท์</label><input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', boxSizing: 'border-box', fontSize: '14px' }} placeholder="08x-xxx-xxxx" /></div>
            <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>📸 สลิปโอนเงิน</label><input type="file" accept="image/*" required style={{ width: '100%', padding: '10px 0', fontSize: '13px' }} onChange={(e) => setSlipFile(e.target.files[0])} /></div>
            <div style={{ display: 'flex', gap: '10px' }}><button type="button" onClick={() => setShowPayModal(false)} style={{ flex: 1, padding: '13px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>ยกเลิก</button><button type="submit" style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg,#6a11cb,#2575fc)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '15px', boxShadow: '0 4px 14px rgba(106,17,203,0.35)' }}>✅ ยืนยันชำระเงิน</button></div>
            <button type="button" onClick={() => setShowPayModal(false)} style={{ width: '100%', marginTop: '12px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>ไว้ทำทีหลัง (ไปที่หน้าประวัติสั่งซื้อ)</button>
          </form>
          </div>
        </div>
      </div>
    )}
      
    <nav style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', position: 'sticky', top: 0, zIndex: 900, boxShadow: '0 2px 16px rgba(0,0,0,0.25)', height: '62px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '26px', cursor: 'pointer', padding: 0, lineHeight: 1 }}>☰</button><h2 style={{ margin: 0, letterSpacing: '1.5px', fontWeight: '900', fontSize: '20px', background: 'linear-gradient(90deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🛒 IBIG SHOP</h2></div>
      <div>{isLoggedIn ? <button onClick={logout} style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>ออกจากระบบ</button> : <div style={{ display: 'flex', gap: '8px' }}><button onClick={() => navigate('/login')} style={{ background: 'linear-gradient(135deg,#6a11cb,#2575fc)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>เข้าสู่ระบบ</button></div>}</div>
    </nav>

    {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(10,10,30,0.6)', zIndex: 998, backdropFilter: 'blur(4px)' }} />}
    
    <div style={{ position: 'fixed', top: 0, left: isSidebarOpen ? 0 : '-300px', width: '268px', height: '100vh', background: '#ffffff', boxShadow: '6px 0 30px rgba(0,0,0,0.12)', transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)', zIndex: 999, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
  <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg,#1a1a2e,#16213e)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ margin: 0, fontWeight: '800', letterSpacing: '1px', fontSize: '16px' }}>เมนูหลัก</h3><button onClick={() => setIsSidebarOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', borderRadius: '6px', width: '30px', height: '30px' }}>✖</button></div>
     {/* 🟢 Profile Section ใน Sidebar */}
<div style={{ 
  padding: '16px 18px', 
  borderBottom: '1px solid #f1f5f9', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px',
  background: '#f8faff'
}}>
  <div style={{ 
    width: '46px', height: '46px', borderRadius: '50%', 
    overflow: 'hidden', background: 'linear-gradient(135deg,#6a11cb,#2575fc)', 
    flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(106,17,203,0.25)'
  }}>
    {profile.profile_picture ? (
      <img 
        src={profile.profile_picture} 
        alt="avatar"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => { e.target.src = ''; e.target.style.display = 'none'; }}
      />
    ) : (
      <span style={{ fontSize: '20px' }}>👤</span>
    )}
  </div>
  <div>
    <div style={{ fontWeight: '800', color: '#1a1a2e', fontSize: '14px' }}>
      {profile.username || 'ผู้ใช้งาน'}
    </div>
    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
      {profile.email || ''}
    </div>
  </div>
</div>
  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
   {/* 👤 ส่วนโปรไฟล์ (โชว์เฉพาะ User) */}
{isLoggedIn && userRole !== 'admin' && (
  <Link to="/profile" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#374151', fontSize: '15px', fontWeight: '700', padding: '11px 14px', background: '#f8faff', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e8f0fe' }}>
    👤 โปรไฟล์ของฉัน
  </Link>
)}

{/* 🏠 หน้าแรก */}
<Link to="/" onClick={() => { setIsSidebarOpen(false); setSelectedCategory('ทั้งหมด'); }} style={{ textDecoration: 'none', color: '#374151', fontSize: '15px', fontWeight: '700', padding: '11px 14px', background: '#f8faff', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e8f0fe' }}>
  🏠 หน้าแรก
</Link>

{/* 📦 หมวดหมู่สินค้า (แบบพับได้) */}
<div style={{ marginBottom: '0' }}>
  <div 
    onClick={() => setIsCategoryOpen(!isCategoryOpen)} 
    style={{ cursor: 'pointer', color: '#374151', fontSize: '15px', fontWeight: '700', padding: '11px 14px', background: '#f8faff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e8f0fe' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>📦 หมวดหมู่สินค้า</div>
    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{isCategoryOpen ? '▲' : '▼'}</span>
  </div>

  {/* ส่วนที่พับ/กาง ออกมา */}
  {isCategoryOpen && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', paddingLeft: '12px' }}>
      {['ทั้งหมด', ...new Set(products.map(p => p.category).filter(cat => cat))].map(cat => (
        <div 
          key={cat} 
          onClick={() => {
            setSelectedCategory(cat);
            setIsSidebarOpen(false); // ปิด Sidebar เมื่อเลือกหมวดหมู่
            navigate('/'); // กลับหน้าแรกเพื่อดูสินค้าที่กรอง
          }}
          style={{ 
            padding: '9px 14px', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontSize: '14px', 
            color: selectedCategory === cat ? '#6a11cb' : '#555',
            background: selectedCategory === cat ? '#eef2ff' : 'transparent',
            fontWeight: selectedCategory === cat ? '800' : 'normal',
            transition: '0.2s',
            borderLeft: selectedCategory === cat ? '3px solid #6a11cb' : '3px solid transparent'
          }}
        >
          • {cat}
        </div>
      ))}
    </div>
  )}
</div>

{/* 🛒 เมนูอื่นๆ สำหรับ User */}
{userRole !== 'admin' && (
  <>
    <Link to="/cart" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#374151', fontSize: '15px', fontWeight: '700', padding: '11px 14px', background: '#f8faff', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e8f0fe' }}>
      🛒 ตะกร้าสินค้า 
      {cart.length > 0 && <span style={{ background: 'linear-gradient(135deg,#e74c3c,#c0392b)', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '12px', marginLeft: 'auto' }}>
        {cart.length}
      </span>}
    </Link>
    
    {isLoggedIn && (
      <Link to="/my-orders" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#374151', fontSize: '15px', fontWeight: '700', padding: '11px 14px', background: '#f8faff', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e8f0fe' }}>
        🧾 ประวัติการสั่งซื้อ
      </Link>
    )}
  </>
)}
    {isLoggedIn && userRole === 'admin' && (
      <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: '12px', padding: '14px 12px', marginTop: '8px', border: '1px solid #bbf7d0' }}>
        <div style={{ color: '#166534', fontSize: '13px', fontWeight: '800', marginBottom: '8px', paddingLeft: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>⚙️ ระบบหลังบ้าน</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { tab: 'report', icon: '📊', label: 'รายงานสถิติ' },
            { tab: 'add', icon: '➕', label: 'เพิ่มสินค้าใหม่' },
            { tab: 'stock', icon: '📦', label: 'จัดการสต็อก' },
            { tab: 'orders', icon: '🧾', label: 'รายการสั่งซื้อ' },
            { tab: 'users', icon: '👥', label: 'จัดการผู้ใช้' },
            { tab: 'reviews', icon: '📝', label: 'จัดการรีวิว' },
          ].map(({ tab, icon, label }) => (
            <button key={tab} onClick={() => { setAdminTab(tab); navigate('/admin'); setIsSidebarOpen(false); }} style={{ textAlign: 'left', background: adminTab === tab ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'transparent', color: adminTab === tab ? 'white' : '#166534', border: 'none', padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: adminTab === tab ? '0 2px 8px rgba(22,163,74,0.3)' : 'none' }}>{icon} {label}</button>
          ))}
        </div>
      </div>
    )}
  </div>
</div>

{showReviewModal && (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(10,10,30,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: '16px', boxSizing: 'border-box' }}>
    <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
      <div style={{ background: 'linear-gradient(135deg,#6a11cb,#2575fc)', padding: '22px 28px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '800' }}>⭐ รีวิวสินค้า</h2>
      </div>
      <div style={{ padding: '24px 28px' }}>
      <p style={{ marginBottom: '8px', fontWeight: '700', color: '#374151', fontSize: '14px' }}>คะแนนความพึงพอใจ: 
        <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ marginLeft: '10px', padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', cursor: 'pointer' }}>
          <option value="5">⭐⭐⭐⭐⭐ ดีมาก</option>
          <option value="4">⭐⭐⭐⭐ ดี</option>
          <option value="3">⭐⭐⭐ ปานกลาง</option>
          <option value="2">⭐⭐ พอใช้</option>
          <option value="1">⭐ ควรปรับปรุง</option>
        </select>
      </p>

      <textarea 
        placeholder="เขียนรีวิวของคุณที่นี่..."
        style={{ width: '100%', height: '110px', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', boxSizing: 'border-box', fontSize: '14px', resize: 'none', marginTop: '12px' }}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setShowReviewModal(false)} 
          style={{ flex: 1, background: '#f3f4f6', color: '#374151', padding: '12px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}
        >
          ยกเลิก
        </button>
        <button 
          onClick={async () => {
            try {
              if (!selectedProduct) return alert("ไม่พบรหัสสินค้า");

              await axios.post(`https://shop-system-backend.onrender.com/api/reviews`, {
                product_id: selectedProduct,
                user_id: userId, // 👈 บิ๊กตรวจสอบชื่อตัวแปรนี้ด้วยว่าในไฟล์นี้ชื่อ userId หรือ user.id
                rating: rating,
                comment: comment
              });

              alert("✅ ขอบคุณสำหรับรีวิวครับ!");
              setShowReviewModal(false);
              setComment(""); // ล้างข้อมูลหลังจากส่งเสร็จ
              setRating(5);
            } catch (err) {
              console.error(err);
              alert("❌ รีวิวไม่สำเร็จ กรุณาลองใหม่");
            }
          }}
          style={{ flex: 2, background: 'linear-gradient(135deg,#6a11cb,#2575fc)', color: 'white', padding: '12px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '15px', boxShadow: '0 4px 14px rgba(106,17,203,0.35)' }}
        >
          ✅ ส่งรีวิว
        </button>
      </div>
      </div>
    </div>
  </div>
)}

    <Routes>
      <Route path="/" element={
        <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
          {/* Hero Banner */}
          <div style={{ textAlign: 'center', padding: '50px 20px 60px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(106,17,203,0.3) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(37,117,252,0.3) 0%, transparent 50%)' }} />
            <div style={{ position: 'relative' }}>
              <h1 style={{ fontSize: 'clamp(2rem,6vw,3.5rem)', margin: 0, fontWeight: '900', letterSpacing: '-1px', background: 'linear-gradient(90deg,#a78bfa,#60a5fa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🛍️ IBIG SHOP</h1>
              <p style={{ fontSize: 'clamp(0.95rem,2.5vw,1.2rem)', opacity: 0.8, marginTop: '10px', marginBottom: '28px' }}>"ช้อปใหญ่ จ่ายน้อย สอยทุกความคุ้ม!"</p>
              <div><input type="text" placeholder="🔍 ค้นหาสินค้าที่ใช่สำหรับคุณ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '14px 24px', width: '90%', maxWidth: '560px', borderRadius: '50px', border: 'none', fontSize: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', background: 'rgba(255,255,255,0.95)', boxSizing: 'border-box' }} /></div>
            </div>
          </div>
          
          {/* Product Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '18px', marginTop: '24px', padding: '0 16px 32px' }}>
            {filteredProducts.map(item => (
              <div key={item.id} style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', textAlign: 'center', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.13)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
              >
                {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '175px', objectFit: 'cover' }} /> : <div style={{ fontSize: '60px', padding: '30px 20px', background: 'linear-gradient(135deg,#f5f7fa,#c3cfe2)' }}>📦</div>}
                <div style={{ padding: '14px 14px 16px' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: '800', color: '#1a1a2e', lineHeight: '1.3' }}>{item.name}</h3>
                  <p style={{ fontSize: '18px', fontWeight: '900', color: '#e74c3c', margin: '0 0 6px', letterSpacing: '-0.5px' }}>฿{Number(item.price).toLocaleString()}</p>
                  <p style={{ color: item.stock > 0 ? '#059669' : '#dc2626', fontWeight: '700', margin: '0 0 12px', fontSize: '12px' }}>{item.stock > 0 ? `คงเหลือ ${item.stock} ชิ้น` : 'สินค้าหมด'}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => navigate(`/product/${item.id}`)} style={{ flex: 1, padding: '9px 4px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>🔍 ดูรายละเอียด</button>
                    <button onClick={() => addToCart(item)} disabled={item.stock <= 0} style={{ flex: 1, background: item.stock > 0 ? 'linear-gradient(135deg,#6a11cb,#2575fc)' : '#d1d5db', color: 'white', border: 'none', padding: '9px 4px', borderRadius: '8px', cursor: item.stock > 0 ? 'pointer' : 'not-allowed', fontWeight: '700', fontSize: '12px' }}>{item.stock > 0 ? '🛒 ใส่ตะกร้า' : 'หมด'}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <footer style={{ marginTop: '10px', padding: '36px 20px', background: 'linear-gradient(135deg,#1a1a2e,#16213e)', color: 'white', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 8px', background: 'linear-gradient(90deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🛍️ IBIG SHOP</p>
            <p style={{ opacity: 0.6, margin: '0 0 12px', fontSize: '13px' }}>ติดต่อเรา: 093-112-1917 | Line: @phuwadet5617</p>
            <hr style={{ width: '40px', margin: '0 auto 12px', borderColor: '#444', border: 'none', borderTop: '1px solid #444' }} />
            <p style={{ fontSize: '12px', opacity: 0.4, margin: 0 }}>© 2026 IBIG SHOP. All rights reserved.</p>
          </footer>
        </div>
      } />

      <Route path="/profile" element={ isLoggedIn ? <ProfilePage userId={userId} /> : <Navigate to="/login" /> } />
      
      <Route path="/product/:id" element={
  <ProductDetailPage 
    products={products} 
    addToCart={addToCart} 
    productReviews={productReviews} 
    fetchProductReviews={fetchProductReviews} 
  />
} />

      <Route path="/cart" element={
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
          <h2>🛒 ตะกร้าสินค้า {cart.length > 0 && <button onClick={clearCart} style={{ background: '#ff7675', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', float: 'right' }}>🗑️ ยกเลิกรายการทั้งหมด</button>}</h2>
          <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            {cart.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>ตะกร้าว่างเปล่า</div> : (
              <div>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #eee', padding: '15px 0' }}>
                    {/* 🟢 [แก้ไข]: เปลี่ยนรูปสินค้าในตะกร้าเป็น Cloud URL (item.image) */}
                    <img src={item.image} alt={item.name} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ flex: 1 }}><h4 style={{ margin: '0' }}>{item.name}</h4><p style={{ margin: 0, color: '#e74c3c', fontWeight: 'bold' }}>฿{item.price}</p></div>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '5px' }}><button onClick={() => updateQuantity(item.id, -1)} style={{ background: '#f8f9fa', border: 'none', padding: '8px 12px' }}>-</button><span style={{ padding: '0 15px' }}>{item.qty}</span><button onClick={() => updateQuantity(item.id, 1)} style={{ background: '#f8f9fa', border: 'none', padding: '8px 12px' }}>+</button></div>
                    <div style={{ width: '80px', textAlign: 'right', fontWeight: 'bold' }}>฿{(item.price * item.qty).toLocaleString()}</div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ff7675', fontSize: '18px' }}>✖</button>
                  </div>
                ))}
                <div style={{ marginTop: '30px', textAlign: 'right' }}><h2>รวม: <span style={{ color: '#e74c3c' }}>฿{calculateTotal().toLocaleString()}</span></h2><button onClick={() => { if (isLoggedIn) { 
                  // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
                  axios.get(`${API_URL}/users/${userId}`).then(res => { setAddress(res.data.address || ''); setPhone(res.data.phone || ''); checkout(); }); } else { navigate('/login'); } }} style={{ padding: '15px 40px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', fontWeight: 'bold' }}>{isLoggedIn ? "✅ ยืนยันการสั่งซื้อ" : "🔑 ล็อกอินเพื่อสั่งซื้อ"}</button></div>
              </div>
            )}
          </div>
        </div>
      } />

      <Route path="/my-orders" element={
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', fontSize: '22px', fontWeight: '900', color: '#1a1a2e', margin: '0 0 20px' }}>🧾 ประวัติการสั่งซื้อของฉัน</h1>
          {myOrders.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '50px 20px', textAlign: 'center', color: '#9ca3af', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
              <p style={{ margin: 0, fontSize: '16px' }}>ยังไม่มีรายการสั่งซื้อ</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myOrders.map(order => {
                const statusColor = {
                  'จัดส่งแล้ว': { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
                  'กำลังจัดส่ง': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
                  'ชำระเงินแล้ว': { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
                  'รอดำเนินการ': { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
                  'ยกเลิก': { bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
                }[order.status] || { bg: '#f9fafb', text: '#374151', border: '#e5e7eb' };
                return (
                  <div key={order.id} style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                    {/* Order Header */}
                    <div style={{ padding: '14px 18px', background: '#f8faff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '900', fontSize: '16px', color: '#1a1a2e' }}>ออเดอร์ #{order.id}</span>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: statusColor.bg, color: statusColor.text, border: `1px solid ${statusColor.border}` }}>{order.status}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(order.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                    </div>
                    {/* Order Body */}
                    <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: '#e74c3c' }}>฿{Number(order.total_price).toLocaleString()}</div>
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {order.status === 'รอดำเนินการ' && 
                          <button onClick={() => cancelOrder(order.id)} style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>ยกเลิก</button>}
                        
                        <button onClick={() => { setCurrentOrderId(order.id); setShowPayModal(true); }} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>💳 จ่ายเงิน</button>
                        <button onClick={() => generatePDF(order)} style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>🖨️ ใบเสร็จ</button>
                        
                        {order.tracking_number && (
                          <button 
                            onClick={() => {
                              let url = "";
                              const track = order.tracking_number;
                              const company = order.shipping_company.toLowerCase();
                              if (company.includes("kerry")) { url = `https://th.kerryexpress.com/th/track/?track=${track}`; }
                              else if (company.includes("flash")) { url = `https://www.flashexpress.co.th/tracking/?se=${track}`; }
                              else if (company.includes("thai") || company.includes("ไปรษณีย์")) { url = `https://track.thailandpost.co.th/?trackNumber=${track}`; }
                              else { url = `https://www.google.com/search?q=เช็คพัสดุ+${track}`; }
                              window.open(url, '_blank');
                            }}
                            style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}
                          >🚚 ตามพัสดุ</button>
                        )}
                        {order.status === 'จัดส่งแล้ว' && (
                          <button 
                            onClick={() => { 
                              console.log("product_id ที่ได้:", order.product_id, "order:", order);
                              setSelectedProduct(order.product_id); 
                              setShowReviewModal(true); 
                            }} 
                            style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}
                          >⭐ รีวิว</button>
                        )}
                        <button onClick={() => deleteOrderHistory(order.id)} style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      } />

      <Route path="/login" element={isLoggedIn ? (userRole === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />) : (
        <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', background: 'linear-gradient(135deg,#f1f5f9,#e8f0fe)' }}>
          <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 16px 48px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', padding: '28px 20px', textAlign: 'center' }}>
              <h2 style={{ margin: 0, color: 'white', fontWeight: '900', fontSize: '22px', background: 'linear-gradient(90deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🔐 เข้าสู่ระบบ</h2>
            </div>
            <div style={{ padding: '28px' }}>
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '14px' }}><label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>ชื่อผู้ใช้งาน</label><input name="username" type="text" placeholder="Username" required style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '15px', boxSizing: 'border-box' }} /></div>
                <div style={{ marginBottom: '22px' }}><label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>รหัสผ่าน</label><input name="password" type="password" placeholder="Password" required style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '15px', boxSizing: 'border-box' }} /></div>
                <button type="submit" style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#6a11cb,#2575fc)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(106,17,203,0.35)' }}>เข้าสู่ระบบ</button>
              </form>
              <p style={{ marginTop: '18px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>ยังไม่มีบัญชี? <Link to="/register" style={{ color: '#6a11cb', fontWeight: '700' }}>สมัครสมาชิกฟรี</Link></p>
            </div>
          </div>
        </div>
      )} />

      <Route path="/register" element={<div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', background: 'linear-gradient(135deg,#f1f5f9,#e8f0fe)' }}><div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 16px 48px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px', overflow: 'hidden' }}><div style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', padding: '28px 20px', textAlign: 'center' }}><h2 style={{ margin: 0, color: 'white', fontWeight: '900', fontSize: '22px' }}>📝 สมัครสมาชิก</h2></div><div style={{ padding: '28px' }}><form onSubmit={handleRegister}><div style={{ marginBottom: '14px' }}><label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>ชื่อผู้ใช้งาน</label><input name="username" placeholder="Username" required style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '15px', boxSizing: 'border-box' }} /></div><div style={{ marginBottom: '14px' }}><label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>รหัสผ่าน</label><input name="password" type="password" placeholder="Password" required style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '15px', boxSizing: 'border-box' }} /></div><div style={{ marginBottom: '22px' }}><label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>ยืนยันรหัสผ่าน</label><input name="confirmPassword" type="password" placeholder="Confirm Password" required style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '15px', boxSizing: 'border-box' }} /></div><button type="submit" style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#16a34a,#059669)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(22,163,74,0.35)' }}>สมัครสมาชิก</button></form><p style={{ marginTop: '18px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>มีบัญชีอยู่แล้ว? <Link to="/login" style={{ color: '#16a34a', fontWeight: '700' }}>เข้าสู่ระบบที่นี่</Link></p></div></div></div>} />

      <Route path="/admin" element={isLoggedIn && userRole === 'admin' ? (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#1a1a2e' }}>⚙️ ระบบจัดการหลังบ้าน</h1>
            <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '14px' }}>Admin Dashboard · IBIG SHOP</p>
          </div>
          {adminTab === 'report' && (
            <div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}><h3 style={{ marginTop: 0, fontWeight: '800', color: '#1a1a2e', fontSize: '16px' }}>📈 สถิติยอดขาย</h3><div style={{ width: '100%', height: 280 }}><ResponsiveContainer><BarChart data={Object.values(orders.reduce((acc, order) => { if (order.status !== 'ยกเลิก' && order.status !== 'รอดำเนินการ') { const date = new Date(order.created_at).toLocaleDateString('th-TH'); if (!acc[date]) acc[date] = { name: date, ยอดขาย: 0 }; acc[date].ยอดขาย += Number(order.total_price); } return acc; }, {}))}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="ยอดขาย" fill="url(#colorGrad)" radius={[6,6,0,0]} /><defs><linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6a11cb" /><stop offset="100%" stopColor="#2575fc" /></linearGradient></defs></BarChart></ResponsiveContainer></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
                {[
                  { label: '💰 ยอดขาย', value: `฿${totalSales.toLocaleString()}`, grad: 'linear-gradient(135deg,#6a11cb,#2575fc)' },
                  { label: '⏳ รอตรวจสอบ', value: pendingOrders, grad: 'linear-gradient(135deg,#f59e0b,#d97706)' },
                  { label: '✅ ส่งแล้ว', value: completedOrders, grad: 'linear-gradient(135deg,#10b981,#059669)' },
                  { label: '👤 ลูกค้า', value: totalUsers, grad: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
                ].map(c => (
                  <div key={c.label} style={{ background: c.grad, color: 'white', padding: '20px', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', opacity: 0.85 }}>{c.label}</p>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>{c.value}</h2>
                  </div>
                ))}
              </div>
            </div>
          )}
          {adminTab === 'add' && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '10px' }}>
              <h3>➕ {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h3>
              <form onSubmit={addOrUpdateProduct} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}><input name="name" placeholder="ชื่อ" defaultValue={editingProduct?.name || ''} required style={{ padding: '8px' }} /><input name="category" placeholder="หมวดหมู่" defaultValue={editingProduct?.category || ''} required style={{ padding: '8px' }} /><input name="stock" type="number" placeholder="สต็อก" defaultValue={editingProduct?.stock || 0} required style={{ padding: '8px' }} /><input name="price" type="number" placeholder="ราคา" defaultValue={editingProduct?.price || ''} required style={{ padding: '8px' }} /><input name="image" type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*" style={{ padding: '8px' }} /><input name="desc" placeholder="รายละเอียด" defaultValue={editingProduct?.description || ''} style={{ flex: 1, padding: '8px' }} /><button type="submit" style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '8px 20px' }}>บันทึก</button></form>
            </div>
          )}
          {adminTab === 'stock' && (
            <div>
              <h3>📦 จัดการสต็อก</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                <thead><tr style={{ background: '#34495e', color: 'white' }}><th style={{ padding: '12px' }}>สินค้า</th><th>ราคา</th><th>จัดการ</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={{ textAlign: 'center', borderBottom: '1px solid #eee' }}>
                      {/* 🟢 [แก้ไข]: เปลี่ยนรูปจิ๋วในหน้าแอดมินให้ดึงจาก Cloud URL (p.image) */}
                      <td style={{ padding: '10px' }}>{p.image && <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} />}{p.name}</td>
                      <td>฿{p.price}</td>
                      <td><button onClick={() => { selectToEdit(p); setAdminTab('add'); }} style={{ background: '#f1c40f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>แก้ไข</button><button onClick={() => deleteProduct(p.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginLeft: '5px' }}>ลบ</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {adminTab === 'orders' && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
      <h3>🧾 รายการสั่งซื้อ</h3>
      <div>
        <button onClick={exportToExcel} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px' }}>📊 Excel</button>
        <button onClick={exportToPDF} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px', marginLeft: '5px' }}>📄 PDF</button>
      </div>
    </div>
    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
    
    {/* 🔍 ค้นหาเลขที่ออเดอร์ */}
    <div style={{ flex: 1, minWidth: '200px' }}>
        <input 
            type="text" 
            placeholder="🔍 ค้นหาเลขที่ออเดอร์หรือที่อยู่..." 
            value={orderSearchTerm}
            onChange={(e) => setOrderSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
        />
    </div>

    {/* 📋 กรองตามสถานะ */}
    <select 
        value={statusFilter} 
        onChange={(e) => setStatusFilter(e.target.value)}
        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', cursor: 'pointer' }}
    >
        <option value="ทั้งหมด">ทุกสถานะ</option>
        <option value="รอดำเนินการ">รอดำเนินการ</option>
        <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
        <option value="ยกเลิก">ยกเลิก</option>
    </select>

    {/* 📅 กรองตามวันที่ */}
    <input 
        type="date" 
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', cursor: 'pointer' }}
    />

    {/* 🧹 ปุ่มล้างการกรอง */}
    <button 
        onClick={() => { setOrderSearchTerm(''); setStatusFilter('ทั้งหมด'); setDateFilter(''); }}
        style={{ padding: '10px 15px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer' }}
    >
        ล้างค่า
    </button>
</div>
    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
      <thead>
        <tr style={{ background: '#2c3e50', color: 'white' }}>
          <th style={{ padding: '12px' }}>ออเดอร์</th>
          {/* 🟢 [เพิ่ม]: หัวข้อคอลัมน์ใหม่ */}
          <th>ที่อยู่จัดส่ง</th>
          <th>ราคารวม</th>
          <th>หลักฐาน</th>
          <th>สถานะ</th>
          <th>พิมพ์</th>
        </tr>
      </thead>
      <tbody>
        {filteredOrders.map((order) => (
          <tr key={order.id} style={{ textAlign: 'center', borderBottom: '1px solid #eee' }}>
            <td style={{ textAlign: 'center', padding: '15px' }}>
    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#2c3e50' }}>
        #{order.id}
    </div>
    {/* 📅 แสดงวันที่และเวลาสั่งซื้อ */}
    <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
        {order.created_at ? new Date(order.created_at).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'ไม่ระบุวันที่'}
    </div>
</td>
            
            {/* 🟢 [เพิ่ม]: คอลัมน์แสดงที่อยู่และเบอร์โทรแยกออกมา */}
            <td style={{ padding: '10px', fontSize: '13px', textAlign: 'left', maxWidth: '250px' }}>
              <div style={{ color: '#2c3e50', fontWeight: '500' }}>📍 {order.address}</div>
              <div style={{ color: '#7f8c8d', fontSize: '12px' }}>📞 {order.phone}</div>
            </td>

            <td>฿{order.total_price}</td>
            <td>
              {order.slip_image ? <button onClick={() => window.open(order.slip_image, '_blank')} style={{ background: '#9b59b6', color: 'white', border: 'none', padding: '5px' }}>🖼️ ดูสลิป</button> : <span style={{ color: '#999' }}>ยังไม่ส่ง</span>}
            </td>
            <td>
              <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} style={{ padding: '5px', borderRadius: '15px', background: order.status === 'จัดส่งแล้ว' ? '#55efc4' : '#ffeaa7' }}>
                <option value="รอดำเนินการ">รอดำเนินการ</option>
                <option value="ชำระเงินแล้ว">ชำระเงินแล้ว</option>
                <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                <option value="ยกเลิก">ยกเลิก</option>
              </select>
            </td>
            <td><button onClick={() => generatePDF(order)} style={{ background: '#34495e', color: 'white', border: 'none', padding: '5px' }}>🖨️ บิล</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

{adminTab === 'users' && (
  <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        👥 จัดการผู้ใช้ <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#7f8c8d' }}>({users.length} บัญชี)</span>
      </h3>
    </div>
    
    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <thead>
        <tr style={{ background: '#2c3e50', color: 'white', textAlign: 'center' }}>
          <th style={{ padding: '15px' }}>ID</th>
          <th style={{ textAlign: 'left' }}>ข้อมูลผู้ใช้งาน</th>
          <th>ระดับสิทธิ์</th>
          <th>สถานะ</th>
          <th>การจัดการ</th>
        </tr>
      </thead>
      <tbody>
        {users && users.length > 0 ? (
          users.map((user, index) => (
            <tr 
              key={user.id || index} 
              style={{ 
                textAlign: 'center', 
                borderBottom: '1px solid #f1f2f6',
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                transition: '0.2s'
              }}
            >
              <td style={{ padding: '12px', color: '#7f8c8d' }}>{user.id}</td>
              <td style={{ textAlign: 'left', padding: '12px' }}>
                {/* 🟢 [แก้ไข]: ป้องกันชื่อหายโดยใช้ค่าสำรองถ้า username เป็น null */}
                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {user.username || "กำลังโหลด..."} 
                </div>
                <div style={{ fontSize: '12px', color: '#95a5a6' }}>
                  {user.email || "---"}
                </div>
              </td>
              <td>
                <select 
                  value={user.role || 'customer'} 
                  onChange={(e) => {
                    const newRole = e.target.value;
                    // ส่งข้อมูลไปอัปเดต โดยยังคงรักษาข้อมูลเดิมในบรรทัดนั้นไว้
                    updateUser(user.id, { role: newRole, status: user.status });
                  }}
                  style={{ 
                    padding: '6px 10px', 
                    borderRadius: '6px', 
                    border: '1px solid #dcdde1',
                    backgroundColor: user.role === 'admin' ? '#fff4e6' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="customer">👤 Customer</option>
                  <option value="admin">🔑 Admin</option>
                </select>
              </td>
              <td>
                <span style={{ 
                  padding: '5px 12px', 
                  borderRadius: '20px', 
                  fontSize: '11px',
                  fontWeight: 'bold',
                  background: user.status === 'suspended' ? '#ffeaa7' : '#d1fae5',
                  color: user.status === 'suspended' ? '#d63031' : '#10b981',
                  border: `1px solid ${user.status === 'suspended' ? '#fab1a0' : '#a7f3d0'}`
                }}>
                  {user.status === 'suspended' ? 'ถูกระงับ' : 'ใช้งานปกติ'}
                </span>
              </td>
              <td>
                <button 
                  onClick={() => {
                    const newStatus = user.status === 'active' ? 'suspended' : 'active';
                    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะ ${newStatus === 'suspended' ? 'ระงับ' : 'ปลดระงับ'} บัญชี ${user.username || ''}?`)) {
                      updateUser(user.id, { role: user.role, status: newStatus });
                    }
                  }}
                  style={{ 
                    background: user.status === 'active' ? '#ff7675' : '#55efc4',
                    color: 'white', 
                    border: 'none', 
                    padding: '7px 14px', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {user.status === 'active' ? '🚫 ระงับ' : '✅ ปลดระงับ'}
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr><td colSpan="5" style={{ padding: '20px', color: '#999' }}>ไม่พบข้อมูลผู้ใช้งาน</td></tr>
        )}
      </tbody>
    </table>
  </div>
)}
{adminTab === 'reviews' && (
  <div style={{ padding: '20px', background: 'white', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>📝 จัดการรีวิวจากลูกค้า</h2>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#2c3e50', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>สินค้า</th>
            <th style={{ padding: '12px' }}>ลูกค้า</th>
            <th style={{ padding: '12px' }}>คะแนน</th>
            <th style={{ padding: '12px' }}>ความคิดเห็น</th>
            <th style={{ padding: '12px' }}>วันที่</th>
            <th style={{ padding: '12px' }}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {/* สมมติว่าบิ๊กตั้งชื่อ state ที่เก็บรีวิวว่า allReviews */}
          {allReviews.length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>ยังไม่มีรีวิวในขณะนี้</td></tr>
          ) : (
            allReviews.map((review) => (
              <tr key={review.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{review.product_name}</td>
                <td style={{ padding: '12px' }}>{review.username}</td>
                <td style={{ padding: '12px', color: '#f1c40f' }}>
                  {'⭐'.repeat(review.rating)}
                </td>
                <td style={{ padding: '12px' }}>{review.comment}</td>
                <td style={{ padding: '12px' }}>{new Date(review.created_at).toLocaleDateString('th-TH')}</td>
                <td style={{ padding: '12px' }}>
                  <button 
                    onClick={() => {
                      if(window.confirm('คุณแน่ใจหรือไม่ที่จะลบริวิวกนี้?')) {
                        deleteReview(review.id);
                      }
                    }}
                    style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                  >
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