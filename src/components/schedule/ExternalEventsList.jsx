// src/components/schedule/ExternalEventsList.jsx
import { useEffect, useState } from "react";
import { getAssignedSubjectsWithSections } from "../../services/facultyService";
import { FaSearch } from "react-icons/fa";

const ExternalEventsList = ({
  selectedPOV,
  selectedId,
  subjects = [],
  faculty = [],
}) => {
  const [assignments, setAssignments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch assignments when in Faculty view
  useEffect(() => {
    if (selectedPOV === "Faculty" && selectedId) {
      getAssignedSubjectsWithSections(selectedId)
        .then((res) => {
          setAssignments(res.data.subjects || []);
        })
        .catch((err) => {
          console.error("Failed to load assignments:", err);
          setAssignments([]);
        });
    } else {
      setAssignments([]);
    }
  }, [selectedPOV, selectedId]);

  // Filter by search term
  useEffect(() => {
    const term = search.trim().toLowerCase();
    setFiltered(
      assignments.filter(
        (a) =>
          a.subjectTitle.toLowerCase().includes(term) ||
          a.subjectCode.toLowerCase().includes(term) ||
          a.sectionLabel.toLowerCase().includes(term)
      )
    );
  }, [search, assignments]);

  const facultyName = faculty.find((f) => f.id === selectedId)?.fullName || "";

  return (
    <div className="p-3 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Assigned Subjects</h2>

      {/* Search */}
      <div className="relative mb-3">
        <FaSearch className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search subject or section…"
          className="input input-bordered pl-10 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div
        id="external-events"
        className="space-y-2 max-h-[400px] overflow-y-auto"
      >
        {selectedPOV !== "Faculty" ? (
          <p className="text-center text-gray-500 text-sm">
            Switch to Faculty view to see assigned subjects.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">
            No assignments found.
          </p>
        ) : (
          filtered.map((a) => {
            // lookup the real subject color
            const subj = subjects.find((s) => s.id === a.id);
            const color = subj?.color || "#9CA3AF";

            return (
              <div
                key={`${a.id}-${a.classSectionId}`}
                className="fc-event p-2 rounded text-white cursor-move"
                data-subject-id={a.id}
                data-faculty-id={selectedId}
                data-section-id={a.classSectionId}
                data-title={`${a.subjectCode} • ${a.subjectTitle} [${a.sectionLabel}]`}
                data-color={color}
                style={{ backgroundColor: color }}
              >
                <div className="font-medium text-sm">
                  {a.subjectCode} • {a.subjectTitle}
                </div>
                <div className="text-xs opacity-80">
                  [{a.sectionLabel}] — {facultyName}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExternalEventsList;
