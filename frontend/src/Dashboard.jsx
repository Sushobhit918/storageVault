import React, { useState, useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';
import Header from './Header';
import FileList from './FileList';
import ShareModal from './ShareModal';

const Dashboard = ({ user, files, setFiles, onLogout }) => {
  const ws = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:6000?token=${localStorage.getItem("token")}`);

    ws.current.onopen = () => console.log("WS connected");
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === "fileShared") {
        const f = data.data;
        setFiles(prev => [...prev, {
          id: f._id,
          name: f.fileName,
          fileName: f.fileName,
          type: f.fileName.includes('.') ? f.fileName.split('.').pop() : 'unknown',
          size: f.size ? (f.size / 1024 / 1024).toFixed(2) + " MB" : "Unknown",
          createdAt: f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "Unknown",
          url: f.url,
          shared: true,
          sharedWith: f.sharedWith || []
        }]);
        alert(`File shared with you: ${f.fileName}`);
      }

      if (data.event === "fileRevoked") {
        setFiles(prev => prev.filter(f => f.id !== data.fileId));
        alert(`File access revoked: ${data.fileId}`);
      }
    };

    ws.current.onclose = () => console.log("WS closed");
    return () => ws.current.close();
  }, []);

  const handleFileUpload = async (uploadedFiles) => {
    const token = localStorage.getItem("token");
    for (let file of uploadedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("http://localhost:5001/api/files/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const savedFile = await res.json();
        const savedFileData = savedFile.file;
        setFiles(prev => [...prev, {
          id: savedFileData._id,
          name: savedFileData.fileName,
          fileName: savedFileData.fileName,
          type: savedFileData.fileName.includes('.') ? savedFileData.fileName.split(".").pop() : "unknown",
          size: savedFileData.size ? (savedFileData.size / 1024 / 1024).toFixed(2) + " MB" : "Unknown",
          createdAt: savedFileData.createdAt ? new Date(savedFileData.createdAt).toLocaleDateString() : "Unknown",
          url: savedFileData.url,
          shared: savedFileData.sharedWith?.length > 0,
          sharedWith: savedFileData.sharedWith || []
        }]);
      } catch (err) { console.log("Upload error:", err); }
    }
  };

  const handleFileInputChange = (e) => handleFileUpload(Array.from(e.target.files));
  const handleDrop = (e) => { e.preventDefault(); handleFileUpload(Array.from(e.dataTransfer.files)); };
  const handleShareFile = (file) => { setSelectedFile(file); setShowShareModal(true); };
  const filteredFiles = files.filter(file => (file.name || file.fileName || "").toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'sans-serif' }}>
      <Header user={user} onLogout={onLogout} />
      <main style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
          <input type="text" placeholder="Search files..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, maxWidth: '400px', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '8px' }}/>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3B82F6', color: '#FFF', borderRadius: '8px', padding: '12px 20px', cursor: 'pointer' }}>
            <Upload size={16} /> Upload Files
            <input type="file" multiple hidden onChange={handleFileInputChange} accept=".pdf,.doc,.docx,.ppt,.pptx"/>
          </label>
        </div>
        <FileList files={filteredFiles} setFiles={setFiles} onShareFile={handleShareFile}/>
      </main>

      {showShareModal && selectedFile && (
        <ShareModal
          file={selectedFile}
          onClose={() => { setShowShareModal(false); setSelectedFile(null); }}
          onShare={(email, permission) => {
            setFiles(prev => prev.map(f =>
              f.id === selectedFile.id
                ? { ...f, shared: true, sharedWith: [...f.sharedWith, { userId: email, permission }] }
                : f
            ));
          }}
          ws={ws}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default Dashboard;
