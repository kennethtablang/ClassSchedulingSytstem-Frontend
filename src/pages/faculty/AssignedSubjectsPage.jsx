import { useEffect, useState } from "react";
import {
  getAssignedSubjects,
  getCurrentSemester,
} from "../../services/facultyScheduleService";
import { toast } from "react-toastify";

const AssignedSubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSem, setCurrentSem] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    const loadSemesterAndSubjects = async () => {
      try {
        const { data: sem } = await getCurrentSemester();
        setCurrentSem(sem);

        const { data } = await getAssignedSubjects();
        setSubjects(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load assigned subjects.");
      }
    };

    loadSemesterAndSubjects();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filteredData = subjects.filter((s) =>
      `${s.subjectCode} ${s.subjectTitle} ${s.section} ${s.courseCode}`
        .toLowerCase()
        .includes(term)
    );
    setFiltered(filteredData);
    setCurrentPage(1);
  }, [searchTerm, subjects]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      {/* 🔹 Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Assigned Subjects</h2>
        {currentSem && (
          <p className="text-sm text-gray-600">
            Current Semester:{" "}
            <span className="font-medium text-base-content">
              {currentSem.name} ({currentSem.schoolYearLabel})
            </span>
          </p>
        )}
      </div>

      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search subjects"
        className="input input-bordered mb-4 w-full md:w-1/3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 📄 Table */}
      {filtered.length === 0 ? (
        <p className="text-gray-600">No subjects assigned to you yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="table w-full table-zebra">
            <thead className="bg-gray-100 text-sm text-gray-700">
              <tr>
                <th>Subject Code</th>
                <th>Title</th>
                <th>Units</th>
                <th>Section</th>
                <th>Semester</th>
                <th>School Year</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((subj, i) => (
                <tr key={i}>
                  <td>{subj.subjectCode}</td>
                  <td>{subj.subjectTitle}</td>
                  <td>{subj.units}</td>
                  <td>
                    {subj.yearLevel}-{subj.section} ({subj.courseCode})
                  </td>
                  <td>{subj.semester}</td>
                  <td>{subj.schoolYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔢 Pagination */}
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

export default AssignedSubjectsPage;
