import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const DashboardCards = ({ successRateData, totalExams, upcomingExams, hiringTestData,handlePopup }) => {
  const COLORS = ['#38A169', '#E53E3E'];

  // Calculate hiring test stats
  const totalCandidates = hiringTestData?.length || 0;
  const avgScore = totalCandidates > 0 
    ? Math.round((hiringTestData.reduce((sum, test) => sum + test.total_score, 0) / totalCandidates) * 100) / 100
    : 0;

  return (
    <div className="card-grid">
      <div className="card" onClick={() => handlePopup('success')}>
        <h2>Success Rate</h2>
        <div className="pie-chart-container">
          <PieChart width={200} height={200}>
            <Pie
              data={successRateData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
              label
            >
              {successRateData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      <div className="card" onClick={() => handlePopup('examStats')}>
        <div className="stat">
          <p className="stat-label">Total Exams</p>
          <p className="stat-number">{totalExams}</p>
        </div>
        <p className="card-subtext">Click for breakdown</p>
      </div>

      <div className="card" onClick={() => handlePopup('upcoming')}>
        <div className="stat">
          <p className="stat-label">Upcoming Exams</p>
          <p className="stat-number">{upcomingExams}</p>
        </div>
        <p className="card-subtext">Click for details</p>
      </div>

      {/* Hiring Test Card */}
      <div className="card" onClick={() => handlePopup("hiringTest")}>
        <h2>Hiring Test 2024-25</h2>
        <p className="card-number">{totalCandidates}</p>
        <p>Total Candidates</p>
        <p style={{ fontSize: "14px", marginTop: "5px" }}>
          Avg Score: {avgScore}
        </p>
      </div>
    </div>
  );
};

export default DashboardCards;