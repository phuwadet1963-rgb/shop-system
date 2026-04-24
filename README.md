🛒 Big Shop - Full Stack E-Commerce Application

Big Shop เป็นเว็บแอปพลิเคชันร้านค้าออนไลน์แบบครบวงจร พัฒนาด้วยเทคโนโลยี Modern Web Stack (MERN Style) รองรับการจัดการสินค้า สมาชิก และการอัปโหลดรูปภาพผ่านระบบ Cloud เพื่อมอบประสบการณ์การช้อปปิ้งที่ลื่นไหลและปลอดภัย

🌟 ฟีเจอร์เด่น (Key Features)

User Authentication: ระบบสมัครสมาชิกและเข้าสู่ระบบด้วยการเข้ารหัสรหัสผ่าน (Bcrypt) และใช้ JWT Token เพื่อรักษาความปลอดภัยข้อมูลผู้ใช้

Product Management: แสดงรายการสินค้าดึงข้อมูลจากฐานข้อมูล MySQL ออนไลน์แบบ Real-time

Cloud Storage: ระบบอัปโหลดและจัดการรูปภาพสินค้าผ่าน Cloudinary ช่วยให้การแสดงผลรูปภาพรวดเร็วและประหยัดพื้นที่เซิร์ฟเวอร์

Responsive Design: หน้าเว็บรองรับการแสดงผลทุกหน้าจอ ทั้งคอมพิวเตอร์ แท็บเล็ต และมือถือ ด้วย Tailwind CSS

Security: เชื่อมต่อฐานข้อมูลผ่านระบบ SSL และปกป้องข้อมูลสำคัญด้วย Environment Variables (.env)

🛠 เทคโนโลยีที่ใช้ (Tech Stack)

หน้าบ้าน (Frontend)

React.js (Vite): โครงสร้างหลักของหน้าเว็บที่เน้นความเร็วและประสิทธิภาพ

Tailwind CSS: เฟรมเวิร์กสำหรับตกแต่ง UI ที่สวยงามและจัดการการแสดงผลบนมือถือ

Axios: ไลบรารีสำหรับเชื่อมต่อและรับ-ส่งข้อมูล API กับฝั่งหลังบ้าน

หลังบ้าน (Backend)

Node.js & Express: ระบบเซิร์ฟเวอร์หลักที่จัดการ API และตรรกะของแอปพลิเคชัน

MySQL: ระบบจัดการฐานข้อมูลเชิงสัมพันธ์สำหรับเก็บข้อมูลสมาชิกและรายการสินค้า

Cloudinary: บริการคลาวด์สำหรับจัดเก็บและปรับแต่งไฟล์รูปภาพออนไลน์

การ Deploy (Hosting)

Vercel: แพลตฟอร์มสำหรับโฮสต์ส่วนหน้าบ้าน (Frontend)

Render: แพลตฟอร์มสำหรับโฮสต์ส่วนหลังบ้าน (Backend)

Aiven.io: บริการฐานข้อมูล MySQL บนคลาวด์ที่มีความเสถียรสูง

📂 โครงสร้างโฟลเดอร์ (Project Structure)

shop-system/
├── backend/            # ส่วนของระบบหลังบ้าน (Node.js)
│   ├── server.js       # ไฟล์หลักของเซิร์ฟเวอร์และ API
│   └── .env            # ไฟล์เก็บค่าคอนฟิกและรหัสผ่านต่างๆ (ไม่ถูกอัปโหลดขึ้น GitHub)
├── frontend/           # ส่วนของหน้าเว็บ (React)
│   ├── src/
│   │   ├── components/ # ส่วนประกอบย่อยต่างๆ ของหน้าเว็บ (Navbar, Footer, etc.)
│   │   └── App.jsx     # ไฟล์หลักที่จัดการเส้นทางและตรรกะของ React
│   └── vercel.json     # ไฟล์ตั้งค่าสำหรับการรัน Routing บน Vercel
└── .gitignore          # ระบุรายการไฟล์และโฟลเดอร์ที่ไม่ต้องอัปโหลดขึ้น GitHub


🚀 วิธีการติดตั้งและรันโปรเจกต์ (Installation)

Clone โปรเจกต์:

git clone [https://github.com/phuwadet1963-rgb/shop-system.git](https://github.com/phuwadet1963-rgb/shop-system.git)
cd shop-system


ติดตั้งและรัน Backend:

cd backend
npm install
# สร้างไฟล์ .env และใส่ค่าการเชื่อมต่อฐานข้อมูลของคุณ
node server.js


ติดตั้งและรัน Frontend:

cd ../frontend
npm install
npm run dev


📝 ข้อมูลผู้พัฒนา

ชื่อ: บิ๊ก (Phuwadet)

สถาบัน: มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน (RMUTI)

คณะ/สาขา: ระบบสารสนเทศ (Information Systems - IS)

© 2026 BIG SHOP. All rights reserved.
