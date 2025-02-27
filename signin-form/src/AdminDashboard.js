import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [formName, setFormName] = useState("");
  const [fields, setFields] = useState([{ fieldName: "", fieldType: "text" }]);
  const [forms, setForms] = useState([]);
  const navigate = useNavigate();

  // Fetch forms when component loads
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      fetchForms(token);
    }
  }, []);

  // Fetch forms from the backend
  const fetchForms = async (token) => {
    try {
      const res = await axios.get("http://localhost:5000/api/forms/admin-dashboard", {
        headers: { Authorization: token },
      });
      setForms(res.data);
    } catch (error) {
      console.error("Error fetching forms:", error);
      setForms([]); // Prevents crash if API fails
    }
  };

  // Add new field input
  const addField = () => {
    setFields([...fields, { fieldName: "", fieldType: "text" }]);
  };

  // Save new form
  const saveForm = async () => {
    const token = localStorage.getItem("token");
    if (!formName.trim()) {
      alert("Form name cannot be empty!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/forms/create",
        { formName, fields },
        { headers: { Authorization: token } }
      );
      alert("Form created successfully!");
      setFormName("");
      setFields([{ fieldName: "", fieldType: "text" }]);
      fetchForms(token); // Refresh form list
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Failed to save form");
    }
  };

  // Copy form link to clipboard
  const copyFormLink = (formId) => {
    const link = `http://localhost:3000/form/${formId}`;
    navigator.clipboard.writeText(link);
    alert("Form link copied!");
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto", textAlign: "center" }}>
      <h2>Admin Dashboard</h2>
      <button onClick={logout} style={{ marginBottom: "20px", cursor: "pointer" }}>Logout</button>

      <h3>Create a New Form</h3>
      <input
        type="text"
        placeholder="Enter Form Name"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      {fields.map((field, index) => (
        <input
          key={index}
          type="text"
          placeholder="Field Name"
          value={field.fieldName}
          onChange={(e) => {
            const updatedFields = [...fields];
            updatedFields[index].fieldName = e.target.value;
            setFields(updatedFields);
          }}
          style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
        />
      ))}

      <button onClick={addField} style={{ margin: "10px", cursor: "pointer" }}>Add Field</button>
      <button onClick={saveForm} style={{ cursor: "pointer" }}>Save Form</button>

      <h3>Your Created Forms</h3>
      {forms.length === 0 ? (
        <p>No forms found.</p>
      ) : (
        forms.map((form) => (
          <div key={form._id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
            <p><strong>{form.formName}</strong></p>
            <button onClick={() => copyFormLink(form._id)} style={{ cursor: "pointer" }}>Copy Link</button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
