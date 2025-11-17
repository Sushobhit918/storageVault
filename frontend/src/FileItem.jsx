import React, { useState } from 'react';
import { File, Download, Share2, Trash2, Edit2, Link } from 'lucide-react';

const FileItem = ({ file, setFiles, onShareFile, token }) => {
  const [hoveredButton, setHoveredButton] = useState(null);

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

  const handleDownload = () => {
    // Download via Cloudinary URL
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

 const handleRename = async () => {
  const currentName = file.name || file.fileName || "Unnamed";
  const baseName = currentName.replace(/\.[^/.]+$/, "");
  const extension = currentName.split('.').pop();
  const newNameInput = prompt("Enter new name:", baseName);

  if (newNameInput && newNameInput.trim()) {
    const fullName = `${newNameInput.trim()}.${extension}`;
    try {
      const res = await fetch(`http://localhost:5001/api/files/${file.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: fullName })
      });
      const updatedFile = await res.json();

      // Update both name and fileName
      setFiles(prev => prev.map(f =>
        (f.id === file.id || f._id === file.id)
          ? { ...f, name: updatedFile.fileName || fullName, fileName: updatedFile.fileName || fullName }
          : f
      ));
    } catch (err) {
      console.log("Rename error:", err);
    }
  }
};



  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        await fetch(`http://localhost:5001/api/files/${file.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFiles(prev => prev.filter(f => f.id !== file.id));
      } catch (err) {
        console.log("Delete error:", err);
      }
    }
  };

  const handleShare = () => {
    onShareFile(file); // Modal open / backend call inside this function
  };

  const handleCopyLink = () => {
    const shareUrl = `http://localhost:5001/shared/${file.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Share link copied to clipboard!`);
  };

  const getButtonStyle = (buttonType, isHovered) => {
    const baseStyle = { padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', height: '32px', transition: 'all 0.2s' };
    const buttonStyles = {
      download: { backgroundColor: isHovered ? '#3B82F6' : '#EFF6FF', color: isHovered ? '#FFFFFF' : '#3B82F6', border: `1px solid ${isHovered ? '#3B82F6' : '#DBEAFE'}` },
      rename: { backgroundColor: isHovered ? '#F59E0B' : '#FFFBEB', color: isHovered ? '#FFFFFF' : '#F59E0B', border: `1px solid ${isHovered ? '#F59E0B' : '#FED7AA'}` },
      share: { backgroundColor: isHovered ? '#10B981' : '#ECFDF5', color: isHovered ? '#FFFFFF' : '#10B981', border: `1px solid ${isHovered ? '#10B981' : '#A7F3D0'}` },
      link: { backgroundColor: isHovered ? '#8B5CF6' : '#F3E8FF', color: isHovered ? '#FFFFFF' : '#8B5CF6', border: `1px solid ${isHovered ? '#8B5CF6' : '#DDD6FE'}` },
      delete: { backgroundColor: isHovered ? '#EF4444' : '#FEF2F2', color: isHovered ? '#FFFFFF' : '#EF4444', border: `1px solid ${isHovered ? '#EF4444' : '#FECACA'}` }
    };
    return { ...baseStyle, ...buttonStyles[buttonType] };
  };

  const styles = {
    row: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 200px', gap: '16px', padding: '16px 24px', borderBottom: '1px solid #F3F4F6', alignItems: 'center', transition: 'background-color 0.2s' },
    fileName: { display: 'flex', alignItems: 'center', gap: '12px' },
    fileInfo: { flex: 1 },
    fileNameText: { fontSize: '14px', fontWeight: '500', color: '#111827' },
    sharedInfo: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' },
    sharedBadge: { fontSize: '12px', color: '#059669', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '12px' },
    sharedWithText: { fontSize: '12px', color: '#3B82F6' },
    size: { fontSize: '14px', color: '#6B7280' },
    date: { fontSize: '14px', color: '#6B7280' },
    actions: { display: 'flex', gap: '4px' }
  };

  return (
    <div style={styles.row} onMouseEnter={e => e.target.style.backgroundColor = '#F9FAFB'} onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}>
      <div style={styles.fileName}>
        {getFileIcon(file.type)}
        <div style={styles.fileInfo}>
          <div style={styles.fileNameText}>{file.name}</div>
          {file.shared && (
            <div style={styles.sharedInfo}>
              <span style={styles.sharedBadge}>Shared</span>
              {file.sharedWith?.length > 0 && <span style={styles.sharedWithText}>with {file.sharedWith.length} people</span>}
            </div>
          )}
        </div>
      </div>
      <div style={styles.size}>{file.size}</div>
      <div style={styles.date}>{file.createdAt}</div>
      <div style={styles.actions}>
        <button onClick={handleDownload} style={getButtonStyle('download', hoveredButton === 'download')} onMouseEnter={() => setHoveredButton('download')} onMouseLeave={() => setHoveredButton(null)} title="Download"><Download size={16} /></button>
        <button onClick={handleRename} style={getButtonStyle('rename', hoveredButton === 'rename')} onMouseEnter={() => setHoveredButton('rename')} onMouseLeave={() => setHoveredButton(null)} title="Rename"><Edit2 size={16} /></button>
        <button onClick={handleShare} style={getButtonStyle('share', hoveredButton === 'share')} onMouseEnter={() => setHoveredButton('share')} onMouseLeave={() => setHoveredButton(null)} title="Share"><Share2 size={16} /></button>
        <button onClick={handleCopyLink} style={getButtonStyle('link', hoveredButton === 'link')} onMouseEnter={() => setHoveredButton('link')} onMouseLeave={() => setHoveredButton(null)} title="Copy Link"><Link size={16} /></button>
        <button onClick={handleDelete} style={getButtonStyle('delete', hoveredButton === 'delete')} onMouseEnter={() => setHoveredButton('delete')} onMouseLeave={() => setHoveredButton(null)} title="Delete"><Trash2 size={16} /></button>
      </div>
    </div>
  );
};

export default FileItem;
