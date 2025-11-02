// src/components/dashboardHome/UnassignedSubjects.jsx
import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import { FaExclamationTriangle } from "react-icons/fa";

const UnassignedSubjects = ({ currentSemester }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({}); // Track which sections are expanded

  useEffect(() => {
    if (!currentSemester) return;

    const fetchUnassigned = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentSemester.id) {
          params.append("semesterId", currentSemester.id);
        }
        if (currentSemester.schoolYearLabel) {
          params.append("schoolYear", currentSemester.schoolYearLabel);
        }

        const response = await axios.get(
          `/dashboard/unassigned-subjects?${params.toString()}`
        );
        setData(response.data);
      } catch (err) {
        console.error("Failed to load unassigned subjects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnassigned();
  }, [currentSemester]);

  const toggleSection = (sectionId) => {
    setExpanded((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border p-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <FaExclamationTriangle className="text-warning" />
          Unassigned Subjects
        </h3>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!data || data.totalUnassignedAcrossAllSections === 0) {
    return (
      <div className="bg-white rounded-lg shadow border p-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-success">
          ✓ All Subjects Assigned
        </h3>
        <p className="text-gray-600 text-sm">
          All subjects have been assigned to faculty for this semester.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaExclamationTriangle className="text-warning" />
          Unassigned Subjects
        </h3>
        <span className="badge badge-warning badge-lg">
          {data.totalUnassignedAcrossAllSections} Total
        </span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {data.sections.map((section) => (
          <div
            key={section.classSectionId}
            className="border rounded-lg overflow-hidden"
          >
            {/* Section Header - Clickable */}
            <div
              className="bg-gray-50 p-3 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => toggleSection(section.classSectionId)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-sm">
                    {section.collegeCourseCode} {section.yearLevel} -{" "}
                    {section.sectionLabel}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {section.semesterName} ({section.schoolYearLabel})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-warning">
                    {section.totalUnassigned} unassigned
                  </span>
                  <span className="text-gray-400">
                    {expanded[section.classSectionId] ? "▼" : "▶"}
                  </span>
                </div>
              </div>
            </div>

            {/* Expandable Subject List */}
            {expanded[section.classSectionId] && (
              <div className="p-3 bg-white">
                <table className="table table-xs w-full">
                  <thead>
                    <tr className="text-xs">
                      <th>Code</th>
                      <th>Title</th>
                      <th>Units</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.subjects.map((subject) => (
                      <tr key={subject.subjectId} className="text-xs">
                        <td className="font-mono">{subject.subjectCode}</td>
                        <td>{subject.subjectTitle}</td>
                        <td>{subject.units}</td>
                        <td>
                          <span className="badge badge-sm badge-ghost">
                            {subject.subjectType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {data.sections.length === 0 && (
        <p className="text-center text-gray-500 text-sm py-4">
          No unassigned subjects for the selected filters.
        </p>
      )}
    </div>
  );
};

export default UnassignedSubjects;