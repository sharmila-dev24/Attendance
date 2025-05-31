import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link for navigation
import "bootstrap/dist/css/bootstrap.min.css"

const StaffView = () => {
  const [date, setDate] = useState("");
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dayOrder,setDayOrder]=useState(null);
  const [facultyName,setFacultyName]=useState("");

  const fetchWorkload = async () => {
    if (!date) {
      alert("Please select a date.");
      return;
    }

    setLoading(true);
    try {

      const response = await axios.post(
        "http://localhost:5000/getWorkload",
        { date },
        { withCredentials: true }
      );
      console.log(response.data);
      setWorkload(response.data);
    
       if(response.data.length>0){
        setDayOrder(response.data[0].day_order)
        setFacultyName(response.data[0].name)
        console.log(response.data[0].name)
       }
       else{
        setDayOrder("not available")
        setFacultyName("")
       }
    } catch (error) {
      console.error("Error fetching workload:", error);
      alert("Failed to fetch workload. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center bg-danger text-white py-2 roounded">
        WELCOME {facultyName ? facultyName:"Faculty"}
      </h1>

      {/* Date Picker */}
      <div className="d-flex justify-content-end mb-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          //max={new Date().toISOString().split("T")[0]}
         className="form-control me-2 w-auto"
        />
        <button onClick={fetchWorkload} disabled={loading} className="btn btn-primary">
          {loading ? "Loading..." : "Show"}
        </button>
      </div>

      {dayOrder!==null&&(<h2 className="text-center my-3">Day Order:{dayOrder??"Not available"}</h2>)}

    
      {/* Workload Display */}
      {loading ? (
        <p className="text-center">Loading workload data...</p>
      ) : workload.length > 0 ? (
        <div className="row justify-content-center">
          {workload.map((item, index) => (
            <div
              key={index}
              className="col-md-4 col-sm-6 mb-3"
            >
              
            <div className={`card border-${index %3 ===0?"danger":index %3===1 ?"warning" :"success"}`} >
             <div className="card-body text-center"> 
              {/* Clickable Class Name that Navigates */}
              <h5 className="card-title">

                 <Link to={`/attendance/${item.class_code}/${item.hour}/${item.sub_code}/${date}`} 
                 className="text-dark text-decoration-none">{item.class_code}</Link>
              </h5>
              
              <p className="card-text">
                <b>Subject:</b> {item.sub_code}
              </p>
              
              <p className="card-text">
                <b>Subject_Name:</b> {item.sub_name}
              </p>

              <p className="card-text">
                <b>Hour:</b> {item.hour}
              </p>
            </div>
            </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">No workload found for the selected date.</p>
      )}
    </div>
  );
};

export default StaffView;
