import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/exam_allotment_module_css/CreateExamForm.css";
import { apiClient } from '../../config/api';

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    apiClient.get('/api/exam_allotment/subjects/')
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

  // Replace your existing fetchQuestions function with this:

const fetchQuestions = async (subject, latestCounts) => {
  const { mcq = 0, fib = 0 } = latestCounts[subject] || {};
  if (mcq <= 0 && fib <= 0) return;

  setIsLoading(true);
  
  try {
    const res = await apiClient.get('/api/exam_allotment/random-questions/', {
      params: { subject, mcq_count: mcq, fib_count: fib }
    });
    
    // Update the fetched questions for this subject
    setFetchedQuestions(fq => ({ ...fq, [subject]: res.data }));
    
    // ✅ CRITICAL FIX: Regenerate ALL question IDs from ALL subjects
    setFetchedQuestions(currentFetchedQuestions => {
      const updatedFetchedQuestions = { ...currentFetchedQuestions, [subject]: res.data };
      
      // Collect ALL question IDs from ALL selected subjects
      const allMcqIds = [];
      const allFibIds = [];
      
      Object.keys(updatedFetchedQuestions).forEach(subj => {
        if (selectedSubjects.includes(subj) && updatedFetchedQuestions[subj]) {
          allMcqIds.push(...updatedFetchedQuestions[subj].mcq.map(q => q.id));
          allFibIds.push(...updatedFetchedQuestions[subj].fib.map(q => q.id));
        }
      });
      
      // Update formData with the complete set of question IDs
      setFormData(fd => ({
        ...fd,
        mcq_question_ids: allMcqIds,
        fib_question_ids: allFibIds
      }));
      
      return updatedFetchedQuestions;
    });
    
  } catch (err) {
    console.error(`Error fetching questions for ${subject}:`, err);
  } finally {
    setIsLoading(false);
  }
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
    // ✅ FIX: Convert datetime-local values to IST timezone before sending to Django
    const convertToIST = (datetimeLocal) => {
      if (!datetimeLocal) return datetimeLocal;
      
      // datetime-local gives us: "2025-05-28T10:45"
      // We need to tell Django this is IST time, not UTC
      // Convert to ISO format with IST timezone offset
      const localDate = new Date(datetimeLocal);
      
      // Since the user entered this time thinking it's IST,
      // we need to create an ISO string that represents this time in IST
      const istOffset = '+05:30';
      const isoString = datetimeLocal + ':00' + istOffset;
      
      return isoString;
    };

    const payload = {
      ...formData,
      created_by: parseInt(formData.created_by, 10),
      // Convert both start and end times to IST timezone format
      exam_start_time: convertToIST(formData.exam_start_time),
      exam_end_time: convertToIST(formData.exam_end_time),
    };
    
    console.log('Payload being sent:', payload); // Debug log
    
    const examRes = await apiClient.post('/api/exam_allotment/exams/', payload);
    const exam = examRes.data;
    navigate(`/select-candidates/${exam.exam_token}`);
  } catch (err) {
    console.error('Exam creation failed:', err.response?.data || err);
    alert('Failed to create exam—see console for details.');
  }
};

  return (
    <div className="exam-form-container">
      <div className="form-wrapper">
        {/* Left Side - Form */}
        <div className="form-section">
          <h1 className="form-title">Create Exam</h1>
          <p className="form-subtitle">Fill in the details to create a new examination</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Exam Title *</label>
              <input
                name="exam_title"
                placeholder="Enter exam title"
                ref={refs.exam_title}
                value={formData.exam_title}
                onChange={handleInputChange}
                className="form-input"
              />
              {errors.exam_title && <div className="error-message">⚠ {errors.exam_title}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Instructions *</label>
              <textarea
                name="instruction"
                placeholder="Enter exam instructions for students"
                ref={refs.instruction}
                value={formData.instruction}
                onChange={handleInputChange}
                className="form-input form-textarea"
              />
              {errors.instruction && <div className="error-message">⚠ {errors.instruction}</div>}
            </div>

            <div className="datetime-group">
              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input
                  type="datetime-local"
                  name="exam_start_time"
                  ref={refs.exam_start_time}
                  value={formData.exam_start_time}
                  onChange={handleInputChange}
                  className="form-input"
                />
                {errors.exam_start_time && <div className="error-message">⚠ {errors.exam_start_time}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">End Time *</label>
                <input
                  type="datetime-local"
                  name="exam_end_time"
                  ref={refs.exam_end_time}
                  value={formData.exam_end_time}
                  onChange={handleInputChange}
                  className="form-input"
                />
                {errors.exam_end_time && <div className="error-message">⚠ {errors.exam_end_time}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Created By *</label>
              <select
                name="created_by"
                ref={refs.created_by}
                value={formData.created_by}
                onChange={handleInputChange}
                className="form-input form-select"
              >
                <option value="">-- Select Creator --</option>
                <option value="1">HR Department</option>
                <option value="2">Employee</option>
              </select>
              {errors.created_by && <div className="error-message">⚠ {errors.created_by}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Role / Department *</label>
              <input
                name="role_or_department"
                placeholder="Enter role or department"
                ref={refs.role_or_department}
                value={formData.role_or_department}
                onChange={handleInputChange}
                className="form-input"
              />
              {errors.role_or_department && <div className="error-message">⚠ {errors.role_or_department}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                name="location"
                placeholder="Enter exam location"
                ref={refs.location}
                value={formData.location}
                onChange={handleInputChange}
                className="form-input"
              />
              {errors.location && <div className="error-message">⚠ {errors.location}</div>}
            </div>


<div className="subjects-section">
  <div className="subjects-title">Select Subjects</div>
  {allSubjects.map(subj => (
    <div key={subj} className="subject-item">
      <div className="subject-row">
        <label className="subject-checkbox-label">
          <input 
            type="checkbox"
            className="subject-checkbox"
            checked={selectedSubjects.includes(subj)}
            onChange={() => toggleSubject(subj)} 
          />
          <span className="subject-name">{subj}</span>
        </label>
        
        {selectedSubjects.includes(subj) && (
          <div className="question-counts-inline">
            <div className="count-group">
              <input 
                type="number" 
                min="0" 
                placeholder="0"
                value={counts[subj]?.mcq || ''}
                onChange={e => handleCountChange(subj, 'mcq', e.target.value)}
                className="count-input"
              />
              <label className="count-label">MCQ</label>
            </div>
            <div className="count-group">
              <input 
                type="number" 
                min="0" 
                placeholder="0"
                value={counts[subj]?.fib || ''}
                onChange={e => handleCountChange(subj, 'fib', e.target.value)}
                className="count-input"
              />
              <label className="count-label">FIB</label>
            </div>
          </div>
        )}
      </div>
    </div>
  ))}
</div>



            <button 
              type="submit" 
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Exam...' : 'Create Exam'}
            </button>
          </form>
        </div>

        {/* Right Side - Preview */}
        <div className="preview-section">
          <h2 className="preview-title">Question Preview</h2>
          
          {selectedSubjects.length === 0 ? (
            <div className="empty-preview">
              <p>Select subjects to preview questions</p>
            </div>
          ) : (
            selectedSubjects.map(subj => 
              fetchedQuestions[subj] && (
                <div key={subj} className="preview-card">
                  <h3 className="subject-heading">{subj}</h3>
                  
                  {fetchedQuestions[subj].mcq.length > 0 && (
                    <>
                      <h4 className="question-type-header">Multiple Choice Questions</h4>
                      <ul className="question-list">
                        {fetchedQuestions[subj].mcq.map(q => 
                          <li key={q.id} className="question-item">{q.question_text}</li>
                        )}
                      </ul>
                    </>
                  )}
                  
                  {fetchedQuestions[subj].fib.length > 0 && (
                    <>
                      <h4 className="question-type-header">Fill in the Blanks</h4>
                      <ul className="question-list">
                        {fetchedQuestions[subj].fib.map(q => 
                          <li key={q.id} className="question-item">{q.question_text}</li>
                        )}
                      </ul>
                    </>
                  )}
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateExamForm;