import React from "react";

const ViewSubjectAssignmentsModal = ({ isOpen, onClose, section, data }) => {
  if (!isOpen || !section || !data) return null;

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-4xl">
        {/* 🔹 Modal Title */}
        <h3 className="text-lg font-bold mb-1">
          Subject Assignments for Section:{" "}
          <span className="text-primary">{section.section}</span>
        </h3>

        {/* 🔹 Semester & School Year */}
        <div className="text-sm text-gray-600 mb-4 space-y-1">
          <p>
            <span className="font-semibold">Semester:</span>{" "}
            {section.semesterName}
          </p>
          <p>
            <span className="font-semibold">School Year:</span>{" "}
            {section.schoolYearLabel}
          </p>
        </div>

        {/* 🔹 Subject-Faculty Table */}
        <div className="overflow-x-auto max-h-[400px] border rounded">
          {data.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              No assignments found for this section.
            </div>
          ) : (
            <table className="table table-zebra w-full text-sm">
              <thead className="bg-base-200">
                <tr>
                  <th>Subject</th>
                  <th>Units</th>
                  <th>Faculty</th>
                </tr>
              </thead>
              <tbody>
                {data.map((a, idx) => (
                  <tr key={`${a.subjectId}-${a.facultyId}-${idx}`}>
                    <td>{a.subjectTitle}</td>
                    <td>{a.units}</td>
                    <td>{a.facultyName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 🔹 Action Buttons */}
        <div className="modal-action mt-4">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ViewSubjectAssignmentsModal;
