// frontend/src/components/exam_allotment_module/CreateExamForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateExamForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    exam_title: '',
    instruction: '',
    exam_start_time: '',
    exam_end_time: '',
    created_by: '',
    role_or_department: '',
    mcq_question_ids: [],
    fib_question_ids: [],
     location: ''
  });

  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [counts, setCounts] = useState({});       // { subject: { mcq:0, fib:0 } }
  const [fetchedQuestions, setFetchedQuestions] = useState({}); // { subject: { mcq:[], fib:[] } }

  // load subjects once
  useEffect(() => {
    axios.get('/api/exam_allotment/subjects/')
      .then(res => setAllSubjects(res.data || []))
      .catch(err => console.error('Failed to fetch subjects:', err));
  }, []);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
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
        [subject]: { ...(prev[subject] || { mcq:0, fib:0 }), [type]: num }
      };
      // auto-fetch whenever count changes
      fetchQuestions(subject, updated);
      return updated;
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
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

  return (
    <div style={{ padding:20, maxWidth:700, margin:'auto' }}>
      <h2>Create Exam</h2>
      <form onSubmit={handleSubmit}>

        <input name="exam_title" placeholder="Exam Title" required
          value={formData.exam_title} onChange={handleInputChange}
          style={{ width:'100%', marginBottom:10 }} />

        <textarea name="instruction" placeholder="Instruction" required
          value={formData.instruction} onChange={handleInputChange}
          style={{ width:'100%', marginBottom:10, height:80 }} />

        <label>Start Time:</label>
        <input type="datetime-local" name="exam_start_time" required
          value={formData.exam_start_time} onChange={handleInputChange}
          style={{ width:'100%', marginBottom:10 }} />

        <label>End Time:</label>
        <input type="datetime-local" name="exam_end_time" required
          value={formData.exam_end_time} onChange={handleInputChange}
          style={{ width:'100%', marginBottom:10 }} />

        <select name="created_by" required
          value={formData.created_by} onChange={handleInputChange}
          style={{ width:'100%', marginBottom:10 }}>
          <option value="">-- Creator --</option>
          <option value="1">HR</option>
          <option value="2">Employee</option>
        </select>

        <input name="role_or_department" placeholder="Role / Department"
          value={formData.role_or_department} onChange={handleInputChange}
          style={{ width:'100%', marginBottom:20 }} />

        <input name="location" placeholder="Location" required
          value={formData.location} onChange={handleInputChange}
          style={{ width:'100%', marginBottom:20 }} />
          
        <div style={{ marginBottom:20 }}><strong>Select Subjects:</strong>
          {allSubjects.map(subj => (
            <div key={subj} style={{ display:'flex', alignItems:'center', marginBottom:8 }}>
              <label style={{ flex:1 }}>
                <input type="checkbox"
                  checked={selectedSubjects.includes(subj)}
                  onChange={()=>toggleSubject(subj)} /> {subj}
              </label>
              {selectedSubjects.includes(subj) && (
                <>
                  <input type="number" min="0" placeholder="MCQ#"
                    value={counts[subj]?.mcq||''}
                    onChange={e=>handleCountChange(subj,'mcq',e.target.value)}
                    style={{ width:60, marginRight:4 }} />
                  <input type="number" min="0" placeholder="FIB#"
                    value={counts[subj]?.fib||''}
                    onChange={e=>handleCountChange(subj,'fib',e.target.value)}
                    style={{ width:60 }} />
                </>
              )}
            </div>
          ))}
        </div>

        {selectedSubjects.map(subj => (
          fetchedQuestions[subj] && (
            <div key={subj} style={{ background:'#f8f8f8', padding:15, marginBottom:20 }}>
              <h4>{subj} Preview</h4>
              <h5>MCQs:</h5>
              <ul>{fetchedQuestions[subj].mcq.map(q=><li key={q.id}>{q.question_text}</li>)}</ul>
              <h5>FIBs:</h5>
              <ul>{fetchedQuestions[subj].fib.map(q=><li key={q.id}>{q.question_text}</li>)}</ul>
            </div>
          )
        ))}

        <button type="submit" style={{ width:'100%', padding:10 }}>Create Exam</button>
      </form>
    </div>
  );
};

export default CreateExamForm;
