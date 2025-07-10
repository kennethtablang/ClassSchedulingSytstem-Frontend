import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { updateSubject } from "../../services/subjectService";
import { toast } from "react-toastify";

const EditSubjectModal = ({ open, onClose, onUpdated, subject, courses }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    if (subject) {
      setValue("id", subject.id);
      setValue("subjectCode", subject.subjectCode);
      setValue("subjectTitle", subject.subjectTitle);
      setValue("units", subject.units);
      setValue("subjectType", subject.subjectType);
      setValue("yearLevel", subject.yearLevel);
      setValue("collegeCourseId", subject.collegeCourseId);
      setValue("color", subject.color || "#9CA3AF"); // default fallback
    }
  }, [subject, setValue]);

  const onSubmit = async (data) => {
    try {
      await updateSubject(data);
      toast.success("Subject updated successfully!");
      onClose();
      onUpdated();
    } catch {
      toast.error("Failed to update subject.");
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-base-200 p-6 rounded-xl w-full max-w-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Subject</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
              <input type="hidden" {...register("id")} />

              <div>
                <label className="label">Subject Code</label>
                <input
                  {...register("subjectCode", { required: true })}
                  className="input input-bordered w-full"
                />
                {errors.subjectCode && (
                  <p className="text-red-500 text-sm">Required</p>
                )}
              </div>

              <div>
                <label className="label">Subject Title</label>
                <input
                  {...register("subjectTitle", { required: true })}
                  className="input input-bordered w-full"
                />
                {errors.subjectTitle && (
                  <p className="text-red-500 text-sm">Required</p>
                )}
              </div>

              <div>
                <label className="label">Units</label>
                <input
                  type="number"
                  min={1}
                  {...register("units", { required: true, min: 1 })}
                  className="input input-bordered w-full"
                />
                {errors.units && (
                  <p className="text-red-500 text-sm">Invalid value</p>
                )}
              </div>

              <div>
                <label className="label">Subject Type</label>
                <select
                  {...register("subjectType", { required: true })}
                  className="select select-bordered w-full"
                >
                  <option value="">-- Select Type --</option>
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab</option>
                  <option value="Lecture-Lab">Lecture-Lab</option>
                </select>
                {errors.subjectType && (
                  <p className="text-red-500 text-sm">Required</p>
                )}
              </div>

              <div>
                <label className="label">Year Level</label>
                <select
                  {...register("yearLevel", { required: true })}
                  className="select select-bordered w-full"
                >
                  <option value="">-- Select Year Level --</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
                {errors.yearLevel && (
                  <p className="text-red-500 text-sm">Required</p>
                )}
              </div>

              <div>
                <label className="label">Course</label>
                <select
                  {...register("collegeCourseId", { required: true })}
                  className="select select-bordered w-full"
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
                {errors.collegeCourseId && (
                  <p className="text-red-500 text-sm">Required</p>
                )}
              </div>

              <div>
                <label className="label">Color</label>
                <input
                  type="color"
                  {...register("color")}
                  className="w-16 h-10 border rounded"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    reset();
                    onClose();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditSubjectModal;
