// src/components/exam_content/QuestionDashboard.jsx
import React, { useState } from 'react';
import FillBlankForm from './FillBlankForm';
import MCQForm from './MCQForm';

const QuestionDashboard = () => {
  const [selectedType, setSelectedType] = useState('MCQ');

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Upload New Question</h2>

      <div className="mb-6">
        <label className="font-medium text-gray-700 mr-4">Select Question Type:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border px-4 py-2 rounded-md"
        >
          <option value="MCQ">MCQ</option>
          <option value="FILL">Fill in the Blank</option>
        </select>
      </div>

      {selectedType === 'MCQ' ? <MCQForm /> : <FillBlankForm />}
    </div>
  );
};

export default QuestionDashboard;
