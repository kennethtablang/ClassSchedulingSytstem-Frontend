// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";

// Public pages
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import AuthRedirect from "../components/AuthRedirect";

// Dashboard layout and pages (SuperAdmin & Dean)
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import Profile from "../pages/dashboard/ProfilePage";
import UserManagementPage from "../pages/dashboard/UserManagementPage";
import SchoolYearPage from "../pages/dashboard/SchoolYearPage";
import SemesterPage from "../pages/dashboard/SemesterPage";
import ClassSectionPage from "../pages/dashboard/ClassSectionPage";
import SubjectPage from "../pages/dashboard/SubjectPage";
import FacultyPage from "../pages/dashboard/FacultyPage";
import CollegeCoursePage from "../pages/dashboard/CollegeCoursePage";
import BuildingPage from "../pages/dashboard/BuildingPage";
import RoomPage from "../pages/dashboard/RoomPage";
import ArchivesPage from "../pages/dashboard/ArchivesPage";
import SchedulePage from "../pages/dashboard/SchedulePage";

// Faculty layout and pages
import FacultyLayout from "../layouts/FacultyLayout";
import RequireFaculty from "../components/RequireFaculty";
import FacultySchedulePage from "../pages/faculty/FacultySchedulePage";
import AssignedSubjectsPage from "../pages/faculty/AssignedSubjectsPage";
import AvailableRoomsPage from "../pages/faculty/AvailableRoomsPage"; // Uncomment when added
import FacultyProfile from "../pages/faculty/ProfilePage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<AuthRedirect fallback={<Landing />} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Faculty layout routes */}
      <Route
        path="/faculty"
        element={
          <RequireFaculty>
            <FacultyLayout />
          </RequireFaculty>
        }
      >
        <Route path="schedule" element={<FacultySchedulePage />} />
        <Route path="assigned-subjects" element={<AssignedSubjectsPage />} />
        <Route path="available-rooms" element={<AvailableRoomsPage />} />
        <Route path="profile" element={<FacultyProfile />} />
      </Route>

      {/* Dashboard layout routes (Dean & SuperAdmin) */}
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

        {/* Archives */}
        <Route path="archives" element={<ArchivesPage />} />
      </Route>

      {/* Catch-all (404) */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
};

export default AppRoutes;
