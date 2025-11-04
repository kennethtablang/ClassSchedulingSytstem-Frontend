// src/pages/dashboard/ReportsPage.jsx
import { useEffect, useState } from "react";
import {
  downloadAllFacultyLoadReport,
  downloadFacultyLoadReport,
  getFacultyLoadSummary,
} from "../../services/reportsService";
import {
  getCurrentSemesters,
  getSemesters,
} from "../../services/semesterService";
import { toast } from "sonner";
import { FaDownload, FaFileAlt, FaSpinner } from "react-icons/fa";

const ReportsPage = () => {
  const [currentSemester, setCurrentSemester] = useState(null);
  const [allSemesters, setAllSemesters] = useState([]);
  const [facultyLoadData, setFacultyLoadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadSemesters();
  }, []);

  useEffect(() => {
    if (currentSemester) {
      loadFacultyLoadData();
    }
  }, [currentSemester]);

  const loadSemesters = async () => {
    try {
      const [currentRes, allRes] = await Promise.all([
        getCurrentSemesters(),
        getSemesters(),
      ]);

      const current = currentRes.data[0] || null;
      setCurrentSemester(current);
      setAllSemesters(allRes.data);
    } catch (err) {
      console.error("Failed to load semesters:", err);
      toast.error("Failed to load semester information.");
    }
  };

  const loadFacultyLoadData = async () => {
    try {
      setLoading(true);
      const data = await getFacultyLoadSummary(currentSemester.id);
      setFacultyLoadData(data);
    } catch (err) {
      console.error("Failed to load faculty load data:", err);
      toast.error("Failed to load faculty academic load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!currentSemester) {
      toast.error("Please select a semester first.");
      return;
    }

    setDownloadingAll(true);
    try {
      await downloadAllFacultyLoadReport(currentSemester.id);
      toast.success("All faculty load reports downloaded successfully!");
    } catch (err) {
      console.error("Download error:", err);
      if (err.response?.status === 404) {
        toast.error("No faculty load data found for the selected semester.");
      } else {
        toast.error("Failed to download reports. Please try again.");
      }
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleDownloadSingle = async (facultyId, facultyName) => {
    if (!currentSemester) {
      toast.error("Please select a semester first.");
      return;
    }

    setDownloadingId(facultyId);
    try {
      await downloadFacultyLoadReport(facultyId, currentSemester.id);
      toast.success(`Academic load report for ${facultyName} downloaded!`);
    } catch (err) {
      console.error("Download error:", err);
      if (err.response?.status === 404) {
        toast.error(
          `No load data found for ${facultyName} in the selected semester.`
        );
      } else {
        toast.error("Failed to download report. Please try again.");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = facultyLoadData.filter(
    (f) =>
      f.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.employeeID || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <FaFileAlt className="text-primary" />
              Faculty Academic Load Reports
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Generate and download academic load reports for faculty members
            </p>
          </div>

          <div className="flex gap-2 items-center">
            {/* Semester Selector */}
            {currentSemester && (
              <select
                className="select select-bordered"
                value={currentSemester.id}
                onChange={(e) => {
                  const selected = allSemesters.find(
                    (s) => s.id === parseInt(e.target.value)
                  );
                  setCurrentSemester(selected);
                  setCurrentPage(1);
                }}
              >
                {allSemesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name} ({sem.schoolYearLabel})
                  </option>
                ))}
              </select>
            )}

            {/* Download All Button */}
            <button
              className="btn btn-primary"
              onClick={handleDownloadAll}
              disabled={downloadingAll || loading || filtered.length === 0}
            >
              {downloadingAll ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FaDownload className="mr-2" />
                  Download All Reports
                </>
              )}
            </button>
          </div>
        </div>

        {currentSemester && (
          <div className="alert alert-info">
            <div>
              <strong>Selected Semester:</strong> {currentSemester.name} (
              {currentSemester.schoolYearLabel})
              <br />
              <span className="text-sm">
                {filtered.length} faculty member(s) with assigned loads
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by faculty name or employee ID..."
        className="input input-bordered mb-4 w-full md:w-1/3"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* Faculty Load Table */}
      {loading ? (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-2" />
          <p>Loading faculty load data...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-warning">
          <div>
            <strong>No Data Available</strong>
            <p>
              {searchTerm
                ? "No faculty members match your search criteria."
                : "No faculty members have assigned loads for the selected semester."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-100 text-sm text-gray-700">
                  <th>Faculty Name</th>
                  <th>Employee ID</th>
                  <th className="text-center">Total Units</th>
                  <th className="text-center">Total Subjects</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((faculty) => (
                  <tr
                    key={faculty.facultyId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="font-medium">{faculty.facultyName}</td>
                    <td>{faculty.employeeID || "—"}</td>
                    <td className="text-center">
                      <span className="badge badge-primary">
                        {faculty.totalUnits}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge badge-secondary">
                        {faculty.totalSubjects}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() =>
                          handleDownloadSingle(
                            faculty.facultyId,
                            faculty.facultyName
                          )
                        }
                        disabled={downloadingId === faculty.facultyId}
                      >
                        {downloadingId === faculty.facultyId ? (
                          <>
                            <FaSpinner className="animate-spin mr-1" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <FaDownload className="mr-1" />
                            Download
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                className="btn btn-sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`btn btn-sm ${
                      currentPage === page ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="btn btn-sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage;
