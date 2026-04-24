# 🛒 Big Shop - Full Stack E-Commerce Application

**Big Shop** เป็นเว็บแอปพลิเคชันร้านค้าออนไลน์แบบครบวงจร พัฒนาด้วยเทคโนโลยี Modern Web Stack (MERN Style) รองรับการจัดการสินค้า สมาชิก และการอัปโหลดรูปภาพผ่านระบบ Cloud

---

## 🌟 ฟีเจอร์เด่น (Key Features)
* **User Authentication:** ระบบสมัครสมาชิกและเข้าสู่ระบบด้วยการเข้ารหัสรหัสผ่าน (Bcrypt) และใช้ JWT Token
* **Product Management:** แสดงรายการสินค้าดึงข้อมูลจากฐานข้อมูล MySQL
* **Cloud Storage:** ระบบอัปโหลดและจัดการรูปภาพสินค้าผ่าน Cloudinary
* **Responsive Design:** หน้าเว็บรองรับการแสดงผลทั้งบนคอมพิวเตอร์และมือถือ
* **Security:** เชื่อมต่อฐานข้อมูลผ่านระบบ SSL และซ่อนข้อมูลสำคัญด้วย Environment Variables

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

### **หน้าบ้าน (Frontend)**
* **React.js (Vite):** โครงสร้างหลักของหน้าเว็บ
* **Tailwind CSS:** สำหรับการตกแต่งหน้าตาเว็บ
* **Axios:** สำหรับการเชื่อมต่อ API กับหลังบ้าน

### **หลังบ้าน (Backend)**
* **Node.js & Express:** ระบบ Server และ API
* **MySQL:** ฐานข้อมูลสำหรับเก็บข้อมูลสมาชิกและสินค้า
* **Cloudinary:** บริการเก็บไฟล์รูปภาพออนไลน์

### **การ Deploy (Hosting)**
* **Vercel:** สำหรับโฮสต์หน้าบ้าน (Frontend)
* **Render:** สำหรับโฮสต์หลังบ้าน (Backend)
* **Aiven.io:** บริการฐานข้อมูล MySQL ออนไลน์

---

## 📂 โครงสร้างโฟลเดอร์ (Project Structure)

```text
shop-system/
├── backend/            # ส่วนของระบบหลังบ้าน (Node.js)
│   ├── server.js       # ไฟล์หลักของเซิร์ฟเวอร์
│   └── .env            # ไฟล์เก็บรหัสผ่าน (ไม่ได้อัปโหลดขึ้น GitHub)
├── frontend/           # ส่วนของหน้าเว็บ (React)
│   ├── src/
│   │   ├── components/ # คอมโพเนนต์ย่อยของหน้าเว็บ
│   │   └── App.jsx     # ไฟล์หลักของ React
│   └── vercel.json     # ตั้งค่า Routing สำหรับ Vercel
└── .gitignore          # ระบุไฟล์ที่ไม่ต้องการให้อัปโหลด
