import React, { useState } from 'react';
import { User } from 'lucide-react';

const LoginForm = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMode, setForgotMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      onLogin(data);
    } catch (error) {
      alert("Server not responding. Check network or backend.");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return alert("Please enter your email.");

    try {
      const response = await fetch("http://localhost:5000/api/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();
      if (!response.ok) return alert(data.message || "Something went wrong");
      
      alert("Password reset link sent to your email!");
      setForgotMode(false);
      setForgotEmail('');
    } catch (err) {
      alert("Server not responding.");
      console.log(err);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8FAFC',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    form: {
      backgroundColor: '#FFFFFF',
      padding: '32px',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      width: '400px',
      maxWidth: '90vw',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    title: { fontSize: '24px', fontWeight: '700', textAlign: 'center', marginBottom: '8px', color: '#111827' },
    subtitle: { fontSize: '14px', textAlign: 'center', marginBottom: '24px', color: '#6B7280' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' },
    input: { width: '100%', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' },
    button: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'background-color 0.2s', opacity: isLoading ? 0.7 : 1 },
    divider: { textAlign: 'center', margin: '20px 0', position: 'relative', color: '#6B7280', fontSize: '14px' },
    dividerLine: { position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#E5E7EB', zIndex: 1 },
    dividerText: { backgroundColor: '#FFFFFF', padding: '0 16px', position: 'relative', zIndex: 2 },
    switchText: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6B7280' },
    switchLink: { color: '#3B82F6', cursor: 'pointer', fontWeight: '500', textDecoration: 'none' },
    forgotLink: { textAlign: 'right', fontSize: '12px', color: '#3B82F6', cursor: 'pointer', marginBottom: '16px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <h2 style={styles.title}>{forgotMode ? "Forgot Password" : "Welcome back"}</h2>
        <p style={styles.subtitle}>{forgotMode ? "Enter your email to reset password" : "Sign in to your file storage account"}</p>

        {!forgotMode ? (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>

            <div
              style={styles.forgotLink}
              onClick={() => setForgotMode(true)}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              Forgot Password?
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={styles.button}
              onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#2563EB')}
              onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#3B82F6')}
            >
              <User size={16} />
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </>
        ) : (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                style={styles.input}
              />
            </div>
            <button
              onClick={handleForgotPassword}
              style={styles.button}
            >
              Send Reset Link
            </button>
            <div
              style={{ ...styles.forgotLink, textAlign: 'center', marginTop: '12px' }}
              onClick={() => setForgotMode(false)}
            >
              Back to Login
            </div>
          </>
        )}

        {!forgotMode && (
          <>
            <div style={styles.divider}>
              <div style={styles.dividerLine}></div>
              <span style={styles.dividerText}>or</span>
            </div>

            <div style={styles.switchText}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                style={{
                  ...styles.switchLink,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  font: 'inherit'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Sign up
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
