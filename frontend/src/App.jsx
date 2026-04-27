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
    <div style={{ padding: '24px 16px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', background: 'white', padding: '28px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
        {/* 🖼️ ฝั่งซ้าย: รูปสินค้า */}
        <div style={{ flex: '1 1 340px' }}>
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              style={{
                width: '100%', 
                height: '380px', 
                objectFit: 'cover',
                borderRadius: '14px'
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
              }}
            />
          ) : (
            <div style={{
              width: '100%', 
              height: '380px', 
              background: 'linear-gradient(135deg,#f0f4ff,#e0e7ff)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '64px'
            }}>
              📦
            </div>
          )}
        </div>
        
        {/* 📝 ฝั่งขวา: รายละเอียด */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ background: '#eff6ff', color: '#2563eb', padding: '5px 12px', borderRadius: '20px', alignSelf: 'flex-start', fontSize: '12px', fontWeight: '700', border: '1px solid #bfdbfe' }}>
            🏷️ {product.category || 'ไม่ระบุหมวดหมู่'}
          </span>
          <h1 style={{ fontSize: '28px', margin: '14px 0 8px', color: '#1e293b', fontFamily: "'Prompt', sans-serif", lineHeight: 1.3 }}>{product.name}</h1>
          <h2 style={{ color: '#dc2626', fontSize: '34px', margin: '0 0 18px 0', fontFamily: "'Prompt', sans-serif", fontWeight: '800' }}>฿{product.price}</h2>
          
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', marginBottom: '18px', border: '1px solid #f1f5f9' }}>
            <p style={{ margin: 0, lineHeight: '1.7', color: '#64748b', fontSize: '14px' }}>
              <strong style={{ color: '#374151' }}>รายละเอียด:</strong><br />
              {product.description || 'ไม่มีรายละเอียดสินค้า'}
            </p>
          </div>

          <p style={{ color: product.stock > 0 ? '#059669' : '#dc2626', fontWeight: '700', fontSize: '15px' }}>
            📦 {product.stock > 0 ? `มีสินค้าพร้อมส่ง (${product.stock} ชิ้น)` : 'สินค้าหมดชั่วคราว'}
          </p>

          <button 
            onClick={() => addToCart(product)} 
            disabled={product.stock <= 0} 
            style={{ 
              marginTop: '14px', padding: '14px', fontSize: '16px', fontWeight: '700', border: 'none', borderRadius: '12px', cursor: 'pointer',
              background: product.stock > 0 ? 'linear-gradient(135deg,#10b981,#059669)' : '#cbd5e1', color: 'white', 
              boxShadow: product.stock > 0 ? '0 6px 20px rgba(16,185,129,0.35)' : 'none',
              transition: 'transform 0.2s'
            }}
          >
            {product.stock > 0 ? '🛒 หยิบใส่ตะกร้า' : '❌ สินค้าหมด'}
          </button>
        </div>
      </div>

      {/* ⭐ [ส่วนที่เพิ่มใหม่]: วางต่อจาก Card รายละเอียดสินค้า */}
      <div style={{ marginTop: '24px', background: 'white', padding: '28px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '14px', marginBottom: '20px', color: '#1e293b', fontFamily: "'Prompt', sans-serif", fontSize: '16px' }}>
            💬 รีวิวจากลูกค้า ({productReviews.length})
          </h3>
          
          {productReviews.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>ยังไม่มีรีวิวสำหรับสินค้านี้</p>
          ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {productReviews.map((rev) => (
                      <div key={rev.id} style={{ borderBottom: '1px solid #f8fafc', paddingBottom: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '15px', color: '#1e293b' }}>👤 {rev.username}</strong>
                              <span style={{ color: '#f59e0b', fontSize: '16px' }}>
                                  {'⭐'.repeat(rev.rating)}
                              </span>
                          </div>
                          <p style={{ margin: '8px 0', color: '#475569', lineHeight: '1.6', fontSize: '14px' }}>{rev.comment}</p>
                          <small style={{ color: '#cbd5e1', fontSize: '12px' }}>
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
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#2c3e50' }}>👤 โปรไฟล์ของฉัน</h2>
        
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <div style={{ width: '120px', height: '120px', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', background: '#eee', border: '3px solid #3498db', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {file ? (
                <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : profile.profile_picture ? (
                // 🟢 [แก้ไข]: ดึงจาก URL ในฐานข้อมูลตรงๆ (Cloudinary URL)
                <img 
                  src={profile.profile_picture} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => {
                    // กันพลาด: ถ้าใน DB ใครยังไม่มีรูป (เป็น NULL) ให้ใช้รูปสำรองนี้
                    e.target.src = 'https://via.placeholder.com/150';
                  }}
                />
              ) : (
                <span style={{ fontSize: '50px' }}>👤</span>
              )}
            </div>
            <label style={{ display: 'inline-block', marginTop: '10px', background: '#3498db', color: 'white', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '14px' }}>
              📸 เปลี่ยนรูป
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
            </label>
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>👤 ชื่อผู้ใช้งาน:</label>
            <input type="text" required value={profile.username || ''} onChange={(e) => setProfile({...profile, username: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #3498db' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>📧 อีเมล:</label>
            <input type="email" required value={profile.email || ''} onChange={(e) => setProfile({...profile, email: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #3498db' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', color: '#e74c3c' }}>🔐 รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่เปลี่ยน):</label>
            <input type="password" value={profile.password || ''} onChange={(e) => setProfile({...profile, password: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #e74c3c' }} />
          </div>

          <hr style={{ border: '0.5px solid #eee', margin: '10px 0' }} />

          <div>
            <label style={{ fontWeight: 'bold' }}>🏠 ที่อยู่จัดส่ง:</label>
            <textarea rows="3" value={profile.address || ''} onChange={(e) => setProfile({...profile, address: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #3498db' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>📞 เบอร์โทรศัพท์:</label>
            <input type="text" value={profile.phone || ''} onChange={(e) => setProfile({...profile, phone: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #3498db' }} />
          </div>

          <button type="submit" style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>
            💾 บันทึกข้อมูล
          </button>
        </form>
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
  <div style={{ fontFamily: "'Sarabun', 'Prompt', sans-serif", backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700;800&family=Prompt:wght@600;700;800&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
      @media print {
        nav, .sidebar-overlay, .sidebar, .no-print, button:not(.print-btn) { display: none !important; }
        .print-area { box-shadow: none !important; padding: 0 !important; }
        body { background: white !important; }
      }
      @media (max-width: 768px) {
        .admin-table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .admin-table-wrapper table { min-width: 600px; }
        .product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; padding: 0 12px !important; }
        .hero-title { font-size: 2rem !important; }
        .hero-search { width: 95% !important; }
        .my-orders-card { flex-direction: column !important; }
      }
      @keyframes slideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      .order-card-anim { animation: slideIn 0.35s ease forwards; }
      .stat-card:hover { transform: translateY(-3px); transition: transform 0.2s ease; }
    `}</style>

    {showPayModal && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' }}>
        <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '450px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', animation: 'slideIn 0.3s ease' }}>
          <h2 style={{ textAlign: 'center', color: '#059669', margin: '0 0 6px 0', fontSize: '22px', fontFamily: "'Prompt', sans-serif" }}>💰 แจ้งชำระเงิน</h2>
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>ออเดอร์ #{currentOrderId} · กรุณาโอนเงินมาที่: <strong>ธนาคารกสิกรไทย 000-0-00000-0</strong></p>
          <form onSubmit={handlePayment}>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>🏠 ที่อยู่จัดส่ง</label><textarea required rows="3" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', resize: 'none', transition: 'border 0.2s' }} placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด..." onFocus={e=>e.target.style.border='1.5px solid #3b82f6'} onBlur={e=>e.target.style.border='1.5px solid #e2e8f0'} /></div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>📞 เบอร์โทรศัพท์</label><input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }} placeholder="08x-xxx-xxxx" /></div>
            <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>📸 อัปโหลดสลิปโอนเงิน</label><input type="file" accept="image/*" required style={{ width: '100%', marginTop: '5px', fontSize: '13px' }} onChange={(e) => setSlipFile(e.target.files[0])} /></div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}><button type="button" onClick={() => setShowPayModal(false)} style={{ flex: 1, padding: '12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>❌ ยกเลิก</button><button type="submit" style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }}>✅ ยืนยันชำระเงิน</button></div>
            <button type="button" onClick={() => setShowPayModal(false)} style={{ width: '100%', marginTop: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>ไว้ทำทีหลัง (ไปที่หน้าประวัติสั่งซื้อ)</button>
          </form>
        </div>
      </div>
    )}
      
    <nav style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '0 20px', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', position: 'sticky', top: 0, zIndex: 900, boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><button onClick={() => setIsSidebarOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer', padding: '8px 10px', borderRadius: '8px', lineHeight: 1 }}>☰</button><h2 style={{ margin: 0, letterSpacing: '0.5px', fontFamily: "'Prompt', sans-serif", fontSize: '20px', background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🛒 BIG SHOP</h2></div>
      <div>{isLoggedIn ? <button onClick={logout} style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>ออกจากระบบ</button> : <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => navigate('/login')} style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }}>เข้าสู่ระบบ</button></div>}</div>
    </nav>

    {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.6)', zIndex: 998, backdropFilter: 'blur(4px)' }} />}
    
    <div className="sidebar" style={{ position: 'fixed', top: 0, left: isSidebarOpen ? 0 : '-300px', width: '270px', height: '100vh', background: '#ffffff', boxShadow: '6px 0 30px rgba(0,0,0,0.15)', transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)', zIndex: 999, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
  <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg,#1e293b,#0f172a)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}><h3 style={{ margin: 0, fontFamily: "'Prompt', sans-serif", fontSize: '16px' }}>เมนูหลัก</h3><button onClick={() => setIsSidebarOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', borderRadius: '6px', padding: '4px 8px' }}>✖</button></div>
     {/* 🟢 Profile Section ใน Sidebar */}
<div style={{ 
  padding: '16px 15px', 
  borderBottom: '1px solid #f1f5f9', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px',
  background: '#f8fafc'
}}>
  <div style={{ 
    width: '46px', height: '46px', borderRadius: '50%', 
    overflow: 'hidden', background: '#e2e8f0', 
    border: '2px solid #3b82f6', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}>
    {profile.profile_picture ? (
      <img 
        src={profile.profile_picture} 
        alt="avatar"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => { e.target.src = ''; e.target.style.display = 'none'; }}
      />
    ) : (
      <span style={{ fontSize: '22px' }}>👤</span>
    )}
  </div>
  <div>
    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>
      {profile.username || 'ผู้ใช้งาน'}
    </div>
    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
      {profile.email || ''}
    </div>
  </div>
</div>
  <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
   {/* 👤 ส่วนโปรไฟล์ (โชว์เฉพาะ User) */}
{isLoggedIn && userRole !== 'admin' && (
  <Link to="/profile" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#334155', fontSize: '15px', fontWeight: '600', padding: '11px 14px', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0', transition: '0.2s' }}>
    👤 โปรไฟล์ของฉัน
  </Link>
)}

{/* 🏠 หน้าแรก */}
<Link to="/" onClick={() => { setIsSidebarOpen(false); setSelectedCategory('ทั้งหมด'); }} style={{ textDecoration: 'none', color: '#334155', fontSize: '15px', fontWeight: '600', padding: '11px 14px', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0' }}>
  🏠 หน้าแรก
</Link>

{/* 📦 หมวดหมู่สินค้า (แบบพับได้) */}
<div>
  <div 
    onClick={() => setIsCategoryOpen(!isCategoryOpen)} 
    style={{ cursor: 'pointer', color: '#334155', fontSize: '15px', fontWeight: '600', padding: '11px 14px', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>📦 หมวดหมู่สินค้า</div>
    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{isCategoryOpen ? '▲' : '▼'}</span>
  </div>

  {/* ส่วนที่พับ/กาง ออกมา */}
  {isCategoryOpen && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '6px', paddingLeft: '12px' }}>
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
            color: selectedCategory === cat ? '#2563eb' : '#64748b',
            background: selectedCategory === cat ? '#eff6ff' : 'transparent',
            fontWeight: selectedCategory === cat ? '700' : '400',
            transition: '0.2s',
            borderLeft: selectedCategory === cat ? '3px solid #3b82f6' : '3px solid transparent'
          }}
        >
          {cat}
        </div>
      ))}
    </div>
  )}
</div>

{/* 🛒 เมนูอื่นๆ สำหรับ User */}
{userRole !== 'admin' && (
  <>
    <Link to="/cart" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#334155', fontSize: '15px', fontWeight: '600', padding: '11px 14px', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>🛒 ตะกร้าสินค้า</span>
      {cart.length > 0 && <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
        {cart.length}
      </span>}
    </Link>
    
    {isLoggedIn && (
      <Link to="/my-orders" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#334155', fontSize: '15px', fontWeight: '600', padding: '11px 14px', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0' }}>
        🧾 ประวัติการสั่งซื้อ
      </Link>
    )}
  </>
)}
    {isLoggedIn && userRole === 'admin' && (
      <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '12px 10px', marginTop: '8px', border: '1px solid #bbf7d0' }}>
        <div style={{ color: '#059669', fontSize: '13px', fontWeight: '700', marginBottom: '8px', paddingLeft: '4px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>⚙️ ระบบหลังบ้าน</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { tab: 'report', icon: '📊', label: 'รายงานสถิติ' },
            { tab: 'add', icon: '➕', label: 'เพิ่มสินค้าใหม่' },
            { tab: 'stock', icon: '📦', label: 'จัดการสต็อก' },
            { tab: 'orders', icon: '🧾', label: 'รายการสั่งซื้อ' },
            { tab: 'users', icon: '👥', label: 'จัดการผู้ใช้' },
            { tab: 'reviews', icon: '📝', label: 'จัดการรีวิว' },
          ].map(({ tab, icon, label }) => (
            <button key={tab} onClick={() => { setAdminTab(tab); navigate('/admin'); setIsSidebarOpen(false); }} style={{ textAlign: 'left', background: adminTab === tab ? '#10b981' : 'transparent', color: adminTab === tab ? 'white' : '#374151', border: 'none', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>{icon} {label}</button>
          ))}
        </div>
      </div>
    )}
  </div>
</div>

{showReviewModal && (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' }}>
    <div style={{ background: 'white', padding: '28px', borderRadius: '20px', width: '100%', maxWidth: '420px', animation: 'slideIn 0.3s ease', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
      <h2 style={{ textAlign: 'center', color: '#1e293b', fontFamily: "'Prompt', sans-serif", marginTop: 0 }}>⭐ รีวิวสินค้า</h2>
      
      <p style={{ marginBottom: '10px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>คะแนนความพึงพอใจ: 
        <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ marginLeft: '10px', padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '14px' }}>
          <option value="5">⭐⭐⭐⭐⭐ ดีมาก</option>
          <option value="4">⭐⭐⭐⭐ ดี</option>
          <option value="3">⭐⭐⭐ ปานกลาง</option>
          <option value="2">⭐⭐ พอใช้</option>
          <option value="1">⭐ ควรปรับปรุง</option>
        </select>
      </p>

      <textarea 
        placeholder="เขียนรีวิวของคุณที่นี่..."
        style={{ width: '100%', height: '100px', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', resize: 'none', outline: 'none', fontFamily: 'inherit' }}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setShowReviewModal(false)} 
          style={{ flex: 1, background: '#f1f5f9', color: '#64748b', padding: '11px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
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
          style={{ flex: 1, background: 'linear-gradient(135deg,#6c5ce7,#a855f7)', color: 'white', padding: '11px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 12px rgba(108,92,231,0.35)' }}
        >
          ✨ ส่งรีวิว
        </button>
      </div>
    </div>
  </div>
)}

    <Routes>
      <Route path="/" element={
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center', padding: '50px 20px 60px', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'rgba(99,102,241,0.15)', borderRadius: '50%', filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '200px', height: '200px', background: 'rgba(59,130,246,0.2)', borderRadius: '50%', filter: 'blur(30px)' }} />
            <h1 className="hero-title" style={{ fontSize: '2.8rem', margin: 0, fontWeight: '800', fontFamily: "'Prompt', sans-serif", letterSpacing: '-0.5px', position: 'relative' }}>🛍️ BIG1919 SHOP</h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.85, marginTop: '8px', position: 'relative' }}>"ช้อปใหญ่ จ่ายน้อย สอยทุกความคุ้ม!"</p>
            <div style={{ marginTop: '24px', position: 'relative' }}><input type="text" placeholder="🔍 ค้นหาสินค้าที่ใช่สำหรับคุณ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="hero-search" style={{ padding: '14px 22px', width: '85%', maxWidth: '540px', borderRadius: '50px', border: 'none', fontSize: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', outline: 'none' }} /></div>
          </div>
          
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '28px', padding: '0 20px' }}>
            {filteredProducts.map(item => (
              <div key={item.id} style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.14)'}} onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.08)'}}>
                {/* 🟢 [แก้ไข]: เปลี่ยนจาก localhost เป็น Cloud URL (item.image) */}
                {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} /> : <div style={{ fontSize: '64px', padding: '24px', background: 'linear-gradient(135deg,#f0f4ff,#e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px' }}>📦</div>}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#1e293b', fontWeight: '700', lineHeight: 1.3 }}>{item.name}</h3>
                  <p style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626', margin: '4px 0', fontFamily: "'Prompt', sans-serif" }}>฿{item.price}</p>
                  <p style={{ color: item.stock > 0 ? '#059669' : '#dc2626', fontWeight: '600', fontSize: '12px', margin: '4px 0 12px' }}>{item.stock > 0 ? `คงเหลือ: ${item.stock} ชิ้น` : 'สินค้าหมด'}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => navigate(`/product/${item.id}`)} style={{ flex: 1, padding: '9px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🔍 รายละเอียด</button>
                    <button onClick={() => addToCart(item)} disabled={item.stock <= 0} style={{ flex: 1, background: item.stock > 0 ? 'linear-gradient(135deg,#1e293b,#334155)' : '#cbd5e1', color: 'white', border: 'none', padding: '9px', borderRadius: '8px', cursor: item.stock > 0 ? 'pointer' : 'not-allowed', fontWeight: '600', fontSize: '13px' }}>{item.stock > 0 ? '🛒 ใส่ตะกร้า' : 'หมด'}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <footer style={{ marginTop: '50px', padding: '36px 20px', background: 'linear-gradient(135deg,#1e293b,#0f172a)', color: 'white', textAlign: 'center' }}><p style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 6px', fontFamily: "'Prompt', sans-serif" }}>🛍️ BIG SHOP - ร้านค้าอันดับ 1 ของทุกคน</p><p style={{ opacity: 0.6, margin: 0, fontSize: '14px' }}>ติดต่อเรา: 093-112-1917 | Line: @phuwadet5617</p><hr style={{ width: '40px', margin: '16px auto', borderColor: '#334155' }} /><p style={{ fontSize: '13px', opacity: 0.4, margin: 0 }}>© 2026 BIG SHOP. All rights reserved.</p></footer>
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
        <div style={{ padding: '24px 16px', maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', fontFamily: "'Prompt', sans-serif", color: '#1e293b', marginBottom: '24px', fontSize: '1.6rem' }}>📋 ประวัติการสั่งซื้อของฉัน</h1>
          {myOrders.length === 0 ? (
            <div style={{ background: 'white', padding: '48px 20px', borderRadius: '16px', textAlign: 'center', color: '#94a3b8', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
              <p style={{ fontSize: '16px', margin: 0 }}>ยังไม่มีรายการสั่งซื้อ</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myOrders.map(order => {
                const statusColors = {
                  'จัดส่งแล้ว': { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
                  'ยกเลิก': { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
                  'รอดำเนินการ': { bg: '#fef9c3', color: '#854d0e', border: '#fde68a' },
                  'ชำระเงินแล้ว': { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
                  'กำลังจัดส่ง': { bg: '#ede9fe', color: '#5b21b6', border: '#ddd6fe' },
                };
                const sc = statusColors[order.status] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
                return (
                <div key={order.id} className="order-card-anim" style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                  {/* Header ของ card */}
                  <div style={{ padding: '14px 18px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '16px', fontFamily: "'Prompt', sans-serif" }}>ออเดอร์ #{order.id}</span>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{order.status}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>📅 {new Date(order.created_at).toLocaleDateString('th-TH', { year:'numeric', month:'short', day:'numeric' })}</div>
                  </div>
                  {/* Body */}
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#dc2626', marginBottom: '14px', fontFamily: "'Prompt', sans-serif" }}>฿{Number(order.total_price).toLocaleString()}</div>
                    {/* ปุ่มจัดการ */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {order.status === 'รอดำเนินการ' && 
                        <button onClick={() => cancelOrder(order.id)} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>❌ ยกเลิก</button>}
                      
                      <button onClick={() => { setCurrentOrderId(order.id); setShowPayModal(true); }} style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>💳 จ่ายเงิน</button>
                      <button onClick={() => generatePDF(order)} className="print-btn" style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>📄 บิล/ปริ้น</button>
                      
                      {order.tracking_number && (
                        <button 
                          onClick={() => {
                        let url = "";
                        const track = order.tracking_number;
                        const company = order.shipping_company.toLowerCase();

                        if (company.includes("kerry")) {
                          url = `https://th.kerryexpress.com/th/track/?track=${track}`;
                        } else if (company.includes("flash")) {
                          url = `https://www.flashexpress.co.th/tracking/?se=${track}`;
                        } else if (company.includes("thai") || company.includes("ไปรษณีย์")) {
                          url = `https://track.thailandpost.co.th/?trackNumber=${track}`;
                        } else {
                          url = `https://www.google.com/search?q=เช็คพัสดุ+${track}`;
                        }
                        window.open(url, '_blank');
                    }}
                          style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                        >
                          🚚 ตามพัสดุ
                        </button>
                      )}
                    {order.status === 'จัดส่งแล้ว' && (
                        <button 
                          onClick={() => { 
                            console.log("product_id ที่ได้:", order.product_id, "order:", order);
                    setSelectedProduct(order.product_id); 
                            setShowReviewModal(true); 
                          }} 
                          style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                        >
                          ⭐ รีวิว
                        </button>
                      )}

                      <button onClick={() => deleteOrderHistory(order.id)} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🗑️ ลบ</button>
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
        <div style={{ padding: '50px', textAlign: 'center', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '20px' }}>🔐 เข้าสู่ระบบ</h2>
            <form onSubmit={handleLogin}><div style={{ marginBottom: '15px', textAlign: 'left' }}><label>ชื่อผู้ใช้งาน:</label><input name="username" type="text" placeholder="Username" required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd' }} /></div><div style={{ marginBottom: '25px', textAlign: 'left' }}><label>รหัสผ่าน:</label><input name="password" type="password" placeholder="Password" required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd' }} /></div><button type="submit" style={{ width: '100%', padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px' }}>Login</button></form>
            <p style={{ marginTop: '20px' }}>ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิกฟรี</Link></p>
          </div>
        </div>
      )} />

      <Route path="/register" element={<div style={{ padding: '50px', textAlign: 'center', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}><h2 style={{ marginBottom: '20px', color: '#2ecc71' }}>📝 สมัครสมาชิกใหม่</h2><form onSubmit={handleRegister}><div style={{ marginBottom: '15px', textAlign: 'left' }}><label>ชื่อผู้ใช้งาน:</label><input name="username" placeholder="Username" required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} /></div><div style={{ marginBottom: '15px', textAlign: 'left' }}><label>รหัสผ่าน:</label><input name="password" type="password" placeholder="Password" required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} /></div><div style={{ marginBottom: '25px', textAlign: 'left' }}><label>ยืนยันรหัสผ่าน:</label><input name="confirmPassword" type="password" placeholder="Confirm Password" required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} /></div><button type="submit" style={{ width: '100%', padding: '12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px' }}>สมัครสมาชิก</button></form><p style={{ marginTop: '20px' }}>มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบที่นี่</Link></p></div></div>} />

      <Route path="/admin" element={isLoggedIn && userRole === 'admin' ? (
        <div style={{ padding: '24px 16px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}><h1 style={{ margin: 0, fontFamily: "'Prompt', sans-serif", color: '#1e293b', fontSize: '1.5rem' }}>🛠️ ระบบจัดการหลังบ้าน</h1><p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>Admin Dashboard — BIG SHOP</p></div>
          {adminTab === 'report' && (
            <div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}><h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '16px', fontWeight: '700' }}>📈 กราฟยอดขายรายวัน</h3><div style={{ width: '100%', height: 280 }}><ResponsiveContainer><BarChart data={Object.values(orders.reduce((acc, order) => { if (order.status !== 'ยกเลิก' && order.status !== 'รอดำเนินการ') { const date = new Date(order.created_at).toLocaleDateString('th-TH'); if (!acc[date]) acc[date] = { name: date, ยอดขาย: 0 }; acc[date].ยอดขาย += Number(order.total_price); } return acc; }, {}))}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} /><YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} /><Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} /><Legend /><Bar dataKey="ยอดขาย" fill="#3b82f6" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}><p style={{ margin: '0 0 6px', fontSize: '13px', opacity: 0.85 }}>💰 ยอดขายรวม</p><h2 style={{ margin: 0, fontFamily: "'Prompt', sans-serif", fontSize: '26px' }}>฿{totalSales.toLocaleString()}</h2></div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}><p style={{ margin: '0 0 6px', fontSize: '13px', opacity: 0.85 }}>⏳ รอตรวจสอบ</p><h2 style={{ margin: 0, fontFamily: "'Prompt', sans-serif", fontSize: '26px' }}>{pendingOrders}</h2></div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}><p style={{ margin: '0 0 6px', fontSize: '13px', opacity: 0.85 }}>✅ จัดส่งแล้ว</p><h2 style={{ margin: 0, fontFamily: "'Prompt', sans-serif", fontSize: '26px' }}>{completedOrders}</h2></div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}><p style={{ margin: '0 0 6px', fontSize: '13px', opacity: 0.85 }}>👤 ลูกค้า</p><h2 style={{ margin: 0, fontFamily: "'Prompt', sans-serif", fontSize: '26px' }}>{totalUsers}</h2></div>
              </div>
            </div>
          )}
          {adminTab === 'add' && (
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ marginTop: 0, color: '#1e293b', fontFamily: "'Prompt', sans-serif", fontSize: '16px' }}>➕ {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h3>
              <form onSubmit={addOrUpdateProduct} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {[
                  { name: 'name', placeholder: 'ชื่อสินค้า', defaultValue: editingProduct?.name || '', required: true },
                  { name: 'category', placeholder: 'หมวดหมู่', defaultValue: editingProduct?.category || '', required: true },
                  { name: 'stock', type: 'number', placeholder: 'สต็อก', defaultValue: editingProduct?.stock || 0, required: true },
                  { name: 'price', type: 'number', placeholder: 'ราคา', defaultValue: editingProduct?.price || '', required: true },
                ].map(f => <input key={f.name} name={f.name} type={f.type||'text'} placeholder={f.placeholder} defaultValue={f.defaultValue} required={f.required} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', minWidth: '130px' }} />)}
                <input name="image" type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*" style={{ padding: '8px', fontSize: '13px', border: '1.5px dashed #e2e8f0', borderRadius: '10px', cursor: 'pointer' }} />
                <input name="desc" placeholder="รายละเอียดสินค้า" defaultValue={editingProduct?.description || ''} style={{ flex: '1 1 200px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', minWidth: '200px' }} />
                <button type="submit" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>💾 บันทึก</button>
              </form>
            </div>
          )}
          {adminTab === 'stock' && (
            <div>
              <h3 style={{ color: '#1e293b', fontFamily: "'Prompt', sans-serif", fontSize: '16px', marginBottom: '16px' }}>📦 จัดการสต็อกสินค้า</h3>
              <div className="admin-table-wrapper" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                <thead><tr style={{ background: 'linear-gradient(135deg,#1e293b,#334155)', color: 'white' }}><th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>สินค้า</th><th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>ราคา</th><th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>จัดการ</th></tr></thead>
                <tbody>
                  {products.map((p, idx) => (
                    <tr key={p.id} style={{ textAlign: 'center', borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                      {/* 🟢 [แก้ไข]: เปลี่ยนรูปจิ๋วในหน้าแอดมินให้ดึงจาก Cloud URL (p.image) */}
                      <td style={{ padding: '12px 16px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>{p.image && <img src={p.image} alt={p.name} style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />}<span style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{p.name}</span></td>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#dc2626' }}>฿{p.price}</td>
                      <td style={{ padding: '12px' }}><button onClick={() => { selectToEdit(p); setAdminTab('add'); }} style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', marginRight: '6px' }}>✏️ แก้ไข</button><button onClick={() => deleteProduct(p.id)} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🗑️ ลบ</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
          {adminTab === 'orders' && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
      <h3 style={{ margin: 0, color: '#1e293b', fontFamily: "'Prompt', sans-serif", fontSize: '16px' }}>🧾 รายการสั่งซื้อทั้งหมด</h3>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={exportToExcel} style={{ background: 'linear-gradient(135deg,#059669,#047857)', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>📊 Excel</button>
        <button onClick={exportToPDF} style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>📄 PDF</button>
      </div>
    </div>
    <div style={{ background: 'white', padding: '16px', borderRadius: '14px', marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
    
    <div style={{ flex: 1, minWidth: '180px' }}>
        <input 
            type="text" 
            placeholder="🔍 ค้นหาเลขที่ออเดอร์หรือที่อยู่..." 
            value={orderSearchTerm}
            onChange={(e) => setOrderSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
        />
    </div>

    <select 
        value={statusFilter} 
        onChange={(e) => setStatusFilter(e.target.value)}
        style={{ padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', cursor: 'pointer', fontSize: '14px', outline: 'none' }}
    >
        <option value="ทั้งหมด">ทุกสถานะ</option>
        <option value="รอดำเนินการ">รอดำเนินการ</option>
        <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
        <option value="ยกเลิก">ยกเลิก</option>
    </select>

    <input 
        type="date" 
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        style={{ padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', cursor: 'pointer', fontSize: '14px', outline: 'none' }}
    />

    <button 
        onClick={() => { setOrderSearchTerm(''); setStatusFilter('ทั้งหมด'); setDateFilter(''); }}
        style={{ padding: '9px 16px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#64748b' }}
    >
        ล้างค่า
    </button>
</div>
    <div className="admin-table-wrapper" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
      <thead>
        <tr style={{ background: 'linear-gradient(135deg,#1e293b,#334155)', color: 'white' }}>
          <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>ออเดอร์</th>
          <th style={{ padding: '14px 8px', fontSize: '13px', fontWeight: '600', textAlign: 'left' }}>ที่อยู่จัดส่ง</th>
          <th style={{ padding: '14px 8px', fontSize: '13px', fontWeight: '600' }}>ราคารวม</th>
          <th style={{ padding: '14px 8px', fontSize: '13px', fontWeight: '600' }}>หลักฐาน</th>
          <th style={{ padding: '14px 8px', fontSize: '13px', fontWeight: '600' }}>สถานะ</th>
          <th style={{ padding: '14px 8px', fontSize: '13px', fontWeight: '600' }}>พิมพ์</th>
        </tr>
      </thead>
      <tbody>
        {filteredOrders.map((order, idx) => (
          <tr key={order.id} style={{ textAlign: 'center', borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
            <td style={{ textAlign: 'center', padding: '14px 16px' }}>
    <div style={{ fontWeight: '800', fontSize: '15px', color: '#1e293b', fontFamily: "'Prompt', sans-serif" }}>
        #{order.id}
    </div>
    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
        {order.created_at ? new Date(order.created_at).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'ไม่ระบุวันที่'}
    </div>
</td>
            
            <td style={{ padding: '10px 12px', fontSize: '13px', textAlign: 'left', maxWidth: '220px' }}>
              <div style={{ color: '#1e293b', fontWeight: '600', fontSize: '13px' }}>📍 {order.address}</div>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>📞 {order.phone}</div>
            </td>

            <td style={{ fontWeight: '800', color: '#dc2626', fontSize: '15px', fontFamily: "'Prompt', sans-serif" }}>฿{order.total_price}</td>
            <td>
              {order.slip_image ? <button onClick={() => window.open(order.slip_image, '_blank')} style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>🖼️ ดูสลิป</button> : <span style={{ color: '#cbd5e1', fontSize: '12px' }}>ยังไม่ส่ง</span>}
            </td>
            <td style={{ padding: '8px' }}>
              <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '12px', background: order.status === 'จัดส่งแล้ว' ? '#dcfce7' : order.status === 'ยกเลิก' ? '#fee2e2' : '#fef9c3', fontWeight: '600', cursor: 'pointer', outline: 'none' }}>
                <option value="รอดำเนินการ">รอดำเนินการ</option>
                <option value="ชำระเงินแล้ว">ชำระเงินแล้ว</option>
                <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                <option value="ยกเลิก">ยกเลิก</option>
              </select>
            </td>
            <td style={{ padding: '8px' }}><button onClick={() => generatePDF(order)} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>🖨️ บิล</button></td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  </div>
)}

{adminTab === 'users' && (
  <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <h3 style={{ margin: 0, color: '#1e293b', fontFamily: "'Prompt', sans-serif", fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        👥 จัดการผู้ใช้ <span style={{ fontSize: '13px', fontWeight: '400', color: '#94a3b8' }}>({users.length} บัญชี)</span>
      </h3>
    </div>
    
    <div className="admin-table-wrapper" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
      <thead>
        <tr style={{ background: 'linear-gradient(135deg,#1e293b,#334155)', color: 'white', textAlign: 'center' }}>
          <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>ID</th>
          <th style={{ textAlign: 'left', padding: '14px 8px', fontSize: '13px', fontWeight: '600' }}>ข้อมูลผู้ใช้งาน</th>
          <th style={{ padding: '14px 8px', fontSize: '13px', fontWeight: '600' }}>ระดับสิทธิ์</th>
          <th style={{ padding: '14px 8px', fontSize: '13px', fontWeight: '600' }}>สถานะ</th>
          <th style={{ padding: '14px 8px', fontSize: '13px', fontWeight: '600' }}>การจัดการ</th>
        </tr>
      </thead>
      <tbody>
        {users && users.length > 0 ? (
          users.map((user, index) => (
            <tr 
              key={user.id || index} 
              style={{ 
                textAlign: 'center', 
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                transition: '0.2s'
              }}
            >
              <td style={{ padding: '13px 16px', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>{user.id}</td>
              <td style={{ textAlign: 'left', padding: '13px 12px' }}>
                {/* 🟢 [แก้ไข]: ป้องกันชื่อหายโดยใช้ค่าสำรองถ้า username เป็น null */}
                <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>
                  {user.username || "กำลังโหลด..."} 
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  {user.email || "---"}
                </div>
              </td>
              <td>
                <select 
                  value={user.role || 'customer'} 
                  onChange={(e) => {
                    const newRole = e.target.value;
                    updateUser(user.id, { role: newRole, status: user.status });
                  }}
                  style={{ 
                    padding: '7px 10px', 
                    borderRadius: '8px', 
                    border: '1.5px solid #e2e8f0',
                    backgroundColor: user.role === 'admin' ? '#fff7ed' : 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    outline: 'none'
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
                  fontSize: '12px',
                  fontWeight: '700',
                  background: user.status === 'suspended' ? '#fef9c3' : '#dcfce7',
                  color: user.status === 'suspended' ? '#92400e' : '#166534',
                  border: `1px solid ${user.status === 'suspended' ? '#fde68a' : '#bbf7d0'}`
                }}>
                  {user.status === 'suspended' ? '🔴 ถูกระงับ' : '🟢 ปกติ'}
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
                    background: user.status === 'active' ? '#fee2e2' : '#dcfce7',
                    color: user.status === 'active' ? '#dc2626' : '#16a34a', 
                    border: `1px solid ${user.status === 'active' ? '#fecaca' : '#bbf7d0'}`, 
                    padding: '7px 14px', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}
                >
                  {user.status === 'active' ? '🚫 ระงับ' : '✅ ปลดระงับ'}
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr><td colSpan="5" style={{ padding: '24px', color: '#94a3b8', textAlign: 'center' }}>ไม่พบข้อมูลผู้ใช้งาน</td></tr>
        )}
      </tbody>
    </table>
    </div>
  </div>
)}
{adminTab === 'reviews' && (
  <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
    <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
      <h2 style={{ margin: 0, color: '#1e293b', fontFamily: "'Prompt', sans-serif", fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>📝 จัดการรีวิวจากลูกค้า</h2>
    </div>
    <div className="admin-table-wrapper">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'linear-gradient(135deg,#1e293b,#334155)', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '13px 16px', fontSize: '13px', fontWeight: '600' }}>สินค้า</th>
            <th style={{ padding: '13px 8px', fontSize: '13px', fontWeight: '600' }}>ลูกค้า</th>
            <th style={{ padding: '13px 8px', fontSize: '13px', fontWeight: '600' }}>คะแนน</th>
            <th style={{ padding: '13px 8px', fontSize: '13px', fontWeight: '600' }}>ความคิดเห็น</th>
            <th style={{ padding: '13px 8px', fontSize: '13px', fontWeight: '600' }}>วันที่</th>
            <th style={{ padding: '13px 8px', fontSize: '13px', fontWeight: '600' }}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {/* สมมติว่าบิ๊กตั้งชื่อ state ที่เก็บรีวิวว่า allReviews */}
          {allReviews.length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>ยังไม่มีรีวิวในขณะนี้</td></tr>
          ) : (
            allReviews.map((review, idx) => (
              <tr key={review.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{review.product_name}</td>
                <td style={{ padding: '12px 8px', color: '#64748b', fontSize: '13px' }}>{review.username}</td>
                <td style={{ padding: '12px 8px', color: '#f59e0b', fontSize: '14px' }}>
                  {'⭐'.repeat(review.rating)}
                </td>
                <td style={{ padding: '12px 8px', color: '#374151', fontSize: '13px', maxWidth: '200px' }}>{review.comment}</td>
                <td style={{ padding: '12px 8px', color: '#94a3b8', fontSize: '12px' }}>{new Date(review.created_at).toLocaleDateString('th-TH')}</td>
                <td style={{ padding: '12px 8px' }}>
                  <button 
                    onClick={() => {
                      if(window.confirm('คุณแน่ใจหรือไม่ที่จะลบริวิวกนี้?')) {
                        deleteReview(review.id);
                      }
                    }}
                    style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
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