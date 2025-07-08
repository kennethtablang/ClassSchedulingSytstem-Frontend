import { useEffect, useState } from "react";
import { getAllAssignedSubjects } from "../../services/facultyService";
import { toast } from "react-toastify";

const ViewFacultySubjectsModal = ({ isOpen, onClose }) => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadAssignments();
    }
  }, [isOpen]);

  const loadAssignments = async () => {
    try {
      const { data } = await getAllAssignedSubjects();
      setAssignments(data);
    } catch (err) {
      toast.error("Failed to fetch assignments.");
      console.error("Error fetching assignments:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-5xl">
        <h3 className="text-lg font-bold mb-4">All Subject Assignments</h3>

        {assignments.length > 0 && (
          <div className="mb-4">
            <p className="font-semibold text-sm">
              Semester: {assignments[0].semesterName}
            </p>
            <p className="font-semibold text-sm">
              School Year: {assignments[0].schoolYearLabel}
            </p>
          </div>
        )}

        <div className="overflow-auto max-h-[400px] border rounded">
          <table className="table w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Subject</th>
                <th>Section</th>
                <th>Faculty</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    No assignments found.
                  </td>
                </tr>
              ) : (
                assignments.map((a, index) => (
                  <tr
                    key={`${a.subjectId}-${a.classSectionId}-${a.facultyName}-${index}`}
                  >
                    <td>{a.subjectTitle}</td>
                    <td>{a.classSectionName}</td>
                    <td>{a.facultyName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="modal-action mt-4">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ViewFacultySubjectsModal;
