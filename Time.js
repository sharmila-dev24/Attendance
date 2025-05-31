import React, { useState, useEffect } from "react";
//import "./Calender.css";
import ImportData from './ImportData'
import SelectableTable from "./SelectableTable";

const Workload = () => {
  const [time, setTime] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    faculty_id: "",
    day_order: "",
    hour: "",
    sub_code: "",
    class_code: "",
  });
  const [viewMode, setViewMode] = useState("view");
 

  // Fetch workload data
  useEffect(() => {
    fetch("http://localhost:5000/admin/timetable")
      .then((res) => res.json())
      .then((data) => setTime(data))
      .catch((err) => console.error("Error fetching workload", err));
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new entry (POST)
  const handleAdd = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/admin/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        setTime([...time, data]);
        setViewMode("view");
        setFormData({ faculty_id: "", day_order: "", hour: "", sub_code: "", class_code: "" }); // Reset form
      })
      .catch((err) => console.error("Error adding entry", err));
  };

  // Delete an entry (DELETE)
  const handleDelete = (faculty_id, day_order, hour) => {
    fetch(`http://localhost:5000/admin/timetable/${faculty_id}/${day_order}/${hour}`, {
      method: "DELETE",
    })
      .then(() => setTime(time.filter((entry) => !(entry.faculty_id === faculty_id && entry.day_order === day_order && entry.hour === hour))))
      .catch((err) => console.error("Error deleting entry", err));
  };

  // Enable editing for a row
  const handleEdit = (index) => {
    setEditIndex(index);
  };

  // Save updated row (PATCH)
  const handleSave = (index) => {
    const entry = time[index];
    fetch(`http://localhost:5000/admin/timetable/${entry.faculty_id}/${entry.day_order}/${entry.hour}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    })
      .then((res) => res.json())
      .then(() => {
        setTime([...time]);
        setEditIndex(null);
      })
      .catch((err) => console.error("Error updating entry", err));
  };

  // Handle input change in the table during editing
  const handleEditChange = (index, field, value) => {
    const updatedTime = [...time];
    updatedTime[index][field] = value;
    setTime(updatedTime);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center text-primary mb-4">Workload Management</h2>
      <ImportData endpoint="workload" />

      <div className="d-flex justify-content-center mb-3">
      <button className="btn btn-outline-primary mx-2" onClick={() => setViewMode("view")}>View Workload</button>
      <button className="btn btn-primary mx-2" onClick={() => setViewMode("add")}>Add New Entry</button>
      </div>

      {viewMode === "view" ? (
        <div className="table-responsive">
        <table className="table table-stripped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Faculty ID</th>
              <th>Day Order</th>
              <th>Hour</th>
              <th>Subject Code</th>
              <th>Class Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {time.map((entry, index) => (
              <tr key={`${entry.faculty_id}-${entry.day_order}-${entry.hour}`}>
                {["faculty_id", "day_order", "hour", "sub_code", "class_code"].map((field) => (
                  <td key={field}>
                    {editIndex === index ? (
                      <input
                        className="form-control"
                        value={entry[field]}
                        onChange={(e) => handleEditChange(index, field, e.target.value)}
                      />
                    ) : (
                      entry[field]
                    )}
                  </td>
                ))}
                <td>
                  {editIndex === index ? (
                    <button className="btn btn-success btn-sm me-2" onClick={() => handleSave(index)}>Save</button>
                  ) : (
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(index)}>Edit</button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(entry.faculty_id, entry.day_order, entry.hour)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      ) : (
        <div className="card p-4 shadow-sm">
        <h4 className="text-center text-secondary">Add Workload Entry</h4>
        <form onSubmit={handleAdd}>
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Faculty ID</label>
              <input type="text" name="faculty_id" className="form-control" placeholder="Faculty ID" value={formData.faculty_id} onChange={handleChange} required />
             </div> 

              <div className="col-md-6">
              <label className="form-label">Day order</label>
              <input type="text" name="day_order" className="form-control" placeholder="Day Order" value={formData.day_order} onChange={handleChange} required />
             </div>

             <div className="col-md-6 mt-3">
                 <label className="form-label">Hour</label>
                 <input type="text" name="hour" className="form-control" 
                  placeholder="Hour" value={formData.hour} onChange={handleChange} required />
            </div>

            <div className="col-md-6 mt-3">
                <label className="form-label">subject code</label>
               <input type="text" name="sub_code" className="form-control" placeholder="Subject Code" value={formData.sub_code} onChange={handleChange} required />
            </div>

            <div className="col-md-6 mt-3">
              <label className="form-label">class code</label>
              <input type="text" name="class_code" className="form-control" placeholder="Class Code" value={formData.class_code} onChange={handleChange} required />
            </div>
            </div>

            <div className="text-center mt-4">
              <button type="submit">Add Entry</button>
            </div>
        </form>
        </div>
      )}
    </div>
  );
};

export default Workload;
