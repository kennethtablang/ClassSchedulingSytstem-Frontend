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
      <div className="modal-box max-w-4xl">
        <h3 className="text-lg font-bold mb-4">All Subject Assignments</h3>

        <div className="overflow-auto max-h-[400px]">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Section</th>
                <th>Faculty</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, index) => (
                <tr key={`${a.subjectId}-${a.classSectionId}-${index}`}>
                  <td>{a.subjectTitle}</td>
                  <td>{a.classSectionName}</td>
                  <td>{a.facultyName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ViewFacultySubjectsModal;
