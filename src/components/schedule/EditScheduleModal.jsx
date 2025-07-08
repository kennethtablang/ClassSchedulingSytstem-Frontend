import { useEffect, useState } from "react";
import {
  updateSchedule,
  checkScheduleConflict,
  getAvailableRooms,
  deleteSchedule, // ✅ added
} from "../../services/scheduleService";
import { toast } from "react-toastify";

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
        startTime: schedule.startTime.slice(0, 5),
        endTime: schedule.endTime.slice(0, 5),
        roomId: schedule.roomId,
        isActive: schedule.isActive,
      });
    }
  }, [isOpen, schedule]);

  useEffect(() => {
    if (!isOpen) return;
    const { day, startTime, endTime } = form;
    setLoadingRooms(true);
    getAvailableRooms(day, startTime, endTime)
      .then((res) => {
        const free = res.data;
        const current = allRooms.find((r) => r.id === form.roomId);
        const merged = current
          ? [current, ...free.filter((r) => r.id !== current.id)]
          : free;
        setAvailableRooms(merged);
      })
      .catch((err) => {
        console.error("Error loading rooms:", err);
        setAvailableRooms(allRooms);
      })
      .finally(() => setLoadingRooms(false));
  }, [isOpen, form.day, form.startTime, form.endTime, form.roomId, allRooms]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const dto = {
        id: form.id,
        subjectId: parseInt(form.subjectId),
        facultyId: form.facultyId,
        classSectionId: parseInt(form.classSectionId),
        roomId: parseInt(form.roomId),
        day: dayNames[parseInt(form.day)],
        startTime: form.startTime,
        endTime: form.endTime,
        isActive: form.isActive,
      };

      const conflictRes = await checkScheduleConflict(dto);
      if (conflictRes.data.hasConflict) {
        toast.error(
          "Conflict: " + conflictRes.data.conflictingResources.join(", ")
        );
        return;
      }

      await updateSchedule(form.id, dto);
      toast.success("Schedule updated.");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update schedule.");
    }
  };

  // ✅ Delete handler
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this schedule?"
    );
    if (!confirmed) return;

    try {
      await deleteSchedule(form.id);
      toast.success("Schedule deleted.");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete schedule.");
    }
  };

  if (!isOpen) return null;
  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg mb-4">Edit Schedule</h3>

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
                  {s.subjectTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Class Section */}
          <div>
            <label className="label">
              <span className="label-text">Section</span>
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
                  {sec.yearLevel} {sec.section}
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

          {/* Room */}
          <div className="col-span-2">
            <label className="label">
              <span className="label-text">Room</span>
            </label>
            {loadingRooms ? (
              <div>Loading rooms…</div>
            ) : (
              <select
                name="roomId"
                value={form.roomId}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="">Select Room</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (Cap: {r.capacity})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Active */}
          <div className="col-span-2 flex items-center">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="checkbox"
              />
              <span>Active</span>
            </label>
          </div>
        </div>

        {/* Footer with Update / Cancel / Delete */}
        <div className="modal-action mt-4 flex justify-between">
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="btn btn-primary">
              Update
            </button>
            <button onClick={onClose} className="btn">
              Cancel
            </button>
          </div>
          <button onClick={handleDelete} className="btn btn-error btn-outline">
            Delete
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default EditScheduleModal;
