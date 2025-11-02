// src/components/schedule/WeeklyUnitTrackerSidebar.jsx
import { useMemo } from "react";
import { FaBookOpen } from "react-icons/fa";

const WeeklyUnitTrackerSidebar = ({ schedules = [], currentSemester }) => {
  const trackerItems = useMemo(() => {
    if (!currentSemester) return [];

    // ✅ Filter schedules by semester name and school year label instead of dates
    const filteredSchedules = schedules.filter((s) => {
      // Match by semester name and school year
      return (
        s.semesterName === currentSemester.name &&
        s.schoolYearLabel === currentSemester.schoolYearLabel
      );
    });

    const map = {};

    filteredSchedules.forEach((s) => {
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
      // ✅ Add duration (already calculated in schedule data)
      map[key].totalHours += s.duration || 0;
    });

    return Object.values(map);
  }, [schedules, currentSemester]);

  return (
    <div className="bg-white shadow rounded p-4 h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <FaBookOpen /> Weekly Unit Tracker
      </h2>

      {/* ✅ Show current semester info */}
      {currentSemester && (
        <div className="mb-4 p-2 bg-blue-50 rounded text-sm">
          <p className="font-medium text-gray-700">
            {currentSemester.name} ({currentSemester.schoolYearLabel})
          </p>
        </div>
      )}

      {trackerItems.length === 0 ? (
        <p className="text-sm text-gray-500">
          {currentSemester
            ? "No scheduled subjects for this semester yet."
            : "Select a semester to view unit tracker."}
        </p>
      ) : (
        <ul className="space-y-4">
          {trackerItems.map((item) => {
            const percent =
              item.units > 0
                ? Math.min((item.totalHours / item.units) * 100, 100)
                : 0;

            const remaining = item.units - item.totalHours;
            const isExceeded = remaining < 0;

            return (
              <li
                key={`${item.subjectId}-${item.sectionLabel}`}
                className="border border-gray-200 rounded p-3 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">
                    {item.subjectTitle}{" "}
                    <span className="text-xs text-gray-500">
                      ({item.sectionLabel})
                    </span>
                  </div>
                  <div className="text-xs font-semibold">
                    {item.totalHours.toFixed(1)}h / {item.units}u
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 h-3 rounded mb-2 overflow-hidden">
                  <div
                    className="h-3 rounded transition-all duration-300"
                    style={{
                      width: `${Math.min(percent, 100)}%`,
                      backgroundColor: isExceeded ? "#ef4444" : item.color,
                    }}
                  />
                </div>

                {/* Status Text */}
                {!isExceeded && remaining > 0 && (
                  <p className="text-xs text-gray-500">
                    {remaining.toFixed(1)}h remaining
                  </p>
                )}

                {isExceeded && (
                  <p className="text-xs text-red-600 font-semibold">
                    ⚠️ Exceeded by {Math.abs(remaining).toFixed(1)}h
                  </p>
                )}

                {remaining === 0 && (
                  <p className="text-xs text-green-600 font-semibold">
                    ✓ Completed
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Summary Stats */}
      {trackerItems.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">Total Subjects</p>
              <p className="text-lg font-bold text-primary">
                {trackerItems.length}
              </p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">Total Hours</p>
              <p className="text-lg font-bold text-primary">
                {trackerItems
                  .reduce((sum, item) => sum + item.totalHours, 0)
                  .toFixed(1)}
                h
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyUnitTrackerSidebar;
