/**
# 🛒 Smart Stock - Grocery Store Management System
This project is developed to address the problems of the small scaled and mid scaled businessmen - retailers and shopkeepers.

**Smart Stock** is an intelligent grocery inventory management system designed to help shopkeepers track product expiry dates, manage stock efficiently, and reduce wastage. The system leverages OCR for expiry date detection, offers manual product entry, and provides timely notifications with discount suggestions.

---

## 📌 Features

- 🔍 **OCR-Based Expiry Date Detection** using a trained model.
- 📝 **Manual Product Entry** for flexible data input.
- 🗂️ **SQLite3 Database** for lightweight and fast storage.
- 📆 **Expiry Tracking & Alerts** via email notifications.
- 💬 **WhatsApp Notifications** using Meta API (optional).
- 🌐 **React Frontend Dashboard** with:
  - User Login/Signup
  - Add, Remove, and View Products
  - Profile Management
- 🚀 **Express.js Backend** handling routes and database logic.
- 🔐 Authentication for secure access to user dashboards.

---

## 🧱 Tech Stack

| Layer         | Tech Used              |
|---------------|------------------------|
| Frontend      | HTML, CSS, JavaScript, React |
| Backend       | Node.js, Express.js    |
| Database      | SQLite3                |
| OCR Model     | Python, TensorFlow (hosted on Flask) |
| Notifications | Nodemailer, Meta WhatsApp API |

---

## 🔄 Workflow

1. **User Login/Signup**
2. **Dashboard Access**
3. **Add Item:**
   - Via Image (OCR detects expiry)
   - Via Manual Entry
4. **Items Stored in SQLite3**
5. **Expiry Checks Run Automatically**
6. **Email Alerts Sent to User**
7. *(Optional)* WhatsApp alerts for soon-to-expire or expired items (currently nodemailer is being used to send the alerts using email)

---
**/
