import React, { useState, useEffect } from "react";
import ImportData from'./ImportData'
const Staff = () => {
  const [faculty, setFaculty] = useState([]);
  const [editing, setEditing] = useState(null); // Track which student is being edited
  const [editFormData, setEditFormData] = useState({});  // Store updated values
  const [formData, setFormData] = useState({  // New student form data
    faculty_id: "",
    Name: "",
    Phone: "",
    Email: "",
    Designation: "",
  });

  // Fetch student data from backend
  useEffect(() => {
    fetch("http://localhost:5000/admin/staff")
      .then((res) => res.json())
      .then((data) => setFaculty(data))
      .catch((err) => console.error("Error fetching students", err));
  }, []);

  // Handle form input changes (New student form)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new student (POST)
  const handleAdd = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/admin/staffs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        setFaculty([...faculty, data]);
        setFormData({ faculty_id: "", name: "", Phone: "", Email: "", Designation: "" }); // Clear form
      })
      .catch((err) => console.error("Error adding faculty", err));
  };

  // Enable editing mode
  const handleEditClick = (s) => {
    setEditing(s.faculty_id); // Set current editing student
    setEditFormData({ ...s }); // Copy current values
  };

  // Handle input changes for inline editing
  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Save edited student details (PATCH)
  const handleSaveClick = (faculty_id) => {
    fetch(`http://localhost:5000/admin/Staffs/${faculty_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editFormData),
    })
      .then((res) => res.json())
      .then(() => {
        setFaculty(faculty.map((s) => (s.faculty_id=== faculty_id ? editFormData : s))); // Update UI
        setEditing(null); // Exit edit mode
      })
      .catch((err) => console.error("Error updating faculty", err));
  };

  // Delete a student (DELETE)
  const handleDelete = (faculty_id) => {
    fetch(`http://localhost:5000/admin/Staff/${faculty_id}`, {
      method: "DELETE",
    })
      .then(() => setFaculty(faculty.filter((entry) => entry.faculty_id !== faculty_id)))
      .catch((err) => console.error("Error deleting student", err));
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Manage Faculty</h2>

      <div className="card p-4 mb-4 shadow">
      <h3 className="mb-3">Add New Faculty</h3>
      <ImportData endpoint='faculty' />
      <form onSubmit={handleAdd} className="row g-3">

        <div className="col-md-4">
        <input type="text" name="faculty_id" value={formData.faculty_id} onChange={handleChange} className="form-control" placeholder="Enter Faculty_id" required />
        </div>

        <div className="col-md-4">
        <input type="text" name="Name" value={formData.Name} onChange={handleChange} className="form-control" placeholder="Enter Name" required />
        </div>
        
        <div className="col-md-4">
        <input type="text" name="Phone" value={formData.Phone} onChange={handleChange} className="form-control" placeholder="Enter Phone" />
        </div>

        <div className="col-md-6">
        <input type="text" name="Email" value={formData.Email} onChange={handleChange} className="form-control" placeholder="Enter Email" required />
        </div>

        <div className="col-md-6">
        <input type="text" name="Designation" value={formData.Designation} className="form-control" onChange={handleChange} placeholder="Enter Designation" required />
        </div>

        <div className="col-12">
        <button type="submit" className="btn btn-primary w-100">Add Staff</button>
        </div>
    
      </form>
      </div>

      {/* Student Table */}
      <h3 className="text-center mt-4">Staff's List</h3>
      <div className="table-responsive">
      <table className="table table-bordered table-striped mt-3">
        <thead className="table-dark">
          <tr>
            <th>Faculty_id</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Designation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {faculty.map((entry) => (
            <tr key={entry.faculty_id}>
              <td>{entry.faculty_id}</td>
              <td>
                {editing === entry.faculty_id ? (
                  <input type="text" name="Name" value={editFormData.Name} onChange={handleEditChange} className="form-control" />
                ) : (
                  entry.Name
                )}
              </td>
              <td>
                {editing === entry.faculty_id ? (
                  <input type="text" name="Phone" value={editFormData.Phone} onChange={handleEditChange} className="form-control" />
                ) : (
                  entry.Phone
                )}
              </td>
              <td>
                {editing === entry.faculty_id ? (
                  <input type="text" name="Email" value={editFormData.Email} onChange={handleEditChange} className="form-control" />
                ) : (
                  entry.Email
                )}
              </td>
              <td>
                {editing === entry.faculty_id ? (
                  <input type="text" name="Designation" value={editFormData.Designation} onChange={handleEditChange} className="form-control" />
                ) : (
                  entry.Designation
                )}
              </td>
              <td>
                {editing === entry.faculty_id ? (
                  <button className="btn btn-success btn-sm me-2" onClick={() => handleSaveClick(entry.faculty_id)}>Save</button>
                ) : (
                  <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditClick(entry)}>Edit</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(entry.faculty_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default Staff;