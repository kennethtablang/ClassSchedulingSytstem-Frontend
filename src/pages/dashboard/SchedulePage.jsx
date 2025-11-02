// src/pages/dashboard/SchedulePage.jsx
import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import { toast } from "sonner";

import {
  getAllSchedules,
  getSchedulesByFaculty,
  getSchedulesBySection,
  getSchedulesByRoom,
  checkScheduleConflict,
  updateSchedule,
  downloadSchedulePdf,
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

  // ✅ NEW: Search state for faculty
  const [facultySearchTerm, setFacultySearchTerm] = useState("");
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [receivedFcEvent, setReceivedFcEvent] = useState(null);

  const refreshSchedules = async () => {
    if (!currentSem) return;

    if (
      (selectedPOV === "Faculty" ||
        selectedPOV === "Class Section" ||
        selectedPOV === "Room") &&
      !selectedId
    ) {
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
    }

    setSchedules(res.data);
  };

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
      // ✅ Filter out deactivated faculty
      setFaculty(fac.data.filter((f) => f.isActive));
      setRooms(rm.data);
      setSections(sec.data);
    });
  }, []);

  useEffect(() => {
    if (!currentSem) return;
    setSections((prev) => prev.filter((s) => s.semesterId === currentSem.id));
  }, [currentSem]);

  useEffect(() => {
    refreshSchedules();
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

  const formatTime12Hour = (timeStr) => {
    const [hour, minute] = timeStr.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const calendarEvents = schedules.map((s) => ({
    id: String(s.id),
    title: `${s.subjectTitle} | ${s.courseCode} ${s.yearLevel}-${s.classSectionName} | Room: ${s.roomName}`,
    daysOfWeek: [dayToIndex[s.day]],
    startTime: s.startTime,
    endTime: s.endTime,
    startRecur: currentSem?.startDate,
    endRecur: currentSem?.endDate,
    backgroundColor: s.subjectColor,
    borderColor: s.subjectColor,
    extendedProps: s,
    description: `
      Subject: ${s.subjectTitle}
Course: ${s.courseCode}
Section: ${s.yearLevel}-${s.classSectionName}
Room: ${s.roomName}
Time: ${formatTime12Hour(s.startTime)} - ${formatTime12Hour(s.endTime)}`,
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

  const ordinalYear = (num) => {
    switch (num) {
      case 1:
        return "1";
      case 2:
        return "2";
      case 3:
        return "3";
      case 4:
        return "4";
      default:
        return `${num}th Year`;
    }
  };

  const handleEventDrop = async (info) => {
    const updated = {
      ...info.event.extendedProps,
      day: info.event.start.getDay(),
      startTime: info.event.start.toTimeString().slice(0, 5),
      endTime: info.event.end.toTimeString().slice(0, 5),
    };

    try {
      const res = await checkScheduleConflict(updated, info.event.id);
      if (res.data.hasConflict) {
        toast.error(`Conflict: ${res.data.conflictingResources.join(", ")}`);
        info.revert();
        return;
      }

      await updateSchedule(info.event.id, {
        id: info.event.id,
        subjectId: updated.subjectId,
        facultyId: updated.facultyId,
        classSectionId: updated.classSectionId,
        roomId: updated.roomId,
        day: updated.day,
        startTime: updated.startTime,
        endTime: updated.endTime,
        isActive: updated.isActive,
      });

      await refreshSchedules();
    } catch (err) {
      console.error("Drop error:", err);
      info.revert();
    }
  };

  const handleEventResize = async (info) => {
    const event = info.event;

    const updated = {
      ...event.extendedProps,
      day: event.start.getDay(),
      startTime: event.start.toTimeString().slice(0, 5),
      endTime: event.end.toTimeString().slice(0, 5),
    };

    try {
      const res = await checkScheduleConflict(updated, event.id);
      if (res.data.hasConflict) {
        toast.error(`Conflict: ${res.data.conflictingResources.join(", ")}`);
        info.revert();
        return;
      }

      await updateSchedule(event.id, {
        id: event.id,
        subjectId: updated.subjectId,
        facultyId: updated.facultyId,
        classSectionId: updated.classSectionId,
        roomId: updated.roomId,
        day: updated.day,
        startTime: updated.startTime,
        endTime: updated.endTime,
        isActive: updated.isActive,
      });

      await refreshSchedules();
    } catch (err) {
      console.error("Resize error:", err);
      info.revert();
    }
  };

  const handleSaveAdd = async () => {
    setShowAddModal(false);
    if (receivedFcEvent) {
      receivedFcEvent.remove();
      setReceivedFcEvent(null);
    }
    await refreshSchedules();
  };

  const handleCancelAdd = () => {
    if (receivedFcEvent) {
      receivedFcEvent.remove();
      setReceivedFcEvent(null);
    }
    setShowAddModal(false);
  };

  const handleDownloadPdf = async () => {
    if (selectedPOV === "All" || selectedId) {
      try {
        await downloadSchedulePdf(
          selectedPOV,
          selectedPOV === "All" ? null : selectedId,
          currentSem?.id
        );
        toast.success("Download started.");
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error("No schedules found for the selected semester.");
        } else {
          toast.error("Failed to download PDF.");
        }
      }
    } else {
      toast.error(`Please select a ${selectedPOV} to download its schedule.`);
    }
  };

  // ✅ Filter faculty based on search term
  const filteredFaculty = faculty.filter((f) =>
    f.fullName.toLowerCase().includes(facultySearchTerm.toLowerCase())
  );

  // ✅ Get selected faculty name for display
  const selectedFacultyName =
    faculty.find((f) => f.id === selectedId)?.fullName || "";

  // ✅ Handle faculty selection from dropdown
  const handleSelectFaculty = (facultyMember) => {
    setSelectedId(facultyMember.id);
    setFacultySearchTerm(facultyMember.fullName);
    setShowFacultyDropdown(false);
  };

  // ✅ Clear faculty selection
  const handleClearFaculty = () => {
    setSelectedId("");
    setFacultySearchTerm("");
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
              setFacultySearchTerm("");
            }}
          >
            <option>Faculty</option>
            <option>Class Section</option>
            <option>Room</option>
            <option>All</option>
          </select>
        </label>

        {/* ✅ NEW: Conditional rendering based on POV */}
        {selectedPOV !== "All" && (
          <>
            {selectedPOV === "Faculty" ? (
              // ✅ Faculty Search Panel
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">
                  Search Faculty:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type to search..."
                    className="input input-bordered w-full"
                    value={facultySearchTerm}
                    onChange={(e) => {
                      setFacultySearchTerm(e.target.value);
                      setShowFacultyDropdown(true);
                    }}
                    onFocus={() => setShowFacultyDropdown(true)}
                  />

                  {/* Clear button */}
                  {selectedId && (
                    <button
                      type="button"
                      onClick={handleClearFaculty}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}

                  {/* Dropdown list */}
                  {showFacultyDropdown && filteredFaculty.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredFaculty.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleSelectFaculty(f)}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition ${
                            selectedId === f.id ? "bg-blue-50 font-medium" : ""
                          }`}
                        >
                          <div className="text-sm">{f.fullName}</div>
                          {f.employeeID && (
                            <div className="text-xs text-gray-500">
                              ID: {f.employeeID}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No results message */}
                  {showFacultyDropdown &&
                    facultySearchTerm &&
                    filteredFaculty.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-3">
                        <p className="text-sm text-gray-500 text-center">
                          No active faculty found
                        </p>
                      </div>
                    )}
                </div>

                {/* Selected faculty display */}
                {selectedId && selectedFacultyName && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <span className="font-medium">Selected:</span>{" "}
                    {selectedFacultyName}
                  </div>
                )}
              </div>
            ) : (
              // ✅ Original dropdown for Class Section and Room
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
                      {selectedPOV === "Class Section"
                        ? `${it.collegeCourseCode || "N/A"} ${ordinalYear(
                            it.yearLevel
                          )} - ${it.section}`
                        : it.fullName || it.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}

        {selectedPOV === "Faculty" && (
          <div id="external-events" className="space-y-2">
            <h2 className="text-lg font-semibold mb-2">Drag to Calendar</h2>
            <ExternalEventsList
              selectedPOV={selectedPOV}
              selectedId={selectedId}
              currentSemester={currentSem}
              subjects={subjects}
              faculty={faculty}
              sections={sections}
              schedules={schedules}
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
          <div className="flex gap-2 items-center">
            {currentSem && (
              <select
                className="select select-bordered"
                value={currentSem.id}
                onChange={(e) => {
                  const sel = allSemesters.find(
                    (s) => s.id === +e.target.value
                  );
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
            <button
              className="btn btn-outline"
              onClick={handleDownloadPdf}
              disabled={selectedPOV !== "All" && !selectedId}
              title={
                selectedPOV !== "All" && !selectedId
                  ? `Select a ${selectedPOV} first`
                  : "Download Schedule as PDF"
              }
            >
              📄 Download PDF
            </button>
          </div>
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
          eventResize={handleEventResize}
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
          slotMaxTime="20:00:00"
          slotDuration="00:30:00"
          eventDisplay="block"
          height="calc(100vh - 200px)"
          allDaySlot={false}
          eventDidMount={(info) => {
            info.el.setAttribute("title", info.event.extendedProps.description);
          }}
        />
      </main>

      <aside className="w-80 bg-gray-50 overflow-y-auto">
        <WeeklyUnitTrackerSidebar
          schedules={schedules}
          currentSemester={currentSem}
        />
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
          onSuccess={async () => {
            setShowEditModal(false);
            await refreshSchedules();
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
