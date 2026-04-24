require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// 🟢 Cloudinary Setup
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const SECRET_KEY = "my_super_secret_key"; 
const saltRounds = 10; 

const app = express();
app.use(cors());app.use(cors({
  origin: "*", // หรือใส่ URL ของหน้าเว็บคุณที่จะทำในสเต็ปถัดไป
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// 🟢 [สำคัญ]: ใส่ข้อมูล Cloudinary ของคุณที่นี่
cloudinary.config({ 
  cloud_name: 'dqpr5ll6u', 
  api_key: '516198845634898', 
  api_secret: 'PAoBcSz-UNtJ_N-OB7byupF1lL8' 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'big_shop_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});
const upload = multer({ storage: storage }); 

// เปลี่ยนจากค่าเดิมที่เป็นข้อความตรงๆ เป็น process.env.ชื่อตัวแปร
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect((err) => {
    if (err) {
        console.error("❌ เชื่อมต่อฐานข้อมูลล้มเหลว:", err);
        return;
    }
    console.log("✅ เชื่อมต่อฐานข้อมูล Aiven Cloud สำเร็จ!");

    
    
    // 🟠 [แถมให้]: สร้างตารางอัตโนมัติถ้ายังไม่มี
    const createTables = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        email VARCHAR(255),
        address TEXT,
        phone VARCHAR(20),
        profile_picture TEXT
    );
    CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        price DECIMAL(10,2),
        stock INT,
        description TEXT,
        image TEXT,
        category VARCHAR(100)
    );
    CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        total_price DECIMAL(10,2),
        items_count INT,
        user_id INT,
        status VARCHAR(50) DEFAULT 'รอดำเนินการ',
        address TEXT,
        phone VARCHAR(20),
        slip_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        product_id INT,
        quantity INT
    );`;

    // รันคำสั่งสร้างตาราง (แยกทีละคำสั่งเพื่อความชัวร์)
    const sqlStatements = createTables.split(';').filter(s => s.trim());
    sqlStatements.forEach(sql => {
        db.query(sql, (err) => { if (err) console.log("แจ้งเตือนการสร้างตาราง:", err.message); });
    });
});

// --- API (CRUD) ส่วนที่เหลือเหมือนเดิมที่คุณให้มา ---

app.get('/api/products', (req, res) => {
    db.query("SELECT * FROM products", (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, price, stock, description, category } = req.body; 
  const image = req.file ? req.file.path : null;
  const sql = "INSERT INTO products (name, price, stock, description, image, category) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [name, price, stock, description, image, category], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "เพิ่มสินค้าสำเร็จ!" });
  });
});

app.put('/api/products/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, price, stock, description, category } = req.body; 
    let sql = "UPDATE products SET name=?, price=?, stock=?, description=?, category=? WHERE id=?";
    let params = [name, price, stock, description, category, id];
    if (req.file) {
        sql = "UPDATE products SET name=?, price=?, stock=?, description=?, category=?, image=? WHERE id=?";
        params = [name, price, stock, description, category, req.file.path, id];
    }
    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "แก้ไขสินค้าสำเร็จ" });
    });
});

app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "ลบสำเร็จ!" });
    });
});

app.post('/api/orders', (req, res) => {
  const { total_price, items_count, user_id, cartItems } = req.body;
  const sqlOrder = "INSERT INTO orders (total_price, items_count, user_id, status) VALUES (?, ?, ?, 'รอดำเนินการ')";
  db.query(sqlOrder, [total_price, items_count, user_id], (err, result) => {
    if (err) return res.status(500).json(err);
    const orderId = result.insertId;
    if (cartItems && cartItems.length > 0) {
      const itemCounts = {};
      cartItems.forEach(item => { itemCounts[item.id] = (itemCounts[item.id] || 0) + 1; });
      const values = Object.keys(itemCounts).map(productId => [orderId, productId, itemCounts[productId]]);
      const sqlItems = "INSERT INTO order_items (order_id, product_id, quantity) VALUES ?";
      db.query(sqlItems, [values], (err2) => { if (err2) console.log("บันทึกรายละเอียดบิลพลาด:", err2); });
    }
    res.json({ orderId: orderId, message: "สั่งซื้อสำเร็จ" });
  });
});

app.get('/api/orders', (req, res) => {
    const sql = "SELECT * FROM orders ORDER BY created_at DESC";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

app.put('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  const updateSql = "UPDATE orders SET status = ? WHERE id = ?";
  db.query(updateSql, [status, orderId], (err, result) => {
    if (err) return res.status(500).json(err);
    if (status === 'จัดส่งแล้ว') {
      const getItemsSql = "SELECT product_id, quantity FROM order_items WHERE order_id = ?";
      db.query(getItemsSql, [orderId], (err, items) => {
        if (err) return;
        items.forEach(item => {
          const cutStockSql = "UPDATE products SET stock = stock - ? WHERE id = ?";
          db.query(cutStockSql, [item.quantity, item.product_id], (err3) => {});
        });
      });
    }
    res.json({ message: "อัปเดตสถานะสำเร็จ" });
  });
});

app.put('/api/orders/pay/:id', upload.single('slip'), (req, res) => {
    const { id } = req.params;
    const { address, phone } = req.body;
    const slip_image = req.file ? req.file.path : null;
    const sql = "UPDATE orders SET address = ?, phone = ?, slip_image = ?, status = 'ชำระเงินแล้ว' WHERE id = ?";
    db.query(sql, [address, phone, slip_image, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "ส่งหลักฐานการชำระเงินเรียบร้อย!" });
    });
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const deleteItemsSql = "DELETE FROM order_items WHERE order_id = ?";
  db.query(deleteItemsSql, [id], (err1) => {
    if (err1) return res.status(500).json(err1);
    const deleteOrderSql = "DELETE FROM orders WHERE id = ?";
    db.query(deleteOrderSql, [id], (err2) => {
      if (err2) return res.status(500).json(err2);
      res.json({ message: "ลบประวัติการสั่งซื้อเรียบร้อยแล้ว!" });
    });
  });
});

app.get('/api/orders/:id/items', (req, res) => {
  const orderId = req.params.id;
  const sql = `SELECT p.name, p.price, oi.quantity FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`;
  db.query(sql, [orderId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], async (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) {
            const match = await bcrypt.compare(password, result[0].password);
            if (match) {
                res.json({ token: "mock_token_" + result[0].id, role: result[0].role, id: result[0].id });
            } else {
                res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
            }
        } else {
            res.status(404).json({ message: "ไม่พบชื่อผู้ใช้งานนี้" });
        }
    });
});

app.get('/api/my-orders/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const checkUser = "SELECT * FROM users WHERE username = ?";
        
        // 1. ตรวจสอบชื่อผู้ใช้ซ้ำ (เพิ่ม err เข้ามาใน Callback)
        db.query(checkUser, [username], (err, result) => {
            // ดักจับ Error จากฐานข้อมูลก่อน
            if (err) {
                console.error("❌ Error Checking User:", err);
                return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล" });
            }

            // ตรวจสอบว่ามี User นี้อยู่แล้วหรือไม่ (เช็คความปลอดภัยของ result ก่อนอ่าน length)
            if (result && result.length > 0) {
                return res.status(400).json({ message: "ชื่อนี้มีคนใช้แล้ว" });
            }

            // 2. ถ้าชื่อไม่ซ้ำ ให้ทำการบันทึกข้อมูล
            const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, 'user')";
            db.query(sql, [username, hashedPassword], (err2, result2) => {
                if (err2) {
                    console.error("❌ Error Inserting User:", err2);
                    return res.status(500).json({ message: "สมัครสมาชิกไม่สำเร็จ" });
                }
                return res.json({ message: "สมัครสมาชิกแบบปลอดภัยสำเร็จ!" });
            });
        });
    } catch (error) { 
        console.error("❌ Hashing Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้ารหัสข้อมูล" }); 
    }
});

app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  db.query("SELECT id, username, email, address, phone, profile_picture FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]); 
  });
});

app.put('/api/users/:id', upload.single('profile_picture'), async (req, res) => {
  const userId = req.params.id;
  const { username, email, address, phone, password } = req.body;
  try {
    let sql = "UPDATE users SET username = ?, email = ?, address = ?, phone = ?";
    let params = [username, email, address, phone];
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql += ", password = ?";
      params.push(hashedPassword);
    }
    if (req.file) {
      sql += ", profile_picture = ?";
      params.push(req.file.path);
    }
    sql += " WHERE id = ?";
    params.push(userId);
    db.query(sql, params, (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว!" });
    });
  } catch (error) { res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้ารหัสผ่าน" }); }
});

// 1. ดึงรายชื่อผู้ใช้ทั้งหมด (เหมือนเดิมแต่จัดให้ดูง่ายขึ้น)
app.get('/api/users', (req, res) => {
  const sql = 'SELECT id, username, email, role, status FROM users ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// 2. แก้ไขข้อมูล/ระงับบัญชี
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { role, status } = req.body;

  // ตรวจสอบเบื้องต้นว่ามีข้อมูลส่งมาไหม
  if (!role || !status) {
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน (ต้องการ role และ status)' });
  }

  const sqlUpdate = 'UPDATE users SET role = ?, status = ? WHERE id = ?';
  
  db.query(sqlUpdate, [role, status, id], (err, result) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ message: 'ไม่สามารถอัปเดตข้อมูลได้' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้งานที่ต้องการอัปเดต' });
    }

    // ✅ แทนที่จะส่งแค่ข้อความ ให้ส่งข้อมูลที่อัปเดตแล้วกลับไป หรือแค่ยืนยันความสำเร็จ
    // เพื่อให้ Frontend มั่นใจว่าฐานข้อมูลเปลี่ยนแล้วจริงๆ
    res.json({ 
      success: true, 
      message: 'อัปเดตสถานะสำเร็จ',
      updatedUser: { id, role, status } 
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 เซิร์ฟเวอร์รันที่พอร์ต ${PORT} (Aiven Cloud Mode)`));