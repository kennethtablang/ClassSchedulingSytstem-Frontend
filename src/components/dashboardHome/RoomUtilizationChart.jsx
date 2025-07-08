import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAllSchedules } from "../../services/scheduleService";

// Helper: convert "HH:mm:ss" to float hours
const getHours = (start, end) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh + em / 60 - (sh + sm / 60);
};

const RoomUtilizationChart = ({ currentSemester }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!currentSemester) return;

    const load = async () => {
      try {
        const res = await getAllSchedules();
        const schedules = res.data;

        // Filter schedules by semester name and school year label
        const filtered = schedules.filter(
          (s) =>
            s.semesterName === currentSemester.name &&
            s.schoolYearLabel === currentSemester.schoolYearLabel
        );

        const dayMap = {
          Sunday: 0,
          Monday: 0,
          Tuesday: 0,
          Wednesday: 0,
          Thursday: 0,
          Friday: 0,
          Saturday: 0,
        };

        filtered.forEach((s) => {
          const hours = getHours(s.startTime, s.endTime);
          dayMap[s.day] = (dayMap[s.day] || 0) + hours;
        });

        const formattedData = Object.entries(dayMap).map(([day, hours]) => ({
          day,
          hours: +hours.toFixed(2),
        }));

        setData(formattedData);
      } catch (err) {
        console.error("Room utilization load failed:", err);
      }
    };

    load();
  }, [currentSemester]);

  return (
    <div className="bg-white rounded-lg shadow border p-4">
      <h3 className="text-lg font-semibold mb-2">Room Utilization by Day</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="day" />
          <YAxis unit=" hrs" />
          <Tooltip formatter={(value) => `${value} hours`} />
          <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RoomUtilizationChart;
