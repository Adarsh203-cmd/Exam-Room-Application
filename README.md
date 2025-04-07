#Exam-Room-Application 


# 📝 Exam Room Application

The **Exam Room Application** is a web-based platform designed to automate and streamline the online examination process for organizations handling a large number of candidates. It provides a secure, efficient, and role-based environment for managing exams, candidates, results, and analytics.

---

## 📌 Table of Contents
- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Modules](#modules)
- [Getting Started](#getting-started)
- [Working as a Team](#working-as-a-team)
- [Git Workflow](#git-workflow)
- [Contributing](#contributing)
- [Project Management](#project-management)
- [License](#license)

---

## 📖 About the Project

Traditional exam management methods are inefficient and error-prone. This system aims to:
- Automate exam creation, candidate and exam allotment
- Support online exam-taking interface
- Enable role-based access (Admin, Invigilator, Candidate)
- Provide real-time results and reports
- Enhance scalability and transparency

---

## ⚙️ Tech Stack

| Part        | Technology         |
|-------------|--------------------|
| Backend     | Django (Python)    |
| Frontend    | ReactJS            |
| Database    | PostgreSQL         |
| Versioning  | Git + GitHub       |
| Project Mgmt| Notion (or Trello) |

---

## 🗂 Folder Structure
Exam-Room-Application/ ├── backend/ # Django backend │ └── exam_content/ │ └── exam_allotment/ │ └── ... ├── frontend/ # ReactJS frontend │ └── exam-ui/ ├── .gitignore └── README.md

---

## 📦 Modules (Under Development)

1. **Exam Content Module** – Create and manage questions, sections, and papers
2. **Candidate Allotment Module** – Register and assign candidates to exams
3. **Exam Allotment Module** – Schedule and assign exams
4. **Exam Taker Module** – User interface for taking exams
5. **Exam Assessment Module** – Auto/manual grading logic
6. **Admin Module** – Manage all users, settings, and data
7. **Dashboard & Reporting** – Visual analytics for performance & attendance

---

## 🚀 Getting Started

### 🔧 Backend Setup (Django)

```bash
cd backend
python -m venv env
source env/bin/activate   # Windows: env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


### 🌐 Frontend Setup (React)
cd frontend
npx create-react-app exam-ui
cd exam-ui
npm start



### 🌳 Git Workflow
Clone repo once

```bash
Copy
Edit
git clone https://github.com/yourusername/Exam-Room-Application.git
cd Exam-Room-Application
Create a new branch

```bash
Copy
Edit
git checkout -b feature/module-name
Make changes → Add → Commit → Push

```bash
Copy
Edit
git add .
git commit -m "Short but clear message"
git push origin feature/module-name
Open Pull Request on GitHub




