import { Outlet,Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

export default function Admins() {
  return (
    <div className="container-fluid min-vh-100 bg-light">
      <div className="row">
        {/* Sidebar */}
        <nav className="col-md-3 col-lg-2 d-md-block bg-dark sidebar py-3">
          <h2 className="text-white text-center mb-4">Admin Panel</h2>
          <ul className="nav flex-column">
          <li className="nav-item">
              <Link to="/admin/dashboard" className="nav-link text-white">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link to="/admin/Calender" className="nav-link text-white">📅 Calendar</Link>
            </li>
            <li className="nav-item">
              <Link to="/admin/Students" className="nav-link text-white">🎓 Manage Students</Link>
            </li>
            <li className="nav-item">
              <Link to="/admin/Staff" className="nav-link text-white">👨‍🏫 Manage Faculty</Link>
            </li>
            <li className="nav-item">
              <Link to="/admin/Time" className="nav-link text-white">📌 Time Table</Link>
            </li>
            <li className="nav-item">
              <Link to="/admin/AttendanceReport" className="nav-link text-white">📊 Report Generation</Link>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <main className="col-md-9 col-lg-10 px-md-5 py-4">
         <Outlet />
        </main>
      </div>
    </div>
  );
}
