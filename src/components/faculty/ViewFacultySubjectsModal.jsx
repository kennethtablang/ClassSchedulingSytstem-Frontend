import React from "react";

const ViewFacultySubjectsModal = ({
  isOpen,
  onClose,
  faculty,
  subjectsData,
}) => {
  if (!isOpen || !faculty || !subjectsData) return null;

  const { subjects = [], totalUnits = 0 } = {
    subjects: subjectsData.subjects ?? [],
    totalUnits: subjectsData.totalUnits ?? 0,
  };

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <h3 className="text-lg font-bold mb-2">
          Assigned Subjects for{" "}
          <span className="text-primary">{faculty.fullName}</span>
        </h3>

        <p className="text-sm mb-4">
          <strong>Total Unit Load:</strong>{" "}
          <span className="badge badge-info">{totalUnits}</span>
        </p>

        {subjects.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No subjects assigned to this faculty.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[400px] border rounded">
            <table className="table table-zebra w-full text-sm">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Units</th>
                  <th>Type</th>
                  <th>Year Level</th>
                  <th>Section</th>
                  <th>Course</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={`${s.id}-${s.classSectionId}`}>
                    <td>{s.subjectCode}</td>
                    <td>{s.subjectTitle}</td>
                    <td>{s.units}</td>
                    <td>{s.subjectType}</td>
                    <td>{s.yearLevel}</td>
                    <td>{s.sectionLabel}</td>
                    <td>{s.collegeCourseName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
