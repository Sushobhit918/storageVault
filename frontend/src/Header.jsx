import React from 'react';
import { LogOut } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const styles = {
    header: {
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#111827',
      margin: 0
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    welcomeText: {
      color: '#6B7280',
      fontSize: '14px'
    },
    logoutBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      background: 'none',
      border: 'none',
      color: '#6B7280',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '8px 12px',
      borderRadius: '6px',
      transition: 'all 0.2s'
    }
  };

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>File Storage</h1>
      <div style={styles.rightSection}>
        <span style={styles.welcomeText}>Welcome, {user?.name}</span>
        <button 
          onClick={onLogout} 
          style={styles.logoutBtn}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#6B7280';
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;