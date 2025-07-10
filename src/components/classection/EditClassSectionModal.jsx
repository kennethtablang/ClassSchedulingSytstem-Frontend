import { useEffect, useState } from "react";
import { getCollegeCourses } from "../../services/collegeCourseService";
import { getCurrentSemesters } from "../../services/semesterService";
import { updateClassSection } from "../../services/classSectionService";
import { notifySuccess, notifyError } from "../../services/notificationService";

const EditClassSectionModal = ({ section, onClose, onSuccess }) => {
  const [form, setForm] = useState({ ...section });
  const [courses, setCourses] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, semesterRes] = await Promise.all([
          getCollegeCourses(),
          getCurrentSemesters(),
        ]);
        setCourses(courseRes.data);

        if (semesterRes.data.length > 0) {
          const current = semesterRes.data[0];
          setCurrentSemester(current);
          setForm((prev) => ({
            ...prev,
            semesterId: current.id,
            schoolYearId: current.schoolYearId,
          }));
        } else {
          notifyError("No current semester found.");
        }
      } catch {
        notifyError("Failed to load dropdown data.");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await updateClassSection(form.id, form);
      notifySuccess("Class section updated successfully.");
      onSuccess();
    } catch (err) {
      const msg = err?.response?.data || "Failed to update section.";
      setError(msg);
      notifyError("Update failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-xl">
        <h3 className="text-lg font-bold mb-4">Edit Class Section</h3>

        {error && <div className="alert alert-error mb-3 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="section"
            value={form.section}
            onChange={handleChange}
            placeholder="Section (e.g., A, B)"
            className="input input-bordered w-full"
            required
          />

          <select
            name="yearLevel"
            className="select select-bordered w-full"
            value={form.yearLevel}
            onChange={handleChange}
            required
          >
            <option value="">Select Year Level</option>
            {[1, 2, 3, 4].map((y) => (
              <option key={y} value={y}>
                {`${y}st Year`}
              </option>
            ))}
          </select>

          <select
            name="collegeCourseId"
            className="select select-bordered w-full"
            value={form.collegeCourseId}
            onChange={handleChange}
            required
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>

          {currentSemester && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label font-semibold">Semester</label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-gray-100"
                  value={currentSemester.name}
                  readOnly
                />
              </div>
              <div>
                <label className="label font-semibold">School Year</label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-gray-100"
                  value={currentSemester.schoolYearLabel}
                  readOnly
                />
              </div>
            </div>
          )}

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default EditClassSectionModal;
