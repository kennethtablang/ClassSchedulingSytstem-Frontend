// src/pages/dashboard/RoomPage.jsx
import { useEffect, useState } from "react";
import { getRooms, deleteRoom } from "../../services/roomService";
import { notifySuccess, notifyError } from "../../services/notificationService";
import { FaEdit, FaTrash } from "react-icons/fa";
import AddRoomModal from "../../components/room/AddRoomModal";
import EditRoomModal from "../../components/room/EditRoomModal";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";

const RoomPage = () => {
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [reload, setReload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await getRooms();
        setRooms(data);
      } catch {
        notifyError("Failed to load rooms.");
      }
    };
    fetchRooms();
  }, [reload]);

  const confirmDelete = (id) => setDeleteId(id);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteRoom(deleteId);
      notifySuccess("Room deleted successfully.");
      setReload((prev) => !prev);
    } catch {
      notifyError("Failed to delete room.");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const filtered = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.buildingName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.type || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Room Management</h2>
        <AddRoomModal onSuccess={() => setReload((r) => !r)} />
      </div>

      <input
        type="text"
        placeholder="Search room, building or type"
        className="input input-bordered mb-4 w-full md:w-1/3"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="table w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th>Name</th>
              <th>Capacity</th>
              <th>Type</th>
              <th>Building</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No rooms found.
                </td>
              </tr>
            ) : (
              paginated.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.capacity}</td>
                  <td>{r.type || "—"}</td>
                  <td>{r.buildingName}</td>
                  <td className="text-right space-x-2">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => setEditingRoom(r)}
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => confirmDelete(r.id)}
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`btn btn-sm ${
                currentPage === page ? "btn-primary" : "btn-outline"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSuccess={() => {
            setEditingRoom(null);
            setReload((r) => !r);
          }}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteId}
        title="Delete Room"
        message="Are you sure you want to delete this room? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
      />
    </div>
  );
};

export default RoomPage;
