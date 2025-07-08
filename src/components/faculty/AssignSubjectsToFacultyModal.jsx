import { useEffect, useState } from "react";
import { getSubjects } from "../../services/subjectService";
import { getClassSections } from "../../services/classSectionService";
import {
  assignSubjectsToFacultyPerSection,
  getAssignedSubjectsWithSections,
  getAllAssignedSubjects,
} from "../../services/facultyService";
import { getCurrentSemesters } from "../../services/semesterService";
import { toast } from "react-toastify";

const normalizeYearLevel = (level) => {
  const map = {
    1: "1st Year",
    2: "2nd Year",
    3: "3rd Year",
    4: "4th Year",
    "1st Year": "1st Year",
    "2nd Year": "2nd Year",
    "3rd Year": "3rd Year",
    "4th Year": "4th Year",
  };
  return map[level] || level;
};

const AssignSubjectsToFacultyModal = ({
  isOpen,
  onClose,
  faculty,
  onSuccess,
}) => {
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterType, setFilterType] = useState("");
  const [globalAssignments, setGlobalAssignments] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);

  useEffect(() => {
    if (isOpen && faculty) {
      loadSemesterAndData();
    }
  }, [isOpen, faculty]);

  const loadSemesterAndData = async () => {
    try {
      const semRes = await getCurrentSemesters();
      const currentSem = semRes.data[0];
      setCurrentSemester(currentSem);

      if (!currentSem) throw new Error("No active semester found.");
      await loadData(currentSem);
    } catch (err) {
      toast.error("Failed to load current semester.");
      console.error("Semester load error:", err);
    }
  };

  const loadData = async (semester) => {
    try {
      const [subjectRes, sectionRes, assignedRes, globalRes] =
        await Promise.all([
          getSubjects(),
          getClassSections(),
          getAssignedSubjectsWithSections(
            faculty.id,
            semester.id,
            semester.schoolYearLabel
          ),
          getAllAssignedSubjects(),
        ]);

      setSubjects(subjectRes.data);
      setSections(sectionRes.data);
      setGlobalAssignments(globalRes.data);
      setTotalUnits(assignedRes.data.totalUnits || 0);

      const initial = (assignedRes.data.subjects || []).map((s) => ({
        subjectId: s.id,
        classSectionId: s.classSectionId,
      }));
      setAssignments(initial);
    } catch (err) {
      toast.error("Failed to load assignment data.");
      console.error("Assignment load error:", err);
    }
  };

  const handleChange = (subjectId, sectionId) => {
    const exists = assignments.find(
      (a) => a.subjectId === subjectId && a.classSectionId === sectionId
    );
    if (exists) {
      setAssignments((prev) =>
        prev.filter(
          (a) => !(a.subjectId === subjectId && a.classSectionId === sectionId)
        )
      );
    } else {
      setAssignments((prev) => [
        ...prev,
        { subjectId, classSectionId: sectionId },
      ]);
    }
  };

  const handleSubmit = async () => {
    try {
      await assignSubjectsToFacultyPerSection(faculty.id, assignments);
      toast.success("Subjects assigned successfully.");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to assign subjects.");
      console.error("Submit error:", err);
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesTitle = subject.subjectTitle
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse
      ? subject.collegeCourseId === parseInt(filterCourse)
      : true;
    const matchesYear = filterYear
      ? normalizeYearLevel(subject.yearLevel) === filterYear
      : true;
    const matchesType = filterType ? subject.subjectType === filterType : true;
    return matchesTitle && matchesCourse && matchesYear && matchesType;
  });

  const courseMap = subjects.reduce((acc, s) => {
    acc[s.collegeCourseId] = s.collegeCourseName;
    return acc;
  }, {});
  const uniqueCourses = Array.from(
    new Set(subjects.map((s) => s.collegeCourseId))
  );
  const uniqueYears = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const uniqueTypes = Array.from(new Set(subjects.map((s) => s.subjectType)));

  const getAssignedFacultyName = (subjectId, sectionId) => {
    const record = globalAssignments.find(
      (a) => a.subjectId === subjectId && a.classSectionId === sectionId
    );
    return record?.facultyName || null;
  };

  const isAlreadyAssignedToAnother = (subjectId, sectionId) => {
    const record = globalAssignments.find(
      (a) => a.subjectId === subjectId && a.classSectionId === sectionId
    );
    return record && record.facultyName !== faculty?.fullName;
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-6xl">
        <h3 className="text-lg font-bold mb-4">
          Assign Subjects to: {faculty?.fullName}
        </h3>

        {currentSemester && (
          <p className="mb-2 text-sm text-gray-700">
            <strong>Semester:</strong> {currentSemester.name} (
            {currentSemester.schoolYearLabel})
            <br />
            <strong>Total Current Load:</strong> {totalUnits} units
          </p>
        )}

        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="Search subject title..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="select select-bordered"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {uniqueCourses.map((id) => (
              <option key={id} value={id}>
                {courseMap[id] || `Course ID: ${id}`}
              </option>
            ))}
          </select>
          <select
            className="select select-bordered"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {uniqueYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            className="select select-bordered"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-auto max-h-[400px]">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Assign</th>
                <th>Subject</th>
                <th>Section</th>
                <th>Year</th>
                <th>Units</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((subject) =>
                sections
                  .filter(
                    (sec) =>
                      normalizeYearLevel(sec.yearLevel) ===
                        normalizeYearLevel(subject.yearLevel) &&
                      sec.collegeCourseId === subject.collegeCourseId &&
                      sec.semesterId === currentSemester?.id &&
                      sec.schoolYearLabel === currentSemester?.schoolYearLabel
                  )
                  .map((section) => {
                    const isChecked = assignments.some(
                      (a) =>
                        a.subjectId === subject.id &&
                        a.classSectionId === section.id
                    );
                    const assignedTo = getAssignedFacultyName(
                      subject.id,
                      section.id
                    );
                    const isDisabled = isAlreadyAssignedToAnother(
                      subject.id,
                      section.id
                    );
                    return (
                      <tr key={`${subject.id}-${section.id}`}>
                        <td>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={() =>
                              handleChange(subject.id, section.id)
                            }
                            className="checkbox"
                          />
                        </td>
                        <td>
                          {subject.subjectTitle}
                          {assignedTo && (
                            <div className="text-xs text-gray-500">
                              Assigned to: {assignedTo}
                            </div>
                          )}
                        </td>
                        <td>{section.section}</td>
                        <td>{subject.yearLevel}</td>
                        <td>{subject.units}</td>
                        <td>{subject.subjectType}</td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Save Assignments
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default AssignSubjectsToFacultyModal;
