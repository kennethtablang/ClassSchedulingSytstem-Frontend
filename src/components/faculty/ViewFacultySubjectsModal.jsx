const ViewFacultySubjectsModal = ({
  isOpen,
  onClose,
  faculty,
  subjectsData,
}) => {
  if (!isOpen || !faculty || !subjectsData) return null;

  const { subjects = [], totalUnits = 0, totalSubjects = 0 } = subjectsData;

  // Use the first subject entry to display semester/school year
  const semesterName = subjects[0]?.semesterName ?? "N/A";
  const schoolYearLabel = subjects[0]?.schoolYearLabel ?? "N/A";

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-5xl">
        <h3 className="text-lg font-bold mb-1">
          Assigned Subjects for{" "}
          <span className="text-primary">{faculty.fullName}</span>
        </h3>

        <div className="text-sm text-gray-600 mb-3">
          <p>
            <strong>Semester:</strong> {semesterName}
          </p>
          <p>
            <strong>School Year:</strong> {schoolYearLabel}
          </p>
        </div>

        <div className="flex gap-4 text-sm mb-3">
          <div>
            <strong>Total Units:</strong>{" "}
            <span className="badge badge-info">{totalUnits}</span>
          </div>
          <div>
            <strong>Total Subjects:</strong>{" "}
            <span className="badge badge-secondary">{totalSubjects}</span>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
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
                {subjects.map((s, idx) => (
                  <tr key={`${s.id}-${s.classSectionId}-${idx}`}>
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
