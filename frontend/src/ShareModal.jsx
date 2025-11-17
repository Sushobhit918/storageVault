import React, { useState } from 'react';
import { X, Send, File } from 'lucide-react';

const ShareModal = ({ file, onClose, onShare, ws }) => {
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('read');

  const handleShare = async () => {
    if (!shareEmail.trim()) return;
    const token = localStorage.getItem("token");

    try {
      // Backend API call
      const res = await fetch(`http://localhost:5001/api/files/${file.id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId: shareEmail, permission: sharePermission })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      // Update local state
      onShare(shareEmail, sharePermission);

      // Emit WS event
      if (ws && ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          event: "shareFile",
          payload: {
            fileId: file.id,
            sharedWithUserId: shareEmail,
            fileName: file.name,
            permission: sharePermission
          }
        }));
      }

      alert(`File shared with ${shareEmail} with ${sharePermission} permission!`);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to share: " + err.message);
    }
  };

  const getFileIcon = (type) => {
    const iconProps = { size: 20 };
    switch (type.toLowerCase()) {
      case 'pdf': return <File {...iconProps} style={{ color: '#EF4444' }} />;
      case 'docx':
      case 'doc': return <File {...iconProps} style={{ color: '#3B82F6' }} />;
      case 'pptx':
      case 'ppt': return <File {...iconProps} style={{ color: '#F59E0B' }} />;
      default: return <File {...iconProps} style={{ color: '#6B7280' }} />;
    }
  };

  // Styles
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '24px',
      width: '400px',
      maxWidth: '90vw',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px', borderRadius: '4px' },
    fileInfo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px', marginBottom: '20px' },
    fileName: { fontSize: '14px', fontWeight: '500', color: '#111827' },
    fileSize: { fontSize: '12px', color: '#6B7280' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    label: { fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' },
    input: { width: '100%', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
    select: { width: '100%', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: '#FFFFFF', boxSizing: 'border-box' },
    buttonContainer: { display: 'flex', gap: '12px', marginTop: '8px' },
    shareBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    cancelBtn: { flex: 1, backgroundColor: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '6px', padding: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    sharedList: { marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' },
    sharedTitle: { fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' },
    sharedItem: { fontSize: '14px', color: '#6B7280', backgroundColor: '#F9FAFB', padding: '8px 12px', borderRadius: '6px', marginBottom: '4px' }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Share File</h3>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        <div style={styles.fileInfo}>
          {getFileIcon(file.type)}
          <div>
            <div style={styles.fileName}>{file.name}</div>
            <div style={styles.fileSize}>{file.size}</div>
          </div>
        </div>

        <div style={styles.form}>
          <div>
            <label style={styles.label}>Share with email</label>
            <input
              type="email"
              placeholder="Enter email address"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Permission</label>
            <select
              value={sharePermission}
              onChange={(e) => setSharePermission(e.target.value)}
              style={styles.select}
            >
              <option value="read">Can view</option>
              <option value="edit">Can edit</option>
            </select>
          </div>

          <div style={styles.buttonContainer}>
            <button 
              onClick={handleShare}
              disabled={!shareEmail.trim()}
              style={{
                ...styles.shareBtn,
                opacity: !shareEmail.trim() ? 0.5 : 1,
                cursor: !shareEmail.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={16} /> Share
            </button>
            <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
          </div>
        </div>

        {file.sharedWith && file.sharedWith.length > 0 && (
          <div style={styles.sharedList}>
            <h4 style={styles.sharedTitle}>Already shared with:</h4>
            {file.sharedWith.map((item, index) => (
              <div key={index} style={styles.sharedItem}>
                {item.userId} ({item.permission})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
