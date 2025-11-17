import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { ToastProvider } from './ToastContext';

// Mock data
const mockFiles = [
  { id: 1, name: 'Project Proposal.pdf', type: 'pdf', size: '2.4 MB', createdAt: '2024-09-15', shared: false, sharedWith: [], downloadUrl: '#' },
  { id: 2, name: 'Meeting Notes.docx', type: 'docx', size: '156 KB', createdAt: '2024-09-14', shared: true, sharedWith: ['tejasv@example.com'], downloadUrl: '#' },
  { id: 3, name: 'Presentation.pptx', type: 'pptx', size: '5.2 MB', createdAt: '2024-09-13', shared: false, sharedWith: [], downloadUrl: '#' },
];

function App() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'dashboard'

 useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    setCurrentView("login");
    return;
  }

  const fetchUser = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/verify", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("VERIFY RESPONSE:", data);

      if (response.ok && data.valid) {
        setUser({
          name: data.user.name,
          email: data.user.email,
        });
        setCurrentView("dashboard");
      } else {
        localStorage.removeItem("token");
        setCurrentView("login");
      }
    } catch (err) {
      console.log("VERIFY ERROR:", err);
      localStorage.removeItem("token");
    }
  };

  fetchUser();
}, []);   



const handleLogin = (userData) => {
 setUser({
    name: userData.name,
    email: userData.email
  });

  setCurrentView("dashboard");
  };

const handleSignup = (email, password, name) => {
  localStorage.setItem('token',data.token);
  setUser({ name: name || 'New User', email });
  setFiles([]);
  setCurrentView('dashboard');
};

 const handleLogout = () => {
  localStorage.removeItem('token');
  setUser(null);
  setFiles([]);
  setCurrentView('login');
  window.location.reload();
};


  if (currentView === 'login') {
    return (
      <LoginForm 
        onLogin={handleLogin} 
        onSwitchToSignup={() => setCurrentView('signup')}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <SignupForm 
        onSignup={handleSignup} 
        onSwitchToLogin={() => setCurrentView('login')}
      />
    );
  }

  return (
    <ToastProvider>
    <Dashboard 
      user={user} 
      files={files} 
      setFiles={setFiles}
      onLogout={handleLogout} 
    />
    </ToastProvider>
  );
}

export default App;