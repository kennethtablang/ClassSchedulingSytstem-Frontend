import { useEffect, useState } from "react";
import { getBuildings, deleteBuilding } from "../../services/buildingService";
import AddBuildingModal from "../../components/building/AddBuildingModal";
import EditBuildingModal from "../../components/building/EditBuildingModal";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const BuildingPage = () => {
  const [buildings, setBuildings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [reload, setReload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = async () => {
    try {
      const { data } = await getBuildings();
      setBuildings(data);
    } catch {
      toast.error("Failed to load buildings.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [reload]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this building?")) return;
    try {
      await deleteBuilding(id);
      toast.success("Building deleted.");
      setReload((r) => !r);
    } catch {
      toast.error("Failed to delete building.");
    }
  };

  const filtered = buildings.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Buildings</h2>
        <AddBuildingModal onSuccess={() => setReload((r) => !r)} />
      </div>

      <input
        type="text"
        placeholder="Search for building"
        className="input input-bordered mb-4 w-full md:w-1/3"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="table w-full">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-700">
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Rooms</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No buildings found.
                </td>
              </tr>
            ) : (
              paginated.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.description || "-"}</td>
                  <td>
                    <span
                      className={`badge ${
                        b.isActive ? "badge-success" : "badge-error"
                      }`}
                    >
                      {b.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{b.rooms?.length || 0}</td>
                  <td className="text-right space-x-2">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => setEditing(b)}
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(b.id)}
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

      {/* Pagination */}
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

      {/* Edit Modal */}
      {editing && (
        <EditBuildingModal
          building={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            setReload((r) => !r);
          }}
        />
      )}
    </div>
  );
};

export default BuildingPage;
