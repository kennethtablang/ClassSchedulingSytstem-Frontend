import { useEffect, useState } from "react";
import { getAllSchedules } from "../../services/scheduleService";
import { format } from "date-fns";

const RecentActivityFeed = ({ currentSemester }) => {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentSemester) {
      setRecent([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllSchedules();

        // Filter by current semester
        const filtered = res.data.filter(
          (s) =>
            s.semesterName === currentSemester.name &&
            s.schoolYearLabel === currentSemester.schoolYearLabel
        );

        // Sort by ID descending (most recent first) and take top 10
        const sorted = filtered.sort((a, b) => b.id - a.id).slice(0, 10);

        setRecent(sorted);
      } catch (err) {
        console.error("Failed to load recent schedule activity:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentSemester]);

  const formatTime = (timeStr) => {
    try {
      const [hours, minutes] = timeStr.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, "h:mm a");
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border p-4">
      <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>

      {!currentSemester ? (
        <p className="text-gray-500 text-sm">
          Select a semester to view activity.
        </p>
      ) : loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : recent.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent activity.</p>
      ) : (
        <ul className="space-y-3 max-h-[400px] overflow-y-auto">
          {recent.map((s) => (
            <li
              key={s.id}
              className="border-l-4 border-blue-500 pl-3 py-2 hover:bg-gray-50 transition"
            >
              <p className="text-sm">
                <strong className="text-gray-800">
                  {s.subjectTitle || "Untitled"}
                </strong>
                {" assigned to "}
                <span className="text-blue-600 font-medium">
                  {s.facultyName || "Unknown"}
                </span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-medium">
                  {s.courseCode} {s.yearLevel}-{s.classSectionName}
                </span>
                {" • "}
                {s.day} at {formatTime(s.startTime)}–{formatTime(s.endTime)}
                {" • "}
                Room: {s.roomName || "TBA"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivityFeed;
