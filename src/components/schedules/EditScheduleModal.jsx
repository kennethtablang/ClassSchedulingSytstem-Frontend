import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { updateSchedule } from "../../services/scheduleService";
import { toast } from "react-toastify";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const EditScheduleModal = ({
  isOpen,
  onClose,
  onSuccess,
  schedule,
  subjects,
  rooms,
  faculty,
  classSection,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && schedule) {
      setValue("subjectId", schedule.subjectId);
      setValue("facultyId", schedule.facultyId);
      setValue("classSectionId", schedule.classSectionId);
      setValue("roomId", schedule.roomId);
      setValue("day", schedule.day);
      setValue("startTime", schedule.startTime?.slice(0, 5));
      setValue("endTime", schedule.endTime?.slice(0, 5));
    }
  }, [isOpen, schedule, setValue]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      const payload = {
        ...data,
        day: parseInt(data.day),
        startTime: `${data.startTime}:00`,
        endTime: `${data.endTime}:00`,
      };

      await updateSchedule(schedule.id, payload);
      toast.success("Schedule updated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating schedule:", err);
      toast.error("Failed to update schedule.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !schedule) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Edit Schedule</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium">Subject</label>
            <select
              {...register("subjectId", { required: true })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Subject</option>
              {Array.isArray(subjects) &&
                subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subjectTitle}
                  </option>
                ))}
            </select>
            {errors.subjectId && (
              <p className="text-red-500 text-sm">Subject is required</p>
            )}
          </div>

          {/* Faculty */}
          <div>
            <label className="block text-sm font-medium">Faculty</label>
            <select
              {...register("facultyId", { required: true })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Faculty</option>
              {Array.isArray(faculty) &&
                faculty.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fullName}
                  </option>
                ))}
            </select>
            {errors.facultyId && (
              <p className="text-red-500 text-sm">Faculty is required</p>
            )}
          </div>

          {/* Class Section */}
          <div>
            <label className="block text-sm font-medium">Class Section</label>
            <select
              {...register("classSectionId", { required: true })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Section</option>
              {Array.isArray(classSection) &&
                classSection.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.section}
                  </option>
                ))}
            </select>
            {errors.classSectionId && (
              <p className="text-red-500 text-sm">Section is required</p>
            )}
          </div>

          {/* Room */}
          <div>
            <label className="block text-sm font-medium">Room</label>
            <select
              {...register("roomId", { required: true })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Room</option>
              {Array.isArray(rooms) &&
                rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
            </select>
            {errors.roomId && (
              <p className="text-red-500 text-sm">Room is required</p>
            )}
          </div>

          {/* Day */}
          <div>
            <label className="block text-sm font-medium">Day</label>
            <select
              {...register("day", { required: true })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Day</option>
              {daysOfWeek.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
            {errors.day && (
              <p className="text-red-500 text-sm">Day is required</p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium">Start Time</label>
            <input
              type="time"
              {...register("startTime", { required: true })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm">Start time is required</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium">End Time</label>
            <input
              type="time"
              {...register("endTime", { required: true })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm">End time is required</p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded"
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScheduleModal;
