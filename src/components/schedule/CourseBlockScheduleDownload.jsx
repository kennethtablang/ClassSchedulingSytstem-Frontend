// Frontend: src/components/schedule/CourseBlockScheduleDownload.jsx - NEW COMPONENT

import { useState, useEffect } from "react";
import { downloadCourseBlockSchedulePdf } from "../../services/exportService";
import { getCollegeCourses } from "../../services/collegeCourseService";
import { getClassSections } from "../../services/classSectionService";
import {
  getCurrentSemesters,
  getSemesters,
} from "../../services/semesterService";
import { toast } from "sonner";
import { FaDownload, FaSpinner } from "react-icons/fa";

const CourseBlockScheduleDownload = () => {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [allSemesters, setAllSemesters] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [downloading, setDownloading] = useState(false);

  const [filteredSections, setFilteredSections] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCourse && selectedYear && currentSemester) {
      filterSections();
    } else {
      setFilteredSections([]);
    }
  }, [selectedCourse, selectedYear, currentSemester, sections]);

  const loadInitialData = async () => {
    try {
      const [coursesRes, sectionsRes, currentSemRes, allSemRes] =
        await Promise.all([
          getCollegeCourses(),
          getClassSections(),
          getCurrentSemesters(),
          getSemesters(),
        ]);

      setCourses(coursesRes.data);
      setSections(sectionsRes.data);
      setCurrentSemester(currentSemRes.data[0] || null);
      setAllSemesters(allSemRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
      toast.error("Failed to load necessary data");
    }
  };

  const filterSections = () => {
    const filtered = sections.filter(
      (s) =>
        s.collegeCourseId === parseInt(selectedCourse) &&
        s.yearLevel === parseInt(selectedYear) &&
        s.semesterId === currentSemester?.id
    );
    setFilteredSections(filtered);
  };

  const handleDownload = async () => {
    if (!selectedCourse || !selectedYear || !currentSemester) {
      toast.error("Please select course, year level, and semester");
      return;
    }

    setDownloading(true);
    try {
      await downloadCourseBlockSchedulePdf(
        parseInt(selectedCourse),
        parseInt(selectedYear),
        currentSemester.id,
        selectedSection || null
      );
      toast.success("PDF download started successfully!");
    } catch (err) {
      console.error("Download error:", err);
      if (err.response?.status === 404) {
        toast.error("No schedules found for the selected criteria");
      } else {
        toast.error("Failed to download PDF. Please try again.");
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">
          Download Course Block Schedule
        </h3>

        <div className="space-y-4">
          {/* Semester Selector */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Semester</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={currentSemester?.id || ""}
              onChange={(e) => {
                const selected = allSemesters.find(
                  (s) => s.id === parseInt(e.target.value)
                );
                setCurrentSemester(selected);
                setSelectedSection(""); // Reset section when semester changes
              }}
              disabled={allSemesters.length === 0}
            >
              {allSemesters.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.name} ({sem.schoolYearLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Course Selector */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">College Course</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedSection(""); // Reset section when course changes
              }}
            >
              <option value="">-- Select Course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Level Selector */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Year Level</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedSection(""); // Reset section when year changes
              }}
            >
              <option value="">-- Select Year --</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          {/* Block/Section Selector (Optional) */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Block/Section (Optional)
              </span>
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={filteredSections.length === 0}
            >
              <option value="">All Blocks</option>
              {filteredSections.map((section) => (
                <option key={section.id} value={section.section}>
                  Block {section.section}
                </option>
              ))}
            </select>
            {selectedCourse &&
              selectedYear &&
              filteredSections.length === 0 && (
                <label className="label">
                  <span className="label-text-alt text-warning">
                    No sections found for selected course and year
                  </span>
                </label>
              )}
          </div>

          {/* Download Button */}
          <button
            className="btn btn-primary w-full"
            onClick={handleDownload}
            disabled={
              !selectedCourse ||
              !selectedYear ||
              !currentSemester ||
              downloading
            }
          >
            {downloading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Generating PDF...
              </>
            ) : (
              <>
                <FaDownload className="mr-2" />
                Download Schedule PDF
              </>
            )}
          </button>
        </div>

        {/* Info Alert */}
        {selectedCourse && selectedYear && currentSemester && (
          <div className="alert alert-info mt-4">
            <div className="text-sm">
              <strong>Selected:</strong>{" "}
              {courses.find((c) => c.id === parseInt(selectedCourse))?.code} -{" "}
              Year {selectedYear}
              {selectedSection && ` - Block ${selectedSection}`}
              <br />
              <strong>Semester:</strong> {currentSemester.name} (
              {currentSemester.schoolYearLabel})
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseBlockScheduleDownload;
