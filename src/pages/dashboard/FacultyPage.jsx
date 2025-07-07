import { useEffect, useState } from "react";
import {
  getFacultyUsers,
  getAssignedSubjectsWithSections,
} from "../../services/facultyService";
import { toast } from "react-toastify";
import ViewFacultySubjectsModal from "../../components/faculty/ViewFacultySubjectsModal";
import AssignSubjectsToFacultyModal from "../../components/faculty/AssignSubjectsToFacultyModal";

const FacultyPage = () => {
  const [faculty, setFaculty] = useState([]);
  const [facultyLoads, setFacultyLoads] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [subjectsData, setSubjectsData] = useState(null);
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const itemsPerPage = 5;

  const fetchFaculty = async () => {
    try {
      const { data } = await getFacultyUsers();
      setFaculty(data);

      // ✅ FIXED: Access res.data.totalUnits instead of res.totalUnits
      const loads = await Promise.all(
        data.map(async (f) => {
          try {
            const res = await getAssignedSubjectsWithSections(f.id);
            return { facultyId: f.id, totalUnits: res.data.totalUnits };
          } catch {
            return { facultyId: f.id, totalUnits: 0 };
          }
        })
      );

      const loadMap = loads.reduce((acc, curr) => {
        acc[curr.facultyId] = curr.totalUnits;
        return acc;
      }, {});
      setFacultyLoads(loadMap);
    } catch {
      toast.error("Failed to load faculty list.");
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleViewSubjects = async (faculty) => {
    try {
      const res = await getAssignedSubjectsWithSections(faculty.id);
      setSelectedFaculty(faculty);
      setSubjectsData(res.data);
      setIsSubjectsModalOpen(true);
    } catch {
      toast.error("Failed to fetch assigned subjects.");
    }
  };

  const handleAssignSubjects = (faculty) => {
    setSelectedFaculty(faculty);
    setIsAssignModalOpen(true);
  };

  const handleViewSchedule = (facultyId) => {
    window.location.href = `/dashboard/faculty-schedule/${facultyId}`;
  };

  const filtered = faculty.filter(
    (f) =>
      `${f.fullName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
              <th>Load (Units)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
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
                    <span className="font-semibold">
                      {facultyLoads[f.id] ?? "..."}
                    </span>
                  </td>
                  <td className="flex flex-wrap gap-2">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleViewSchedule(f.id)}
                    >
                      View Schedule
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleViewSubjects(f)}
                    >
                      View Subjects
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleAssignSubjects(f)}
                    >
                      Assign Subjects
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

      {/* View Assigned Subjects Modal */}
      <ViewFacultySubjectsModal
        isOpen={isSubjectsModalOpen}
        onClose={() => setIsSubjectsModalOpen(false)}
        faculty={selectedFaculty}
        subjectsData={subjectsData}
      />

      {/* Assign Subjects Modal */}
      <AssignSubjectsToFacultyModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        faculty={selectedFaculty}
        onSuccess={fetchFaculty}
      />
    </div>
  );
};

export default FacultyPage;
