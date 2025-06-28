import React from "react";

const ScheduleFilters = ({
  viewType,
  setViewType,
  selectedId,
  setSelectedId,
  faculty,
  rooms,
  sections,
}) => {
  const handleViewChange = (e) => {
    setViewType(e.target.value);
    setSelectedId(null);
  };

  const handleIdChange = (e) => {
    setSelectedId(e.target.value);
  };

  const getOptions = () => {
    if (viewType === "Faculty") {
      return faculty.map((f) => (
        <option key={f.id} value={f.id}>
          {f.firstName} {f.middleName} {f.lastName}
        </option>
      ));
    } else if (viewType === "Room") {
      return rooms.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ));
    } else {
      return sections.map((s) => (
        <option key={s.id} value={s.id}>
          {s.section} ({s.collegeCourseCode})
        </option>
      ));
    }
  };

  return (
    <div className="flex items-center gap-4 mb-4">
      <select
        className="select select-bordered"
        value={viewType}
        onChange={handleViewChange}
      >
        <option value="ClassSection">Class Section</option>
        <option value="Faculty">Faculty</option>
        <option value="Room">Room</option>
      </select>

      <select
        className="select select-bordered"
        value={selectedId || ""}
        onChange={handleIdChange}
      >
        <option value="" disabled>
          {viewType === "Faculty"
            ? "Select Faculty"
            : viewType === "Room"
            ? "Select Room"
            : "Select Section"}
        </option>
        {getOptions()}
      </select>
    </div>
  );
};

export default ScheduleFilters;
