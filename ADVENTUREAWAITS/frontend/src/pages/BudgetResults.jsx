import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/BudgetResults.css';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const BudgetResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [budgetData, setBudgetData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [additionalExpenses, setAdditionalExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ 
    title: '', 
    amount: '' 
  });
  
  // Get budget data from location state
  useEffect(() => {
    if (location.state && location.state.budgetData) {
      // Ensure all numeric values are properly initialized
      const data = location.state.budgetData;
      
      // Fix any NaN values by providing defaults
      const sanitizedData = {
        ...data,
        totalBudget: isNaN(data.totalBudget) ? 0 : data.totalBudget,
        accommodationPerDay: isNaN(data.accommodationPerDay) ? 0 : data.accommodationPerDay,
        accommodationTotal: isNaN(data.accommodationTotal) ? 0 : data.accommodationTotal,
        transportationPerPerson: isNaN(data.transportationPerPerson) ? 0 : data.transportationPerPerson,
        transportationTotal: isNaN(data.transportationTotal) ? 0 : data.transportationTotal,
        foodPerDay: isNaN(data.foodPerDay) ? 0 : data.foodPerDay,
        foodTotal: isNaN(data.foodTotal) ? 0 : data.foodTotal,
        activitiesTotal: isNaN(data.activitiesTotal) ? 0 : data.activitiesTotal,
        travelers: isNaN(data.travelers) ? 1 : data.travelers,
        duration: isNaN(data.duration) ? 1 : data.duration,
      };
      
      setBudgetData(sanitizedData);
    } else {
      // If no data, redirect to home after a short delay
      setTimeout(() => navigate('/'), 1000);
    }
    setIsLoading(false);
  }, [location, navigate]);
  
  // If still loading or no budget data, show loading
  if (isLoading) {
    return (
      <div className="budget-results-container">
        <div className="loading-state">
          <h2>Loading budget information...</h2>
        </div>
      </div>
    );
  }
  
  // If no budget data after loading, show error
  if (!budgetData) {
    return (
      <div className="budget-results-container">
        <div className="error-state">
          <h2>Budget information not found</h2>
          <p>Redirecting to home page...</p>
        </div>
      </div>
    );
  }
  
  // Calculate number of days
  const startDate = new Date(budgetData.startDate);
  const endDate = new Date(budgetData.endDate);
  const numberOfDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  
  // Calculate total budget
  const calculateTotal = () => {
    return budgetData.totalBudget || 0;
  };
  
  // Calculate per person cost
  const calculatePerPersonCost = () => {
    return Math.round((budgetData.totalBudget || 0) / (budgetData.travelers || 1));
  };
  
  // Calculate per day cost
  const calculatePerDayCost = () => {
    return Math.round((budgetData.totalBudget || 0) / numberOfDays);
  };
  
  // Handle adding new expense
  const handleAddExpense = () => {
    if (newExpense.title && newExpense.amount) {
      const newExpenseItem = { 
        ...newExpense, 
        id: Date.now(),
        amount: parseInt(newExpense.amount) || 0
      };
      setAdditionalExpenses([...additionalExpenses, newExpenseItem]);
      setNewExpense({ title: '', amount: '' });
    }
  };
  
  // Handle removing expense
  const handleRemoveExpense = (id) => {
    setAdditionalExpenses(additionalExpenses.filter(expense => expense.id !== id));
  };
  
  // Handle input change for new expense
  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return dateString;
    }
  };

  // Save budget to database
  const saveBudget = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save your budget");
      return;
    }

    setIsSaving(true);
    
    try {
      // Calculate additional expenses total
      const additionalExpensesTotal = additionalExpenses.reduce((total, expense) => total + (expense.amount || 0), 0);
      
      // Prepare budget data for saving
      const budgetToSave = {
        title: `Trip to ${budgetData.destinationName}`,
        destination: budgetData.destinationName,
        startDate: budgetData.startDate,
        endDate: budgetData.endDate,
        travelers: budgetData.travelers,
        totalBudget: budgetData.totalBudget,
        accommodationBudget: budgetData.accommodationTotal || 0,
        transportationBudget: budgetData.transportationTotal || 0,
        foodBudget: budgetData.foodTotal || 0,
        activitiesBudget: budgetData.activitiesTotal || 0,
        expenses: additionalExpenses.map(expense => ({
          description: expense.title,
          amount: expense.amount,
          category: 'other'
        })),
        notes: `${budgetData.accommodation} accommodation, ${budgetData.transportation} transportation, ${budgetData.food} food`
      };
      
      // Send to API
      const response = await axios.post('http://localhost:5000/api/v1/budgets', budgetToSave, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      toast.success(
        <div>
          Budget saved successfully! 
          <Link to="/saved-budgets" style={{ color: 'white', textDecoration: 'underline', marginLeft: '5px' }}>
            View Saved Budgets
          </Link>
        </div>,
        {
          autoClose: 5000,
          closeOnClick: false
        }
      );
    } catch (error) {
      console.error('Error saving budget:', error);
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Your session has expired. Please login again to save your budget.');
        } else if (error.response.data && error.response.data.error) {
          toast.error(`Failed to save budget: ${error.response.data.error}`);
        } else {
          toast.error('Failed to save budget. Please try again later.');
        }
      } else if (error.request) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Failed to save budget. Please try again later.');
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="budget-results-container">
      <div className="results-header">
        <h1>Budget for Your Trip to {budgetData.destinationName}</h1>
        <div className="budget-amount">
          ₹{(calculateTotal() || 0).toLocaleString('en-IN')}
        </div>
        <div className="budget-breakdown">
          <div className="breakdown-item">
            <span>Per Person:</span>
            <strong>₹{calculatePerPersonCost().toLocaleString('en-IN')}</strong>
          </div>
          <div className="breakdown-item">
            <span>Per Day:</span>
            <strong>₹{calculatePerDayCost().toLocaleString('en-IN')}</strong>
          </div>
          <div className="breakdown-item">
            <span>Duration:</span>
            <strong>{budgetData.duration || numberOfDays} {(budgetData.duration || numberOfDays) === 1 ? 'day' : 'days'}</strong>
          </div>
          <div className="breakdown-item">
            <span>Travelers:</span>
            <strong>{budgetData.travelers || 1}</strong>
          </div>
        </div>
      </div>
      
      <div className="trip-details">
        <h2>Trip Details</h2>
        <div className="details-grid">
          <div className="detail-item">
            <div className="detail-icon"><i className="fas fa-map-marker-alt"></i></div>
            <div className="detail-content">
              <span className="detail-label">Destination</span>
              <span className="detail-value">{budgetData.destinationName}</span>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon"><i className="fas fa-calendar"></i></div>
            <div className="detail-content">
              <span className="detail-label">Start Date</span>
              <span className="detail-value">{formatDate(budgetData.startDate)}</span>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon"><i className="fas fa-calendar-check"></i></div>
            <div className="detail-content">
              <span className="detail-label">End Date</span>
              <span className="detail-value">{formatDate(budgetData.endDate)}</span>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon"><i className="fas fa-hotel"></i></div>
            <div className="detail-content">
              <span className="detail-label">Accommodation</span>
              <span className="detail-value">
                {budgetData.accommodation === 'budget' ? 'Budget' : 
                 budgetData.accommodation === 'mid-range' ? 'Mid-Range' : 'Luxury'}
              </span>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon"><i className="fas fa-bus"></i></div>
            <div className="detail-content">
              <span className="detail-label">Transportation</span>
              <span className="detail-value">
                {budgetData.transportation ? (budgetData.transportation.charAt(0).toUpperCase() + budgetData.transportation.slice(1)) : 'Not specified'}
              </span>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon"><i className="fas fa-utensils"></i></div>
            <div className="detail-content">
              <span className="detail-label">Food</span>
              <span className="detail-value">
                {budgetData.food === 'budget' ? 'Budget' : 
                 budgetData.food === 'mid-range' ? 'Mid-Range' : 'Premium'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="accommodation-details">
        <h2>Your Accommodation Details</h2>
        <div className="accommodation-info">
          <div className="accommodation-type">
            <h3>
              {budgetData.accommodation === 'budget' ? 'Budget' : 
               budgetData.accommodation === 'mid-range' ? 'Mid-Range' : 'Luxury'}
              {' '}Accommodation
            </h3>
            <p className="accommodation-description">{budgetData.accommodationDesc || "Accommodation based on your selected preference"}</p>
          </div>
          <div className="accommodation-pricing">
            <div className="pricing-item">
              <span className="pricing-label">Per Day Cost:</span>
              <span className="pricing-value">₹{(budgetData.accommodationPerDay || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="pricing-item">
              <span className="pricing-label">Total for {budgetData.duration || numberOfDays} days:</span>
              <span className="pricing-value">₹{(budgetData.accommodationTotal || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="transportation-details">
        <h2>Your Transportation Details</h2>
        <div className="transportation-info">
          <div className="transportation-type">
            <h3>
              {budgetData.transportation ? (budgetData.transportation.charAt(0).toUpperCase() + budgetData.transportation.slice(1)) : 'Transportation'}
            </h3>
            <p className="transportation-description">{budgetData.transportationDesc || "Transportation based on your selected preference"}</p>
          </div>
          <div className="transportation-pricing">
            <div className="pricing-item">
              <span className="pricing-label">Per Person Cost:</span>
              <span className="pricing-value">₹{(budgetData.transportationPerPerson || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="pricing-item">
              <span className="pricing-label">Total for {budgetData.travelers || 1} travelers:</span>
              <span className="pricing-value">₹{(budgetData.transportationTotal || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="food-details">
        <h2>Your Food Details</h2>
        <div className="food-info">
          <div className="food-type">
            <h3>
              {budgetData.food === 'budget' ? 'Budget' : 
               budgetData.food === 'mid-range' ? 'Mid-Range' : 'Premium'}
              {' '}Food Options
            </h3>
            <p className="food-description">{budgetData.foodDesc || "Food options based on your selected preference"}</p>
          </div>
          <div className="food-pricing">
            <div className="pricing-item">
              <span className="pricing-label">Per Day Cost:</span>
              <span className="pricing-value">₹{(budgetData.foodPerDay || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="pricing-item">
              <span className="pricing-label">Total for {budgetData.duration || numberOfDays} days:</span>
              <span className="pricing-value">₹{(budgetData.foodTotal || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="activities-details">
        <h2>Activities Budget</h2>
        <div className="activities-info">
          <div className="activities-summary">
            <p className="activities-description">
              Estimated budget for activities, sightseeing, and entertainment during your trip.
            </p>
          </div>
          <div className="activities-pricing">
            <div className="pricing-item">
              <span className="pricing-label">Total Activities Budget:</span>
              <span className="pricing-value">₹{(budgetData.activitiesTotal || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="expenses-section">
        <h2>Additional Expenses</h2>
        
        {additionalExpenses.length > 0 ? (
          <div className="expenses-list">
            {additionalExpenses.map((expense) => (
              <div className="expense-item" key={expense.id}>
                <div className="expense-info">
                  <span className="expense-title">{expense.title}</span>
                  <span className="expense-amount">₹{expense.amount.toLocaleString('en-IN')}</span>
                </div>
                <button 
                  className="remove-expense" 
                  onClick={() => handleRemoveExpense(expense.id)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-expenses">
            <p>No additional expenses added yet. Add some below!</p>
          </div>
        )}
        
        <div className="add-expense">
          <input 
            type="text" 
            name="title"
            placeholder="Expense name" 
            value={newExpense.title}
            onChange={handleExpenseChange}
          />
          <input 
            type="number" 
            name="amount"
            placeholder="Amount (₹)" 
            value={newExpense.amount}
            onChange={handleExpenseChange}
          />
          <button onClick={handleAddExpense}>Add</button>
        </div>
      </div>
      
      <div className="save-note">
        <p>
          <i className="fas fa-info-circle"></i> To track your actual expenses during your trip, save this budget and view it later in your profile under "Saved Budgets".
        </p>
      </div>
      
      <div className="budget-actions">
        <button 
          className="action-button secondary" 
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
        <button 
          className="action-button primary" 
          onClick={saveBudget}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Budget'}
        </button>
      </div>
    </div>
  );
};

export default BudgetResults; 