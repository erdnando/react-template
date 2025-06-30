import React, { useState, useEffect, useCallback } from 'react';
import { utilsService, UtilsPasswordResetStatsDto } from '../../services/utilsApiService';
import { Button } from '../ui';
import AutocompleteInput from '../common/AutocompleteInput';
import './AdminPasswordResetManagement.css';

const AdminPasswordResetManagement: React.FC = () => {
  const [resetStats, setResetStats] = useState<UtilsPasswordResetStatsDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [emailToReset, setEmailToReset] = useState<string>('');
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Fetch reset stats
  const fetchResetStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await utilsService.getPasswordResetStats();
      
      console.log('Component - Fetch stats response:', response);
      
      if (response && response.success === true) {
        // Always set the stats if the response is successful, even if data has empty arrays
        setResetStats(response.data);
        console.log('Stats set successfully:', response.data);
      } else {
        console.error('Response not successful:', response);
        setError(response?.message || 'Failed to fetch password reset statistics');
      }
    } catch (err) {
      console.error('Error in fetchResetStats catch block:', err);
      setError('An error occurred while fetching password reset statistics. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password attempts for a user
  const resetAttemptsForUser = async (email: string) => {
    if (!email || !email.trim()) {
      setActionMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    
    try {
      setIsProcessing(true);
      console.log('Resetting attempts for user:', email);
      const response = await utilsService.resetPasswordAttempts({ email: email.trim() });
      console.log('Reset attempts response:', response);
      
      if (response && response.success) {
        // Safe access to response.data with fallbacks
        const tokensDeleted = response.data?.tokensDeleted || 0;
        setActionMessage({ 
          type: 'success', 
          text: `Successfully reset attempts for ${email}. ${tokensDeleted} tokens removed.` 
        });
        setEmailToReset('');
        fetchResetStats(); // Refresh stats
      } else {
        setActionMessage({ 
          type: 'error', 
          text: response?.message || 'Failed to reset attempts' 
        });
      }
    } catch (err) {
      console.error('Error resetting password attempts:', err);
      setActionMessage({ 
        type: 'error', 
        text: 'An error occurred while resetting password attempts.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Clean up expired tokens
  const cleanupExpiredTokens = async () => {
    try {
      setIsProcessing(true);
      console.log('Cleaning up expired tokens...');
      const response = await utilsService.cleanupExpiredTokens();
      console.log('Cleanup response:', response);
      
      if (response && response.success) {
        // Safe access to response.data with fallbacks
        const tokensDeleted = response.data?.expiredTokensDeleted || 0;
        setActionMessage({ 
          type: 'success', 
          text: `Successfully cleaned up ${tokensDeleted} expired tokens.` 
        });
        fetchResetStats(); // Refresh stats
      } else {
        setActionMessage({ 
          type: 'error', 
          text: response?.message || 'Failed to clean up expired tokens' 
        });
      }
    } catch (err) {
      console.error('Error cleaning up expired tokens:', err);
      setActionMessage({ 
        type: 'error', 
        text: 'An error occurred while cleaning up expired tokens.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Fetch email suggestions for autocomplete using the backend API
  const fetchEmailSuggestions = useCallback(async (partialEmail: string) => {
    if (partialEmail.trim().length < 2) {
      setEmailSuggestions([]);
      return;
    }
    
    setLoadingSuggestions(true);
    
    try {
      console.log('Fetching email suggestions for:', partialEmail);
      const response = await utilsService.searchUsersByEmail(partialEmail);
      
      if (response && response.success && response.data && response.data.users) {
        console.log('Email suggestions received:', response.data.users);
        setEmailSuggestions(response.data.users);
      } else {
        console.log('No users found or API error:', response?.message);
        setEmailSuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching email suggestions:', err);
      setEmailSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any state or props

  // Handle user selection from autocomplete
  const handleUserSelection = useCallback((selectedEmail: string) => {
    console.log('User selected:', selectedEmail);
    setEmailSuggestions([]); // Clear suggestions when user is selected
  }, []);
  
  // Load stats when component mounts
  // Debug: Log state changes
  useEffect(() => {
    console.log('Debug - Current state:', {
      resetStats,
      loading,
      error,
      isProcessing,
      emailToReset,
      emailSuggestions,
      loadingSuggestions
    });
  }, [resetStats, loading, error, isProcessing, emailToReset, emailSuggestions, loadingSuggestions]);

  useEffect(() => {
    // Reset error state and fetch stats
    setError(null);
    fetchResetStats();
    
    // Auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      setError(null); // Reset error before each refresh
      fetchResetStats();
    }, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="password-reset-management">
      <div className="header-container">
        <Button 
          className="refresh-button" 
          onClick={() => {
            setError(null); // Reset error state
            fetchResetStats();
          }} 
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </Button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="alert alert-error">
          <span className="error-icon">⚠️</span> {error}
        </div>
      )}
      
      {/* Action message */}
      {actionMessage && (
        <div className={`alert alert-${actionMessage.type}`}>
          {actionMessage.type === 'success' ? '✅' : '⚠️'} {actionMessage.text}
          <button 
            className="close-button" 
            onClick={() => setActionMessage(null)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Stats summary */}
      {resetStats && !loading && !error && (
        <div className="stats-summary">
          <div className="stat-card">
            <span className="stat-value">{resetStats.totalUsers || 0}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{resetStats.usersWithActiveTokens || 0}</span>
            <span className="stat-label">Users with Active Tokens</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{resetStats.totalActiveTokens || 0}</span>
            <span className="stat-label">Total Active Tokens</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{resetStats.usersAtLimit || 0}</span>
            <span className="stat-label">Users at Limit</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{resetStats.recentResetRequests || 0}</span>
            <span className="stat-label">Recent Reset Requests</span>
          </div>
        </div>
      )}
      
      {/* Admin Actions */}
      <div className="admin-actions">
        <h3>Administrative Actions</h3>
        
        <div className="action-container">
          <div className="action-group">
            <label htmlFor="emailInput">Reset Password Attempts for User:</label>
            <div className="input-button-group">
              <AutocompleteInput
                id="emailInput"
                type="email"
                value={emailToReset}
                onChange={setEmailToReset}
                onSelect={handleUserSelection}
                placeholder="user@example.com"
                suggestions={emailSuggestions}
                fetchSuggestions={fetchEmailSuggestions}
                disabled={isProcessing}
                className="email-autocomplete"
                debounceTime={300}
              />
              <Button 
                onClick={() => resetAttemptsForUser(emailToReset)}
                disabled={isProcessing || !emailToReset.trim()}
              >
                {isProcessing ? 'Processing...' : 'Reset Attempts'}
              </Button>
            </div>
          </div>
          
          <div className="action-group">
            <Button 
              className="warning-button"
              onClick={cleanupExpiredTokens}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Clean Up All Expired Tokens'}
            </Button>
            <small>This will remove all expired password reset tokens across the system.</small>
          </div>
        </div>
      </div>
      
      {/* User stats table */}
      {resetStats && resetStats.resetStats && Array.isArray(resetStats.resetStats) && resetStats.resetStats.length > 0 && !error && (
        <div className="user-stats-section">
          <h3>User Reset Attempts</h3>
          <div className="table-responsive">
            <table className="user-stats-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Active Tokens</th>
                  <th>At Limit</th>
                  <th>Last Attempt</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resetStats.resetStats.map((userStat, index) => (
                  <tr key={index} className={userStat.isAtLimit ? 'at-limit' : ''}>
                    <td>{userStat.userEmail}</td>
                    <td>{userStat.activeTokens}</td>
                    <td>{userStat.isAtLimit ? '✓' : '–'}</td>
                    <td>
                      {userStat.lastResetAttempt 
                        ? new Date(userStat.lastResetAttempt).toLocaleString() 
                        : 'Never'}
                    </td>
                    <td>
                      <Button 
                        className="small-button"
                        onClick={() => resetAttemptsForUser(userStat.userEmail)}
                        disabled={isProcessing}
                      >
                        Reset
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="loading-spinner">
          Loading stats...
        </div>
      )}
      
      {/* No data message - only show one info message when there's no data */}
      {!loading && !error && resetStats && resetStats.resetStats && Array.isArray(resetStats.resetStats) && resetStats.resetStats.length === 0 && (
        <div className="no-data-message info-message">
          <span className="info-icon">ℹ️</span> No password reset attempts have been recorded in the system. The system is working normally.
        </div>
      )}
    </div>
  );
};

export default AdminPasswordResetManagement;