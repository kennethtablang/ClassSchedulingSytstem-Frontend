import { useEffect, useState } from "react";
import {
  getClassSections,
  deleteClassSection,
  getSubjectAssignmentsBySectionId,
} from "../../services/classSectionService";
import { getCurrentSemesters } from "../../services/semesterService";
import AddClassSectionModal from "../../components/classection/AddClassSectionModal";
import EditClassSectionModal from "../../components/classection/EditClassSectionModal";
import ViewSubjectAssignmentsModal from "../../components/classection/ViewSubjectAssignmentsModal";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { notifyError, notifySuccess } from "../../services/notificationService";

const ClassSectionPage = () => {
  const [sections, setSections] = useState([]);
  const [editing, setEditing] = useState(null);
  const [reload, setReload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterYearLevel, setFilterYearLevel] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingAssignments, setViewingAssignments] = useState(null);
  const [subjectAssignments, setSubjectAssignments] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 100;

  const fetchData = async () => {
    try {
      const { data } = await getClassSections();
      setSections(data);
    } catch {
      notifyError("Failed to load sections.");
    }
  };

  const fetchCurrentSemester = async () => {
    try {
      const { data } = await getCurrentSemesters();
      if (data && data.length > 0) {
        const semester = data[0];
        const label = `${semester.name} (${semester.schoolYearLabel})`;
        setCurrentSemester(semester);
        setFilterSemester(label); // ✅ Preselect filter
      }
    } catch {
      notifyError("Failed to load current semester.");
    }
  };

  useEffect(() => {
    fetchData();
    fetchCurrentSemester();
  }, [reload]);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await deleteClassSection(confirmDeleteId);
      notifySuccess("Class Section deleted.");
      setReload((r) => !r);
    } catch {
      notifyError("Failed to delete class section.");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleViewAssignments = async (section) => {
    try {
      const { data } = await getSubjectAssignmentsBySectionId(section.id);
      setViewingAssignments(section);
      setSubjectAssignments(data);
    } catch {
      notifyError("Failed to load subject assignments.");
    }
  };

  // Collect options for course and year level from data
  const courseOptions = Array.from(
    new Set(sections.map((s) => s.collegeCourseName))
  ).sort();
  const yearLevelOptions = Array.from(
    new Set(sections.map((s) => s.yearLevel))
  ).sort();
  const semesterOptions = Array.from(
    new Set(sections.map((s) => `${s.semesterName} (${s.schoolYearLabel})`))
  ).sort();

  const filtered = sections.filter((s) => {
    const matchesSearch =
      s.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.semesterLabel?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = !filterCourse || s.collegeCourseName === filterCourse;

    const matchesYear =
      !filterYearLevel || String(s.yearLevel) === filterYearLevel;

    const matchesSemester =
      !filterSemester ||
      `${s.semesterName} (${s.schoolYearLabel})` === filterSemester;

    return matchesSearch && matchesCourse && matchesYear && matchesSemester;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
        <h2 className="text-2xl font-semibold">Class Sections</h2>
        <AddClassSectionModal onSuccess={() => setReload((r) => !r)} />
      </div>

      {/* ✅ Current Semester Display (smaller and below header) */}
      {currentSemester && (
        <p className="text-sm text-gray-600">
          Current Semester:{" "}
          <span className="font-medium text-black">
            {currentSemester.name} ({currentSemester.schoolYearLabel})
          </span>
        </p>
      )}
      <p className="text-sm text-gray-600 mb-4">
        Click the Add Class Section to Enroll a Class Section to a Semester.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by section or semester"
          className="input input-bordered w-full"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          className="select select-bordered w-full"
          value={filterCourse}
          onChange={(e) => {
            setFilterCourse(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Courses</option>
          {courseOptions.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>

        <select
          className="select select-bordered w-full"
          value={filterYearLevel}
          onChange={(e) => {
            setFilterYearLevel(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Year Levels</option>
          {yearLevelOptions.map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </select>

        <select
          className="select select-bordered w-full"
          value={filterSemester}
          onChange={(e) => {
            setFilterSemester(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Semesters</option>
          {semesterOptions.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="table w-full">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-700">
              <th>Section</th>
              <th>Year Level</th>
              <th>Course</th>
              <th>Semester</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No sections found.
                </td>
              </tr>
            ) : (
              paginated.map((s) => (
                <tr key={s.id}>
                  <td>{s.section}</td>
                  <td>{s.yearLevel}</td>
                  <td>{s.collegeCourseName}</td>
                  <td>
                    {s.semesterName} ({s.schoolYearLabel})
                  </td>
                  <td className="text-right space-x-2">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleViewAssignments(s)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => setEditing(s)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => setConfirmDeleteId(s.id)}
                    >
                      <FaTrash />
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

      {editing && (
        <EditClassSectionModal
          section={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            setReload((r) => !r);
          }}
        />
      )}

      {viewingAssignments && subjectAssignments && (
        <ViewSubjectAssignmentsModal
          isOpen={!!viewingAssignments}
          onClose={() => setViewingAssignments(null)}
          section={viewingAssignments}
          data={subjectAssignments}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!confirmDeleteId}
        title="Delete Class Section"
        message="Are you sure you want to delete this class section? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
        loading={isDeleting}
      />
    </div>
  );
};

export default ClassSectionPage;
