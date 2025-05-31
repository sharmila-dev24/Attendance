import { useState } from "react";
import { Table, Form, Button, Container, Row, Col } from "react-bootstrap";
//import Papa from "paperparse";
const Papa=require("papaparse")

function AttendancePercentage() {
    const [classCode, setClassCode] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [attendanceData, setAttendanceData] = useState([]);

    const fetchAttendance = async () => {
        if (!classCode || !startDate || !endDate) {
            alert("Please enter class code and select date range.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/attendance-percentage?class_code=${classCode}&startDate=${startDate}&endDate=${endDate}`
            );
            const data = await response.json();
            setAttendanceData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const exportCSV=()=>{
        const csv=Papa.unparse(attendanceData);
        const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"})
        const url=URL.createObjectURL(blob);
        const link=document.createElement("a");
        link.setAttribute("href",url)
        link.setAttribute("download",`Attendance_Report_${classCode}.csv`)
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <Container className="mt-4">
            <h2 className="text-center mb-4">Attendance Percentage</h2>
            
            <Row className="mb-3">
                <Col md={4}>
                    <Form.Control
                        type="text"
                        placeholder="Enter Class Code"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value)}
                    />
                </Col>
                <Col md={3}>
                    <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </Col>
                <Col md={3}>
                    <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </Col>
                <Col md={2}>
                    <Button variant="primary" onClick={fetchAttendance}>
                        Get Attendance
                    </Button>
                </Col>
            </Row>

            {attendanceData.length > 0 && (
                <>
                <Table striped bordered hover responsive>
                    <thead className="table-dark">
                        <tr>
                            <th>Reg No</th>
                            <th>Name</th>
                            <th>Attended Hours</th>
                            <th>Total Hours</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceData.map((student) => (
                            <tr key={student.Regno}>
                                <td>{student.Regno}</td>
                                <td>{student.name}</td>
                                <td>{student.attended_hours}</td>
                                <td>{student.total_hours}</td>
                                <td>{student.percentage}%</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Button variant="success" className="mt-3" onClick={exportCSV}>Export as CSV</Button>
                </>
            )}
        </Container>
    );
}

export default AttendancePercentage;
