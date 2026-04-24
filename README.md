🛒 Big Shop - Full Stack E-Commerce Application

Big Shop เป็นเว็บแอปพลิเคชันร้านค้าออนไลน์แบบครบวงจร (Full Stack) ที่พัฒนาขึ้นเพื่ออำนวยความสะดวกในการซื้อขายสินค้าออนไลน์ โดยรองรับทั้งระบบหน้าบ้าน (Frontend) สำหรับลูกค้า และระบบหลังบ้าน (Backend) สำหรับจัดการข้อมูลที่มีความปลอดภัยสูง

🔗 Live Demo

Frontend: shop-system-opal.vercel.app

Backend API: shop-system-backend.onrender.com

🌟 ฟีเจอร์เด่น (Key Features)

🔐 User Authentication: ระบบสมัครสมาชิกและเข้าสู่ระบบด้วยการเข้ารหัสรหัสผ่าน (Bcrypt) และการใช้ JSON Web Token (JWT) เพื่อความปลอดภัย

📦 Product Management: ดึงข้อมูลสินค้าจากฐานข้อมูล MySQL มาแสดงผลแบบ Real-time

☁️ Cloud Storage: ระบบจัดการรูปภาพสินค้าผ่าน Cloudinary ช่วยให้การโหลดรูปภาพรวดเร็วและประหยัดพื้นที่เซิร์ฟเวอร์

📱 Responsive Design: ออกแบบด้วย Tailwind CSS ทำให้หน้าเว็บรองรับการแสดงผลทุกอุปกรณ์ (Mobile, Tablet, Desktop)

🛡️ Security & Environment: ปกป้องข้อมูลสำคัญด้วย Environment Variables และเชื่อมต่อฐานข้อมูลผ่านระบบ SSL

🛠 เทคโนโลยีที่ใช้ (Tech Stack)

หน้าบ้าน (Frontend)

React.js (Vite): โครงสร้างโปรเจกต์ยุคใหม่ที่รวดเร็ว

Tailwind CSS: สำหรับการตกแต่ง UI ที่สวยงามและทันสมัย

Axios: สำหรับการรับ-ส่งข้อมูลกับ API หลังบ้าน

Lucide React: ไอคอนที่สวยงามและใช้งานง่าย

หลังบ้าน (Backend)

Node.js & Express: ระบบ Server-side ที่ทรงพลัง

MySQL: ระบบฐานข้อมูลเชิงสัมพันธ์ที่มีประสิทธิภาพ

Cloudinary SDK: จัดการไฟล์รูปภาพบนระบบคลาวด์

JWT & Bcrypt: ระบบยืนยันตัวตนและการเข้ารหัสข้อมูล

การ Deploy (Hosting)

Vercel: สำหรับโฮสต์หน้าบ้าน (Frontend)

Render: สำหรับโฮสต์หลังบ้าน (Backend)

Aiven.io: บริการฐานข้อมูล MySQL ออนไลน์ที่มีความเสถียรสูง

📂 โครงสร้างโฟลเดอร์ (Project Structure)

shop-system/
├── backend/            # ระบบหลังบ้าน (Node.js)
│   ├── uploads/        # โฟลเดอร์พักไฟล์รูปภาพ
│   ├── server.js       # ไฟล์หลักของเซิร์ฟเวอร์และ API
│   └── .env            # ไฟล์เก็บความลับ (Database & Cloudinary Config)
├── frontend/           # ระบบหน้าบ้าน (React)
│   ├── src/
│   │   ├── assets/     # ไฟล์ Static (รูปภาพ, ไอคอน)
│   │   ├── components/ # ส่วนประกอบย่อยของหน้าเว็บ
│   │   ├── App.jsx     # ไฟล์ควบคุมเส้นทางและตรรกะหน้าเว็บ
│   │   └── config.js   # ตั้งค่า URL ของ Backend
│   └── vercel.json     # ตั้งค่าระบบ Routing สำหรับ Vercel
└── .gitignore          # ระบุไฟล์ที่ไม่ต้องอัปโหลดขึ้น GitHub


🚀 วิธีการติดตั้งเพื่อพัฒนาต่อ (Local Installation)

Clone โปรเจกต์:

git clone [https://github.com/phuwadet1963-rgb/shop-system.git](https://github.com/phuwadet1963-rgb/shop-system.git)
cd shop-system


ตั้งค่า Backend:

cd backend
npm install


สร้างไฟล์ .env ในโฟลเดอร์ backend และใส่ข้อมูลดังนี้:

PORT=5000
DB_HOST=your_aiven_host
DB_USER=avnadmin
DB_PASS=your_password
DB_NAME=defaultdb
DB_PORT=23049
SECRET_KEY=your_secret_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret


ตั้งค่า Frontend:

cd ../frontend
npm install
npm run dev


📝 ข้อมูลผู้พัฒนา

ชื่อ: Big (Phuwadet)

สถาบัน: Rajamangala University of Technology Isan (RMUTI)

สาขา: ระบบสารสนเทศ (Information Systems - IS)

© 2026 BIG SHOP. All rights reserved.
