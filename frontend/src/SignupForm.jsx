import React, { useState } from "react";
import { UserPlus, Eye, EyeOff } from "lucide-react";

const SignupForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setErrors({ email: data.message || "Registration failed" });
        return;
      }

      alert("Account created successfully!");
      setIsLoading(false);

      // Switch to login form
      onSwitchToLogin();
    } catch (error) {
      setIsLoading(false);
      alert("Server not responding");
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F8FAFC",
      padding: "20px 0",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    form: {
      backgroundColor: "#FFF",
      padding: "32px",
      borderRadius: "12px",
      border: "1px solid #E5E7EB",
      width: "400px",
      maxWidth: "90vw",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    title: {
      fontSize: "24px",
      fontWeight: "700",
      textAlign: "center",
      marginBottom: "8px",
      color: "#111827",
    },
    subtitle: {
      fontSize: "14px",
      textAlign: "center",
      marginBottom: "24px",
      color: "#6B7280",
    },
    inputGroup: { marginBottom: "20px" },
    label: {
      display: "block",
      marginBottom: "6px",
      fontSize: "14px",
      fontWeight: "500",
      color: "#374151",
    },
    inputWrapper: { position: "relative" },
    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #D1D5DB",
      borderRadius: "6px",
      fontSize: "14px",
      outline: "none",
    },
    inputError: { borderColor: "#EF4444" },
    passwordToggle: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      background: "none",
      border: "none",
      color: "#6B7280",
    },
    errorText: {
      marginTop: "4px",
      fontSize: "12px",
      color: "#EF4444",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#10B981",
      color: "#FFF",
      border: "none",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      opacity: isLoading ? 0.6 : 1,
    },
    switchText: {
      marginTop: "20px",
      fontSize: "14px",
      textAlign: "center",
      color: "#6B7280",
    },
    switchLink: {
      color: "#3B82F6",
      cursor: "pointer",
      fontWeight: "500",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.subtitle}>Join us to start managing your files</p>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(errors.name ? styles.inputError : {}),
            }}
          />
          {errors.name && <div style={styles.errorText}>{errors.name}</div>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(errors.email ? styles.inputError : {}),
            }}
          />
          {errors.email && <div style={styles.errorText}>{errors.email}</div>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <div style={styles.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                paddingRight: "48px",
                ...(errors.password ? styles.inputError : {}),
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <div style={styles.errorText}>{errors.password}</div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={styles.button}
        >
          <UserPlus size={16} />{" "}
          {isLoading ? "Creating account..." : "Create Account"}
        </button>

        <div style={styles.switchText}>
          Already have an account?{" "}
          <span style={styles.switchLink} onClick={onSwitchToLogin}>
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
