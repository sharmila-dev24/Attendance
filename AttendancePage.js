import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const AttendancePage = () => {
    const { classCode, hour, subCode, date } = useParams();
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    
    const todayDate=new Date().toISOString().split("T")[0]

    useEffect(() => {
        if(date!==todayDate){
            const userConfirmed=window.confirm("You are selecting a different date Are you sure to mark attendance?")
            if(!userConfirmed){
               return
            }
        }

       
        const fetchStudents = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/getStudents/${classCode}`, { withCredentials: true });
                setStudents(response.data);

                const defaultAttendance = {};
                response.data.forEach(student => {
                    defaultAttendance[student.Regno] = 1; // Default: Present (1)
                });
                setAttendance(defaultAttendance);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };
        fetchStudents();
    }, [classCode, hour, date]); // Added hour and date as dependencies

    // Toggle attendance
    const toggleAttendance = (Regno) => {
        setAttendance(prev => ({
            ...prev,
            [Regno]: prev[Regno]=== 1 ? 0 : 1, // Convert 'p' → 1 (Present), 'a' → 0 (Absent)
        }));
    };

    const submitAttendance = async () => {
        if (!hour) {
            alert("Hour not found. Please try again.");
            return;
        }

        setLoading(true);
        try {
            await axios.post("http://localhost:5000/hour", {
                hour,
                class_code: classCode,
                attendance: Object.entries(attendance).map(([Regno, status]) => ({
                    Regno,
                    status, // Already converted to 1 or 0
                    date
                }))
            }, { withCredentials: true });

            alert("Attendance submitted successfully");
        } catch (error) {
            console.error("Error submitting attendance:", error);
            alert("Failed to submit attendance.");
        }
        setLoading(false);
    };

    return (
        <div className="container mt-4">
            <div className="card shadow mb-4">
             <div className="card-body">
            <h2 className="text-center text-primary fw-bold">Mark Attendance for {classCode}</h2>
            <div className="row mt-3">
                <div className="col-md-3"><strong>Class:</strong> <span className="text-success">{classCode}</span></div>
                <div className="col-md-3"><strong>Subject:</strong> <span className="text-success">{subCode}</span></div>
                <div className="col-md-3"><strong>Hour:</strong> <span className="text-success">{hour}</span></div>
                <div className="col-md-3"><strong>Date :</strong> <span className="text-success">{date}</span></div>
            </div>
            </div>
            </div>
           
                <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead className="table-dark">
                        <tr>
                            <th>Reg No</th>
                            <th>Name</th>
                            <th>Attendance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.Regno}>
                                <td>{student.Regno}</td>
                                <td>{student.name}</td>
                                <td>
                                    <button
                                       className={`btn ${attendance[student.Regno]===1?"btn-success":"btn-danger"}`}
                                       onClick={()=>toggleAttendance(student.Regno)}>
                                        {attendance[student.Regno]===1?"present":"absent"}
                                    </button>

                                   
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button
                onClick={submitAttendance}
                disabled={loading || !hour}
               className="btn btn-primary mt-3"
            >
                {loading ? "Submitting..." : "Submit Attendance"}
            </button>
      
    </div>
    );
};

export default AttendancePage;
