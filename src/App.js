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