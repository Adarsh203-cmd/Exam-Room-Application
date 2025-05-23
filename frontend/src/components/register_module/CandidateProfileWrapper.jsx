import { useParams } from 'react-router-dom';
import CandidateProfileForm from './candidateprofileform';

const CandidateProfileWrapper = () => {
  const { userId } = useParams();
  return <CandidateProfileForm userId={userId} />;
};

export default CandidateProfileWrapper;
