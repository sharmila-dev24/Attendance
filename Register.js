import React, { useState } from "react";
import {Link} from "react-router-dom";
//import styles from "./Register.module.css";
import "bootstrap/dist/css/bootstrap.min.css";


export default function Register() {
  const [formData, setFormData] = useState({
    user_id: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "select",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Send form data to the backend
    fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message); // Alert success or error message
        if (data.success) {
          setFormData({
            user_id: "",
            name: "",
            email: "",
            password: "",
            phone: "",
            role: "select"
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Failed to register.");
      });
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
    <div className="col-lg-6 col-md-8 col-sm-10">
    <form onSubmit={handleSubmit} className="p-4 shadow rounded bg-light">
      
        <h2 className="text-center text-primary">REGISTER/SIGNUP</h2>
      
      <div className="mb-3">
        <label className="form-label">user_id:</label>
        <input
          type="text"
          name="user_id"
          value={formData.user_id}
          onChange={handleChange}
          required
          className="form-control"
      />
      </div>

      <div className="mb-3">
        <label className="form-label">Enter Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="form-control"
        />
      </div>

      <div className="mb-3" >
        <label className="form-label">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">phone</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="form-control"
        >
          <option value="select">select</option>
          <option value="staff">staff</option>
          <option value="admin">admin</option>
        </select>
      </div>
        <button type="submit" className="btn btn-primary w-100">Register</button>
        <p className="text-center mt-3">Already have an account?<Link to="/login">sign in</Link></p>
     
    </form>
    </div>
    </div>
  );
}