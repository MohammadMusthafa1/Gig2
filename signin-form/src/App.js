import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";

// 🔹 Role Selection Page
const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Select Role</h2>
      <button onClick={() => navigate("/login/admin")}>Admin</button>
      <button onClick={() => navigate("/signup")}>User</button> {/* User goes to Signup First */}
    </div>
  );
};

// 🔹 Signup Component
const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure all fields are filled before making request
    if (!formData.name || !formData.email || !formData.password) {
      alert("All fields are required.");
      return;
    }

    console.log("Submitting:", formData); // Debugging output

    try {
      await axios.post("http://localhost:5000/api/auth/signup", formData);
      alert("Signup successful! Please login.");
      navigate("/login/user");
    } catch (error) {
      console.error("Signup error:", error.response?.data);
      alert(error.response?.data?.error || "Signup failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>User Signup</h2>
      <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Sign Up</button>
    </form>
  );
};
// 🔹 Login Component (For Both Admin & User)
const Login = ({ role }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { ...formData, role });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        alert("Login successful!");
        navigate(role === "admin" ? "/admin-dashboard" : "/");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Invalid credentials.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{role} Login</h2>
      <input type="email" placeholder="Email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
      <input type="password" placeholder="Password" onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
      <button type="submit">Login</button>
    </form>
  );
};

// 🔹 Fixed Admin Dashboard with Form Creation
const AdminDashboard = () => {
  const [formName, setFormName] = useState("");
  const [fields, setFields] = useState([{ fieldName: "", fieldType: "text" }]);
  const [forms, setForms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const res = await axios.get("http://localhost:5000/api/forms/admin-dashboard", {
        headers: { Authorization: token },
      });
      setForms(res.data);
    } catch (error) {
      console.error("Error fetching forms:", error);
    }
  };

  const addField = () => {
    setFields([...fields, { fieldName: "", fieldType: "text" }]);
  };

  const saveForm = async () => {
    const token = localStorage.getItem("token");
    if (!formName.trim()) return alert("Form name cannot be empty!");

    try {
      await axios.post(
        "http://localhost:5000/api/forms/create",
        { formName, fields },
        { headers: { Authorization: token } }
      );
      alert("Form created successfully!");
      setFormName("");
      setFields([{ fieldName: "", fieldType: "text" }]);
      fetchForms();
    } catch (error) {
      alert("Failed to save form");
    }
  };

  const copyFormLink = (formId) => {
    const link = `http://localhost:3000/form/${formId}`;
    navigator.clipboard.writeText(link);
    alert("Form link copied!");
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <button onClick={logout}>Logout</button>

      <h3>Create a New Form</h3>
      <input type="text" placeholder="Enter Form Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
      {fields.map((field, index) => (
        <input key={index} type="text" placeholder="Field Name" value={field.fieldName} onChange={(e) => {
          const updatedFields = [...fields];
          updatedFields[index].fieldName = e.target.value;
          setFields(updatedFields);
        }} />
      ))}
      <button onClick={addField}>Add Field</button>
      <button onClick={saveForm}>Save Form</button>

      <h3>Your Created Forms</h3>
      {forms.length === 0 ? <p>No forms found.</p> : (
        forms.map((form) => (
          <div key={form._id}>
            <p>{form.formName}</p>
            <button onClick={() => copyFormLink(form._id)}>Copy Link</button>
          </div>
        ))
      )}
    </div>
  );
};

// 🔹 Main App Component with Routes
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login/admin" element={<Login role="admin" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login/user" element={<Login role="user" />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
