import React from 'react';
import { useParams } from 'react-router-dom';
import CandidateProfileForm from './candidateprofileform';

const CandidateProfileWrapper = () => {
  const userId = localStorage.getItem("userId"); // pulls `userId` from URL like /profile/INT5316
  return <CandidateProfileForm userId={userId} />;
};

export default CandidateProfileWrapper;
