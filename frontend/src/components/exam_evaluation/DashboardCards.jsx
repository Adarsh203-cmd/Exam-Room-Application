import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const DashboardCards = ({ successRateData, totalExams, upcomingExams, handlePopup }) => {
  const COLORS = ['#38A169', '#E53E3E'];

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
    </div>
  );
};

export default DashboardCards;