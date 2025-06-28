// src/pages/dashboard/SchedulePage.jsx

import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";

import { getAllSchedules } from "../../services/scheduleService";
import { getSubjects } from "../../services/subjectService";
import { getRooms } from "../../services/roomService";
import { getFacultyUsers } from "../../services/facultyService";
import { getClassSections } from "../../services/classSectionService";

import AddScheduleModal from "../../components/schedules/AddScheduleModal";
import EditScheduleModal from "../../components/schedules/EditScheduleModal";
import WeeklyUnitTrackerSidebar from "../../components/schedules/WeeklyUnitTrackerSidebar";

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [viewMode, setViewMode] = useState("ClassSection");
  const [filterId, setFilterId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedRes, subjRes, roomRes, facultyRes, sectionRes] =
        await Promise.all([
          getAllSchedules(),
          getSubjects(),
          getRooms(),
          getFacultyUsers(),
          getClassSections(),
        ]);

      setSchedules(schedRes);
      setSubjects(subjRes);
      setRooms(roomRes);
      setFaculty(facultyRes);
      setSections(sectionRes);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load scheduling data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDateClick = (arg) => {
    if (loading) return;
    const dayIndex = arg.date.getDay();
    const time = arg.date.toTimeString().slice(0, 5);
    setSelectedSlot({ day: dayIndex, startTime: time });
    setShowAddModal(true);
  };

  const handleEventClick = (clickInfo) => {
    const schedule = schedules.find(
      (s) => s.id === parseInt(clickInfo.event.id)
    );
    setSelectedSchedule(schedule);
    setShowEditModal(true);
  };

  const getTitle = (s) => {
    switch (viewMode) {
      case "Faculty":
        return s.facultyName;
      case "Room":
        return s.roomName;
      case "ClassSection":
        return s.classSectionName;
      default:
        return s.subjectTitle;
    }
  };

  const getEvents = () => {
    let filtered = schedules;
    if (filterId) {
      switch (viewMode) {
        case "Faculty":
          filtered = schedules.filter((s) => s.facultyId === filterId);
          break;
        case "Room":
          filtered = schedules.filter((s) => s.roomId === parseInt(filterId));
          break;
        case "ClassSection":
          filtered = schedules.filter(
            (s) => s.classSectionId === parseInt(filterId)
          );
          break;
        default:
          break;
      }
    }
    return filtered.map((s) => ({
      id: s.id,
      title: getTitle(s),
      start: `2023-01-0${s.day + 1}T${s.startTime}`,
      end: `2023-01-0${s.day + 1}T${s.endTime}`,
      backgroundColor: s.subjectColor,
      borderColor: "#ccc",
      className: s.isActive ? "" : "line-through opacity-60",
      extendedProps: { ...s },
    }));
  };

  const renderFilterDropdown = () => {
    switch (viewMode) {
      case "Faculty":
        return (
          <select
            className="select select-bordered select-sm"
            value={filterId}
            onChange={(e) => setFilterId(e.target.value)}
          >
            <option value="">All Faculty</option>
            {faculty.map((f) => (
              <option key={f.id} value={f.id}>
                {f.fullName}
              </option>
            ))}
          </select>
        );
      case "Room":
        return (
          <select
            className="select select-bordered select-sm"
            value={filterId}
            onChange={(e) => setFilterId(e.target.value)}
          >
            <option value="">All Rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        );
      case "ClassSection":
        return (
          <select
            className="select select-bordered select-sm"
            value={filterId}
            onChange={(e) => setFilterId(e.target.value)}
          >
            <option value="">All Sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.section}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading schedules...</div>;
  }

  return (
    <div className="flex gap-6">
      {/* Calendar */}
      <div className="flex-1 bg-white rounded shadow px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Schedule Calendar
          </h2>

          <div className="flex gap-2 items-center">
            <select
              className="select select-bordered select-sm"
              value={viewMode}
              onChange={(e) => {
                setViewMode(e.target.value);
                setFilterId("");
              }}
            >
              <option value="ClassSection">Class Section View</option>
              <option value="Faculty">Faculty View</option>
              <option value="Room">Room View</option>
            </select>

            {renderFilterDropdown()}

            <button
              onClick={() => {
                if (!loading) {
                  setSelectedSlot(null);
                  setShowAddModal(true);
                }
              }}
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              + Add Schedule
            </button>
          </div>
        </div>

        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          slotMinTime="07:00:00"
          slotMaxTime="19:00:00"
          allDaySlot={false}
          editable={false}
          selectable={true}
          weekends={true}
          events={getEvents()}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          nowIndicator={true}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
        />
      </div>

      {/* Sidebar */}
      <div className="w-72 shrink-0">
        <WeeklyUnitTrackerSidebar schedules={schedules} subjects={subjects} />
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddScheduleModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchData}
          subjects={subjects}
          rooms={rooms}
          faculty={faculty}
          classSection={sections}
          selectedSlot={selectedSlot}
        />
      )}

      {showEditModal && selectedSchedule && (
        <EditScheduleModal
          isOpen={showEditModal}
          onClose={() => {
            setSelectedSchedule(null);
            setShowEditModal(false);
          }}
          schedule={selectedSchedule}
          onSuccess={fetchData}
          subjects={subjects}
          rooms={rooms}
          faculty={faculty}
          classSection={sections}
        />
      )}
    </div>
  );
};

export default SchedulePage;
