import React from "react";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    if (role === "admin") {
      navigate("/Login");
    } else if (role === "user") {
      navigate("/Signup");
    }
  };

  return (
    <div>
      <h2>Select Your Role</h2>
      <button onClick={() => handleSelect("admin")}>Admin</button>
      <button onClick={() => handleSelect("user")}>User</button>
    </div>
  );
};

export default RoleSelection;
