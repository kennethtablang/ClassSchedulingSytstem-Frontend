import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/dashboard/ProfilePage";

// Dashboard layout and pages
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import UserManagementPage from "../pages/dashboard/UserManagementPage";
import SchoolYearPage from "../pages/dashboard/SchoolYearPage";
import SemesterPage from "../pages/dashboard/SemesterPage";
import ClassSectionPage from "../pages/dashboard/ClassSectionPage";
import SubjectPage from "../pages/dashboard/SubjectPage";
import FacultyPage from "../pages/dashboard/FacultyPage";
import CollegeCoursePage from "../pages/dashboard/CollegeCoursePage";
import BuildingPage from "../pages/dashboard/BuildingPage";
import RoomPage from "../pages/dashboard/RoomPage";
// import NotificationsPage from "../pages/dashboard/NotificationsPage";
// import AlertFacultyPage from "../pages/dashboard/AlertFacultyPage";
// import ReportsPage from "../pages/dashboard/ReportsPage";
// import ArchivesPage from "../pages/dashboard/ArchivesPage";
import SchedulePage from "../pages/dashboard/SchedulePage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard layout with nested routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<Profile />} />
        <Route path="schedules" element={<SchedulePage />} />

        {/* Academic */}
        <Route path="school-year" element={<SchoolYearPage />} />
        <Route path="semester" element={<SemesterPage />} />
        <Route path="class-section" element={<ClassSectionPage />} />
        <Route path="subjects" element={<SubjectPage />} />

        {/* Management */}
        <Route path="faculty" element={<FacultyPage />} />
        <Route path="userManagement" element={<UserManagementPage />} />
        <Route path="courses" element={<CollegeCoursePage />} />

        {/* Infrastructure */}
        <Route path="buildings" element={<BuildingPage />} />
        <Route path="rooms" element={<RoomPage />} />

        {/* Communication */}
        {/* <Route path="notifications" element={<NotificationsPage />} /> */}
        {/* <Route path="alert-faculty" element={<AlertFacultyPage />} /> */}

        {/* Reports */}
        {/* <Route path="reports" element={<ReportsPage />} /> */}
        {/* <Route path="archives" element={<ArchivesPage />} /> */}

        {/* Scheduling */}
        {/* <Route path="schedules" element={<SchedulesPage />} /> */}
      </Route>

      {/* Catch-all (404) */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
};

export default AppRoutes;
