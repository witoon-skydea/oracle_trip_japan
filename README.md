# Oracle Trip

Oracle Trip เป็นเว็บแอปพลิเคชันสำหรับจัดการข้อมูลแหล่งท่องเที่ยวในญี่ปุ่น พัฒนาด้วย Node.js, Express, และ MongoDB

## ฟีเจอร์

- แสดงรายการแหล่งท่องเที่ยวทั้งหมด
- ดูรายละเอียดแหล่งท่องเที่ยวแต่ละแห่ง
- เพิ่มแหล่งท่องเที่ยวใหม่
- แก้ไขข้อมูลแหล่งท่องเที่ยว
- ลบข้อมูลแหล่งท่องเที่ยว

## การติดตั้ง

1. โคลนโปรเจค
```
git clone https://github.com/witoon-skydea/oracle_trip_japan.git
cd oracle_trip_japan
```

2. ติดตั้ง dependencies
```
npm install
```

3. สร้างไฟล์ .env และกำหนดค่า
```
PORT=3000
MONGODB_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/oracle_trip?retryWrites=true&w=majority
```

4. รันแอปพลิเคชัน
```
npm run dev
```

5. เปิดเบราว์เซอร์และไปที่ http://localhost:3000

## เทคโนโลยีที่ใช้

- Node.js
- Express.js
- MongoDB & Mongoose
- EJS (Template Engine)
- HTML, CSS, JavaScript