// src/components/dashboardHome/AvailableRoomsWidget.jsx
import { useEffect, useState } from "react";
import { getAvailableRooms } from "../../services/scheduleService";
import { FaDoorOpen, FaSync } from "react-icons/fa";

const AvailableRoomsWidget = ({ currentSemester }) => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[new Date().getDay()];
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  });
  const [duration, setDuration] = useState(1); // hours

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const calculateEndTime = (startTime, durationHours) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationHours * 60;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}:00`;
  };

  const fetchAvailableRooms = async () => {
    if (!currentSemester || !selectedDay || !selectedTime) return;

    setLoading(true);
    try {
      const startTime = `${selectedTime}:00`;
      const endTime = calculateEndTime(selectedTime, duration);

      const response = await getAvailableRooms(selectedDay, startTime, endTime);
      setAvailableRooms(response.data);
    } catch (err) {
      console.error("Failed to load available rooms:", err);
      setAvailableRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableRooms();
  }, [currentSemester, selectedDay, selectedTime, duration]);

  const formatTime12Hour = (time24) => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="bg-white rounded-lg shadow border p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaDoorOpen className="text-primary" />
          Available Rooms
        </h3>
        <button
          onClick={fetchAvailableRooms}
          className="btn btn-sm btn-ghost"
          disabled={loading}
        >
          <FaSync className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-4">
        {/* Day Selector */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Day
          </label>
          <select
            className="select select-bordered select-sm w-full"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Time Selector */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Start Time
          </label>
          <input
            type="time"
            className="input input-bordered input-sm w-full"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          />
        </div>

        {/* Duration Selector */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Duration (hours)
          </label>
          <select
            className="select select-bordered select-sm w-full"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            <option value={0.5}>30 minutes</option>
            <option value={1}>1 hour</option>
            <option value={1.5}>1.5 hours</option>
            <option value={2}>2 hours</option>
            <option value={2.5}>2.5 hours</option>
            <option value={3}>3 hours</option>
          </select>
        </div>
      </div>

      {/* Time Display */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 text-sm">
        <p className="font-medium text-blue-800">
          {selectedDay} • {formatTime12Hour(selectedTime)} -{" "}
          {formatTime12Hour(
            calculateEndTime(selectedTime, duration).slice(0, 5)
          )}
        </p>
        {currentSemester && (
          <p className="text-xs text-blue-600 mt-1">
            {currentSemester.name} ({currentSemester.schoolYearLabel})
          </p>
        )}
      </div>

      {/* Room List */}
      <div className="max-h-[400px] overflow-y-auto">
        {!currentSemester ? (
          <div className="text-center text-gray-500 py-6">
            <p className="text-sm">Select a semester to view available rooms</p>
          </div>
        ) : loading ? (
          <div className="text-center text-gray-500 py-6">
            <div className="loading loading-spinner loading-md"></div>
            <p className="text-sm mt-2">Loading rooms...</p>
          </div>
        ) : availableRooms.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            <FaDoorOpen className="text-4xl mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No rooms available</p>
            <p className="text-xs mt-1">All rooms are occupied at this time</p>
          </div>
        ) : (
          <div className="space-y-2">
            {availableRooms.map((room) => (
              <div
                key={room.id}
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-primary transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-gray-800">{room.name}</h4>
                  <span className="badge badge-success badge-sm">
                    Available
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Building:</span>{" "}
                    {room.buildingName || "N/A"}
                  </p>
                  {room.capacity && (
                    <p>
                      <span className="font-medium">Capacity:</span>{" "}
                      {room.capacity} students
                    </p>
                  )}
                  {room.type && (
                    <p>
                      <span className="font-medium">Type:</span> {room.type}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {availableRooms.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-primary text-lg">
                {availableRooms.length}
              </span>{" "}
              room{availableRooms.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableRoomsWidget;
