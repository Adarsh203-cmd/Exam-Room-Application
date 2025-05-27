import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateExamForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    exam_title: '',
    instruction: '',
    exam_start_time: '',
    exam_end_time: '',
    created_by: '',
    role_or_department: '',
    location: '',
    mcq_question_ids: [],
    fib_question_ids: [],
  });

  const [errors, setErrors] = useState({});
  const refs = {
    exam_title: useRef(),
    instruction: useRef(),
    exam_start_time: useRef(),
    exam_end_time: useRef(),
    created_by: useRef(),
    role_or_department: useRef(),
    location: useRef(),
  };

  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [counts, setCounts] = useState({});
  const [fetchedQuestions, setFetchedQuestions] = useState({});

  useEffect(() => {
    axios.get('/api/exam_allotment/subjects/')
      .then(res => setAllSubjects(res.data || []))
      .catch(err => console.error('Failed to fetch subjects:', err));
  }, []);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleSubject = subj => {
    setSelectedSubjects(prev =>
      prev.includes(subj)
        ? prev.filter(s => s !== subj)
        : [...prev, subj]
    );
  };

  const fetchQuestions = (subject, latestCounts) => {
    const { mcq = 0, fib = 0 } = latestCounts[subject] || {};
    if (mcq <= 0 && fib <= 0) return;

    axios.get('/api/exam_allotment/random-questions/', {
      params: { subject, mcq_count: mcq, fib_count: fib }
    })
      .then(res => {
        setFetchedQuestions(fq => ({ ...fq, [subject]: res.data }));
        setFormData(fd => ({
          ...fd,
          mcq_question_ids: Array.from(new Set([
            ...fd.mcq_question_ids,
            ...res.data.mcq.map(q => q.id)
          ])),
          fib_question_ids: Array.from(new Set([
            ...fd.fib_question_ids,
            ...res.data.fib.map(q => q.id)
          ]))
        }));
      })
      .catch(err => console.error(`Error fetching questions for ${subject}:`, err));
  };

  const handleCountChange = (subject, type, value) => {
    const num = parseInt(value, 10) || 0;
    setCounts(prev => {
      const updated = {
        ...prev,
        [subject]: { ...(prev[subject] || { mcq: 0, fib: 0 }), [type]: num }
      };
      fetchQuestions(subject, updated);
      return updated;
    });
  };

 const validateForm = () => {
  const newErrors = {};

  if (!formData.exam_title.trim()) newErrors.exam_title = 'Exam title is required';
  if (!formData.instruction.trim()) newErrors.instruction = 'Instruction is required';
  if (!formData.exam_start_time) newErrors.exam_start_time = 'Start time is required';
  if (!formData.exam_end_time) newErrors.exam_end_time = 'End time is required';
  if (formData.exam_start_time && formData.exam_end_time) {
    const start = new Date(formData.exam_start_time);
    const end = new Date(formData.exam_end_time);
    if (end <= start) {
      newErrors.exam_end_time = 'End time must be after start time';
    }
  }
  if (!formData.created_by) newErrors.created_by = 'Select a creator';
  if (!formData.role_or_department.trim()) newErrors.role_or_department = 'Role/Department is required';
  if (!formData.location.trim()) newErrors.location = 'Location is required';

  setErrors(newErrors);
  return newErrors;
};

const handleSubmit = async e => {
  e.preventDefault();
  const validationErrors = validateForm();
  const invalidField = Object.keys(validationErrors)[0];

  if (invalidField) {
    refs[invalidField].current?.focus();
    return;
  }

  try {
    const payload = {
      ...formData,
      created_by: parseInt(formData.created_by, 10),
    };
    const examRes = await axios.post('/api/exam_allotment/exams/', payload);
    const exam = examRes.data;
    navigate(`/select-candidates/${exam.exam_token}`);
  } catch (err) {
    console.error('Exam creation failed:', err.response?.data || err);
    alert('Failed to create exam—see console for details.');
  }
};

  const inputStyle = {
    width: '100%',
    marginBottom: '4px',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px'
  };

  const errorStyle = {
    color: 'red',
    fontSize: '0.85em',
    marginBottom: '10px'
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: 'auto' }}>
      <h2>Create Exam</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="exam_title"
          placeholder="Exam Title"
          ref={refs.exam_title}
          value={formData.exam_title}
          onChange={handleInputChange}
          style={inputStyle}
        />
        {errors.exam_title && <div style={errorStyle}>{errors.exam_title}</div>}

        <textarea
          name="instruction"
          placeholder="Instruction"
          ref={refs.instruction}
          value={formData.instruction}
          onChange={handleInputChange}
          style={{ ...inputStyle, height: 80 }}
        />
        {errors.instruction && <div style={errorStyle}>{errors.instruction}</div>}

        <label>Start Time:</label>
        <input
          type="datetime-local"
          name="exam_start_time"
          ref={refs.exam_start_time}
          value={formData.exam_start_time}
          onChange={handleInputChange}
          style={inputStyle}
        />
        {errors.exam_start_time && <div style={errorStyle}>{errors.exam_start_time}</div>}

        <label>End Time:</label>
        <input
          type="datetime-local"
          name="exam_end_time"
          ref={refs.exam_end_time}
          value={formData.exam_end_time}
          onChange={handleInputChange}
          style={inputStyle}
        />
        {errors.exam_end_time && <div style={errorStyle}>{errors.exam_end_time}</div>}

        <select
          name="created_by"
          ref={refs.created_by}
          value={formData.created_by}
          onChange={handleInputChange}
          style={inputStyle}
        >
          <option value="">-- Creator --</option>
          <option value="1">HR</option>
          <option value="2">Employee</option>
        </select>
        {errors.created_by && <div style={errorStyle}>{errors.created_by}</div>}

        <input
          name="role_or_department"
          placeholder="Role / Department"
          ref={refs.role_or_department}
          value={formData.role_or_department}
          onChange={handleInputChange}
          style={inputStyle}
        />
        {errors.role_or_department && <div style={errorStyle}>{errors.role_or_department}</div>}

        <input
          name="location"
          placeholder="Location"
          ref={refs.location}
          value={formData.location}
          onChange={handleInputChange}
          style={inputStyle}
        />
        {errors.location && <div style={errorStyle}>{errors.location}</div>}

        <div style={{ marginBottom: 20 }}><strong>Select Subjects:</strong>
          {allSubjects.map(subj => (
            <div key={subj} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ flex: 1 }}>
                <input type="checkbox"
                  checked={selectedSubjects.includes(subj)}
                  onChange={() => toggleSubject(subj)} /> {subj}
              </label>
              {selectedSubjects.includes(subj) && (
                <>
                  <input type="number" min="0" placeholder="MCQ#"
                    value={counts[subj]?.mcq || ''}
                    onChange={e => handleCountChange(subj, 'mcq', e.target.value)}
                    style={{ width: 60, marginRight: 4 }} />
                  <input type="number" min="0" placeholder="FIB#"
                    value={counts[subj]?.fib || ''}
                    onChange={e => handleCountChange(subj, 'fib', e.target.value)}
                    style={{ width: 60 }} />
                </>
              )}
            </div>
          ))}
        </div>

        {selectedSubjects.map(subj => (
          fetchedQuestions[subj] && (
            <div key={subj} style={{ background: '#f8f8f8', padding: 15, marginBottom: 20 }}>
              <h4>{subj} Preview</h4>
              <h5>MCQs:</h5>
              <ul>{fetchedQuestions[subj].mcq.map(q => <li key={q.id}>{q.question_text}</li>)}</ul>
              <h5>FIBs:</h5>
              <ul>{fetchedQuestions[subj].fib.map(q => <li key={q.id}>{q.question_text}</li>)}</ul>
            </div>
          )
        ))}

        <button type="submit" style={{ width: '100%', padding: 10 }}>Create Exam</button>
      </form>
    </div>
  );
};

export default CreateExamForm;
