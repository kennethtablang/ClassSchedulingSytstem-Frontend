// src/pages/dashboard/UnderutilizedRoomsPage.jsx
import { useEffect, useState } from "react";
import { getAllSchedules } from "../../services/scheduleService";
import { getRooms } from "../../services/roomService";
import {
  getCurrentSemesters,
  getSemesters as getAllSemesters,
} from "../../services/semesterService";
import {
  FaChartBar,
  FaExclamationTriangle,
  FaSort,
  FaFilter,
} from "react-icons/fa";

const UnderutilizedRoomsPage = () => {
  const [underutilizedRooms, setUnderutilizedRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [allSemesters, setAllSemesters] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [utilizationFilter, setUtilizationFilter] = useState("all"); // all, critical, low, moderate
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("utilization"); // utilization, name, schedules, hours
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const [currentRes, allRes] = await Promise.all([
          getCurrentSemesters(),
          getAllSemesters(),
        ]);
        setCurrentSemester(currentRes.data[0] || null);
        setAllSemesters(allRes.data);
      } catch (err) {
        console.error("Failed to load semesters:", err);
      }
    };
    loadSemesters();
  }, []);

  useEffect(() => {
    if (!currentSemester) {
      setUnderutilizedRooms([]);
      setFilteredRooms([]);
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

        const semesterSchedules = allSchedules.filter(
          (s) =>
            s.semesterName === currentSemester.name &&
            s.schoolYearLabel === currentSemester.schoolYearLabel
        );

        const roomUtilization = allRooms.map((room) => {
          const roomSchedules = semesterSchedules.filter(
            (s) => s.roomId === room.id
          );

          const totalHours = roomSchedules.reduce((sum, schedule) => {
            return sum + (schedule.duration || 0);
          }, 0);

          const weeksInSemester = 18;
          const hoursPerWeek = 40;
          const totalPossibleHours = weeksInSemester * hoursPerWeek;

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
            totalHours: parseFloat(totalHours.toFixed(1)),
            utilizationRate: parseFloat(utilizationRate.toFixed(1)),
            scheduleCount: roomSchedules.length,
          };
        });

        const sorted = roomUtilization.sort(
          (a, b) => a.utilizationRate - b.utilizationRate
        );

        setUnderutilizedRooms(sorted);
        setFilteredRooms(sorted);
      } catch (err) {
        console.error("Failed to analyze room utilization:", err);
        setUnderutilizedRooms([]);
        setFilteredRooms([]);
      } finally {
        setLoading(false);
      }
    };

    analyzeRoomUtilization();
  }, [currentSemester]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...underutilizedRooms];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Utilization filter
    if (utilizationFilter !== "all") {
      filtered = filtered.filter((room) => {
        if (utilizationFilter === "critical") return room.utilizationRate < 20;
        if (utilizationFilter === "low")
          return room.utilizationRate >= 20 && room.utilizationRate < 40;
        if (utilizationFilter === "moderate")
          return room.utilizationRate >= 40 && room.utilizationRate < 60;
        return true;
      });
    }

    // Building filter
    if (buildingFilter !== "all") {
      filtered = filtered.filter(
        (room) => room.buildingName === buildingFilter
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case "utilization":
          compareValue = a.utilizationRate - b.utilizationRate;
          break;
        case "name":
          compareValue = a.name.localeCompare(b.name);
          break;
        case "schedules":
          compareValue = a.scheduleCount - b.scheduleCount;
          break;
        case "hours":
          compareValue = a.totalHours - b.totalHours;
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    setFilteredRooms(filtered);
    setCurrentPage(1);
  }, [
    searchTerm,
    utilizationFilter,
    buildingFilter,
    sortBy,
    sortOrder,
    underutilizedRooms,
  ]);

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

  const uniqueBuildings = [
    ...new Set(underutilizedRooms.map((r) => r.buildingName)),
  ].sort();

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = {
    total: underutilizedRooms.length,
    critical: underutilizedRooms.filter((r) => r.utilizationRate < 20).length,
    low: underutilizedRooms.filter(
      (r) => r.utilizationRate >= 20 && r.utilizationRate < 40
    ).length,
    moderate: underutilizedRooms.filter(
      (r) => r.utilizationRate >= 40 && r.utilizationRate < 60
    ).length,
    avgUtilization:
      underutilizedRooms.length > 0
        ? (
            underutilizedRooms.reduce((sum, r) => sum + r.utilizationRate, 0) /
            underutilizedRooms.length
          ).toFixed(1)
        : 0,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaChartBar className="text-warning" />
            Room Utilization Analysis
          </h1>
          {currentSemester && (
            <p className="text-sm text-gray-600 mt-1">
              {currentSemester.name} ({currentSemester.schoolYearLabel})
            </p>
          )}
        </div>

        {/* Semester Selector */}
        <select
          className="select select-bordered"
          value={currentSemester?.id || ""}
          onChange={(e) => {
            const selected = allSemesters.find((s) => s.id === +e.target.value);
            setCurrentSemester(selected);
          }}
          disabled={allSemesters.length === 0}
        >
          {allSemesters.map((sem) => (
            <option key={sem.id} value={sem.id}>
              {sem.name} ({sem.schoolYearLabel})
            </option>
          ))}
        </select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 mb-1">Total Rooms</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 mb-1">Avg. Utilization</p>
          <p className="text-2xl font-bold text-blue-600">
            {stats.avgUtilization}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 mb-1">Critical</p>
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 mb-1">Low Usage</p>
          <p className="text-2xl font-bold text-orange-600">{stats.low}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 mb-1">Moderate</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.moderate}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-gray-600" />
          <h3 className="font-semibold">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search rooms..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Utilization Filter */}
          <select
            className="select select-bordered w-full"
            value={utilizationFilter}
            onChange={(e) => setUtilizationFilter(e.target.value)}
          >
            <option value="all">All Utilization Levels</option>
            <option value="critical">Critical (&lt;20%)</option>
            <option value="low">Low (20-40%)</option>
            <option value="moderate">Moderate (40-60%)</option>
          </select>

          {/* Building Filter */}
          <select
            className="select select-bordered w-full"
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
          >
            <option value="all">All Buildings</option>
            {uniqueBuildings.map((building) => (
              <option key={building} value={building}>
                {building}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            className="btn btn-outline"
            onClick={() => {
              setSearchTerm("");
              setUtilizationFilter("all");
              setBuildingFilter("all");
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="text-sm mt-4">Analyzing room utilization...</p>
        </div>
      ) : !currentSemester ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            Select a semester to view room utilization
          </p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-12">
          <FaChartBar className="text-6xl mx-auto mb-4 opacity-30" />
          <p className="text-gray-600 font-medium">No rooms found</p>
          <p className="text-sm text-gray-500 mt-2">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <>
          {/* Results Info and Sorting */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Showing {paginatedRooms.length} of {filteredRooms.length} rooms
            </p>
            <div className="flex items-center gap-2">
              <FaSort className="text-gray-600" />
              <select
                className="select select-bordered select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="utilization">Sort by Utilization</option>
                <option value="name">Sort by Name</option>
                <option value="schedules">Sort by Schedules</option>
                <option value="hours">Sort by Hours</option>
              </select>
              <button
                className="btn btn-sm btn-outline"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
              </button>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {paginatedRooms.map((room, index) => (
              <div
                key={room.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-ghost badge-sm">
                      #{(currentPage - 1) * itemsPerPage + index + 1}
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

                {/* Details */}
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
                  <p className="text-xs text-gray-500">
                    {room.totalHours} hours scheduled
                  </p>
                </div>

                {/* Warning */}
                {room.utilizationRate < 20 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                    <FaExclamationTriangle />
                    <span>Critically underutilized</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                className="btn btn-sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`btn btn-sm ${
                      currentPage === pageNum ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="btn btn-sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UnderutilizedRoomsPage;
