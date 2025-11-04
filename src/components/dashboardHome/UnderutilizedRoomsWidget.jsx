// src/components/dashboardHome/UnderutilizedRoomsWidget.jsx
import { useEffect, useState } from "react";
import { getAllSchedules } from "../../services/scheduleService";
import { getRooms } from "../../services/roomService";
import { FaChartBar, FaExclamationTriangle } from "react-icons/fa";

const UnderutilizedRoomsWidget = ({ currentSemester }) => {
  const [underutilizedRooms, setUnderutilizedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!currentSemester) {
      setUnderutilizedRooms([]);
      setLoading(false);
      return;
    }

    const analyzeRoomUtilization = async () => {
      setLoading(true);
      try {
        const [schedulesRes, roomsRes] = await Promise.all([
          getAllSchedules(),
          getRooms(),
        ]);

        const allSchedules = schedulesRes.data;
        const allRooms = roomsRes.data;

        // Filter schedules by current semester
        const semesterSchedules = allSchedules.filter(
          (s) =>
            s.semesterName === currentSemester.name &&
            s.schoolYearLabel === currentSemester.schoolYearLabel
        );

        // Calculate utilization for each room
        const roomUtilization = allRooms.map((room) => {
          // Get all schedules for this room in current semester
          const roomSchedules = semesterSchedules.filter(
            (s) => s.roomId === room.id
          );

          // Calculate total hours scheduled
          const totalHours = roomSchedules.reduce((sum, schedule) => {
            return sum + (schedule.duration || 0);
          }, 0);

          // Calculate total possible hours (assuming 8-hour days, 5 days/week)
          // This is a simplified calculation - you can adjust based on your needs
          const weeksInSemester = 18; // typical semester length
          const hoursPerWeek = 40; // 8 hours/day * 5 days
          const totalPossibleHours = weeksInSemester * hoursPerWeek;

          // Calculate utilization percentage
          const utilizationRate =
            totalPossibleHours > 0
              ? (totalHours / totalPossibleHours) * 100
              : 0;

          return {
            id: room.id,
            name: room.name,
            buildingName: room.buildingName || "N/A",
            capacity: room.capacity,
            type: room.type || "General",
            totalHours: totalHours.toFixed(1),
            utilizationRate: utilizationRate.toFixed(1),
            scheduleCount: roomSchedules.length,
          };
        });

        // Sort by utilization rate (lowest first) and take top 10
        const sorted = roomUtilization
          .sort((a, b) => a.utilizationRate - b.utilizationRate)
          .slice(0, 10);

        setUnderutilizedRooms(sorted);
      } catch (err) {
        console.error("Failed to analyze room utilization:", err);
        setUnderutilizedRooms([]);
      } finally {
        setLoading(false);
      }
    };

    analyzeRoomUtilization();
  }, [currentSemester]);

  const getUtilizationColor = (rate) => {
    if (rate < 20) return "text-red-600 bg-red-50";
    if (rate < 40) return "text-orange-600 bg-orange-50";
    if (rate < 60) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getUtilizationLabel = (rate) => {
    if (rate < 20) return "Critical";
    if (rate < 40) return "Low";
    if (rate < 60) return "Moderate";
    return "Good";
  };

  const displayRooms = showAll
    ? underutilizedRooms
    : underutilizedRooms.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow border p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaChartBar className="text-warning" />
          Underutilized Rooms
        </h3>
        {underutilizedRooms.length > 0 && (
          <span className="badge badge-warning badge-lg">
            Top {underutilizedRooms.length}
          </span>
        )}
      </div>

      {/* Info Alert */}
      {currentSemester && underutilizedRooms.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 text-sm">
          <p className="text-blue-800">
            <span className="font-medium">
              {currentSemester.name} ({currentSemester.schoolYearLabel})
            </span>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Based on scheduled hours vs. available capacity
          </p>
        </div>
      )}

      {/* Room List */}
      <div className="max-h-[500px] overflow-y-auto">
        {!currentSemester ? (
          <div className="text-center text-gray-500 py-6">
            <p className="text-sm">
              Select a semester to analyze room utilization
            </p>
          </div>
        ) : loading ? (
          <div className="text-center text-gray-500 py-6">
            <div className="loading loading-spinner loading-md"></div>
            <p className="text-sm mt-2">Analyzing rooms...</p>
          </div>
        ) : underutilizedRooms.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            <FaChartBar className="text-4xl mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No data available</p>
            <p className="text-xs mt-1">Unable to analyze room utilization</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayRooms.map((room, index) => (
              <div
                key={room.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                {/* Room Header */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-ghost badge-sm">
                      #{index + 1}
                    </span>
                    <h4 className="font-semibold text-gray-800">{room.name}</h4>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${getUtilizationColor(
                      room.utilizationRate
                    )}`}
                  >
                    {getUtilizationLabel(room.utilizationRate)}
                  </span>
                </div>

                {/* Room Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                  <p>
                    <span className="font-medium">Building:</span>{" "}
                    {room.buildingName}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span> {room.type}
                  </p>
                  <p>
                    <span className="font-medium">Capacity:</span>{" "}
                    {room.capacity || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Schedules:</span>{" "}
                    {room.scheduleCount}
                  </p>
                </div>

                {/* Utilization Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Utilization Rate</span>
                    <span className="font-semibold text-gray-800">
                      {room.utilizationRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        room.utilizationRate < 20
                          ? "bg-red-500"
                          : room.utilizationRate < 40
                          ? "bg-orange-500"
                          : room.utilizationRate < 60
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(room.utilizationRate, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {room.totalHours} hours scheduled
                  </p>
                </div>

                {/* Warning for critically underutilized */}
                {room.utilizationRate < 20 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                    <FaExclamationTriangle />
                    <span>
                      Critically underutilized - consider reassignment
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Show More/Less Button */}
      {underutilizedRooms.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn btn-sm btn-outline"
          >
            {showAll ? "Show Less" : `Show All (${underutilizedRooms.length})`}
          </button>
        </div>
      )}

      {/* Summary Stats */}
      {underutilizedRooms.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600">Avg. Utilization</p>
              <p className="text-lg font-bold text-gray-800">
                {(
                  underutilizedRooms.reduce(
                    (sum, r) => sum + parseFloat(r.utilizationRate),
                    0
                  ) / underutilizedRooms.length
                ).toFixed(1)}
                %
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Critical</p>
              <p className="text-lg font-bold text-red-600">
                {
                  underutilizedRooms.filter((r) => r.utilizationRate < 20)
                    .length
                }
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Low Usage</p>
              <p className="text-lg font-bold text-orange-600">
                {
                  underutilizedRooms.filter(
                    (r) => r.utilizationRate >= 20 && r.utilizationRate < 40
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnderutilizedRoomsWidget;
