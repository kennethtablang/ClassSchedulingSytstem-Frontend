import { useEffect, useState } from "react";
import MetricCards from "../../components/dashboardHome/MetricCards";
import RoomUtilizationChart from "../../components/dashboardHome/RoomUtilizationChart";
import RecentActivityFeed from "../../components/dashboardHome/RecentActivityFeed";
import MiniCalendar from "../../components/dashboardHome/MiniCalendar";
import FacultyLoadChart from "../../components/dashboardHome/FacultyLoadChart";
import {
  getCurrentSemesters,
  getSemesters as getAllSemesters,
} from "../../services/semesterService";

const DashboardHome = () => {
  const [currentSemester, setCurrentSemester] = useState(null);
  const [allSemesters, setAllSemesters] = useState([]);

  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const [allRes, currentRes] = await Promise.all([
          getAllSemesters(),
          getCurrentSemesters(),
        ]);
        setAllSemesters(allRes.data);
        setCurrentSemester(currentRes.data[0] || null);
      } catch (err) {
        console.error("Failed to load semesters:", err);
      }
    };
    loadSemesters();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Semester Selector */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Welcome to PCNL Scheduler</h1>
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium">Semester:</label>
          <select
            className="select select-bordered"
            value={currentSemester?.id || ""}
            disabled={allSemesters.length === 0}
            onChange={(e) => {
              const selected = allSemesters.find(
                (s) => s.id === +e.target.value
              );
              setCurrentSemester(selected);
            }}
          >
            {allSemesters.map((sem) => (
              <option key={sem.id} value={sem.id}>
                {sem.name} ({sem.schoolYearLabel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Cards */}
      <MetricCards currentSemester={currentSemester} />

      {/* Top Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoomUtilizationChart currentSemester={currentSemester} />
        <FacultyLoadChart currentSemester={currentSemester} />
      </div>

      {/* Bottom Row: Activity + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityFeed currentSemester={currentSemester} />
        <MiniCalendar currentSemester={currentSemester} />
      </div>
    </div>
  );
};

export default DashboardHome;
