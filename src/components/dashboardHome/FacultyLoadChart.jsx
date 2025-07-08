import { useEffect, useState } from "react";
import {
  getFacultyUsers,
  getAssignedSubjectsWithSections,
} from "../../services/facultyService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const FacultyLoadChart = ({ currentSemester }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const semesterId = currentSemester?.id ?? null;
  const schoolYearLabel = currentSemester?.schoolYearLabel ?? "";

  useEffect(() => {
    if (!semesterId || !schoolYearLabel) return;

    const fetchFacultyLoads = async () => {
      setLoading(true);
      try {
        const { data: facultyList } = await getFacultyUsers();

        const facultyWithLoads = await Promise.all(
          facultyList.map(async (faculty) => {
            try {
              const { data } = await getAssignedSubjectsWithSections(
                faculty.id,
                semesterId,
                schoolYearLabel
              );

              const totalUnits = data.subjects
                .filter(
                  (a) =>
                    a.semesterId === semesterId &&
                    a.schoolYearLabel === schoolYearLabel
                )
                .reduce((sum, subj) => sum + subj.units, 0);

              return {
                name: faculty.fullName,
                units: totalUnits,
              };
            } catch {
              return {
                name: faculty.fullName,
                units: 0,
              };
            }
          })
        );

        setChartData(facultyWithLoads);
      } catch (err) {
        console.error("Error fetching faculty loads", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyLoads();
  }, [semesterId, schoolYearLabel]);

  return (
    <div className="bg-white rounded-lg shadow border p-4">
      <h3 className="text-lg font-semibold mb-2">Faculty Load (Units)</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-25}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="units" fill="#3b82f6" name="Total Units" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default FacultyLoadChart;
