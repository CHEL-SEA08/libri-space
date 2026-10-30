# LibriSpace – Library Management System

## 1. Project Overview

LibriSpace is a web-based Library Management System developed using the MERN stack (MongoDB, Express.js, React.js and Node.js).

The application provides a centralized platform to manage books, library members and borrowing transactions. It simplifies library operations through a user-friendly interface and helps administrators manage book availability, issue and return records, and overdue fines.

## 2. Problem Statement

Traditional library management systems often depend on manual record keeping. This can lead to errors in maintaining book records, difficulty tracking borrowed books, delays in retrieving information and mistakes in fine calculations.

LibriSpace aims to overcome these challenges by providing a digital platform that organizes library records, simplifies book management and improves the efficiency of daily library operations.

## 3. Objectives

- Develop a centralized library management application.
- Provide secure user registration and login.
- Manage books and their availability.
- Maintain registered member information.
- Simplify book issuing and returning.
- Calculate overdue fines automatically.
- Provide separate access for administrators and members.

## 4. Features

### Admin Features
- Secure administrator login.
- Add, view and delete books.
- Manage library members.
- Issue books to registered members.
- Process returned books.
- View borrowing transactions.
- Monitor library statistics.

### Member Features
- Register and log in.
- Browse and search books.
- View borrowed books.
- Check due dates and borrowing status.
- View applicable overdue fines.

### Fine Management
The system calculates overdue fines based on the number of days a book is returned late. The configured fine is ₹5 per overdue day.

## 5. Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Node.js | Backend runtime |
| Express.js | REST API development |
| MongoDB | Database |
| Mongoose | Database management |
| JWT | Authentication |
| bcryptjs | Password hashing |
| CSS | Styling |
| Vite | Frontend development |
| Git and GitHub | Version control |

## 6. Project Structure

```text
libri-space/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── .gitignore
└── README.md
```

## 7. Installation and Execution

### Prerequisites
- Node.js and npm
- MongoDB
- Visual Studio Code
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/CHEL-SEA08/libri-space.git
cd libri-space
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Use your own database connection string and a secure JWT secret. Never upload `.env` to GitHub.

### Step 4: Start the Backend

```bash
npm run dev
```

### Step 5: Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### Step 6: Start the Frontend

```bash
npm run dev
```

Open the local URL displayed in the terminal by Vite.

## 8. Future Enhancements

- Email notifications for book due dates.
- Book reservation functionality.
- Advanced search and filtering.
- Downloadable library reports.
- Online deployment.
- Enhanced analytics and reporting.

## 9. Conclusion

LibriSpace provides a digital solution for managing essential library activities. It demonstrates the practical use of the MERN stack to build a full-stack web application with authentication, database operations and role-based access.

## 10. GitHub Repository

**Project:** LibriSpace – Library Management System  
**Repository:** https://github.com/CHEL-SEA08/libri-space  
**Technology:** MERN Stack  
**Category:** Full Stack Development
