import { useEffect, useState } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fontBase64 } from './ThaiFont';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API_URL from './config'; // หรือใส่ path ให้ตรงกับที่ไฟล์ config.js อยู่

// 🟢 [เพิ่มส่วนนี้]: คอมโพเนนต์สำหรับหน้ารายละเอียดสินค้า
function ProductDetailPage({ products, addToCart }) {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return <div style={{ padding: '50px', textAlign: 'center' }}><h3>กำลังโหลด... หรือไม่พบสินค้านี้ 😥</h3><button onClick={() => navigate('/')}>กลับหน้าแรก</button></div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#3498db', fontSize: '16px', cursor: 'pointer', marginBottom: '20px' }}>
        ⬅️ ย้อนกลับ
      </button>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
        {/* 🖼️ ฝั่งซ้าย: รูปสินค้า */}
        <div style={{ flex: '1 1 400px' }}>
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              style={{
                width: '100%', 
                height: '400px', 
                objectFit: 'cover',
                borderRadius: '10px'
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
              }}
            />
          ) : (
            <div style={{
              width: '100%', 
              height: '400px', 
              background: '#f0f0f0',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: '#999'
            }}>
              ไม่มีรูปภาพสินค้า
            </div>
          )}
        </div>
        
        {/* 📝 ฝั่งขวา: รายละเอียด */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ background: '#ecf0f1', color: '#7f8c8d', padding: '5px 10px', borderRadius: '5px', alignSelf: 'flex-start', fontSize: '14px', fontWeight: 'bold' }}>
            🏷️ หมวดหมู่: {product.category || 'ไม่ระบุ'}
          </span>
          <h1 style={{ fontSize: '32px', margin: '15px 0' }}>{product.name}</h1>
          <h2 style={{ color: '#e74c3c', fontSize: '36px', margin: '0 0 20px 0' }}>฿{product.price}</h2>
          
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ margin: 0, lineHeight: '1.6', color: '#555' }}>
              <strong>รายละเอียด:</strong><br />
              {product.description || 'ไม่มีรายละเอียดสินค้า'}
            </p>
          </div>

          <p style={{ color: product.stock > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold', fontSize: '18px' }}>
            📦 สถานะ: {product.stock > 0 ? `มีสินค้าพร้อมส่ง (${product.stock} ชิ้น)` : 'สินค้าหมดชั่วคราว'}
          </p>

          <button 
            onClick={() => addToCart(product)} 
            disabled={product.stock <= 0} 
            style={{ 
              marginTop: 'auto', padding: '15px', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer',
              background: product.stock > 0 ? '#2ecc71' : '#bdc3c7', color: 'white', boxShadow: product.stock > 0 ? '0 4px 10px rgba(46, 204, 113, 0.3)' : 'none'
            }}
          >
            {product.stock > 0 ? '🛒 หยิบใส่ตะกร้า' : '❌ สินค้าหมด'}
          </button>
        </div>
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
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#3498db', fontSize: '16px', cursor: 'pointer', marginBottom: '20px' }}>
        ⬅️ ย้อนกลับ
      </button>

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
    // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
    axios.put(`${API_URL}/orders/${orderId}`, { status: newStatus })
      .then(() => {
        alert("อัปเดตสถานะเป็น: " + newStatus);
        fetchOrders(); 
        // ✅ [แก้ไข]: เปลี่ยนจาก localhost เป็น ${API_URL}
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

// 1. ฟังก์ชันดึงข้อมูล (ปรับให้รองรับ error ได้ดีขึ้น)
const fetchUsers = async () => {
  try {
    const response = await axios.get('https://shop-system-backend.onrender.com/api/users/' + id);
    // ตรวจสอบว่าข้อมูลที่ได้มาเป็น Array หรือไม่ก่อนจะ setUsers
    if (Array.isArray(response.data)) {
      setUsers(response.data);
    }
  } catch (error) {
    console.error('Fetch users error:', error);
  }
};

// 2. ฟังก์ชันอัปเดตข้อมูล (ฉบับเสถียรที่สุด กันชื่อหาย 100%)
// ในหน้า Admin.jsx (หรือไฟล์ที่คุณทำหน้าจัดการผู้ใช้)
const updateUser = async (id, data) => {
  try {
    // 🟢 เปลี่ยนมายิงที่เส้นทางพิเศษที่เราเพิ่งสร้าง
    const response = await axios.put(`https://shop-system-backend.onrender.com/api/special-admin-update/${id}`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    if (response.status === 200) {
      // ไม่ต้องทำ Optimistic Update ใดๆ ทั้งสิ้น สั่งโหลดใหม่จาก DB เลย
      await fetchUsers(); 
      alert("✅ อัปเดตสำเร็จ ");
    }
  } catch (error) {
    console.error("Update Error:", error);
    alert("❌ ยิงไม่ติด: " + error.message);
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

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole('user');
    setIsSidebarOpen(false);
    navigate('/login');
  };
  
  return (
  <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
    {showPayModal && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '100%', maxWidth: '450px', position: 'relative' }}>
          <h2 style={{ textAlign: 'center', color: '#2ecc71' }}>💰 แจ้งชำระเงิน (ออเดอร์ #{currentOrderId})</h2>
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>กรุณาโอนเงินมาที่: **ธนาคารกสิกรไทย 000-0-00000-0**</p>
          <form onSubmit={handlePayment}>
            <div style={{ marginBottom: '15px' }}><label>🏠 ที่อยู่จัดส่ง:</label><textarea required rows="3" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd' }} placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด..." /></div>
            <div style={{ marginBottom: '15px' }}><label>📞 เบอร์โทรศัพท์:</label><input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd' }} placeholder="08x-xxx-xxxx" /></div>
            <div style={{ marginBottom: '20px' }}><label>📸 อัปโหลดสลิปโอนเงิน:</label><input type="file" accept="image/*" required style={{ width: '100%', marginTop: '5px' }} onChange={(e) => setSlipFile(e.target.files[0])} /></div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}><button type="button" onClick={() => setShowPayModal(false)} style={{ flex: 1, padding: '12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>❌ ยกเลิก</button><button type="submit" style={{ flex: 1, padding: '12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>✅ ยืนยันชำระเงิน</button></div>
            <button type="button" onClick={() => setShowPayModal(false)} style={{ width: '100%', marginTop: '15px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline' }}>ไว้ทำทีหลัง (ไปที่หน้าประวัติสั่งซื้อ)</button>
          </form>
        </div>
      </div>
    )}
      
    <nav style={{ background: '#2c3e50', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', position: 'sticky', top: 0, zIndex: 900, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '28px', cursor: 'pointer', padding: 0 }}>☰</button><h2 style={{ margin: 0, letterSpacing: '1px' }}>🛒 BIG SHOP</h2></div>
      <div>{isLoggedIn ? <button onClick={logout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>ออกจากระบบ (Logout)</button> : <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => navigate('/login')} style={{ background: '#3498db', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>เข้าสู่ระบบ</button></div>}</div>
    </nav>

    {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 998, backdropFilter: 'blur(3px)' }} />}

    <div style={{ position: 'fixed', top: 0, left: isSidebarOpen ? 0 : '-300px', width: '260px', height: '100vh', background: '#ffffff', boxShadow: '4px 0 15px rgba(0,0,0,0.1)', transition: 'left 0.3s ease-in-out', zIndex: 999, display: 'flex', flexDirection: 'column' }}>
  <div style={{ padding: '20px', background: '#2c3e50', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ margin: 0 }}>เมนูหลัก</h3><button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>✖</button></div>
  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
    {isLoggedIn && userRole !== 'admin' && <Link to="/profile" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#2c3e50', fontSize: '18px', fontWeight: 'bold', padding: '10px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>👤 โปรไฟล์ของฉัน</Link>}
    <Link to="/" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#2c3e50', fontSize: '18px', fontWeight: 'bold', padding: '10px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>🏠 หน้าแรก</Link>
    {userRole !== 'admin' && <><Link to="/cart" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#2c3e50', fontSize: '18px', fontWeight: 'bold', padding: '10px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>🛒 ตะกร้าสินค้า <span style={{ background: '#e74c3c', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '14px' }}>{cart.length}</span></Link>{isLoggedIn && <Link to="/my-orders" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#2c3e50', fontSize: '18px', fontWeight: 'bold', padding: '10px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>🧾 ประวัติการสั่งซื้อ</Link>}</>}
    {isLoggedIn && userRole === 'admin' && (
      <div style={{ background: '#e8f6f3', borderRadius: '8px', padding: '15px 10px', marginTop: '10px', border: '1px solid #1abc9c' }}>
        <div style={{ color: '#16a085', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', paddingLeft: '5px' }}>⚙️ ระบบหลังบ้าน</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <button onClick={() => { setAdminTab('report'); navigate('/admin'); setIsSidebarOpen(false); }} style={{ textAlign: 'left', background: adminTab === 'report' ? '#1abc9c' : 'transparent', color: adminTab === 'report' ? 'white' : '#2c3e50', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>📊 รายงานสถิติ</button>
          <button onClick={() => { setAdminTab('add'); navigate('/admin'); setIsSidebarOpen(false); }} style={{ textAlign: 'left', background: adminTab === 'add' ? '#1abc9c' : 'transparent', color: adminTab === 'add' ? 'white' : '#2c3e50', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>➕ เพิ่มสินค้าใหม่</button>
          <button onClick={() => { setAdminTab('stock'); navigate('/admin'); setIsSidebarOpen(false); }} style={{ textAlign: 'left', background: adminTab === 'stock' ? '#1abc9c' : 'transparent', color: adminTab === 'stock' ? 'white' : '#2c3e50', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>📦 จัดการสต็อก</button>
          <button onClick={() => { setAdminTab('orders'); navigate('/admin'); setIsSidebarOpen(false); }} style={{ textAlign: 'left', background: adminTab === 'orders' ? '#1abc9c' : 'transparent', color: adminTab === 'orders' ? 'white' : '#2c3e50', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>🧾 รายการสั่งซื้อ</button>
          {/* 🟢 [เพิ่ม]: เมนูจัดการผู้ใช้ */}
          <button onClick={() => { setAdminTab('users'); navigate('/admin'); setIsSidebarOpen(false); }} style={{ textAlign: 'left', background: adminTab === 'users' ? '#1abc9c' : 'transparent', color: adminTab === 'users' ? 'white' : '#2c3e50', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>👥 จัดการผู้ใช้</button>
        </div>
      </div>
    )}
  </div>
</div>

    <Routes>
      <Route path="/" element={
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', color: 'white' }}>
            <h1 style={{ fontSize: '3.5rem', margin: 0, fontWeight: '800', letterSpacing: '-1px' }}>🛍️ BIG1919 SHOP</h1>
            <p style={{ fontSize: '1.3rem', opacity: 0.9, marginTop: '10px' }}>"ช้อปใหญ่ จ่ายน้อย สอยทุกความคุ้ม!"</p>
            <div style={{ marginTop: '30px' }}><input type="text" placeholder="🔍 ค้นหาสินค้าที่ใช่สำหรับคุณ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '15px 25px', width: '85%', maxWidth: '600px', borderRadius: '50px', border: 'none', fontSize: '18px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '25px', flexWrap: 'wrap' }}>
            {['ทั้งหมด', ...new Set(products.map(p => p.category).filter(cat => cat && cat !== 'ทั้งหมด'))].map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '10px 25px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', background: selectedCategory === cat ? '#2c3e50' : 'white', color: selectedCategory === cat ? 'white' : '#333', border: '1px solid #ddd', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: '0.3s' }}>{cat}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px', marginTop: '30px', padding: '0 20px' }}>
            {filteredProducts.map(item => (
              <div key={item.id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', overflow: 'hidden' }}>
                {/* 🟢 [แก้ไข]: เปลี่ยนจาก localhost เป็น Cloud URL (item.image) */}
                {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} /> : <div style={{ fontSize: '80px', padding: '20px', background: '#eee' }}>📦</div>}
                <div style={{ padding: '20px' }}>
                  <h3>{item.name}</h3>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#e74c3c' }}>฿{item.price}</p>
                  <p style={{ color: item.stock > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>{item.stock > 0 ? `คงเหลือ: ${item.stock} ชิ้น` : 'สินค้าหมด'}</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => navigate(`/product/${item.id}`)} style={{ flex: 1, padding: '10px', background: '#ecf0f1', color: '#2c3e50', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>🔍 รายละเอียด</button>
                    <button onClick={() => addToCart(item)} disabled={item.stock <= 0} style={{ flex: 1, background: item.stock > 0 ? '#2c3e50' : '#bdc3c7', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: item.stock > 0 ? 'pointer' : 'not-allowed' }}>{item.stock > 0 ? 'ใส่ตะกร้า' : 'หมด'}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <footer style={{ marginTop: '50px', padding: '40px', background: '#2c3e50', color: 'white', textAlign: 'center' }}><p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>🛍️ BIG SHOP - ร้านค้าอันดับ 1 ของทุกคน</p><p style={{ opacity: 0.7 }}>ติดต่อเรา: 093-112-1917 | Line: @phuwadet5617</p><hr style={{ width: '50px', margin: '20px auto', borderColor: '#555' }} /><p style={{ fontSize: '14px', opacity: 0.5 }}>© 2026 BIG SHOP. All rights reserved.</p></footer>
        </div>
      } />

      <Route path="/profile" element={ isLoggedIn ? <ProfilePage userId={userId} /> : <Navigate to="/login" /> } />
      <Route path="/product/:id" element={<ProductDetailPage products={products} addToCart={addToCart} />} />

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
        <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center' }}>📋 ประวัติการสั่งซื้อของฉัน</h1>
          <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            {myOrders.length === 0 ? <p style={{ textAlign: 'center' }}>ยังไม่มีรายการสั่งซื้อ</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}><th style={{ padding: '12px' }}>เลขที่ออเดอร์</th><th>วันที่สั่ง</th><th>ราคารวม</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
                <tbody>
                  {myOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>#{order.id}</td>
                      <td>{new Date(order.created_at).toLocaleDateString('th-TH')}</td>
                      <td>฿{order.total_price}</td>
                      <td><span style={{ padding: '5px 12px', borderRadius: '15px', fontSize: '12px', background: order.status === 'จัดส่งแล้ว' ? '#55efc4' : '#ffeaa7' }}>{order.status}</span></td>
                      <td>
                        {order.status === 'รอดำเนินการ' && <button onClick={() => cancelOrder(order.id)} style={{ background: '#ff7675', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', marginRight: '5px' }}>ยกเลิก</button>}
                        <button onClick={() => { setCurrentOrderId(order.id); setShowPayModal(true); }} style={{ background: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', marginRight: '5px' }}>💳 จ่ายเงิน</button>
                        <button onClick={() => generatePDF(order)} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', marginRight: '5px' }}>📄 บิล</button>
                        <button onClick={() => deleteOrderHistory(order.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }}>🗑️ ลบ</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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
        <div style={{ padding: '30px' }}>
          <div style={{ borderBottom: '2px solid #ccc', marginBottom: '20px', paddingBottom: '10px' }}><h1>ระบบจัดการหลังบ้าน (Admin)</h1></div>
          {adminTab === 'report' && (
            <div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}><h3 style={{ marginTop: 0 }}>📈 สถิติยอดขาย</h3><div style={{ width: '100%', height: 300 }}><ResponsiveContainer><BarChart data={Object.values(orders.reduce((acc, order) => { if (order.status !== 'ยกเลิก' && order.status !== 'รอดำเนินการ') { const date = new Date(order.created_at).toLocaleDateString('th-TH'); if (!acc[date]) acc[date] = { name: date, ยอดขาย: 0 }; acc[date].ยอดขาย += Number(order.total_price); } return acc; }, {}))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="ยอดขาย" fill="#3498db" /></BarChart></ResponsiveContainer></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#2ecc71', color: 'white', padding: '20px', borderRadius: '15px' }}><p>💰 ยอดขาย</p><h2>฿{totalSales.toLocaleString()}</h2></div>
                <div style={{ background: '#f1c40f', color: 'white', padding: '20px', borderRadius: '15px' }}><p>⏳ รอตรวจสอบ</p><h2>{pendingOrders}</h2></div>
                <div style={{ background: '#3498db', color: 'white', padding: '20px', borderRadius: '15px' }}><p>✅ ส่งแล้ว</p><h2>{completedOrders}</h2></div>
                <div style={{ background: '#9b59b6', color: 'white', padding: '20px', borderRadius: '15px' }}><p>👤 ลูกค้า</p><h2>{totalUsers}</h2></div>
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
        {orders.map(order => (
          <tr key={order.id} style={{ textAlign: 'center', borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '12px' }}>#{order.id}</td>
            
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
      {/* ปุ่มรีเฟรชฉุกเฉินเผื่อข้อมูลค้าง */}
      <button onClick={fetchUsers} style={{ background: '#f1f2f6', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>🔄 รีเฟรชข้อมูล</button>
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
        </div>
      ) : <Navigate to="/login" replace />} />
    </Routes>
  </div>
  );
}

export default App;