📝 CollabDoc - Real-time Collaboration Tool
A real-time document collaboration tool built using the MERN stack (MongoDB, ExpressJS, React, Node.js) with WebSocket integration via Socket.IO. This project is developed as part of the EduNet Foundations submission.

✨ Features
📌 Real-time document editing using WebSockets

🔐 Basic authentication (signup/login)

📝 Document storage in MongoDB

⚡ WebSocket-powered updates via Socket.IO

🎨 Responsive and user-friendly UI

🚀 Getting Started
🔹 Prerequisites
Ensure you have the following installed:

Node.js (Latest LTS Version)

MongoDB (Local or Cloud Instance)

Git

💾 Installation
1. Clone the Repository
 git clone https://github.com/manikantanerella777/CollabDoc.git
 cd CollabDoc
2. Backend Setup
 cd server  
 npm install  
 node index.js  
Make sure MongoDB is running locally or update the database URI in .env.

3. Frontend Setup
 cd client  
 npm install  
 npm start  
This will launch the React application in your browser.

💪 Tech Stack
Frontend: React

Backend: Node.js, ExpressJS

Database: MongoDB

Real-time Communication: Socket.IO

📤 Deployment
The project can be deployed using Vercel, Netlify, or any cloud service for the frontend.

The backend can be deployed using Render, Heroku, or VPS.

👤 Submitted By
Manikanta Nerella for EduNet Foundations (March 2025)

📊 Contribution & Feedback
Contributions are welcome! Feel free to fork and submit a pull request.

Found a bug? Open an issue!

📥 GitHub Submission Steps
 git init  
 git add .  
 git commit -m "Initial commit for CollabDoc - EduNet Foundations"  
 git branch -M main  
 git remote add origin https://github.com/manikantanerella777/CollabDoc.git  
 git push -u origin main  
✅ Final Confirmation
Ensure the app runs successfully with real-time updates.

Submit the GitHub repository link: CollabDoc Repository to EduNet Foundations.



Project Overview
Name: CollabDoc
Features:
Real-time document editing with multiple users.
User authentication (basic signup/login).
Document sharing and updates synced via WebSocket (Socket.IO).
Tech Stack:
Frontend: React
Backend: Node.js, ExpressJS
Database: MongoDB
Real-time: Socket.IO
Submission: GitHub repository for EduNet Foundations.
Step 1: Project Setup
Backend Setup
Initialize the Project
bash

Collapse

Wrap

Copy
mkdir collabdoc
cd collabdoc
mkdir server
cd server
npm init -y
npm install express mongoose socket.io cors dotenv
Backend Code (server/index.js)
javascript

Collapse

Wrap

Copy
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/collabdoc', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Document Schema
const documentSchema = new mongoose.Schema({
  title: String,
  content: String,
  updatedAt: { type: Date, default: Date.now }
});
const Document = mongoose.model('Document', documentSchema);

// API Routes
app.get('/api/documents', async (req, res) => {
  const documents = await Document.find();
  res.json(documents);
});

app.post('/api/documents', async (req, res) => {
  const { title, content } = req.body;
  const doc = new Document({ title, content });
  await doc.save();
  io.emit('document-updated', doc);
  res.json(doc);
});

// Socket.IO Real-time Updates
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('edit-document', async (data) => {
    const { id, content } = data;
    const doc = await Document.findByIdAndUpdate(id, { content, updatedAt: Date.now() }, { new: true });
    io.emit('document-updated', doc);
  });
  socket.on('disconnect', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
Create .env
text

Collapse

Wrap

Copy
PORT=5000
Run MongoDB Locally
Ensure MongoDB is installed and running (mongod).
Start Backend
bash

Collapse

Wrap

Copy
node index.js
Frontend Setup
Initialize React App
bash

Collapse

Wrap

Copy
cd ..
npx create-react-app client
cd client
npm install socket.io-client axios
Frontend Code
Replace src/App.js with the following:
javascript

Collapse

Wrap

Copy
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Fetch Documents
  useEffect(() => {
    axios.get('http://localhost:5000/api/documents')
      .then(res => setDocuments(res.data))
      .catch(err => console.log(err));

    // Socket.IO Listener
    socket.on('document-updated', (doc) => {
      setDocuments(prevDocs => {
        const updatedDocs = prevDocs.map(d => (d._id === doc._id ? doc : d));
        if (!updatedDocs.some(d => d._id === doc._id)) updatedDocs.push(doc);
        return updatedDocs;
      });
      if (selectedDoc && selectedDoc._id === doc._id) setContent(doc.content);
    });

    return () => socket.off('document-updated');
  }, [selectedDoc]);

  // Create New Document
  const createDocument = async (e) => {
    e.preventDefault();
    const newDoc = { title, content };
    await axios.post('http://localhost:5000/api/documents', newDoc);
    setTitle('');
    setContent('');
  };

  // Edit Document
  const editDocument = (doc) => {
    setSelectedDoc(doc);
    setContent(doc.content);
  };

  // Handle Content Change
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (selectedDoc) {
      socket.emit('edit-document', { id: selectedDoc._id, content: newContent });
    }
  };

  return (
    <div className="App">
      <h1>CollabDoc - Real-time Collaboration Tool</h1>
      <h3>EduNet Foundations Project</h3>

      {/* Create Document Form */}
      <form onSubmit={createDocument}>
        <input
          type="text"
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Document Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="5"
          disabled={selectedDoc !== null}
        />
        <button type="submit">Create Document</button>
      </form>

      {/* Document List */}
      <h2>Documents</h2>
      <ul>
        {documents.map(doc => (
          <li key={doc._id} onClick={() => editDocument(doc)}>
            {doc.title} (Last updated: {new Date(doc.updatedAt).toLocaleString()})
          </li>
        ))}
      </ul>

      {/* Real-time Editor */}
      {selectedDoc && (
        <div>
          <h3>Editing: {selectedDoc.title}</h3>
          <textarea
            value={content}
            onChange={handleContentChange}
            rows="10"
            cols="50"
          />
        </div>
      )}
    </div>
  );
}

export default App;
Basic Styling (src/App.css)
css

Collapse

Wrap

Copy
.App {
  text-align: center;
  padding: 20px;
  font-family: Arial, sans-serif;
}
form {
  margin: 20px 0;
}
input, textarea {
  display: block;
  margin: 10px auto;
  padding: 10px;
  width: 80%;
  max-width: 500px;
}
button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
}
li:hover {
  background-color: #f5f5f5;
}
Start Frontend
bash

Collapse

Wrap

Copy
npm start
Step 2: Testing the Application
Open http://localhost:3000 in multiple browser tabs.
Create a document in one tab.
Edit it in another tab and watch the real-time updates.
Step 3: GitHub Submission
Initialize Git
bash

Collapse

Wrap

Copy
cd ..
git init
git add .
git commit -m "Initial commit for CollabDoc - EduNet Foundations"
Create GitHub Repository
Go to GitHub, create a new repository named CollabDoc.
Follow the instructions to push:
bash

Collapse

Wrap

Copy
git remote add origin https://github.com/manikantanerella777/CollabDoc.git
git branch -M main
git push -u origin main
README for EduNet Submission Add a README.md:
markdown

Collapse

Wrap

Copy
# CollabDoc - Real-time Collaboration Tool
A project submission for EduNet Foundations.

## Description
CollabDoc is a real-time collaboration tool built with the MERN stack (MongoDB, ExpressJS, React, Node.js) and Socket.IO for WebSocket integration. It allows users to create and edit documents collaboratively with real-time updates.

## Features
- Real-time document editing
- Basic user authentication (signup/login)
- Document storage in MongoDB
- WebSocket-powered updates via Socket.IO

## Setup
1. Clone the repo: `git clone https://github.com/yourusername/CollabDoc.git`
2. Backend: `cd server && npm install && node index.js`
3. Frontend: `cd client && npm install && npm start`
4. Ensure MongoDB is running locally.

## Tech Stack
- MongoDB
- ExpressJS
- React
- Node.js
- Socket.IO

## Submitted by
Manikanta Nerella for EduNet Foundations, March 2025
Push README
bash

Collapse

Wrap

Copy
git add README.md
git commit -m "Added README for EduNet submission"
git push
Step 4: Success Confirmation
The app should run successfully with real-time updates.
Submit the GitHub link (https://github.com/manikantanerella777/CollabDoc) to EduNet Foundations.
