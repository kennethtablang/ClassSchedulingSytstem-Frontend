import { useEffect, useState } from "react";
import { getAllSchedules } from "../../services/scheduleService";
import { format } from "date-fns";

const getTodayName = () => format(new Date(), "EEEE"); // "Monday", "Tuesday", etc.

const MiniCalendar = () => {
  const [todaySchedules, setTodaySchedules] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllSchedules();
        const today = getTodayName();

        const filtered = res.data
          .filter((s) => s.day === today)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        setTodaySchedules(filtered);
      } catch (err) {
        console.error("Failed to load today's schedule:", err);
      }
    };

    load();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow border p-4">
      <h3 className="text-lg font-semibold mb-3">
        Today’s Schedule ({getTodayName()})
      </h3>

      {todaySchedules.length === 0 ? (
        <p className="text-gray-500 text-sm">No schedules found for today.</p>
      ) : (
        <ul className="space-y-3">
          {todaySchedules.map((s) => (
            <li key={s.id} className="border-l-4 border-blue-500 pl-3">
              <div className="text-sm font-semibold text-gray-800">
                {s.subjectTitle || "Untitled Subject"}
              </div>
              <div className="text-xs text-gray-500">
                {s.startTime}–{s.endTime} · {s.facultyName || "Unknown Faculty"}
              </div>
              <div className="text-xs text-gray-500">
                {s.courseCode} {s.yearLevel}-{s.classSectionName}
              </div>
              <div className="text-xs text-gray-500">
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
