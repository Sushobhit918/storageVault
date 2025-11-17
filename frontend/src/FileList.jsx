import React, { useEffect, useState } from 'react';
import FileItem from './FileItem';

const FileList = ({ files, setFiles, onShareFile }) => {
  const [token, setToken] = useState('');

  const styles = {
    container: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      overflow: 'hidden'
    },
    header: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 200px',
      gap: '16px',
      padding: '16px 24px',
      backgroundColor: '#F9FAFB',
      borderBottom: '1px solid #E5E7EB',
      fontSize: '12px',
      fontWeight: '600',
      color: '#6B7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    emptyState: {
      padding: '64px 24px',
      textAlign: 'center',
      color: '#6B7280'
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#374151'
    },
    emptyText: {
      fontSize: '14px'
    }
  };

  // Get token on mount
  useEffect(() => {
    const t = localStorage.getItem('token');
    setToken(t);
  }, []);

  // Fetch files once token is ready
  useEffect(() => {
    if (!token) return; // wait for token

    const fetchFiles = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/files", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        console.log("Files from backend:", data);

       const formatted = data.map(f => ({
        id: f._id,
        name: f.fileName || "Unnamed file",
        url: f.url,
        size: f.size ? (f.size / 1024).toFixed(1) + " KB" : "Unknown",
        createdAt: f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "Unknown",
        type: f.fileName ? f.fileName.split('.').pop() : "unknown",
        shared: f.sharedWith?.length > 0,
         sharedWith: f.sharedWith || []
     }));


        setFiles(formatted);

      } catch (err) {
        console.log("Error fetching files:", err);
      }
    };

    fetchFiles();
  }, [token]);

  return (
    <div style={styles.container}>
      {files.length === 0 ? (
        <div style={styles.emptyState}>
          <h3 style={styles.emptyTitle}>No files found</h3>
          <p style={styles.emptyText}>Upload files or drag and drop them anywhere.</p>
        </div>
      ) : (
        <>
          <div style={styles.header}>
            <div>NAME</div>
            <div>SIZE</div>
            <div>DATE</div>
            <div>ACTIONS</div>
          </div>

          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              setFiles={setFiles}
              onShareFile={onShareFile}
              token={token} // pass correct token
            />
          ))}
        </>
      )}
    </div>
  );
};

export default FileList;
