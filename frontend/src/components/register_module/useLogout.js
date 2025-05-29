// hooks/useLogout.js
import { useNavigate } from 'react-router-dom';

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('examToken');
    localStorage.removeItem('candidateId');
    
    // Redirect to login page
    navigate('/login', { replace: true });
  };

  return logout;
};

export default useLogout;