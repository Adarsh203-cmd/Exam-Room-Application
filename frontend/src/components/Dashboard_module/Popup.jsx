import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Popup = ({ exam, onClose }) => {
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(exam.title, 14, 20);

    doc.setFontSize(12);
    doc.text(`Date: ${exam.date}`, 14, 30);
    doc.text(`Total Candidates: ${exam.totalCandidates}`, 14, 40);
    doc.text(`Passed: ${exam.pass}`, 14, 50);
    doc.text(`Failed: ${exam.fail}`, 14, 60);

    autoTable(doc, {
      startY: 70,
      head: [['Field', 'Value']],
      body: [
        ['Title', exam.title],
        ['Date', exam.date],
        ['Total Candidates', exam.totalCandidates],
        ['Passed', exam.pass],
        ['Failed', exam.fail],
      ],
    });

    doc.save(`${exam.title.replace(/\s+/g, '_')}_Report.pdf`);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        background: '#fff', padding: '20px',
        borderRadius: '10px', width: '300px', textAlign: 'center'
      }}>
        <h2>{exam.title}</h2>
        <p><strong>Date:</strong> {exam.date}</p>
        <p><strong>Total Candidates:</strong> {exam.totalCandidates}</p>
        <p><strong>Passed:</strong> {exam.pass}</p>
        <p><strong>Failed:</strong> {exam.fail}</p>

        <button onClick={exportToPDF} style={{
          marginTop: '15px', marginBottom: '10px', padding: '10px 20px',
          background: '#28a745', color: 'white',
          border: 'none', borderRadius: '5px', cursor: 'pointer'
        }}>
          Export to PDF
        </button>

        <button onClick={onClose} style={{
          marginTop: '10px', padding: '10px 20px',
          background: '#007bff', color: 'white',
          border: 'none', borderRadius: '5px', cursor: 'pointer'
        }}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;
