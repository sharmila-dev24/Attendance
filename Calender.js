import React, { useState, useEffect } from "react";
import ImportData from './ImportData'

const AdminCalendar = () => {
  const [calendar, setCalendar] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    day: "",
    remarks: "",
    day_order: "",
    current_workingday: "",
    academic_year:"",
  });
  const [viewMode, setViewMode] = useState("view");

  // Fetch calendar data
  useEffect(() => {
    fetch("http://localhost:5000/calenderss")
      .then((res) => res.json())
      .then((data) =>{
        
         setCalendar(data)})
      .catch((err) => console.error("Error fetching calendar", err));
  }, []);
  

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new entry (POST)
  const handleAdd = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/calenders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        setCalendar([...calendar, data]);
        setViewMode("view");
      })
      .catch((err) => console.error("Error adding entry", err));
  };

  // Delete an entry (DELETE)
  const handleDelete = (date) => {
    fetch(`http://localhost:5000/calenders/${date}`, {
      method: "DELETE",
    })
      .then(() => setCalendar(calendar.filter((entry) => entry.date !== date)))
      .catch((err) => console.error("Error deleting entry", err));
  };

  // Enable editing for a row
  const handleEdit = (index) => {
    setEditIndex(index);
  };

  // Save updated row (PATCH)
  const handleSave = (entry) => {
    fetch(`http://localhost:5000/calenders/${entry.date}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    })
      .then((res) => res.json())
      .then(() => {
        setCalendar(
          calendar.map((item) => (item.date === entry.date ? entry : item))
        );
        setEditIndex(null);
      })
      .catch((err) => console.error("Error updating entry", err));
  };

  // Handle row changes while editing
  const handleRowChange = (index, field, value) => {
    const updatedCalendar = [...calendar];
    updatedCalendar[index] = { ...updatedCalendar[index], [field]: value };
    setCalendar(updatedCalendar);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Admin Calendar Management</h2>
      
      <ImportData endpoint="calender" />
      <div className="mb-3">
      <button className="btn btn-primary me-2" onClick={() => setViewMode("view")}>View Calendar</button>
      <button className="btn btn-success" onClick={() => setViewMode("add")}>Add New Entry</button>
      </div>
      {viewMode === "view" ? (
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Remarks</th>
              <th>Day Order</th>
              <th>Current Working Day</th>
              <th>Academic Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {calendar.map((entry, index) => (
              <tr key={entry.date}>

                <td>{entry.date}</td>
                <td>
                  {editIndex === index ? (
                    <input
                      type="text"
                      value={entry.day}
                      className="form-conrol"
                      onChange={(e) =>
                        handleRowChange(index, "day", e.target.value)
                      }
                    />
                  ) : (
                    entry.day
                  )}
                </td>
                <td>
                  {editIndex === index ? (
                    <input
                      type="text"
                      value={entry.remarks}
                      className="form-control"
                      onChange={(e) =>
                        handleRowChange(index, "remarks", e.target.value)
                      }
                    />
                  ) : (
                    entry.remarks
                  )}
                </td>
                <td>
                  {editIndex === index ? (
                    <input
                      type="text"
                      value={entry.day_order}
                      className="form-control"
                      onChange={(e) =>
                        handleRowChange(index, "day_order", e.target.value)
                      }
                    />
                  ) : (
                    entry.day_order
                  )}
                </td>
                <td>
                  {editIndex === index ? (
                    <input
                      type="number"
                      value={entry.current_workingday}
                      classNmae="form-control"
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "current_workingday",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    entry.current_workingday
                  )}
                </td>
                <td>
                  {editIndex === index ? (
                    <input
                      type="text"
                      value={entry.academic_year}
                      className="form-control"
                      onChange={(e) =>
                        handleRowChange(index, "academic_year", e.target.value)
                      }
                    />
                  ) : (
                    entry.academic_year
                  )}
                </td>
                <td>
                  {editIndex === index ? (
                    <button className="btn btn-primary me-2" onClick={() => handleSave(entry)}>Save</button>
                  ) : (
                    <button className="btn btn-warning me-2" onClick={() => handleEdit(index)}>Edit</button>
                  )}
                  <button className="btn btn-danger" onClick={() => handleDelete(entry.date)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      ) : (
        // Add new entry form
        <form onSubmit={handleAdd} className="border p-3 rounded shadow">
          <div className="mb-2">
          <input
            type="date"
            name="date"
            value={formData.date}
            className="form-control"
            onChange={handleChange}
            required
          />
          </div>
          <div className="mb-2">
          <input
            type="text"
            name="day"
            value={formData.day}
            className="form-control"
            onChange={handleChange}
            placeholder="Day (e.g., Monday)"
            required
          />
          </div>

          <div className="mb-2">
          <input
            type="text"
            name="remarks"
            value={formData.remarks}
            className="form-control"
            onChange={handleChange}
            placeholder="Remarks"
          />
          </div>

          <div className="mb-2">
          <input
            type="text"
            name="day_order"
            value={formData.day_order}
            className="form-control"
            onChange={handleChange}
            placeholder="Day Order"
            required
          />
          </div>

          <div className="mb-2">
          <input
            type="number"
            name="current_workingday"
            value={formData.current_workingday}
            className="form-control"
            onChange={handleChange}
            placeholder="Current Working Day"
            required
          />
          </div>
          <div className="mb-2">
          <input
            type="text"
            name="academic_year"
            value={formData.academic_year}
            className="form-control"
            onChange={handleChange}
            placeholder="academic_year"
            required
          />
          </div>
          <button type="submit" className="btn btn-success">Add Entry</button>
        </form>
      )}
    </div>
  );
};

export default AdminCalendar;