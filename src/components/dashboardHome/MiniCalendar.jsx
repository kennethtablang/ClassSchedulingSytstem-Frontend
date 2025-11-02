import { useEffect, useState } from "react";
import { getAllSchedules } from "../../services/scheduleService";
import { format } from "date-fns";

const getTodayName = () => format(new Date(), "EEEE");

const MiniCalendar = ({ currentSemester }) => {
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentSemester) {
      setTodaySchedules([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllSchedules();
        const today = getTodayName();

        const filtered = res.data
          .filter(
            (s) =>
              s.day === today &&
              s.semesterName === currentSemester.name &&
              s.schoolYearLabel === currentSemester.schoolYearLabel
          )
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        setTodaySchedules(filtered);
      } catch (err) {
        console.error("Failed to load today's schedule:", err);
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
      <h3 className="text-lg font-semibold mb-3">
        Today's Schedule ({getTodayName()})
      </h3>

      {!currentSemester ? (
        <p className="text-gray-500 text-sm">
          Select a semester to view schedule.
        </p>
      ) : loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : todaySchedules.length === 0 ? (
        <p className="text-gray-500 text-sm">No schedules found for today.</p>
      ) : (
        <ul className="space-y-3 max-h-[400px] overflow-y-auto">
          {todaySchedules.map((s) => (
            <li
              key={s.id}
              className="border-l-4 border-blue-500 pl-3 py-2 hover:bg-gray-50 transition"
            >
              <div className="text-sm font-semibold text-gray-800">
                {s.subjectTitle || "Untitled Subject"}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {formatTime(s.startTime)}–{formatTime(s.endTime)} •{" "}
                {s.facultyName || "Unknown Faculty"}
              </div>
              <div className="text-xs text-gray-600">
                {s.courseCode} {s.yearLevel}-{s.classSectionName}
              </div>
              <div className="text-xs text-gray-600">
                Room: {s.roomName || "TBA"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MiniCalendar;
