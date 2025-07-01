import React, { useState, useEffect } from 'react';

const EnhancedExamFilter = ({ 
  sortOrder, 
  setSortOrder, 
  onFilterChange, 
  examReports = [] 
}) => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('');
  
  // Predefined years list from 2023 to 2030
  const years = [
    { value: '2030', label: '2030' },
    { value: '2029', label: '2029' },
    { value: '2028', label: '2028' },
    { value: '2027', label: '2027' },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' }
  ];
  
  const months = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Apply filters whenever any filter changes
  useEffect(() => {
    const filters = {
      sortOrder,
      year: selectedYear,
      month: selectedMonth
    };
    
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [sortOrder, selectedYear, selectedMonth, onFilterChange]);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '15px', 
      marginBottom: '20px',
      flexWrap: 'wrap'
    }}>
      {/* Sort Order Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: '500', minWidth: 'max-content' }}>
          Sort:
        </label>
        <select
          value={sortOrder}
          onChange={handleSortChange}
          style={{
            padding: '6px 10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'white',
            minWidth: '120px'
          }}
        >
          <option value="asc">Oldest First</option>
          <option value="desc">Newest First</option>
        </select>
      </div>

      {/* Year Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: '500', minWidth: 'max-content' }}>
          Year:
        </label>
        <select
          value={selectedYear}
          onChange={handleYearChange}
          style={{
            padding: '6px 10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'white',
            minWidth: '80px'
          }}
        >
          {years.map(year => (
            <option key={year.value} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>
      </div>

      {/* Month Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: '500', minWidth: 'max-content' }}>
          Month:
        </label>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          style={{
            padding: '6px 10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'white',
            minWidth: '120px'
          }}
        >
          {months.map(month => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      {/* {(selectedMonth || selectedYear !== '2025') && (
        <button
          onClick={() => {
            setSelectedYear('2025');
            setSelectedMonth('');
          }}
          style={{
            padding: '6px 12px',
            border: '1px solid #dc3545',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#dc3545',
            color: 'white',
            cursor: 'pointer',
            minWidth: 'max-content'
          }}
        >
          Clear Filters
        </button>
      )} */}
    </div>
  );
};

export default EnhancedExamFilter;