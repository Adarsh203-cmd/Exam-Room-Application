import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from '../../utils/axiosInstance';

const QuestionManager = ({ questionType }) => {
  const [questions, setQuestions] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const history = useHistory();

  // Fetch questions from backend API
  const fetchQuestions = async () => {
    try {
      const endpoint =
        questionType === 'MCQ'
          ? '/mcq/list/'
          : questionType === 'Fill-in-the-Blank'
          ? '/fill/list/'
          : '';
      const response = await axios.get(endpoint, {
        params: {
          subject: subjectFilter,
          difficulty: difficultyFilter,
        },
      });
      setQuestions(response.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching questions');
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [subjectFilter, difficultyFilter, questionType]);

  const handleDelete = async (id) => {
    try {
      const endpoint =
        questionType === 'MCQ'
          ? `/mcq/${id}/`
          : questionType === 'Fill-in-the-Blank'
          ? `/fill/${id}/`
          : '';
      await axios.delete(endpoint);
      alert('Question deleted successfully!');
      fetchQuestions(); // Refresh question list
    } catch (err) {
      console.error(err);
      alert('Error deleting question');
    }
  };

  const handleEdit = (id) => {
    history.push(`/edit/${questionType.toLowerCase()}/${id}`);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{questionType} Questions</h2>
      <div className="space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search by Subject"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Difficulty Levels</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Subject</th>
            <th className="border p-2">Question</th>
            <th className="border p-2">Difficulty</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.length > 0 ? (
            questions.map((question) => (
              <tr key={question.id}>
                <td className="border p-2">{question.subject}</td>
                <td className="border p-2">{question.question_text}</td>
                <td className="border p-2">{question.difficulty}</td>
                <td className="border p-2 flex space-x-2">
                  <button
                    onClick={() => handleEdit(question.id)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4">No questions found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionManager;
