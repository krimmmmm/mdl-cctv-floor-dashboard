# MDL CCTV Floor Plan Dashboard - Requirements

## Project Overview
สร้าง Interactive Dashboard Floor Plan สำหรับโปรเจกต์ CCTV ที่สามารถแสดงและอัปเดตสถานะของอุปกรณ์ต่างๆ

## Floor Plan Components

### 1. Background
- ใช้ Floor Plan เป็น Background
- สามารถสร้าง Floor Plan ใหม่เพื่อความสวยงาม

### 2. CCTV Cameras (64 จุด)
**Type 1: New Installation (27 จุด)**
- ใช้กรอบวงกลมสีเหลือง
- Status Updates:
  - Wiring UTP: ขีดสีเขียวเส้นหนา
  - Install Wall Mounting: รูป Wall Mounting Bracket + ขีดสีเขียว
  - Install Dome Camera: รูป Dome Camera + Bracket + ขีดสีเขียว
  - Online: สีเขียวกระพริบ

**Type 2: Replacement (37 จุด)**
- ใช้กรอบสี่เหลี่ยมสีน้ำเงิน
- Status Updates: เหมือน Type 1

**Default Display:**
- ถ้ายังไม่มี Update: แสดงเฉพาะกรอบ (วงกลมเหลือง หรือ สี่เหลี่ยมน้ำเงิน)

### 3. RACK Equipment (2 Type)

**Type 1: Old RACK (Blue Square)**
- ตำแหน่งตามเดิม
- Status Updates:
  1. AC POWER
  2. UTP
  3. POE Switch (Yes/No)
  4. Fiber Optic (Yes/No)
  5. Ready
- Online Status: สีเขียวกระพริบ

**Type 2: New RACK (Green Square → WALL RACK 19" GERMAN 6U)**
- Status "Install Rack": แสดงรูป WALL RACK 19" GERMAN 6U
- Status Updates: เหมือน Type 1
- Online Status: สีเขียวกระพริบ

### 4. CABINET Equipment (Orange Square → CCTV OUTDOOR STEEL CABINET)
- Status "Install Cabinet": แสดงรูป CCTV OUTDOOR STEEL CABINET
- Status Updates:
  1. AC POWER
  2. UTP
  3. POE Switch (Yes/No)
  4. Fiber Optic (Yes/No)
  5. Ready
- Online Status: สีเขียวกระพริบ

### 5. Fiber Optic Routes (Red Lines)
- แสดงเส้นสีแดงตามแนว Route ใน Floor Plan
- สามารถกดเพื่อ Update Status

## Design Notes
- Floor Plan: สี่เหลี่ยมขาว + เส้นขอบดำ
- Interactive Elements: Click เพื่อ Update Status
- Color Scheme:
  - Yellow Circle: Type 1 Cameras
  - Blue Square: Type 2 Cameras / Old RACK
  - Green Square: New RACK
  - Orange Square: New CABINET
  - Red Lines: Fiber Optic Routes
  - Green Thick Lines: Wiring Status
  - Green Blinking: Online Status

## Technical Requirements
- React 19 + Tailwind 4
- SVG for Floor Plan and Equipment Icons
- Interactive Modal/Dialog for Status Updates
- State Management for Equipment Status
- Responsive Design
