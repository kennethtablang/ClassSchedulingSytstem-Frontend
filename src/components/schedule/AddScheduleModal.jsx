// src/components/schedule/AddScheduleModal.jsx - FIXED VERSION
import { useEffect, useState } from "react";
import {
  createSchedule,
  checkScheduleConflict,
} from "../../services/scheduleService";
import { toast } from "sonner";
import {
  prepareTimeForAPI,
  formatTimeForInput,
  isEndTimeAfterStartTime,
} from "../../utils/timeUtils";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const AddScheduleModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = {},
  subjects,
  faculty,
  rooms,
  sections,
}) => {
  const [form, setForm] = useState({
    subjectId: "",
    facultyId: "",
    classSectionId: "",
    roomId: "",
    day: 0,
    startTime: "08:00",
    endTime: "09:00",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setForm({
        subjectId: "",
        facultyId: "",
        classSectionId: "",
        roomId: "",
        day: 0,
        startTime: "08:00",
        endTime: "09:00",
      });
      setErrors({});
      setSubmitting(false);
    }
  }, [isOpen]);

  // Populate form when opening with drag/drop data or edits
  useEffect(() => {
    if (isOpen && initialData) {
      setForm((f) => ({
        ...f,
        subjectId: initialData.subjectId ?? f.subjectId,
        facultyId: initialData.facultyId ?? f.facultyId,
        classSectionId: initialData.classSectionId ?? f.classSectionId,
        day: initialData.day ?? f.day,
        // ✅ Ensure times are in 24-hour format for input fields
        startTime: initialData.startTime
          ? formatTimeForInput(initialData.startTime)
          : f.startTime,
        endTime: initialData.endTime
          ? formatTimeForInput(initialData.endTime)
          : f.endTime,
      }));
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.subjectId) {
      newErrors.subjectId = "Please select a subject";
    }
    if (!form.facultyId) {
      newErrors.facultyId = "Please select a faculty member";
    }
    if (!form.classSectionId) {
      newErrors.classSectionId = "Please select a class section";
    }
    if (!form.roomId) {
      newErrors.roomId = "Please select a room";
    }
    if (!form.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!form.endTime) {
      newErrors.endTime = "End time is required";
    }

    // ✅ Validate that end time is after start time
    if (form.startTime && form.endTime) {
      if (!isEndTimeAfterStartTime(form.startTime, form.endTime)) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate form first
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setSubmitting(true);

    try {
      // ✅ Convert times to 24-hour format for API
      const startTime24 = prepareTimeForAPI(form.startTime);
      const endTime24 = prepareTimeForAPI(form.endTime);

      // Build DTO with day as string and times in 24-hour format
      const dto = {
        subjectId: parseInt(form.subjectId, 10),
        facultyId: form.facultyId,
        classSectionId: parseInt(form.classSectionId, 10),
        roomId: parseInt(form.roomId, 10),
        day: dayNames[parseInt(form.day, 10)],
        startTime: startTime24,
        endTime: endTime24,
        isActive: true,
      };

      console.log("📤 Submitting schedule with times:", {
        original: { start: form.startTime, end: form.endTime },
        converted: { start: startTime24, end: endTime24 },
        dto,
      });

      // Conflict check
      const res = await checkScheduleConflict(dto);
      if (res.data.hasConflict) {
        toast.error(`Conflict: ${res.data.conflictingResources.join(", ")}`);
        setSubmitting(false);
        return;
      }

      // Create schedule
      await createSchedule(dto);
      toast.success("Schedule successfully created!");

      // Notify parent to refresh
      onSave();
    } catch (err) {
      console.error("Error creating schedule:", err);

      // Enhanced error handling
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Failed to create schedule.";

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Add New Schedule</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Subject */}
          <div>
            <label className="label">
              <span className="label-text">
                Subject <span className="text-error">*</span>
              </span>
            </label>
            <select
              name="subjectId"
              value={form.subjectId}
              onChange={handleChange}
              className={`select select-bordered w-full ${
                errors.subjectId ? "select-error" : ""
              }`}
              disabled={submitting}
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subjectTitle} ({s.subjectCode})
                </option>
              ))}
            </select>
            {errors.subjectId && (
              <p className="text-error text-xs mt-1">{errors.subjectId}</p>
            )}
          </div>

          {/* Faculty */}
          <div>
            <label className="label">
              <span className="label-text">
                Faculty <span className="text-error">*</span>
              </span>
            </label>
            <select
              name="facultyId"
              value={form.facultyId}
              onChange={handleChange}
              className={`select select-bordered w-full ${
                errors.facultyId ? "select-error" : ""
              }`}
              disabled={submitting}
            >
              <option value="">Select Faculty</option>
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.fullName}
                </option>
              ))}
            </select>
            {errors.facultyId && (
              <p className="text-error text-xs mt-1">{errors.facultyId}</p>
            )}
          </div>

          {/* Section */}
          <div>
            <label className="label">
              <span className="label-text">
                Class Section <span className="text-error">*</span>
              </span>
            </label>
            <select
              name="classSectionId"
              value={form.classSectionId}
              onChange={handleChange}
              className={`select select-bordered w-full ${
                errors.classSectionId ? "select-error" : ""
              }`}
              disabled={submitting}
            >
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.yearLevel}
                  {sec.section}
                </option>
              ))}
            </select>
            {errors.classSectionId && (
              <p className="text-error text-xs mt-1">{errors.classSectionId}</p>
            )}
          </div>

          {/* Room */}
          <div>
            <label className="label">
              <span className="label-text">
                Room <span className="text-error">*</span>
              </span>
            </label>
            <select
              name="roomId"
              value={form.roomId}
              onChange={handleChange}
              className={`select select-bordered w-full ${
                errors.roomId ? "select-error" : ""
              }`}
              disabled={submitting}
            >
              <option value="">Select Room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (Cap: {r.capacity})
                </option>
              ))}
            </select>
            {errors.roomId && (
              <p className="text-error text-xs mt-1">{errors.roomId}</p>
            )}
          </div>

          {/* Day */}
          <div>
            <label className="label">
              <span className="label-text">
                Day <span className="text-error">*</span>
              </span>
            </label>
            <select
              name="day"
              value={form.day}
              onChange={handleChange}
              className="select select-bordered w-full"
              disabled={submitting}
            >
              {dayNames.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div className="flex gap-2 col-span-2">
            <div className="flex-1">
              <label className="label">
                <span className="label-text">
                  Start Time <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.startTime ? "input-error" : ""
                }`}
                disabled={submitting}
              />
              {errors.startTime && (
                <p className="text-error text-xs mt-1">{errors.startTime}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="label">
                <span className="label-text">
                  End Time <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.endTime ? "input-error" : ""
                }`}
                disabled={submitting}
              />
              {errors.endTime && (
                <p className="text-error text-xs mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>
        </div>

        <div className="modal-action mt-4">
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              "Save Schedule"
            )}
          </button>
          <button onClick={onClose} className="btn" disabled={submitting}>
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default AddScheduleModal;
