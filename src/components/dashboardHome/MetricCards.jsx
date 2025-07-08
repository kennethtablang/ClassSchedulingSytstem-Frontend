import { useEffect, useState } from "react";
import { getAllSchedules } from "../../services/scheduleService";
import { getFacultyUsers } from "../../services/facultyService";
import { getSubjects } from "../../services/subjectService";
import { getRooms } from "../../services/roomService";
import { format } from "date-fns";

const MetricCards = ({ currentSemester }) => {
  const [totalSchedules, setTotalSchedules] = useState(0);
  const [unassignedUnits, setUnassignedUnits] = useState(0);
  const [facultyLoad, setFacultyLoad] = useState(0);
  const [overloadedFacultyCount, setOverloadedFacultyCount] = useState(0);
  const [availableRoomsCount, setAvailableRoomsCount] = useState(0);

  useEffect(() => {
    if (!currentSemester) return;

    const fetchData = async () => {
      try {
        const [schedulesRes, facultyRes, subjectsRes, roomsRes] =
          await Promise.all([
            getAllSchedules(),
            getFacultyUsers(),
            getSubjects(),
            getRooms(),
          ]);

        const allSchedules = schedulesRes.data;
        const faculty = facultyRes.data;
        const subjects = subjectsRes.data;
        const rooms = roomsRes.data;

        // ✅ Filter schedules by Semester Name and School Year Label
        const schedules = allSchedules.filter(
          (s) =>
            s.semesterName === currentSemester.name &&
            s.schoolYearLabel === currentSemester.schoolYearLabel
        );

        setTotalSchedules(schedules.length);

        // ✅ Faculty Load Calculation
        const facultyUnitMap = {};
        schedules.forEach((s) => {
          if (!facultyUnitMap[s.facultyId]) facultyUnitMap[s.facultyId] = 0;
          const duration =
            new Date(`1970-01-01T${s.endTime}`) -
            new Date(`1970-01-01T${s.startTime}`);
          facultyUnitMap[s.facultyId] += duration / (1000 * 60 * 60);
        });

        const totalAssigned = Object.values(facultyUnitMap).reduce(
          (a, b) => a + b,
          0
        );
        const avgLoad = totalAssigned / (faculty.length || 1);
        const maxLoadPerFaculty = 18;
        setFacultyLoad(Math.round((avgLoad / maxLoadPerFaculty) * 100));

        // ✅ Overloaded Faculty
        const overloadThreshold = 21;
        const overloadedCount = Object.values(facultyUnitMap).filter(
          (units) => units > overloadThreshold
        ).length;
        setOverloadedFacultyCount(overloadedCount);

        // ✅ Unassigned Units
        const assignedSubjectIds = new Set(schedules.map((s) => s.subjectId));
        const unassigned = subjects.filter(
          (s) =>
            s.semesterId === currentSemester.id && !assignedSubjectIds.has(s.id)
        );
        const totalUnassignedUnits = unassigned.reduce(
          (sum, subj) => sum + subj.units,
          0
        );
        setUnassignedUnits(totalUnassignedUnits);

        // ✅ Available Rooms (Today)
        const today = format(new Date(), "EEEE");
        const usedRoomIdsToday = new Set(
          schedules.filter((s) => s.day === today).map((s) => s.roomId)
        );
        const available = rooms.filter((r) => !usedRoomIdsToday.has(r.id));
        setAvailableRoomsCount(available.length);
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      }
    };

    fetchData();
  }, [currentSemester]);

  const metrics = [
    {
      title: "Total Schedules",
      value: totalSchedules,
      description: "Across all sections",
    },
    {
      title: "Unassigned Units",
      value: unassignedUnits,
      description: "Subjects not yet scheduled",
    },
    {
      title: "Faculty Load",
      value: `${facultyLoad}%`,
      description: "Average load per faculty",
    },
    {
      title: "Overloaded Faculty",
      value: overloadedFacultyCount,
      description: "> 21 units assigned",
    },
    {
      title: "Available Rooms",
      value: availableRoomsCount,
      description: "Free today",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className="bg-white rounded-lg shadow border p-4 hover:shadow-md transition"
        >
          <h4 className="text-sm text-gray-500">{metric.title}</h4>
          <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
          <p className="text-xs text-gray-400">{metric.description}</p>
        </div>
      ))}
    </div>
  );
};

export default MetricCards;
