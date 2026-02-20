import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'

// Staff pages
import StaffDashboard from './pages/staff/Dashboard'
import StaffAttendance from './pages/staff/Attendance'
import StaffNotes from './pages/staff/Notes'
import StaffTimetable from './pages/staff/Timetable'
import StaffAnnouncements from './pages/staff/Announcements'
import StaffLeave from './pages/staff/Leave'
import FaceRegistry from './pages/staff/FaceRegistry'        // ← NEW: AI face registration

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentFaceAttendance from './pages/student/FaceAttendance'
import StudentResults from './pages/student/Results'
import StudentFeedback from './pages/student/Feedback'
import StudentEvents from './pages/student/Events'
import StudentFees from './pages/student/Fees'
import AIInsights from './pages/student/AIInsights'          // ← NEW: ML performance insights
import PlacementPrep from './pages/student/PlacementPrep'    // ← NEW: placement prediction + resume

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminStudentPerformance from './pages/admin/StudentPerformance'
import AdminStaffPerformance from './pages/admin/StaffPerformance'
import AdminUsers from './pages/admin/Users'
import AdminReports from './pages/admin/Reports'
import AIAnalytics from './pages/admin/AIAnalytics'          // ← NEW: full ML admin dashboard

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Staff Routes */}
      <Route path="/staff" element={<StaffDashboard />} />
      <Route path="/staff/attendance" element={<StaffAttendance />} />
      <Route path="/staff/notes" element={<StaffNotes />} />
      <Route path="/staff/timetable" element={<StaffTimetable />} />
      <Route path="/staff/announcements" element={<StaffAnnouncements />} />
      <Route path="/staff/leave" element={<StaffLeave />} />
      <Route path="/staff/face-registry" element={<FaceRegistry />} />

      {/* Student Routes */}
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/attendance" element={<StudentFaceAttendance />} />
      <Route path="/student/results" element={<StudentResults />} />
      <Route path="/student/feedback" element={<StudentFeedback />} />
      <Route path="/student/events" element={<StudentEvents />} />
      <Route path="/student/fees" element={<StudentFees />} />
      <Route path="/student/ai-insights" element={<AIInsights />} />
      <Route path="/student/placement" element={<PlacementPrep />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/student-performance" element={<AdminStudentPerformance />} />
      <Route path="/admin/staff-performance" element={<AdminStaffPerformance />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/ai-analytics" element={<AIAnalytics />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
