import React, { useState, useEffect } from "react";
import ImportData from './ImportData'
const Students = () => {
  const [student, setStudent] = useState([]);
  const [editingRegno, setEditingRegno] = useState(null); // Track which student is being edited
  const [editFormData, setEditFormData] = useState({});  // Store updated values
  const [formData, setFormData] = useState({  // New student form data
    Regno: "",
    name: "",
    Phone: "",
    Email: "",
    class_code: "",
  });

  // Fetch student data from backend
  useEffect(() => {
    fetch("http://localhost:5000/admin/Students")
      .then((res) => res.json())
      .then((data) => setStudent(data))
      .catch((err) => console.error("Error fetching students", err));
  }, []);

  // Handle form input changes (New student form)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new student (POST)
  const handleAdd = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/admin/Students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        setStudent([...student, data]);
        setFormData({ Regno: "", name: "", Phone: "", Email: "", class_code: "" }); // Clear form
      })
      .catch((err) => console.error("Error adding student", err));
  };

  // Enable editing mode
  const handleEditClick = (studentData) => {
    setEditingRegno(studentData.Regno); // Set current editing student
    setEditFormData({ ...studentData }); // Copy current values
  };

  // Handle input changes for inline editing
  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Save edited student details (PATCH)
  const handleSaveClick = (Regno) => {
    fetch(`http://localhost:5000/admin/Students/${Regno}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editFormData),
    })
      .then((res) => res.json())
      .then(() => {
        setStudent(student.map((s) => (s.Regno === Regno ? editFormData : s))); // Update UI
        setEditingRegno(null); // Exit edit mode
      })
      .catch((err) => console.error("Error updating student", err));
  };

  // Delete a student (DELETE)
  const handleDelete = (Regno) => {
    fetch(`http://localhost:5000/admin/Students/${Regno}`, {
      method: "DELETE",
    })
      .then(() => setStudent(student.filter((entry) => entry.Regno !== Regno)))
      .catch((err) => console.error("Error deleting student", err));
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Manage Students</h2>

      <div className="card p-4 shadow">
      <h3 className="mb-3">Add New Student</h3>
      <form onSubmit={handleAdd}>
        <div className="row g-3">

        <div className="col-md-4">
        <input type="text" name="Regno" value={formData.Regno} onChange={handleChange} className="form-control" placeholder="Enter Regno" required />
        </div>

        <div className="col-md-4">
        <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="Enter Name" required />
        </div>

        <div className="col-md-4">
        <input type="text" name="Phone" value={formData.Phone} onChange={handleChange} className="form-control" placeholder="Enter Phone" />
        </div>

        <div className="col-md-6">
        <input type="text" name="Email" value={formData.Email} onChange={handleChange} className="form-control" placeholder="Enter Email" required />
        </div>

        <div className="col-md-6">
        <input type="text" name="class_code" value={formData.class_code} className="form-control" onChange={handleChange} placeholder="Enter Class Code" required />
        </div>
         <div className="col-12">
        <button type="submit" className="btn btn-primary w-100">Add Student</button>
        </div>
        </div>
       </form>
       </div>

      {/* Student Table */}
      <h3 className="mt-5 mb-3">Student List</h3>
      <div className="table-responsive">
      <table className="table table-bordered table-striped text-center">
        <thead className="table-dark">
          <tr>
            <th>Regno</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Class Code</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {student.map((entry) => (
            <tr key={entry.Regno}>
              <td>{entry.Regno}</td>
              <td>
                {editingRegno === entry.Regno ? (
                  <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} className="form-control"/>
                ) : (
                  entry.name
                )}
              </td>
              <td>
                {editingRegno === entry.Regno ? (
                  <input type="text" name="Phone" value={editFormData.Phone} onChange={handleEditChange} className="form-control" />
                ) : (
                  entry.Phone
                )}
              </td>
              <td>
                {editingRegno === entry.Regno ? (
                  <input type="text" name="Email" value={editFormData.Email} onChange={handleEditChange} className="form-control" />
                ) : (
                  entry.Email
                )}
              </td>
              <td>
                {editingRegno === entry.Regno ? (
                  <input type="text" name="class_code" value={editFormData.class_code} onChange={handleEditChange} className="form-control" />
                ) : (
                  entry.class_code
                )}
              </td>
              <td>
                {editingRegno === entry.Regno ? (
                  <button className="btn btn-success btn-sm me-2" onClick={() => handleSaveClick(entry.Regno)}>Save</button>
                ) : (
                  <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditClick(entry)}>Edit</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(entry.Regno)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <ImportData endpoint="student"/>
    </div>
  );
};

export default Students;