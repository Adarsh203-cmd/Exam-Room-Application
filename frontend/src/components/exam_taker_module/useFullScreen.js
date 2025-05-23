import { useEffect, useState } from 'react';

/**
 * Custom hook for handling fullscreen functionality and security for exam environment
 * @param {Function} onSecurityViolation - Callback when security violation is detected
 * @returns {Object} - State and methods for fullscreen management
 */
const useFullScreen = (onSecurityViolation) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [securityViolations, setSecurityViolations] = useState(0);

  // Function to enter fullscreen mode
  const enterFullScreen = () => {
    const element = document.documentElement;
    try {
      if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => console.warn("Fullscreen request failed:", err));
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen().catch(err => console.warn("Fullscreen request failed:", err));
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen().catch(err => console.warn("Fullscreen request failed:", err));
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen().catch(err => console.warn("Fullscreen request failed:", err));
      }
    } catch (error) {
      console.error("Error entering fullscreen:", error);
    }
  };

  // Set up fullscreen mode and security measures
  useEffect(() => {
    // Track fullscreen state
    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = !!(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      
      setIsFullScreen(isCurrentlyFullScreen);
      
      // If user exited fullscreen, show warning and increment violations
      if (!isCurrentlyFullScreen) {
        setSecurityViolations(prev => {
          const newCount = prev + 1;
          if (onSecurityViolation) onSecurityViolation(newCount);
          return newCount;
        });
        setShowWarning(true);
        
        // Try to re-enter fullscreen immediately
        console.warn("Fullscreen exit detected - attempting to re-enter fullscreen mode");
        
        // Small delay to ensure DOM updates before attempting fullscreen again
        setTimeout(() => {
          enterFullScreen();
          
          // Keep the warning visible for a few seconds after re-entering
          setTimeout(() => setShowWarning(false), 3000);
        }, 100);
        
        // Log the security violation
        console.warn(`Security violation: Exited fullscreen mode. Total violations: ${securityViolations + 1}`);
      }
    };

    // Track tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setSecurityViolations(prev => {
          const newCount = prev + 1;
          if (onSecurityViolation) onSecurityViolation(newCount);
          return newCount;
        });
        // Log the security violation
        console.warn(`Security violation: Tab switched/minimized. Total violations: ${securityViolations + 1}`);
      }
    };

    // Prevent printing
    const handlePrint = (e) => {
      e.preventDefault();
      setSecurityViolations(prev => {
        const newCount = prev + 1;
        if (onSecurityViolation) onSecurityViolation(newCount);
        return newCount;
      });
      console.warn(`Security violation: Print attempt. Total violations: ${securityViolations + 1}`);
      return false;
    };

    // Prevent escape key from exiting fullscreen
    const preventEscapeKey = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        
        // Show warning when escape key is pressed
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
        
        // Re-enter fullscreen mode
        setTimeout(() => enterFullScreen(), 100);
        
        return false;
      }
    };

    // Disable copy paste
    const disableCopyPaste = (e) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        setSecurityViolations(prev => {
          const newCount = prev + 1;
          if (onSecurityViolation) onSecurityViolation(newCount);
          return newCount;
        });
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
        console.warn(`Security violation: Copy/paste attempt. Total violations: ${securityViolations + 1}`);
      }
    };
    
    // Disable right click
    const disableRightClick = (e) => {
      e.preventDefault();
      return false;
    };

    // Register event listeners
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('msfullscreenchange', handleFullScreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableCopyPaste);
    document.addEventListener('keydown', preventEscapeKey);
    window.addEventListener('beforeprint', handlePrint);
    
    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';

    // Initialize fullscreen when component mounts
    enterFullScreen();

    // Clean up event listeners and styles when component unmounts
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('msfullscreenchange', handleFullScreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableCopyPaste);
      document.removeEventListener('keydown', preventEscapeKey);
      window.removeEventListener('beforeprint', handlePrint);
      
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.msUserSelect = '';
      document.body.style.mozUserSelect = '';
    };
  }, [securityViolations, onSecurityViolation]);

  return {
    isFullScreen,
    showWarning,
    securityViolations,
    enterFullScreen,
    setShowWarning
  };
};

export default useFullScreen;