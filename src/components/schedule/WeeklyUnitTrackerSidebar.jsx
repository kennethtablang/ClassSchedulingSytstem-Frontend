// src/components/schedule/WeeklyUnitTrackerSidebar.jsx
import React, { useMemo } from "react";
import { FaBookOpen } from "react-icons/fa";

const WeeklyUnitTrackerSidebar = ({ schedules = [] }) => {
  // Group by subject + section, sum up durations
  const trackerItems = useMemo(() => {
    const map = {};
    (schedules || []).forEach((s) => {
      const key = `${s.subjectId}-${s.classSectionId}`;
      if (!map[key]) {
        map[key] = {
          subjectId: s.subjectId,
          subjectTitle: s.subjectTitle,
          sectionLabel: s.classSectionName,
          units: s.subjectUnits || 0,
          color: s.subjectColor || "#6B7280",
          totalHours: 0,
        };
      }
      map[key].totalHours += s.duration || 0;
    });
    return Object.values(map);
  }, [schedules]);

  return (
    <div className="bg-white shadow rounded p-4 h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <FaBookOpen /> Weekly Unit Tracker
      </h2>

      {trackerItems.length === 0 ? (
        <p className="text-sm text-gray-500">No scheduled subjects yet.</p>
      ) : (
        <ul className="space-y-4">
          {trackerItems.map((item) => {
            const percent =
              item.units > 0
                ? Math.min((item.totalHours / item.units) * 100, 100)
                : 0;
            const remaining = Math.max(item.units - item.totalHours, 0);

            return (
              <li
                key={`${item.subjectId}-${item.sectionLabel}`}
                className="border border-gray-200 rounded p-2"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm font-medium">
                    {item.subjectTitle}{" "}
                    <span className="text-xs text-gray-500">
                      ({item.sectionLabel})
                    </span>
                  </div>
                  <div className="text-xs">
                    {item.totalHours.toFixed(1)}h / {item.units}u
                  </div>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded mb-1">
                  <div
                    className="h-3 rounded"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                {remaining > 0 && (
                  <p className="text-xs text-gray-500">
                    {remaining.toFixed(1)}h remaining
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default WeeklyUnitTrackerSidebar;
