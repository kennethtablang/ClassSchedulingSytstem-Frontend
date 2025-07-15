// src/pages/faculty/AvailableRoomsPage.jsx

import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import { toast } from "react-toastify";

/**
 * AvailableRoomsPage
 * ------------------
 * Displays a list of rooms that are currently unoccupied based on
 * selected day and time input by the faculty user.
 */

const AvailableRoomsPage = () => {
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/schedule/available-rooms", {
        params: { day, startTime, endTime },
      });
      setRooms(response.data);
    } catch (error) {
      console.error("Failed to load available rooms:", error);
      toast.error("Unable to fetch available rooms. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableRooms();
  }, [day, startTime, endTime]);

  return (
    <div className="p-6">
      {/* 🔹 Page Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Available Rooms</h2>
        <p className="text-sm text-gray-600">
          View unoccupied rooms based on selected time and day.
        </p>
      </div>

      {/* 🔍 Filter Form */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Day</label>
          <select
            className="select select-bordered"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <input
            type="time"
            className="input input-bordered w-40"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Time</label>
          <input
            type="time"
            className="input input-bordered w-40"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      {/* 📄 Results Table */}
      {loading ? (
        <div>Loading available rooms...</div>
      ) : rooms.length === 0 ? (
        <p className="text-gray-600">
          No available rooms for the selected time.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="table w-full table-zebra">
            <thead className="bg-gray-100 text-sm text-gray-700">
              <tr>
                <th>Room Name</th>
                <th>Building</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.name}</td>
                  <td>{room.buildingName}</td>
                  <td>{room.capacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AvailableRoomsPage;
