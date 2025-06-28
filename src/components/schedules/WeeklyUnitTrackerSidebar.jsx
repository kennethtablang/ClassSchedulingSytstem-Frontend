// src/components/schedules/WeeklyUnitTrackerSidebar.jsx

import React from "react";

const WeeklyUnitTrackerSidebar = ({ schedules, subjects }) => {
  // Safely compute unit usage
  const unitUsage = Array.isArray(subjects)
    ? subjects.map((subject) => {
        const subjectId = subject.id;
        const subjectTitle =
          subject.subjectTitle || subject.title || "Unknown Subject";
        const subjectColor = subject.color || "#999";
        const subjectUnits = subject.units || 0;

        const subjectSchedules = Array.isArray(schedules)
          ? schedules.filter((s) => s.subjectId === subjectId)
          : [];

        const totalHours = subjectSchedules.reduce((acc, sched) => {
          const start = new Date(`1970-01-01T${sched.startTime}`);
          const end = new Date(`1970-01-01T${sched.endTime}`);
          const hours = (end - start) / (1000 * 60 * 60);
          return acc + hours;
        }, 0);

        return {
          subjectTitle,
          subjectColor,
          units: subjectUnits,
          totalHoursScheduled: totalHours,
        };
      })
    : [];

  return (
    <aside className="w-full max-w-xs p-4 bg-gray-50 border rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4">Weekly Unit Tracker</h3>
      <ul className="space-y-3">
        {unitUsage.map((item, index) => (
          <li
            key={index}
            className="flex items-center justify-between border px-3 py-2 rounded"
            style={{ borderLeft: `4px solid ${item.subjectColor}` }}
          >
            <div>
              <p className="font-semibold text-sm">{item.subjectTitle}</p>
              <p className="text-xs text-gray-500">
                Scheduled: {item.totalHoursScheduled}h / {item.units}u
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                item.totalHoursScheduled > item.units
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {item.totalHoursScheduled > item.units ? "Over" : "OK"}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default WeeklyUnitTrackerSidebar;
