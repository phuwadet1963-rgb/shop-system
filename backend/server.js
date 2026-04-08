const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// 🟢 [แก้ไข]: นำเข้า Cloudinary แทน fs และ path เดิม
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const SECRET_KEY = "my_super_secret_key"; 
const saltRounds = 10; 

const app = express();
app.use(cors());
app.use(express.json());

// 🟢 [แก้ไข]: ตั้งค่าการเชื่อมต่อกับ Cloudinary (นำข้อมูลจากหน้าเว็บ Cloudinary มาใส่ตรงนี้)
cloudinary.config({ 
  cloud_name: 'ใส่_CLOUD_NAME_ของคุณ', 
  api_key: 'ใส่_API_KEY_ของคุณ', 
  api_secret: 'ใส่_API_SECRET_ของคุณ' 
});

// 🟢 [แก้ไข]: เปลี่ยนที่เก็บรูปจากโฟลเดอร์ในเครื่อง เป็น Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'big_shop_uploads', // ชื่อโฟลเดอร์บน Cloud
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});
const upload = multer({ storage: storage }); 

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "my_shop"
});

// --- 4. API (CRUD) ---

// ดึงสินค้าทั้งหมด (ห้ามแก้ไข)
app.get('/api/products', (req, res) => {
    db.query("SELECT * FROM products", (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

// [CREATE] เพิ่มสินค้าใหม่
app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, price, stock, description, category } = req.body; 
  // 🟢 [แก้ไข]: เปลี่ยนจาก req.file.filename เป็น req.file.path (เพื่อให้ได้ URL เต็ม)
  const image = req.file ? req.file.path : null;

  const sql = "INSERT INTO products (name, price, stock, description, image, category) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [name, price, stock, description, image, category], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "เพิ่มสินค้าสำเร็จ!" });
  });
});

// [UPDATE] แก้ไขสินค้า
app.put('/api/products/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, price, stock, description, category } = req.body; 

    let sql = "UPDATE products SET name=?, price=?, stock=?, description=?, category=? WHERE id=?";
    let params = [name, price, stock, description, category, id];

    if (req.file) {
        // 🟢 [แก้ไข]: เปลี่ยนจาก req.file.filename เป็น req.file.path
        sql = "UPDATE products SET name=?, price=?, stock=?, description=?, category=?, image=? WHERE id=?";
        params = [name, price, stock, description, category, req.file.path, id];
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "แก้ไขสินค้าสำเร็จ" });
    });
});

// [DELETE] ลบสินค้า (ห้ามแก้ไขส่วน SQL)
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    // หมายเหตุ: การลบรูปบน Cloudinary ต้องใช้ Public ID หากต้องการประหยัดพื้นที่ 
    // แต่ในขั้นต้นนี้ เราจะเน้นลบข้อมูลใน Database ให้สำเร็จก่อนครับ
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "ลบสำเร็จ!" });
    });
});

// [POST] สร้างออเดอร์ใหม่ (ห้ามแก้ไข)
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

// ดึงออเดอร์ทั้งหมด (ห้ามแก้ไข)
app.get('/api/orders', (req, res) => {
    const sql = "SELECT * FROM orders ORDER BY created_at DESC";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

// อัปเดตสถานะออเดอร์ (ห้ามแก้ไข)
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

// API ส่งหลักฐานการชำระเงิน (อัปเดต URL รูปสลิป)
app.put('/api/orders/pay/:id', upload.single('slip'), (req, res) => {
    const { id } = req.params;
    const { address, phone } = req.body;
    // 🟢 [แก้ไข]: เปลี่ยนเป็น req.file.path
    const slip_image = req.file ? req.file.path : null;

    const sql = "UPDATE orders SET address = ?, phone = ?, slip_image = ?, status = 'ชำระเงินแล้ว' WHERE id = ?";
    db.query(sql, [address, phone, slip_image, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "ส่งหลักฐานการชำระเงินเรียบร้อย!" });
    });
});

// ลบประวัติออเดอร์ (ห้ามแก้ไข)
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

// ดึงรายละเอียดสินค้าในออเดอร์ (ห้ามแก้ไข)
app.get('/api/orders/:id/items', (req, res) => {
  const orderId = req.params.id;
  const sql = `SELECT p.name, p.price, oi.quantity FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`;
  db.query(sql, [orderId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ระบบล็อกอิน (ห้ามแก้ไข)
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

// ดึงประวัติสั่งซื้อของผู้ใช้ (ห้ามแก้ไข)
app.get('/api/my-orders/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// สมัครสมาชิก (ห้ามแก้ไข)
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const checkUser = "SELECT * FROM users WHERE username = ?";
        db.query(checkUser, [username], (err, result) => {
            if (result.length > 0) return res.status(400).json({ message: "ชื่อนี้มีคนใช้แล้ว" });
            const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, 'user')";
            db.query(sql, [username, hashedPassword], (err, result) => {
                if (err) return res.status(500).json(err);
                return res.json({ message: "สมัครสมาชิกแบบปลอดภัยสำเร็จ!" });
            });
        });
    } catch (error) { res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้ารหัส" }); }
});

// ดึงข้อมูลโปรไฟล์ (ห้ามแก้ไข)
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  db.query("SELECT id, username, email, address, phone, profile_picture FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]); 
  });
});

// อัปเดตโปรไฟล์ (อัปเดต URL รูปโปรไฟล์)
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
      // 🟢 [แก้ไข]: เปลี่ยนเป็น req.file.path
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

app.listen(5000, () => console.log("หลังบ้านพร้อมที่พอร์ต 5000 (Cloudinary Mode)!"));