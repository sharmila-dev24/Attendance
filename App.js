import Register from './Register.js';
import Login from './Login.js';
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import StaffView from './StaffView.js';
import AttendancePage from './AttendancePage.js';
import Calender from './Calender.js'
import Time from './Time.js'
import Staff from './Staff.js'
import Students from './Students.js'
import AttendanceReport from './AttendanceReport'
import Admins from './Admins'
import AdminDashboard from './AdminDashboard.js';
import ImportData from './ImportData'
export default function App(){
  return(
   <Router>
     <Routes>
       <Route path="/" element={<Register />} />
       <Route path="/login" element={<Login />} />

      
       <Route path="/staff" element={<StaffView />} />
        <Route path="/attendance/:classCode/:hour/:subCode/:date" element={<AttendancePage />} />
        
        <Route path="/admin" element={<Admins />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="calender" element={<Calender />} />
          <Route path="staff" element={<Staff />} />
          <Route path="time" element={<Time />} />
          <Route path="students" element={<Students />} />
          <Route path="AttendanceReport" element={<AttendanceReport />} />
          <Route path="ImportData" element={<ImportData />} />
        </Route>
     </Routes>
   </Router>
  )
}