import { useEffect, useState } from "react";
import { getBuildings } from "../../services/buildingService";
import { updateRoom } from "../../services/roomService";
import { notifySuccess, notifyError } from "../../services/notificationService";

const EditRoomModal = ({ room, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    capacity: 0,
    type: "",
    buildingId: "",
  });

  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || "",
        capacity: room.capacity || 0,
        type: room.type || "",
        buildingId: room.buildingId || "",
      });
    }
  }, [room]);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const { data } = await getBuildings();
        setBuildings(data.filter((b) => b.isActive));
      } catch {
        notifyError("Failed to load buildings.");
      }
    };

    fetchBuildings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateRoom(room.id, formData);
      notifySuccess("Room updated successfully.");
      document.getElementById("edit_room_modal").close();
      onSuccess();
    } catch {
      notifyError("Failed to update room.");
    }
  };

  if (!room) return null;

  return (
    <dialog id="edit_room_modal" className="modal" open>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Edit Room</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Room Name"
            value={formData.name}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />

          <input
            type="number"
            name="capacity"
            placeholder="Capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="input input-bordered w-full"
          />

          <input
            type="text"
            name="type"
            placeholder="Type (Lecture, Lab, etc.)"
            value={formData.type}
            onChange={handleChange}
            className="input input-bordered w-full"
          />

          <select
            name="buildingId"
            value={formData.buildingId}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option value="" disabled>
              Select Building
            </option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <div className="modal-action">
            <button type="submit" className="btn btn-primary">
              Update
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                document.getElementById("edit_room_modal").close();
                onClose();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default EditRoomModal;
