import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/exam_allotment_module_css/CreateExamForm.css';

function toDateTimeLocalString(date) {
  const pad = n => String(n).padStart(2, '0');
  return (
    date.getFullYear() + '-' +
    pad(date.getMonth() + 1) + '-' +
    pad(date.getDate()) + 'T' +
    pad(date.getHours()) + ':' +
    pad(date.getMinutes())
  );
}

const CreateExamForm = () => {
  const navigate = useNavigate();
  const now = new Date();
  const nowLocal = toDateTimeLocalString(now);

  const [formData, setFormData] = useState({
    exam_title: '',
    instruction: '',
    exam_start_time: '',
    exam_end_time: '',
    created_by: '',
    role_or_department: '',
    mcq_question_ids: [],
    fib_question_ids: [],
    location: '',
    candidate_type: 1
  });
  const [errors, setErrors] = useState({});
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [counts, setCounts] = useState({});
  const [fetchedQuestions, setFetchedQuestions] = useState({});

  useEffect(() => {
    axios.get('/api/exam_allotment/subjects/')
      .then(res => setAllSubjects(res.data || []))
      .catch(console.error);
  }, []);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
    setErrors(err => ({ ...err, [name]: null }));
  };

  const validate = () => {
    const err = {};
    ['exam_title', 'instruction', 'role_or_department', 'location'].forEach(k => {
      const v = formData[k].trim();
      if (!v) err[k] = 'Required';
      else if (!/[A-Za-z]/.test(v)) err[k] = 'Must contain a letter';
    });
    if (!formData.exam_start_time) err.exam_start_time = 'Required';
    else if (new Date(formData.exam_start_time) < now) err.exam_start_time = 'Cannot be past';
    if (!formData.exam_end_time) err.exam_end_time = 'Required';
    else {
      const end = new Date(formData.exam_end_time),
            start = new Date(formData.exam_start_time);
      if (end < now) err.exam_end_time = 'Cannot be past';
      else if (formData.exam_start_time && end <= start) err.exam_end_time = 'Must be after start';
    }
    setErrors(err);
    return !Object.keys(err).length;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload = { ...formData, created_by: parseInt(formData.created_by, 10) };
      const { data: exam } = await axios.post('/api/exam_allotment/exams/', payload);
      navigate(`/select-candidates/${exam.exam_token}`);
    } catch (e) {
      console.error(e);
      alert('Create failed');
    }
  };

  const toggleSubject = subj =>
    setSelectedSubjects(s => s.includes(subj) ? s.filter(x => x !== subj) : [...s, subj]);

  const fetchQuestions = (subj, latestCounts) => {
    const { mcq = 0, fib = 0 } = latestCounts[subj] || {};
    if (mcq <= 0 && fib <= 0) return;
    axios.get('/api/exam_allotment/random-questions/', {
      params: { subject: subj, mcq_count: mcq, fib_count: fib }
    }).then(res => {
      setFetchedQuestions(fq => ({ ...fq, [subj]: res.data }));
      setFormData(fd => ({
        ...fd,
        mcq_question_ids: Array.from(new Set([...fd.mcq_question_ids, ...res.data.mcq.map(q => q.id)])),
        fib_question_ids: Array.from(new Set([...fd.fib_question_ids, ...res.data.fib.map(q => q.id)]))
      }));
    }).catch(console.error);
  };

  const handleCountChange = (subj, type, val) => {
    const num = parseInt(val, 10) || 0;
    setCounts(c => {
      const upd = { ...c, [subj]: { ...(c[subj] || { mcq: 0, fib: 0 }), [type]: num } };
      fetchQuestions(subj, upd);
      return upd;
    });
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: 'auto' }}>
      <h2>Create Exam</h2>
      <form onSubmit={handleSubmit} noValidate>

        {/* Exam Title */}
        <div className="floating-label">
          <input
            name="exam_title"
            placeholder=" "
            value={formData.exam_title}
            onChange={handleInputChange}
            required
          />
          <label>Full Exam Name (as it will appear in the invitation mail)</label>
        </div>
        {errors.exam_title && <div className="error">{errors.exam_title}</div>}

        {/* Instruction */}
        <div className="floating-label">
          <textarea
            name="instruction"
            placeholder=" "
            value={formData.instruction}
            onChange={handleInputChange}
            required
            style={{ height: 80 }}
          />
          <label>Instruction</label>
        </div>
        {errors.instruction && <div className="error">{errors.instruction}</div>}

        {/* Candidate Type */}
        <div className="radio-group" style={{ marginBottom: 10 }}>
          <strong>Candidate Type:</strong>
          <label>
            <input
              type="radio"
              name="candidate_type"
              value={1}
              checked={formData.candidate_type === 1}
              onChange={() => setFormData(fd => ({ ...fd, candidate_type: 1 }))}
            />
            Internal
          </label>
          <label>
            <input
              type="radio"
              name="candidate_type"
              value={2}
              checked={formData.candidate_type === 2}
              onChange={() => setFormData(fd => ({ ...fd, candidate_type: 2 }))}
            />
            External
          </label>
        </div>


        {/* Start Time */}
        <div className="floating-label small-input">
          <input
            type="datetime-local"
            name="exam_start_time"
            placeholder=" "
            min={nowLocal}
            value={formData.exam_start_time}
            onChange={handleInputChange}
            required
          />
          <label>Start Time</label>
        </div>
        {errors.exam_start_time && <div className="error">{errors.exam_start_time}</div>}

        {/* End Time */}
        <div className="floating-label small-input">
          <input
            type="datetime-local"
            name="exam_end_time"
            placeholder=" "
            min={formData.exam_start_time || nowLocal}
            value={formData.exam_end_time}
            onChange={handleInputChange}
            required
          />
          <label>End Time</label>
        </div>
        {errors.exam_end_time && <div className="error">{errors.exam_end_time}</div>}

        {/* Creator */}
        <div className="floating-label small-input">
          <select
            name="created_by"
            value={formData.created_by}
            onChange={handleInputChange}
            required
          >
            <option value=""> </option>
            <option value="1">HR</option>
            <option value="2">Employee</option>
          </select>
          <label>Creator</label>
        </div>

        {/* Role / Department */}
        <div className="floating-label">
          <input
            name="role_or_department"
            placeholder=" "
            value={formData.role_or_department}
            onChange={handleInputChange}
            required
          />
          <label>Role / Department</label>
        </div>
        {errors.role_or_department && <div className="error">{errors.role_or_department}</div>}

        {/* Location */}
        <div className="floating-label">
          <input
            name="location"
            placeholder=" "
            value={formData.location}
            onChange={handleInputChange}
            required
          />
          <label>Exam Location</label>
        </div>
        {errors.location && <div className="error">{errors.location}</div>}

        {/* Subjects & Counts */}
        <div className="subject-selection" style={{ marginBottom: 20 }}>
          <strong>Select Subjects & Counts:</strong>
          {allSubjects.map(subj => (
            <div key={subj} className="subject-row ">
              <label className="subject-label">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subj)}
                  onChange={() => toggleSubject(subj)}
                />
                {subj}
              </label>
              {selectedSubjects.includes(subj) && (
                <div className="subject-inputs ">
                  <input
                    type="number"
                    min="0"
                    placeholder="No. of MCQ"
                    value={counts[subj]?.mcq || ''}
                    onChange={e => handleCountChange(subj, 'mcq', e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="No. of FIB"
                    value={counts[subj]?.fib || ''}
                    onChange={e => handleCountChange(subj, 'fib', e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Question Preview */}
        {selectedSubjects.map(subj => (
          fetchedQuestions[subj] && (
            <div key={subj} style={{ marginBottom: 20, padding: 10, background: '#f0f0f0' }}>
              <h4>{subj} Questions</h4>
              <div>
                <h5>MCQs:</h5>
                <ul>
                  {fetchedQuestions[subj].mcq.map(q => (
                    <li key={q.id}>{q.question_text}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5>FIBs:</h5>
                <ul>
                  {fetchedQuestions[subj].fib.map(q => (
                    <li key={q.id}>{q.question_text}</li>
                  ))}
                </ul>
              </div>
            </div>
          )
        ))}

        <button type="submit" style={{ width: '25%', padding: 10 }}>Create Exam</button>
      </form>
    </div>
  );
};

export default CreateExamForm;
