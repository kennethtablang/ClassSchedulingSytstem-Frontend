import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { addClassSection } from "../../services/classSectionService";
import { getCollegeCourses } from "../../services/collegeCourseService";
import { getCurrentSemesters } from "../../services/semesterService";
import { notifySuccess, notifyError } from "../../services/notificationService";

const AddClassSectionModal = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      section: "",
      yearLevel: "",
      collegeCourseId: "",
    },
  });

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
      } else {
        notifyError("No current semester found.");
      }
    } catch {
      notifyError("Failed to load dropdown data.");
    }
  };

  const onSubmit = async (data) => {
    if (!currentSemester) {
      notifyError("Current semester not loaded.");
      return;
    }

    const payload = {
      ...data,
      yearLevel: Number(data.yearLevel),
      semesterId: currentSemester.id,
      schoolYearId: currentSemester.schoolYearId,
    };

    try {
      await addClassSection(payload);
      notifySuccess("Section added successfully.");
      setOpen(false);
      reset();
      onSuccess?.();
    } catch {
      notifyError("Failed to create section.");
    }
  };

  useEffect(() => {
    if (open) {
      fetchDropdowns();
      reset(); // Reset form when opening
    }
  }, [open, reset]);

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        Add Class Section
      </button>

      {open && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-xl">
            <h3 className="font-bold text-lg mb-4">Add Class Section</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Section Label */}
              <div>
                <label className="label font-semibold">Section Label</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter section (e.g., A, B)"
                  {...register("section", { required: "Section is required" })}
                />
                {errors.section && (
                  <p className="text-error text-sm mt-1">
                    {errors.section.message}
                  </p>
                )}
              </div>

              {/* Year Level */}
              <div>
                <label className="label font-semibold">Year Level</label>
                <select
                  className="select select-bordered w-full"
                  {...register("yearLevel", {
                    required: "Year level is required",
                  })}
                >
                  <option value="">Select year level</option>
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
                {errors.yearLevel && (
                  <p className="text-error text-sm mt-1">
                    {errors.yearLevel.message}
                  </p>
                )}
              </div>

              {/* Course */}
              <div>
                <label className="label font-semibold">Course</label>
                <select
                  className="select select-bordered w-full"
                  {...register("collegeCourseId", {
                    required: "Course is required",
                  })}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
                {errors.collegeCourseId && (
                  <p className="text-error text-sm mt-1">
                    {errors.collegeCourseId.message}
                  </p>
                )}
              </div>

              {/* Semester and School Year (Read-only) */}
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

              {/* Form Actions */}
              <div className="modal-action">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </>
  );
};

export default AddClassSectionModal;
