// src/pages/faculty/FacultySchedulePage.jsx
import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { downloadMyScheduleXlsx } from "../../services/exportService";
import { toast } from "sonner";

import {
  getMySchedule,
  downloadMySchedulePdf,
  getCurrentSemester,
} from "../../services/facultyScheduleService";

const dayToIndex = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const FacultySchedulePage = () => {
  const calendarRef = useRef(null);
  const [currentSem, setCurrentSem] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [selectedDayFilter, setSelectedDayFilter] = useState(""); // ✅ NEW: Day filter state

  const formatTime12Hour = (timeStr) => {
    const [hour, minute] = timeStr.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  // Add this handler
  const handleDownloadXlsx = async () => {
    try {
      await downloadMyScheduleXlsx(
        currentSem?.id,
        selectedDayFilter || undefined
      );
      toast.success("Excel download started.");
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("No schedule found for the selected criteria.");
      } else {
        toast.error("Failed to download Excel file.");
      }
    }
  };

  const calendarEvents = schedule.map((s) => ({
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
    description: `Subject: ${s.subjectTitle}
Course: ${s.courseCode}
Section: ${s.yearLevel}-${s.classSectionName}
Room: ${s.roomName}
Time: ${formatTime12Hour(s.startTime)} - ${formatTime12Hour(s.endTime)}`,
  }));

  // ✅ UPDATED: Pass day filter to download function
  const handleDownloadPdf = async () => {
    try {
      await downloadMySchedulePdf(
        currentSem?.id,
        selectedDayFilter || undefined
      );
      toast.success("Schedule download started.");
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("No schedule found for the selected criteria.");
      } else {
        toast.error("Failed to download PDF.");
      }
    }
  };

  // Load current semester on mount
  useEffect(() => {
    getCurrentSemester()
      .then((res) => setCurrentSem(res.data || null))
      .catch(() => toast.error("Failed to load current semester."));
  }, []);

  // Load schedule once current semester is loaded
  useEffect(() => {
    if (!currentSem) return;

    getMySchedule()
      .then((res) => {
        const filtered = res.data.filter(
          (s) =>
            s.semesterName === currentSem.name &&
            s.schoolYearLabel === currentSem.schoolYearLabel
        );
        setSchedule(filtered);
      })
      .catch(() => toast.error("Failed to load schedule."));
  }, [currentSem]);

  return (
    <div className="p-6">
      {/* 🔹 Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
        <div>
          <h1 className="text-2xl font-bold">My Teaching Schedule</h1>
          {currentSem && (
            <p className="text-sm text-gray-600 mt-1">
              Current Semester:{" "}
              <span className="font-medium text-base-content">
                {currentSem.name} ({currentSem.schoolYearLabel})
              </span>
            </p>
          )}
        </div>

        {/* ✅ NEW: Day Filter and Download Button Container */}
        <div className="flex gap-2 items-center">
          {/* Day Filter Dropdown */}
          <select
            className="select select-bordered"
            value={selectedDayFilter}
            onChange={(e) => setSelectedDayFilter(e.target.value)}
          >
            <option value="">All Days</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>

          {/* PDF Download Button */}
          <button
            className="btn btn-outline"
            onClick={handleDownloadPdf}
            disabled={!schedule.length}
            title={
              !schedule.length
                ? "No schedule available to download"
                : selectedDayFilter
                ? `Download ${selectedDayFilter} schedule as PDF`
                : "Download full schedule as PDF"
            }
          >
            📄 PDF
          </button>

          {/* 🆕 Excel Download Button */}
          <button
            className="btn btn-success btn-outline"
            onClick={handleDownloadXlsx}
            disabled={!schedule.length}
            title={
              !schedule.length
                ? "No schedule available to download"
                : selectedDayFilter
                ? `Download ${selectedDayFilter} schedule as Excel`
                : "Download full schedule as Excel"
            }
          >
            📊 Excel
          </button>
        </div>
      </div>

      {/* 📅 Calendar */}
      <div className="bg-white shadow rounded p-4">
        <FullCalendar
          plugins={[timeGridPlugin]}
          initialView="timeGridWeek"
          events={calendarEvents}
          ref={calendarRef}
          editable={false}
          allDaySlot={false}
          eventDisplay="block"
          height="calc(100vh - 220px)"
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
          eventDidMount={(info) => {
            info.el.setAttribute("title", info.event.extendedProps.description);
          }}
        />
      </div>
    </div>
  );
};

export default FacultySchedulePage;
