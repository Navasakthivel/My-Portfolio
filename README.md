# 🚀 SM Navasakthivel — Personal Portfolio

A modern, responsive personal portfolio website for **SM Navasakthivel**, an AI & Data Science student, showcasing his education, skills, professional experience, and projects. The site includes a fully functional contact form backed by Firebase, and a private, authenticated **Admin Dashboard** for managing messages and tracking visitor analytics.

**🔗 Live Repository:** [github.com/Navasakthivel/My-Portfolio](https://github.com/Navasakthivel/My-Portfolio)

---

## ✨ Features

- **Single-page responsive design** — smooth-scrolling navigation with a mobile-friendly hamburger menu
- **Dynamic sections** — Home, About, Education, Skills, Experience, Projects, and Contact
- **Animated UI** — scroll-triggered fade-in animations and animated skill progress bars
- **Project showcase** — projects are loaded dynamically from `projects.json`, each with a details modal (description, tech stack, demo video, and source code links)
- **Resume viewer** — in-page PDF resume preview with a direct download option
- **Contact form** — messages are captured and stored via Firebase
- **Secure Admin Dashboard**
  - Firebase Authentication–protected login
  - **Analytics tab** — total views, total messages, today's views, unread messages, and visitor trend / message category charts (via Chart.js)
  - **Messages tab** — view, filter (all / unread / read), and manage contact submissions in real time
  - **Export & Sync tab** — export data to Excel/CSV/JSON, plus Google Sheets integration with manual and auto-sync (every 30 minutes)
- **Font Awesome icons** for a polished, professional look

---

## 🛠️ Tech Stack

| Category            | Technologies |
|----------------------|--------------|
| **Frontend**         | HTML5, CSS3, Vanilla JavaScript |
| **Backend / Data**   | Firebase (Authentication, Realtime Database) |
| **Charts**           | Chart.js |
| **Icons**            | Font Awesome 6 |
| **Integrations**     | Google Sheets (Apps Script sync), CSV/Excel/JSON export |

---

## 📁 Project Structure

```
My-Portfolio/
├── index.html          # Main HTML structure (portfolio + admin dashboard)
├── styles.css           # Global styles and responsive layout
├── script.js             # Core site interactions (nav, scroll animations, project modal)
├── admin.js               # Admin dashboard logic (auth, analytics, messages, export/sync)
├── firebase-contact.js     # Handles contact form submission (referenced, not committed)
├── projects.json            # Project data consumed dynamically by the Projects section
└── favicon.png                # Site favicon
```

> **Note:** `index.html` also references a few assets that aren't currently tracked in the repository — `firebase-contact.js`, `photo.jpeg`, and `Navasakthivel resume.pdf`. Make sure these are added locally (or via Git LFS for media) before deploying.

---

## 📂 Featured Projects

The **Projects** section is rendered dynamically from [`projects.json`](./projects.json). Currently featured:

1. **[Smart-Exam-Evaluator](https://github.com/Navasakthivel/Auto-Evaluator.git)** — An AI-powered exam evaluation platform that automates grading of handwritten answer sheets using Google Gemini, Flask, and OpenCV, with Excel-based performance reporting.
2. **FloraMart – Garland Ordering System** — A full-stack wedding flower bulk-ordering platform built with Java 25, Spring Boot, React, and MySQL, featuring JWT authentication, role-based dashboards, and UPI payment integration.
   - [Frontend](https://github.com/Navasakthivel/Flower-order-Application-Frontend.git) · [Backend](https://github.com/Navasakthivel/Flower-order-Application-Backend.git)
3. **[GradeSphere – College CGPA Management System](https://github.com/Navasakthivel/College-CGPA-Calc.git)** — A full-stack GPA/CGPA management system with Firebase-backed real-time computation and role-based access for Admin, HOD, Staff, and Students.

To add a new project, simply append an entry to `projects.json` following the existing schema (`title`, `shortDescription`, `fullDescription`, `icon`, `tags`, `techStack`, `demoVideo`, `sourceCode`).

---

## ⚙️ Getting Started

### Prerequisites
- A modern web browser
- A Firebase project (for the contact form and admin dashboard functionality)
- [Node.js](https://nodejs.org/) *(optional — only needed if you introduce a local dev server or build tooling)*

### Run Locally

```bash
# Clone the repository
git clone https://github.com/Navasakthivel/My-Portfolio.git
cd My-Portfolio

# Serve the site locally (any static server works)
npx serve .
# or
python3 -m http.server 8000
```

Then open `http://localhost:8000` (or the port shown) in your browser.

### Firebase Setup

The admin dashboard and contact form depend on Firebase. To configure your own instance:

1. Create a project at the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password) and **Realtime Database**.
3. Replace the `firebaseConfig` object in `admin.js` with your project's credentials.
4. Add a `firebase-contact.js` module that writes contact-form submissions to your Realtime Database.

---

## 📊 Admin Dashboard

The admin panel is gated behind Firebase Authentication and provides:

- Real-time **analytics** (views, messages, unread counts) with visual charts
- A searchable, filterable **inbox** for contact form messages
- **Data export** to Excel, CSV, or JSON
- Optional **Google Sheets sync**, with a configurable auto-sync interval

Access is restricted to authorized admin credentials configured in Firebase.

---

## 📬 Contact

- **Email:** navasakthivel2005@gmail.com
- **LinkedIn:** [linkedin.com/in/navasakthivel](https://www.linkedin.com/in/navasakthivel)
- **GitHub:** [github.com/Navasakthivel](https://github.com/Navasakthivel)
- **LeetCode:** [leetcode.com/u/NAVASAKTHIVEL](https://leetcode.com/u/NAVASAKTHIVEL/)

---

## 📄 License

This project is currently unlicensed. If you intend to reuse or adapt this portfolio, consider adding an [MIT License](https://choosealicense.com/licenses/mit/) or another license of your choice.

---

<p align="center">© 2026 SM Navasakthivel. All rights reserved.</p>
