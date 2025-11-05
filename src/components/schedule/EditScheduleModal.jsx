// src/components/schedule/EditScheduleModal.jsx - FIXED VERSION
import { useEffect, useState } from "react";
import {
  updateSchedule,
  checkScheduleConflict,
  getAvailableRooms,
  deleteSchedule,
} from "../../services/scheduleService";
import { toast } from "sonner";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
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

const EditScheduleModal = ({
  isOpen,
  onClose,
  schedule = {},
  onSuccess,
  subjects = [],
  faculty = [],
  sections = [],
  rooms: allRooms = [],
}) => {
  const [form, setForm] = useState({
    id: "",
    subjectId: "",
    facultyId: "",
    classSectionId: "",
    day: 0,
    startTime: "08:00",
    endTime: "09:00",
    roomId: "",
    isActive: true,
  });

  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Initialize form from schedule prop
  useEffect(() => {
    if (isOpen && schedule) {
      setForm({
        id: schedule.id,
        subjectId: schedule.subjectId,
        facultyId: schedule.facultyId,
        classSectionId: schedule.classSectionId,
        day:
          typeof schedule.day === "string"
            ? dayNames.indexOf(schedule.day)
            : schedule.day,
        // ✅ Convert times to 24-hour format for input fields
        startTime: formatTimeForInput(
          typeof schedule.startTime === "string"
            ? schedule.startTime
            : schedule.startTime?.slice(0, 5) || "08:00"
        ),
        endTime: formatTimeForInput(
          typeof schedule.endTime === "string"
            ? schedule.endTime
            : schedule.endTime?.slice(0, 5) || "09:00"
        ),
        roomId: schedule.roomId,
        isActive: schedule.isActive,
      });
      setErrors({});
    }
  }, [isOpen, schedule]);

  // ✅ Load available rooms when day or time changes
  useEffect(() => {
    if (!isOpen) return;

    const loadRooms = async () => {
      const { day, startTime, endTime } = form;

      if (!startTime || !endTime) {
        setAvailableRooms(allRooms);
        return;
      }

      setLoadingRooms(true);

      try {
        // Convert times to 24-hour format for API
        const start24 = prepareTimeForAPI(startTime);
        const end24 = prepareTimeForAPI(endTime);

        const dayName = dayNames[day];

        const res = await getAvailableRooms(dayName, start24, end24);
        const free = res.data;
        const current = allRooms.find((r) => r.id === form.roomId);

        // Include current room even if it's "occupied" (by this schedule)
        const merged = current
          ? [current, ...free.filter((r) => r.id !== current.id)]
          : free;

        setAvailableRooms(merged);
      } catch (err) {
        console.error("Error loading rooms:", err);
        setAvailableRooms(allRooms);
      } finally {
        setLoadingRooms(false);
      }
    };

    loadRooms();
  }, [isOpen, form.day, form.startTime, form.endTime, allRooms, form.roomId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!form.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (!form.roomId) {
      newErrors.roomId = "Please select a room";
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
    if (!validateForm()) {
      toast.error("Please correct the errors before saving");
      return;
    }

    setSubmitting(true);

    try {
      // ✅ Convert times to 24-hour format for API
      const startTime24 = prepareTimeForAPI(form.startTime);
      const endTime24 = prepareTimeForAPI(form.endTime);

      const dto = {
        id: form.id,
        subjectId: parseInt(form.subjectId),
        facultyId: form.facultyId,
        classSectionId: parseInt(form.classSectionId),
        roomId: parseInt(form.roomId),
        day: dayNames[parseInt(form.day)],
        startTime: startTime24,
        endTime: endTime24,
        isActive: form.isActive,
      };

      console.log("📤 Updating schedule with times:", {
        original: { start: form.startTime, end: form.endTime },
        converted: { start: startTime24, end: endTime24 },
        dto,
      });

      // Check for conflicts
      const conflictRes = await checkScheduleConflict(dto);
      if (conflictRes.data.hasConflict) {
        toast.error(
          "Schedule Conflict Detected: " +
            conflictRes.data.conflictingResources.join(", ")
        );
        setSubmitting(false);
        return;
      }

      // Update schedule
      await updateSchedule(form.id, dto);
      toast.success("Schedule updated successfully.");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Update error:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Failed to update schedule.";

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteSchedule(form.id);
      toast.success("Schedule deleted.");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete schedule.");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <dialog open className="modal modal-open">
        <div className="modal-box max-w-lg">
          <h3 className="font-bold text-lg mb-4">Edit Schedule</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Subject (Read-only) */}
            <div>
              <label className="label">
                <span className="label-text">Subject</span>
              </label>
              <input
                className="input input-bordered w-full bg-base-200"
                value={
                  subjects.find((s) => s.id === form.subjectId)?.subjectTitle ||
                  "N/A"
                }
                readOnly
              />
            </div>

            {/* Section (Read-only) */}
            <div>
              <label className="label">
                <span className="label-text">Section</span>
              </label>
              <input
                className="input input-bordered w-full bg-base-200"
                value={
                  sections.find((sec) => sec.id === form.classSectionId)
                    ? `${
                        sections.find((sec) => sec.id === form.classSectionId)
                          .yearLevel
                      }${
                        sections.find((sec) => sec.id === form.classSectionId)
                          .section
                      }`
                    : "N/A"
                }
                readOnly
              />
            </div>

            {/* Faculty (Read-only) */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Faculty</span>
              </label>
              <input
                className="input input-bordered w-full bg-base-200"
                value={
                  faculty.find((f) => f.id === form.facultyId)?.fullName ||
                  "N/A"
                }
                readOnly
              />
            </div>

            {/* Day */}
            <div>
              <label className="label">
                <span className="label-text">Day</span>
              </label>
              <select
                name="day"
                value={form.day}
                onChange={handleChange}
                className="select select-bordered w-full"
                disabled={submitting}
              >
                {dayNames.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Time */}
            <div className="col-span-2 flex gap-2">
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

            {/* Room */}
            <div className="col-span-2">
              <label className="label">
                <span className="label-text">
                  Room <span className="text-error">*</span>
                </span>
              </label>
              {loadingRooms ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span className="text-sm">Loading available rooms...</span>
                </div>
              ) : (
                <>
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
                    {availableRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Cap: {r.capacity})
                      </option>
                    ))}
                  </select>
                  {errors.roomId && (
                    <p className="text-error text-xs mt-1">{errors.roomId}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-action mt-4 flex justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={submitting || loadingRooms}
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </button>
              <button onClick={onClose} className="btn" disabled={submitting}>
                Cancel
              </button>
            </div>
            <button
              onClick={handleDelete}
              className="btn btn-error btn-outline"
              disabled={submitting}
            >
              Delete
            </button>
          </div>
        </div>
      </dialog>

      {/* Confirm Delete */}
      <ConfirmDeleteModal
        isOpen={showConfirm}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
    </>
  );
};

export default EditScheduleModal;
