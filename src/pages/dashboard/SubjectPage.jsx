import { useEffect, useState } from "react";
import { getSubjects, deleteSubject } from "../../services/subjectService";
import { getCollegeCourses } from "../../services/collegeCourseService";
import AddSubjectModal from "../../components/subject/AddSubjectModal";
import EditSubjectModal from "../../components/subject/EditSubjectModal";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import { FaEdit, FaTrash } from "react-icons/fa";
import { notifySuccess, notifyError } from "../../services/notificationService";

const SubjectPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYearLevel, setSelectedYearLevel] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectRes, courseRes] = await Promise.all([
        getSubjects(),
        getCollegeCourses(),
      ]);
      setSubjects(subjectRes.data);
      setCourses(courseRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      notifyError("Failed to load data.");
    }
  };

  useEffect(() => {
    filterSubjects();
  }, [subjects, searchTerm, selectedCourse, selectedYearLevel]);

  const filterSubjects = () => {
    let temp = [...subjects];
    if (searchTerm)
      temp = temp.filter(
        (s) =>
          s.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.subjectTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (selectedCourse)
      temp = temp.filter((s) => s.collegeCourseId === parseInt(selectedCourse));
    if (selectedYearLevel)
      temp = temp.filter((s) => s.yearLevel === selectedYearLevel);

    setFiltered(temp);
    setCurrentPage(1);
  };

  const confirmDelete = (id) => setDeleteId(id);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteSubject(deleteId);
      notifySuccess("Subject archived.");
      fetchData();
    } catch {
      notifyError("Failed to deactivate subject.");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Subject Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          Add Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by code/title"
          className="input input-bordered w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="select select-bordered w-full"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="select select-bordered w-full"
          value={selectedYearLevel}
          onChange={(e) => setSelectedYearLevel(e.target.value)}
        >
          <option value="">All Year Levels</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="table w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th>Code</th>
              <th>Title</th>
              <th>Units</th>
              <th>Type</th>
              <th>Year</th>
              <th>Course</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((s) => (
              <tr key={s.id}>
                <td>{s.subjectCode}</td>
                <td className="flex items-center gap-2">
                  {s.color && (
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: s.color }}
                    ></span>
                  )}
                  {s.subjectTitle}
                </td>
                <td>{s.units}</td>
                <td>{s.subjectType}</td>
                <td>{s.yearLevel}</td>
                <td>{s.collegeCourseName}</td>
                <td className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedSubject(s);
                      setShowEditModal(true);
                    }}
                    className="btn btn-sm btn-info"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => confirmDelete(s.id)}
                    className="btn btn-sm btn-error"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No subjects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`btn btn-sm ${
                currentPage === i + 1 ? "btn-primary" : "btn-outline"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddSubjectModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={fetchData}
        courses={courses}
      />

      {selectedSubject && (
        <EditSubjectModal
          open={showEditModal}
          onClose={() => {
            setSelectedSubject(null);
            setShowEditModal(false);
          }}
          subject={selectedSubject}
          onUpdated={fetchData}
          courses={courses}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteId}
        title="Archive Subject"
        message="Are you sure you want to archive this subject? It will no longer appear in active listings but can be restored by an administrator."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
      />
    </div>
  );
};

export default SubjectPage;
