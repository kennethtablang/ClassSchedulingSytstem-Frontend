import { useEffect, useState } from "react";
import { getFacultyUsers } from "../../services/facultyService";
import { toast } from "react-toastify";

const FacultyPage = () => {
  const [faculty, setFaculty] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchFaculty = async () => {
    try {
      const { data } = await getFacultyUsers();
      setFaculty(data);
    } catch {
      toast.error("Failed to load faculty list.");
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const filtered = faculty.filter(
    (f) =>
      `${f.firstName} ${f.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewSchedule = (facultyId) => {
    // Navigate to schedule page or open modal
    // Example: redirect using React Router
    window.location.href = `/dashboard/faculty-schedule/${facultyId}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Faculty Members</h2>
      </div>

      <input
        type="text"
        placeholder="Search faculty"
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
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No faculty found.
                </td>
              </tr>
            ) : (
              paginated.map((f) => (
                <tr key={f.id}>
                  <td>{f.fullName}</td>
                  <td>{f.email}</td>
                  <td>{f.phoneNumber ?? "—"}</td>
                  <td>
                    <span
                      className={`badge ${
                        f.isActive ? "badge-success" : "badge-error"
                      }`}
                    >
                      {f.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleViewSchedule(f.id)}
                    >
                      View Schedule
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
    </div>
  );
};

export default FacultyPage;
