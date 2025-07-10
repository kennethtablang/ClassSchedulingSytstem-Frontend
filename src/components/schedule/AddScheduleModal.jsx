// src/components/schedule/AddScheduleModal.jsx
import { useEffect, useState } from "react";
import {
  createSchedule,
  checkScheduleConflict,
} from "../../services/scheduleService";
import { toast } from "sonner";

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
        startTime: initialData.startTime ?? f.startTime,
        endTime: initialData.endTime ?? f.endTime,
      }));
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Build DTO with day as string
      const dto = {
        subjectId: parseInt(form.subjectId, 10),
        facultyId: form.facultyId,
        classSectionId: parseInt(form.classSectionId, 10),
        roomId: parseInt(form.roomId, 10),
        day: dayNames[parseInt(form.day, 10)],
        startTime: form.startTime,
        endTime: form.endTime,
        isActive: true,
      };

      // Conflict check
      const res = await checkScheduleConflict(dto);
      if (res.data.hasConflict) {
        toast.error(`Conflict: ${res.data.conflictingResources.join(", ")}`);
        return;
      }

      // Create schedule
      await createSchedule(dto);
      toast.success("Schedule successfully created!");

      // Notify parent to refresh (modal stays simple)
      onSave();
    } catch (err) {
      console.error("Error creating schedule:", err);
      toast.error("Failed to create schedule.");
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
              <span className="label-text">Subject</span>
            </label>
            <select
              name="subjectId"
              value={form.subjectId}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subjectTitle} ({s.subjectCode})
                </option>
              ))}
            </select>
          </div>

          {/* Faculty */}
          <div>
            <label className="label">
              <span className="label-text">Faculty</span>
            </label>
            <select
              name="facultyId"
              value={form.facultyId}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Select Faculty</option>
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="label">
              <span className="label-text">Class Section</span>
            </label>
            <select
              name="classSectionId"
              value={form.classSectionId}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.yearLevel}
                  {sec.section}
                </option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div>
            <label className="label">
              <span className="label-text">Room</span>
            </label>
            <select
              name="roomId"
              value={form.roomId}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Select Room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (Cap: {r.capacity})
                </option>
              ))}
            </select>
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
                <span className="label-text">Start Time</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex-1">
              <label className="label">
                <span className="label-text">End Time</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>
        </div>

        <div className="modal-action mt-4">
          <button onClick={handleSubmit} className="btn btn-primary">
            Save Schedule
          </button>
          <button onClick={onClose} className="btn">
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default AddScheduleModal;
