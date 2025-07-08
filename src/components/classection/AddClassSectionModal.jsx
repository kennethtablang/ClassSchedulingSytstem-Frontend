import { useEffect, useState } from "react";
import { addClassSection } from "../../services/classSectionService";
import { getCollegeCourses } from "../../services/collegeCourseService";
import { getCurrentSemesters } from "../../services/semesterService";
import { toast } from "react-toastify";

const AddClassSectionModal = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("");
  const [yearLevel, setYearLevel] = useState(1);
  const [collegeCourseId, setCollegeCourseId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [schoolYearId, setSchoolYearId] = useState("");
  const [courses, setCourses] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);

  const resetForm = () => {
    setSection("");
    setYearLevel(1);
    setCollegeCourseId("");
  };

  const fetchDropdowns = async () => {
    try {
      const [courseRes, semesterRes] = await Promise.all([
        getCollegeCourses(),
        getCurrentSemesters(),
      ]);

      setCourses(courseRes.data);

      if (semesterRes.data.length > 0) {
        const current = semesterRes.data[0];
        setCurrentSemester(current);
        setSemesterId(current.id);
        setSchoolYearId(current.schoolYearId);
      } else {
        toast.error("No current semester found.");
      }
    } catch {
      toast.error("Failed to load dropdown data.");
    }
  };

  const handleSubmit = async () => {
    if (!section || !collegeCourseId || !semesterId || !schoolYearId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      await addClassSection({
        section,
        yearLevel,
        collegeCourseId,
        semesterId,
        schoolYearId,
      });
      toast.success("Section added successfully.");
      setOpen(false);
      resetForm();
      onSuccess();
    } catch {
      toast.error("Failed to create section.");
    }
  };

  useEffect(() => {
    if (open) fetchDropdowns();
  }, [open]);

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        Add Section
      </button>

      {open && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-xl">
            <h3 className="font-bold text-lg mb-4">Add Class Section</h3>

            <div className="space-y-4">
              <div>
                <label className="label font-semibold">Section Label</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="Enter section (e.g., A, B)"
                />
              </div>

              <div>
                <label className="label font-semibold">Year Level</label>
                <select
                  className="select select-bordered w-full"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(Number(e.target.value))}
                >
                  <option value="">Select year level</option>
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <div>
                <label className="label font-semibold">Course</label>
                <select
                  className="select select-bordered w-full"
                  value={collegeCourseId}
                  onChange={(e) => setCollegeCourseId(e.target.value)}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {currentSemester && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label font-semibold">Semester</label>
                    <input
                      className="input input-bordered w-full bg-gray-100"
                      value={currentSemester.name}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="label font-semibold">School Year</label>
                    <input
                      className="input input-bordered w-full bg-gray-100"
                      value={currentSemester.schoolYearLabel}
                      readOnly
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-action mt-6">
              <button className="btn btn-success" onClick={handleSubmit}>
                Save
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
};

export default AddClassSectionModal;
