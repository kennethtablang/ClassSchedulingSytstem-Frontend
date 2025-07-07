// src/pages/dashboard/SchedulePage.jsx
import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import {
  getAllSchedules,
  getSchedulesByFaculty,
  getSchedulesBySection,
  getSchedulesByRoom,
  checkScheduleConflict,
  createSchedule,
} from "../../services/scheduleService";
import { getSubjects } from "../../services/subjectService";
import { getFacultyUsers } from "../../services/facultyService";
import { getRooms } from "../../services/roomService";
import { getClassSections } from "../../services/classSectionService";
import ExternalEventsList from "../../components/schedule/ExternalEventsList";
import WeeklyUnitTrackerSidebar from "../../components/schedule/WeeklyUnitTrackerSidebar";
import AddScheduleModal from "../../components/schedule/AddScheduleFromDropModal";
import EditScheduleModal from "../../components/schedule/EditScheduleModal";

const SchedulePage = () => {
  const calendarRef = useRef(null);

  // master data
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sections, setSections] = useState([]);

  // schedules loaded into calendar
  const [schedules, setSchedules] = useState([]);

  // POV state
  const [selectedPOV, setSelectedPOV] = useState("Faculty");
  const [selectedId, setSelectedId] = useState("");

  // modal state for normal Add/Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  // modal state for drop‑from‑external
  const [showAddModal, setShowAddModal] = useState(false);
  const [dropData, setDropData] = useState(null);

  // 1️⃣ Load all lookups once
  useEffect(() => {
    Promise.all([
      getSubjects(),
      getFacultyUsers(),
      getRooms(),
      getClassSections(),
    ]).then(([sRes, fRes, rRes, csRes]) => {
      setSubjects(sRes.data);
      setFaculty(fRes.data);
      setRooms(rRes.data);
      setSections(csRes.data);
    });
  }, []);

  // 2️⃣ Reload schedules whenever POV or ID changes
  useEffect(() => {
    const load = async () => {
      if (!selectedId && selectedPOV !== "All") {
        setSchedules([]);
        return;
      }
      let res;
      switch (selectedPOV) {
        case "Faculty":
          res = await getSchedulesByFaculty(selectedId);
          break;
        case "Class Section":
          res = await getSchedulesBySection(selectedId);
          break;
        case "Room":
          res = await getSchedulesByRoom(selectedId);
          break;
        default:
          res = await getAllSchedules();
          break;
      }
      setSchedules(res.data);
    };
    load();
  }, [selectedPOV, selectedId]);

  // 3️⃣ Turn your ExternalEventsList into draggable sources
  useEffect(() => {
    let el = document.getElementById("external-events");
    if (el) {
      new Draggable(el, {
        itemSelector: ".fc-event",
        eventData: (eventEl) => ({
          title: eventEl.getAttribute("data-title"),
          backgroundColor: eventEl.getAttribute("data-color"),
          extendedProps: {
            subjectId: Number(eventEl.dataset.subjectId),
            facultyId: eventEl.dataset.facultyId,
            classSectionId: Number(eventEl.dataset.sectionId),
            units: Number(eventEl.dataset.units),
          },
        }),
      });
    }
  }, [selectedPOV, selectedId]);

  // 4️⃣ Turn your schedule rows into FullCalendar events
  const calendarEvents = schedules.map((s) => ({
    id: String(s.id),
    title: s.subjectTitle,
    start: `2025-01-0${s.day + 1}T${s.startTime}`,
    end: `2025-01-0${s.day + 1}T${s.endTime}`,
    backgroundColor: s.subjectColor,
    borderColor: s.subjectColor,
    extendedProps: s,
  }));

  // 5️⃣ Handle external drop‑receive
  const handleEventReceive = (info) => {
    // remove the auto‑inserted placeholder
    info.event.remove();

    // build the “defaultData” payload for the modal
    const { subjectId, facultyId, classSectionId, units } =
      info.event.extendedProps;
    const start = info.event.start;
    const day = start.getDay();
    const hhmmStart = start.toTimeString().slice(0, 5);
    const hhmmEnd = new Date(start.getTime() + 3600000)
      .toTimeString()
      .slice(0, 5);

    setDropData({
      subjectId,
      facultyId,
      classSectionId,
      units,
      title: info.event.title,
      day,
      startTime: hhmmStart,
      endTime: hhmmEnd,
    });
    setShowAddModal(true);
  };

  // 6️⃣ Save from the drop‑modal
  const handleSaveDrop = async (dto) => {
    await createSchedule(dto);
    setShowAddModal(false);
    // refresh the calendar
    if (calendarRef.current) {
      // FullCalendar API
      calendarRef.current.getApi().refetchEvents();
    }
  };

  // 7️⃣ If user cancels, we just close the modal
  const handleCancelDrop = () => {
    setShowAddModal(false);
    setDropData(null);
  };

  // 8️⃣ Handle event click (edit)
  const handleEventClick = (info) => {
    setEditEvent(info.event.extendedProps);
    setShowEditModal(true);
  };

  // 9️⃣ Handle drag‑within‑calendar to reposition
  const handleEventDrop = async (info) => {
    const dto = {
      ...info.event.extendedProps,
      day: info.event.start.getDay(),
      startTime: info.event.start.toTimeString().slice(0, 5),
      endTime: info.event.end.toTimeString().slice(0, 5),
      id: info.event.extendedProps.id,
    };
    const conflict = await checkScheduleConflict(dto);
    if (conflict.data.hasConflict) {
      alert("Conflict: " + conflict.data.conflictingResources.join(", "));
      info.revert();
    } else {
      // ideally call updateSchedule(dto.id, dto) here
      info.event.setExtendedProp("subjectTitle", info.event.title);
    }
  };

  const reloadCalendars = () => {
    if (calendarRef.current) calendarRef.current.getApi().refetchEvents();
  };

  // which POV list to show in the dropdown
  const povItems =
    selectedPOV === "Faculty"
      ? faculty
      : selectedPOV === "Class Section"
      ? sections
      : rooms;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
      {/* Left – draggable sources */}
      <div className="md:col-span-2">
        <ExternalEventsList
          selectedPOV={selectedPOV}
          selectedId={selectedId}
          subjects={subjects}
          faculty={faculty}
          sections={sections}
        />
      </div>

      {/* Center – calendar */}
      <div className="md:col-span-7">
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <select
              className="select select-bordered"
              value={selectedPOV}
              onChange={(e) => {
                setSelectedPOV(e.target.value);
                setSelectedId("");
              }}
            >
              <option>Faculty</option>
              <option>Class Section</option>
              <option>Room</option>
              <option>All</option>
            </select>
            <select
              className="select select-bordered"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Select…</option>
              {povItems.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.fullName || i.section || i.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditEvent(null);
              setShowEditModal(true);
            }}
          >
            + Add Schedule
          </button>
        </div>

        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          droppable // ← allows eventReceive
          editable
          events={calendarEvents}
          eventReceive={handleEventReceive}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
          slotMinTime="07:00:00"
          slotMaxTime="19:00:00"
          height="auto"
        />
      </div>

      {/* Right – unit tracker */}
      <div className="md:col-span-3">
        <WeeklyUnitTrackerSidebar schedules={schedules} />
      </div>

      {/* Drop‑modal */}
      <AddScheduleModal
        open={showAddModal}
        defaultData={dropData}
        onSave={handleSaveDrop}
        onCancel={handleCancelDrop}
      />

      {/* Edit‑modal */}
      <EditScheduleModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        schedule={editEvent}
        onSuccess={reloadCalendars}
        subjects={subjects}
        faculty={faculty}
        rooms={rooms}
        sections={sections}
      />
    </div>
  );
};

export default SchedulePage;
