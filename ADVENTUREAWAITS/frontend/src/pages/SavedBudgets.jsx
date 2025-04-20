import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign, FaUsers, FaEye, FaTrashAlt, FaPlusCircle, FaFileInvoiceDollar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/SavedBudgets.css';

const SavedBudgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedBudgets();
    fetchSummary();
  }, []);

  const fetchSavedBudgets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/saved-budgets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBudgets(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Failed to fetch saved budgets');
      console.error('Error fetching budgets:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/saved-budgets/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching budget summary:', error);
    }
  };

  const handleViewBudget = (budgetId) => {
    navigate(`/budget-results/${budgetId}`);
  };

  const handleDeleteClick = (budget) => {
    setSelectedBudget(budget);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/saved-budgets/${selectedBudget._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Budget deleted successfully');
      setBudgets(budgets.filter(budget => budget._id !== selectedBudget._id));
      fetchSummary(); // Refresh the summary after deleting
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete budget');
      console.error('Error deleting budget:', error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Skeleton loading component
  const BudgetSkeleton = () => (
    <div className="budget-card skeleton">
      <div className="budget-title-skeleton"></div>
      <div className="budget-details-skeleton">
        <div className="budget-detail-skeleton"></div>
        <div className="budget-detail-skeleton"></div>
        <div className="budget-detail-skeleton"></div>
      </div>
      <div className="budget-actions-skeleton">
        <div className="action-btn-skeleton"></div>
        <div className="action-btn-skeleton"></div>
      </div>
    </div>
  );

  return (
    <div className="saved-budgets-container">
      <div className="saved-budgets-header">
        <h1>Your Saved Budgets</h1>
        <Link to="/budget-tracker" className="new-budget-btn">
          <FaPlusCircle /> Create New Budget
        </Link>
      </div>

      {summary && (
        <div className="budget-summary">
          <div className="summary-card">
            <h3>Total Budgets</h3>
            <p>{summary.totalSavedBudgets}</p>
          </div>
          <div className="summary-card">
            <h3>Total Spent</h3>
            <p>{formatCurrency(summary.totalSpent)}</p>
          </div>
          <div className="summary-card">
            <h3>Average Budget</h3>
            <p>{formatCurrency(summary.averageBudget)}</p>
          </div>
          {summary.popularDestinations.length > 0 && (
            <div className="summary-card">
              <h3>Top Destination</h3>
              <p>{summary.popularDestinations[0].destination}</p>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="budget-grid">
          {[...Array(4)].map((_, index) => (
            <BudgetSkeleton key={index} />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="empty-budgets">
          <div className="no-budget-icon">
            <FaFileInvoiceDollar />
          </div>
          <h2>No saved budgets found</h2>
          <p>Start planning your trip budget to see your saved budgets here.</p>
          <Link to="/budget-tracker" className="start-planning-btn">
            Start Planning
          </Link>
        </div>
      ) : (
        <div className="budget-grid">
          {budgets.map((budget) => (
            <div className="budget-card" key={budget._id}>
              <div className="budget-card-header">
                <h3>{budget.title || 'Trip to ' + budget.destination}</h3>
                <span className="budget-created">
                  Created: {formatDate(budget.createdAt)}
                </span>
              </div>
              <div className="budget-details">
                <div className="budget-detail">
                  <FaMapMarkerAlt className="detail-icon" />
                  <span>{budget.destination}</span>
                </div>
                <div className="budget-detail">
                  <FaCalendarAlt className="detail-icon" />
                  <span>{formatDate(budget.startDate)} - {formatDate(budget.endDate)}</span>
                </div>
                <div className="budget-detail">
                  <FaUsers className="detail-icon" />
                  <span>{budget.travelers} travelers</span>
                </div>
                <div className="budget-detail">
                  <FaRupeeSign className="detail-icon" />
                  <span>{formatCurrency(budget.totalBudget)}</span>
                </div>
              </div>
              <div className="budget-actions">
                <button 
                  className="view-btn" 
                  onClick={() => handleViewBudget(budget._id)}
                >
                  <FaEye /> View Details
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDeleteClick(budget)}
                >
                  <FaTrashAlt /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteModalOpen && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete the budget for "{selectedBudget?.title || 'Trip to ' + selectedBudget?.destination}"?</p>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn" 
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedBudgets; 