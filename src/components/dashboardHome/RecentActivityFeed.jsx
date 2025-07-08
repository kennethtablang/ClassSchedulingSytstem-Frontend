import { useEffect, useState } from "react";
import { getAllSchedules } from "../../services/scheduleService";

const RecentActivityFeed = () => {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllSchedules();
        const sorted = res.data
          .sort((a, b) => b.id - a.id) // Most recent (by ID as fallback)
          .slice(0, 5);

        setRecent(sorted);
      } catch (err) {
        console.error("Failed to load recent schedule activity:", err);
      }
    };

    load();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow border p-4">
      <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
      <ul className="space-y-3">
        {recent.length === 0 && (
          <li className="text-gray-500 text-sm">No recent activity.</li>
        )}
        {recent.map((s) => (
          <li key={s.id} className="border-l-4 border-blue-500 pl-3">
            <p className="text-sm">
              <strong>{s.subjectTitle}</strong> assigned to{" "}
              <span className="text-blue-600 font-medium">{s.facultyName}</span>{" "}
              in <span className="font-medium">{s.classSectionName}</span>
            </p>
            <p className="text-xs text-gray-500">
              {s.day} | {s.startTime}–{s.endTime}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivityFeed;
