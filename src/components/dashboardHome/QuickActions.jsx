// src/components/dashboardHome/QuickActions.jsx
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow border p-4 space-y-2">
      <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
      <button
        className="btn btn-outline btn-sm w-full"
        onClick={() => navigate("/schedules")}
      >
        ➕ Add Schedule
      </button>
      <button
        className="btn btn-outline btn-sm w-full"
        onClick={() => navigate("/assign-subjects")}
      >
        🧑‍🏫 Assign Faculty
      </button>
      <button
        className="btn btn-outline btn-sm w-full"
        onClick={() => navigate("/rooms")}
      >
        🏫 Manage Rooms
      </button>
    </div>
  );
};

export default QuickActions;
