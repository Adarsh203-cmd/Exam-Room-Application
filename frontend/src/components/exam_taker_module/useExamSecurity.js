import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for comprehensive exam security
 * Uses multiple security layers rather than relying solely on fullscreen mode
 * 
 * @param {Function} onViolation - Callback when security violation occurs
 * @param {boolean} isActive - Whether security measures are active
 * @param {boolean} examCompleted - Whether the exam has been completed
 * @returns {Object} Security state and control functions
 */
const useExamSecurity = (
  onViolation,
  isActive = true,
  examCompleted = false
) => {
  // Security state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [securityLockActive, setSecurityLockActive] = useState(false);
  const [heartbeatActive, setHeartbeatActive] = useState(false);
  
  // Detection trackers
  const visibilityChangeCount = useRef(0);
  const focusChangeCount = useRef(0);
  const lastActiveTime = useRef(Date.now());
  const warningTimeout = useRef(null);
  const heartbeatInterval = useRef(null);
  const examActiveRef = useRef(isActive && !examCompleted);
  
  // Update active state reference when dependencies change
  useEffect(() => {
    examActiveRef.current = isActive && !examCompleted;
    
    // Clean up security if no longer active
    if (!examActiveRef.current && heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
      setHeartbeatActive(false);
    }
    
    // Exit fullscreen if exam is completed
    if (examCompleted && isFullScreen) {
      exitFullScreen();
    }
  }, [isActive, examCompleted, isFullScreen]);

  // Attempt to request fullscreen on an element
  const requestFullScreen = useCallback((element = document.documentElement) => {
    if (!element || !examActiveRef.current) return false;
    
    try {
      // Enable security lock
      setSecurityLockActive(true);
      
      if (element.requestFullscreen) {
        element.requestFullscreen({ navigationUI: 'hide' });
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else {
        console.warn("Fullscreen API not supported");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting fullscreen:", error);
      return false;
    }
  }, []);

  // Exit fullscreen mode
  const exitFullScreen = useCallback(() => {
    try {
      setSecurityLockActive(false);
      
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      return true;
    } catch (error) {
      console.error("Error exiting fullscreen:", error);
      return false;
    }
  }, []);

  // Handle fullscreen change events
  const handleFullScreenChange = useCallback(() => {
    const fullscreenElement = 
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;
    
    const newFullScreenState = !!fullscreenElement;
    setIsFullScreen(newFullScreenState);
    
    // Handle unexpected fullscreen exit
    if (!newFullScreenState && isFullScreen && examActiveRef.current) {
      // Show warning and record violation
      showWarning('fullscreen_exit', 'You have exited fullscreen mode. This action will be recorded.');
      
      // Force back into fullscreen after a delay
      setTimeout(() => {
        if (examActiveRef.current) {
          requestFullScreen();
        }
      }, 500);
    }
  }, [isFullScreen, requestFullScreen]);

  // Set up fullscreen change event listeners
  useEffect(() => {
    const fsChangeEvents = ['fullscreenchange', 'webkitfullscreenchange', 
                           'mozfullscreenchange', 'MSFullscreenChange'];
    
    fsChangeEvents.forEach(eventName => {
      document.addEventListener(eventName, handleFullScreenChange);
    });
    
    return () => {
      fsChangeEvents.forEach(eventName => {
        document.removeEventListener(eventName, handleFullScreenChange);
      });
    };
  }, [handleFullScreenChange]);

  // IMPROVED: Track focus and visibility changes with better handling
  useEffect(() => {
    let blurCount = 0;
    let blurTime = 0;
    let lastBlurTimestamp = 0;
    
    const handleVisibilityChange = () => {
      if (!examActiveRef.current) return;
      
      if (document.visibilityState === 'hidden') {
        lastBlurTimestamp = Date.now();
        blurCount++;
        
        // Record violation after the tab has been inactive for more than 2 seconds
        setTimeout(() => {
          if (document.visibilityState === 'hidden' && 
              Date.now() - lastBlurTimestamp >= 2000 && 
              examActiveRef.current) {
            recordViolation('tab_switch', 'Tab switching detected');
          }
        }, 2000);
      } else if (document.visibilityState === 'visible' && lastBlurTimestamp > 0) {
        // Calculate time spent away from tab
        const timeAway = Date.now() - lastBlurTimestamp;
        blurTime += timeAway;
        
        // If was away for a significant time, show warning
        if (timeAway > 2000) {
          showWarning('tab_return', 'Tab switching detected. This action has been recorded.');
          
          // Return to fullscreen if needed
          if (!isFullScreen && examActiveRef.current) {
            requestFullScreen();
          }
        }
      }
      
      visibilityChangeCount.current++;
    };
    
    const handleFocus = () => {
      if (!examActiveRef.current) return;
      focusChangeCount.current++;
      lastActiveTime.current = Date.now();
    };
    
    const handleBlur = () => {
      if (!examActiveRef.current) return;
      focusChangeCount.current++;
      
      // Record activity gap if focus is lost
      const now = Date.now();
      const timeSinceActive = now - lastActiveTime.current;
      
      if (timeSinceActive > 500) {
        // Record significant focus loss
        setTimeout(() => {
          if (document.activeElement === document.body && examActiveRef.current) {
            recordViolation('focus_loss', 'Focus loss detected');
          }
        }, 1000);
      }
    };
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isFullScreen, requestFullScreen]);

  // IMPROVED: Heartbeat mechanism to detect browser developer tools
  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) return;
    
    // Use performance measures for more accurate timing
    let lastBeatTime = performance.now();
    let anomalyCount = 0;
    
    heartbeatInterval.current = setInterval(() => {
      if (!examActiveRef.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
        return;
      }
      
      const now = performance.now();
      const delta = now - lastBeatTime;
      lastBeatTime = now;
      
      // Normal heartbeat is ~100ms
      // Developer tools being open or tab throttling often causes irregular beats
      if (delta > 200) {
        anomalyCount++;
        
        // Multiple anomalies suggest developer tools or tab throttling
        if (anomalyCount >= 3) {
          recordViolation('timing_anomaly', 'Browser developer tools may be open');
          anomalyCount = 0; // Reset counter
        }
      } else {
        // Gradually reduce anomaly count for sporadic anomalies
        anomalyCount = Math.max(0, anomalyCount - 0.5);
      }
    }, 100);
    
    setHeartbeatActive(true);
    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
      setHeartbeatActive(false);
    };
  }, []);

  // IMPROVED: Clipboard monitoring and blocking
  useEffect(() => {
    const handleCopy = (event) => {
      if (!examActiveRef.current) return;
      
      event.preventDefault();
      recordViolation('copy_attempt', 'Copy operation blocked');
      return false;
    };
    
    const handlePaste = (event) => {
      if (!examActiveRef.current) return;
      
      event.preventDefault();
      recordViolation('paste_attempt', 'Paste operation blocked');
      return false;
    };
    
    const handleCut = (event) => {
      if (!examActiveRef.current) return;
      
      event.preventDefault();
      recordViolation('cut_attempt', 'Cut operation blocked');
      return false;
    };
    
    if (isActive && !examCompleted) {
      document.addEventListener('copy', handleCopy);
      document.addEventListener('paste', handlePaste);
      document.addEventListener('cut', handleCut);
      
      return () => {
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('paste', handlePaste);
        document.removeEventListener('cut', handleCut);
      };
    }
  }, [isActive, examCompleted]);

  // Block context menu (right-click)
  useEffect(() => {
    const handleContextMenu = (event) => {
      if (!examActiveRef.current) return;
      
      event.preventDefault();
      recordViolation('context_menu', 'Right-click blocked');
      return false;
    };
    
    if (isActive && !examCompleted) {
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [isActive, examCompleted]);

  // IMPROVED: Block print functionality
  useEffect(() => {
    const handlePrint = (event) => {
      if (!examActiveRef.current) return;
      
      event.preventDefault();
      event.stopImmediatePropagation();
      recordViolation('print_attempt', 'Print attempt blocked');
      return false;
    };
    
    const handleBeforePrint = () => {
      if (!examActiveRef.current) return;
      recordViolation('print_attempt', 'Print attempt detected');
    };
    
    if (isActive && !examCompleted) {
      // Block Ctrl+P
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
          handlePrint(e);
        }
      }, true);
      
      // Detect print dialog
      window.addEventListener('beforeprint', handleBeforePrint);
      
      return () => {
        window.removeEventListener('beforeprint', handleBeforePrint);
      };
    }
  }, [isActive, examCompleted]);

  // IMPROVED: Security watermark
  useEffect(() => {
    if (!isActive || examCompleted) return;
    
    // Add a watermark with the student's ID or username
    const watermarkText = localStorage.getItem('userName') || 'Exam in Progress';
    const watermarkId = 'exam-security-watermark';
    
    // Remove any existing watermark
    const existingWatermark = document.getElementById(watermarkId);
    if (existingWatermark) {
      existingWatermark.remove();
    }
    
    // Create new watermark
    const watermark = document.createElement('div');
    watermark.id = watermarkId;
    watermark.style.position = 'fixed';
    watermark.style.top = '0';
    watermark.style.left = '0';
    watermark.style.width = '100%';
    watermark.style.height = '100%';
    watermark.style.pointerEvents = 'none';
    watermark.style.zIndex = '1000';
    watermark.style.opacity = '0.07';
    watermark.style.display = 'flex';
    watermark.style.alignItems = 'center';
    watermark.style.justifyContent = 'center';
    watermark.style.fontSize = '5vw';
    watermark.style.fontFamily = 'Arial, sans-serif';
    watermark.style.transform = 'rotate(-45deg)';
    watermark.style.userSelect = 'none';
    watermark.textContent = watermarkText;
    
    document.body.appendChild(watermark);
    
    return () => {
      const mark = document.getElementById(watermarkId);
      if (mark) {
        mark.remove();
      }
    };
  }, [isActive, examCompleted]);

  // Show security warning with auto-dismiss timer
  const showWarning = useCallback((type, message) => {
    setWarningMessage(message);
    setShowSecurityWarning(true);
    
    // Auto-dismiss warning after 5 seconds
    if (warningTimeout.current) {
      clearTimeout(warningTimeout.current);
    }
    
    warningTimeout.current = setTimeout(() => {
      setShowSecurityWarning(false);
    }, 5000);
    
    // Record violation
    recordViolation(type, message);
  }, []);

  // Record a security violation
  const recordViolation = useCallback((type, details) => {
    if (typeof onViolation === 'function') {
      onViolation(type, details);
    }
    
    // Log for debugging
    console.warn(`Security violation: ${type} - ${details}`);
  }, [onViolation]);

  // Initialize security when the hook is first called
  useEffect(() => {
    if (isActive && !examCompleted) {
      // Start heartbeat monitoring
      startHeartbeat();
    }
    
    return () => {
      // Clean up
      if (warningTimeout.current) {
        clearTimeout(warningTimeout.current);
      }
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, [isActive, examCompleted, startHeartbeat]);

  // Dismiss warning and return to fullscreen
  const dismissWarning = useCallback(() => {
    setShowSecurityWarning(false);
    
    // Return to fullscreen if needed
    if (!isFullScreen && examActiveRef.current) {
      requestFullScreen();
    }
  }, [isFullScreen, requestFullScreen]);

  // Return the security state and functions
  return {
    isFullScreen,
    showSecurityWarning,
    warningMessage,
    securityLockActive,
    heartbeatActive,
    
    // Functions
    requestFullScreen,
    exitFullScreen,
    dismissWarning,
    recordViolation,
    startHeartbeat
  };
};

export default useExamSecurity;