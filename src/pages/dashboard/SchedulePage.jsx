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
import {
  getCurrentSemesters,
  getSemesters as getAllSemesters,
} from "../../services/semesterService";

import ExternalEventsList from "../../components/schedule/ExternalEventsList";
import WeeklyUnitTrackerSidebar from "../../components/schedule/WeeklyUnitTrackerSidebar";
import AddScheduleModal from "../../components/schedule/AddScheduleModal";
import EditScheduleModal from "../../components/schedule/EditScheduleModal";

const dayToIndex = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const SchedulePage = () => {
  const calendarRef = useRef(null);

  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sections, setSections] = useState([]);

  const [currentSem, setCurrentSem] = useState(null);
  const [allSemesters, setAllSemesters] = useState([]);

  const [schedules, setSchedules] = useState([]);
  const [selectedPOV, setSelectedPOV] = useState("Faculty");
  const [selectedId, setSelectedId] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [receivedFcEvent, setReceivedFcEvent] = useState(null);

  useEffect(() => {
    getCurrentSemesters().then((res) => setCurrentSem(res.data[0] || null));
    getAllSemesters().then((res) => setAllSemesters(res.data));
    Promise.all([
      getSubjects(),
      getFacultyUsers(),
      getRooms(),
      getClassSections(),
    ]).then(([sub, fac, rm, sec]) => {
      setSubjects(sub.data);
      setFaculty(fac.data);
      setRooms(rm.data);
      setSections(sec.data);
    });
  }, []);

  useEffect(() => {
    if (!currentSem) return;
    setSections((prev) => prev.filter((s) => s.semesterId === currentSem.id));
  }, [currentSem]);

  useEffect(() => {
    if (!currentSem) return;
    if (!selectedId && selectedPOV !== "All") {
      setSchedules([]);
      return;
    }
    (async () => {
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
      }
      setSchedules(res.data);
    })();
  }, [selectedPOV, selectedId, currentSem]);

  useEffect(() => {
    const container = document.getElementById("external-events");
    if (container && selectedPOV === "Faculty") {
      new Draggable(container, {
        itemSelector: ".fc-event",
        eventData: (el) => ({
          title: el.dataset.title,
          backgroundColor: el.dataset.color,
          extendedProps: {
            subjectId: +el.dataset.subjectId,
            facultyId: el.dataset.facultyId,
            classSectionId: +el.dataset.sectionId,
            units: +el.dataset.units,
          },
        }),
      });
    }
  }, [selectedPOV, sections]);

  const calendarEvents = schedules.map((s) => ({
    id: String(s.id),
    title: s.subjectTitle,
    daysOfWeek: [dayToIndex[s.day]],
    startTime: s.startTime,
    endTime: s.endTime,
    startRecur: currentSem?.startDate,
    endRecur: currentSem?.endDate,
    backgroundColor: s.subjectColor,
    borderColor: s.subjectColor,
    extendedProps: s,
  }));

  const handleEventReceive = (info) => {
    const ev = info.event;
    setReceivedFcEvent(ev);
    setCurrentEvent({
      subjectId: ev.extendedProps.subjectId,
      facultyId: ev.extendedProps.facultyId,
      classSectionId: ev.extendedProps.classSectionId,
      day: ev.start.getDay(),
      startTime: ev.start.toTimeString().slice(0, 5),
      endTime: ev.end
        ? ev.end.toTimeString().slice(0, 5)
        : new Date(ev.start.getTime() + 3600000).toTimeString().slice(0, 5),
    });
    setShowAddModal(true);
  };

  const handleEventDrop = async (info) => {
    const updated = {
      ...info.event.extendedProps,
      day: info.event.start.getDay(),
      startTime: info.event.start.toTimeString().slice(0, 5),
      endTime: info.event.end.toTimeString().slice(0, 5),
    };
    const res = await checkScheduleConflict(updated);
    if (res.data.hasConflict) {
      alert(`Conflict: ${res.data.conflictingResources.join(", ")}`);
      info.revert();
    } else {
      setSelectedId((id) => id);
    }
  };

  const handleSaveAdd = async (dto) => {
    await createSchedule(dto);
    setShowAddModal(false);
    if (currentSem) {
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
      }
      setSchedules(res.data);
    }
  };

  const handleCancelAdd = () => {
    if (receivedFcEvent) {
      receivedFcEvent.remove();
      setReceivedFcEvent(null);
    }
    setShowAddModal(false);
  };

  const povData =
    selectedPOV === "Faculty"
      ? faculty
      : selectedPOV === "Class Section"
      ? sections
      : selectedPOV === "Room"
      ? rooms
      : [];

  return (
    <div className="flex h-full">
      <aside className="w-64 bg-gray-50 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Filters</h2>
        <label className="block mb-2">
          View By:
          <select
            className="select select-bordered w-full mt-1"
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
        </label>
        {selectedPOV !== "All" && (
          <label className="block mb-4">
            Select {selectedPOV}:
            <select
              className="select select-bordered w-full mt-1"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">-- choose --</option>
              {povData.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.fullName || it.section || it.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {selectedPOV === "Faculty" && (
          <div id="external-events" className="space-y-2">
            <h2 className="text-lg font-semibold mb-2">Drag to Calendar</h2>
            <ExternalEventsList
              selectedPOV={selectedPOV}
              selectedId={selectedId}
              subjects={subjects}
              faculty={faculty}
              sections={sections}
            />
          </div>
        )}

        <button
          className="btn btn-primary w-full mt-4"
          onClick={() => {
            setCurrentEvent(null);
            setShowAddModal(true);
          }}
        >
          + Add Schedule
        </button>
      </aside>

      <main className="flex-1 p-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            {currentSem ? `Schedule — ${currentSem.name}` : "Schedule"}
          </h1>
          {currentSem && (
            <select
              className="select select-bordered"
              value={currentSem.id}
              onChange={(e) => {
                const sel = allSemesters.find((s) => s.id === +e.target.value);
                setCurrentSem(sel);
              }}
            >
              {allSemesters.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.name} ({sem.schoolYearLabel})
                </option>
              ))}
            </select>
          )}
        </div>

        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          editable
          droppable
          ref={calendarRef}
          events={calendarEvents}
          eventReceive={handleEventReceive}
          eventDrop={handleEventDrop}
          eventClick={(info) => {
            setCurrentEvent(info.event.extendedProps);
            setShowEditModal(true);
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
          slotMinTime="07:00:00"
          slotMaxTime="19:00:00"
          slotDuration="00:30:00"
          eventDisplay="block"
          height="calc(100vh - 200px)"
        />
      </main>

      <aside className="w-80 bg-gray-50 overflow-y-auto">
        <WeeklyUnitTrackerSidebar schedules={schedules} />
      </aside>

      {showAddModal && (
        <AddScheduleModal
          isOpen={showAddModal}
          onClose={handleCancelAdd}
          onSave={handleSaveAdd}
          initialData={currentEvent}
          subjects={subjects}
          faculty={faculty}
          rooms={rooms}
          sections={sections}
        />
      )}

      {showEditModal && currentEvent && (
        <EditScheduleModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          schedule={currentEvent}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedId((id) => id);
          }}
          subjects={subjects}
          faculty={faculty}
          rooms={rooms}
          sections={sections}
        />
      )}
    </div>
  );
};

export default SchedulePage;
