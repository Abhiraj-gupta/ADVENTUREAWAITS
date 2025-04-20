import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { savedBudgetAPI } from '../services/api';
import '../styles/BudgetTracker.css';

const BudgetTracker = () => {
  const navigate = useNavigate();
  // Main states for the budget tracker
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [showNewTripForm, setShowNewTripForm] = useState(false);
  const [newTripData, setNewTripData] = useState({
    name: '',
    destination: '',
    budget: '',
    startDate: '',
    endDate: ''
  });
  
  // New state for expense
  const [newExpenseData, setNewExpenseData] = useState({
    description: '',
    amount: '',
    category: 'accommodation',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Search state for destination
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  
  // List of available destinations
  const destinations = [
    "Kerala",
    "Jammu & Kashmir",
    "Himachal Pradesh",
    "Gujarat",
    "Uttar Pradesh",
    "Odisha",
    "Goa",
    "Rajasthan",
    "Tamil Nadu",
    "Karnataka",
    "Maharashtra",
    "West Bengal",
    "Assam",
    "Ladakh",
    "Andhra Pradesh",
    "Telangana",
    "Punjab",
    "Uttarakhand",
    "Sikkim",
    "Manipur",
    "Other"
  ];
  
  // Reference for handling clicks outside dropdown
  const dropdownRef = useRef(null);
  
  // Add new state for save modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Load trips from localStorage on mount
  useEffect(() => {
    const savedTrips = localStorage.getItem('budgetTrips');
    if (savedTrips) {
      const parsedTrips = JSON.parse(savedTrips);
      setTrips(parsedTrips);
      
      // Set active trip to the first one if available
      if (parsedTrips.length > 0 && !activeTrip) {
        setActiveTrip(parsedTrips[0]);
      }
    }
  }, []);
  
  // Save trips to localStorage whenever they change
  useEffect(() => {
    if (trips.length > 0) {
      localStorage.setItem('budgetTrips', JSON.stringify(trips));
    }
  }, [trips]);
  
  // Filter destinations based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDestinations(destinations);
    } else {
      const filtered = destinations.filter(
        dest => dest.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDestinations(filtered);
    }
  }, [searchQuery]);
  
  // Handle click outside for destination dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDestinationDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Handle trip input changes
  const handleTripInputChange = (e) => {
    const { name, value } = e.target;
    setNewTripData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle expense input changes
  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpenseData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Create a new trip
  const handleCreateTrip = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newTripData.name || !newTripData.destination || !newTripData.budget) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newTrip = {
      id: `trip-${Date.now()}`,
      ...newTripData,
      expenses: [],
      createdAt: new Date().toISOString()
    };
    
    const updatedTrips = [...trips, newTrip];
    setTrips(updatedTrips);
    setActiveTrip(newTrip);
    setShowNewTripForm(false);
    setNewTripData({
      name: '',
      destination: '',
      budget: '',
      startDate: '',
      endDate: ''
    });
    
    // Clear search query after trip creation
    setSearchQuery('');
  };
  
  // Add an expense to the active trip
  const handleAddExpense = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newExpenseData.description || !newExpenseData.amount || !newExpenseData.date) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!activeTrip) {
      alert('Please select a trip first');
      return;
    }
    
    const newExpense = {
      id: `expense-${Date.now()}`,
      ...newExpenseData,
      amount: parseFloat(newExpenseData.amount),
      createdAt: new Date().toISOString()
    };
    
    // Add expense to active trip
    const updatedTrip = {
      ...activeTrip,
      expenses: [...activeTrip.expenses, newExpense]
    };
    
    // Update active trip in trips array
    const updatedTrips = trips.map(trip => 
      trip.id === activeTrip.id ? updatedTrip : trip
    );
    
    setTrips(updatedTrips);
    setActiveTrip(updatedTrip);
    setNewExpenseData({
      description: '',
      amount: '',
      category: 'accommodation',
      date: new Date().toISOString().split('T')[0]
    });
  };
  
  // Delete an expense
  const handleDeleteExpense = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const updatedExpenses = activeTrip.expenses.filter(exp => exp.id !== expenseId);
      
      const updatedTrip = {
        ...activeTrip,
        expenses: updatedExpenses
      };
      
      const updatedTrips = trips.map(trip => 
        trip.id === activeTrip.id ? updatedTrip : trip
      );
      
      setTrips(updatedTrips);
      setActiveTrip(updatedTrip);
    }
  };
  
  // Delete a trip
  const handleDeleteTrip = (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      const updatedTrips = trips.filter(trip => trip.id !== tripId);
      
      setTrips(updatedTrips);
      
      // If active trip is deleted, set active to first available or null
      if (activeTrip && activeTrip.id === tripId) {
        setActiveTrip(updatedTrips.length > 0 ? updatedTrips[0] : null);
      }
      
      // If no trips left, remove from localStorage
      if (updatedTrips.length === 0) {
        localStorage.removeItem('budgetTrips');
      }
    }
  };
  
  // Select a trip
  const handleSelectTrip = (trip) => {
    setActiveTrip(trip);
  };
  
  // Calculate total expenses for a trip
  const calculateTotalExpenses = (expenses) => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };
  
  // Handle selection of a destination from the dropdown
  const handleSelectDestination = (destination) => {
    setNewTripData({
      ...newTripData,
      destination
    });
    setSearchQuery(destination);
    setShowDestinationDropdown(false);
  };
  
  // Calculate expenses by category
  const calculateExpensesByCategory = (expenses) => {
    const categories = {
      accommodation: 0,
      food: 0,
      transportation: 0,
      activities: 0,
      shopping: 0,
      other: 0
    };
    
    expenses.forEach(expense => {
      categories[expense.category] += expense.amount;
    });
    
    return categories;
  };
  
  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);
  
  // Save budget to account
  const handleSaveBudget = async () => {
    if (!activeTrip) {
      toast.error('Please select a trip first');
      return;
    }
    
    if (!isLoggedIn) {
      toast.error('Please log in to save your budget');
      navigate('/login');
      return;
    }
    
    setShowSaveModal(true);
  };

  // Confirm saving budget to account
  const handleConfirmSave = async () => {
    try {
      setIsSaving(true);
      
      // Format expenses by category
      const expensesByCategory = calculateExpensesByCategory(activeTrip.expenses);
      
      // Create recommendations based on expenses
      const recommendations = [];
      
      if (expensesByCategory.accommodation > 0.4 * activeTrip.budget) {
        recommendations.push('Consider budget accommodation options like hostels or guesthouses');
      }
      
      if (expensesByCategory.food > 0.3 * activeTrip.budget) {
        recommendations.push('Try local street food or self-catering to reduce food costs');
      }
      
      if (expensesByCategory.transportation > 0.3 * activeTrip.budget) {
        recommendations.push('Look for public transportation options or travel passes');
      }
      
      // Calculate trip duration in days
      const startDate = new Date(activeTrip.startDate);
      const endDate = new Date(activeTrip.endDate);
      const tripDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
      
      // Calculate travelers (default to 1 if not specified)
      const travelers = parseInt(activeTrip.travelers) || 1;
      
      // Create budget data to save
      const budgetData = {
        name: activeTrip.name,
        destination: activeTrip.destination,
        startDate: activeTrip.startDate,
        endDate: activeTrip.endDate,
        travelers: travelers,
        totalBudget: parseFloat(activeTrip.budget),
        expenses: activeTrip.expenses.map(expense => ({
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          date: expense.date
        })),
        accommodation: {
          cost: expensesByCategory.accommodation || 0,
          notes: "Accommodation expenses"
        },
        transportation: {
          cost: expensesByCategory.transportation || 0,
          notes: "Transportation expenses"
        },
        food: {
          cost: expensesByCategory.food || 0,
          notes: "Food expenses"
        },
        activities: {
          cost: expensesByCategory.activities || 0,
          notes: "Activities and sightseeing"
        },
        other: {
          cost: (expensesByCategory.shopping || 0) + (expensesByCategory.other || 0),
          notes: "Shopping and other expenses"
        },
        recommendations: recommendations,
        notes: `Budget for ${activeTrip.name} trip to ${activeTrip.destination} for ${travelers} traveler(s) over ${tripDuration} days.`
      };
      
      // Save budget to backend
      const response = await savedBudgetAPI.createSavedBudget(budgetData);
      
      setIsSaving(false);
      setShowSaveModal(false);
      
      toast.success('Budget saved successfully to your account!');
      
      // Redirect to saved budgets page
      navigate('/saved-budgets');
    } catch (error) {
      setIsSaving(false);
      console.error('Error saving budget:', error);
      toast.error('Failed to save budget. Please try again.');
    }
  };
  
  return (
    <div className="budget-tracker-page">
      <div className="budget-tracker-header">
        <h1>Travel Budget Tracker</h1>
        <p>Plan and manage your travel expenses</p>
        <Link to="/saved-budgets" className="view-saved-budgets-btn">
          <i className="fas fa-file-invoice-dollar"></i> View Saved Budgets
        </Link>
      </div>
      
      <div className="budget-tracker-container">
        {/* Trips Sidebar */}
        <div className="trips-sidebar">
          <div className="sidebar-header">
            <h2>My Trips</h2>
            <button 
              className="add-trip-btn"
              onClick={() => setShowNewTripForm(true)}
            >
              <i className="fas fa-plus"></i> New Trip
            </button>
          </div>
          
          {/* New Trip Form */}
          {showNewTripForm && (
            <form className="new-trip-form" onSubmit={handleCreateTrip}>
              <h3>Create New Trip</h3>
              
              <div className="form-group">
                <label>Trip Name</label>
                <input 
                  type="text"
                  name="name"
                  value={newTripData.name}
                  onChange={handleTripInputChange}
                  placeholder="Enter trip name"
                  required
                />
              </div>
              
              {/* Replace select dropdown with search and select */}
              <div className="form-group">
                <label>Destination</label>
                <div className="destination-search" ref={dropdownRef}>
                  <input 
                    type="text"
                    placeholder="Search for a destination"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDestinationDropdown(true);
                    }}
                    onFocus={() => setShowDestinationDropdown(true)}
                    className="destination-search-input"
                  />
                  
                  {showDestinationDropdown && (
                    <div className="destination-dropdown">
                      {filteredDestinations.length > 0 ? (
                        filteredDestinations.map((dest, index) => (
                          <div 
                            key={index} 
                            className="destination-option"
                            onClick={() => handleSelectDestination(dest)}
                          >
                            {dest}
                          </div>
                        ))
                      ) : (
                        <div className="no-results">No destinations found</div>
                      )}
                    </div>
                  )}
                </div>
                {/* Hidden input for form submission */}
                <input 
                  type="hidden"
                  name="destination"
                  value={newTripData.destination}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Budget (₹)</label>
                <input 
                  type="number"
                  name="budget"
                  value={newTripData.budget}
                  onChange={handleTripInputChange}
                  placeholder="Enter budget amount"
                  min="1"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input 
                    type="date"
                    name="startDate"
                    value={newTripData.startDate}
                    onChange={handleTripInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    type="date"
                    name="endDate"
                    value={newTripData.endDate}
                    onChange={handleTripInputChange}
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="create-trip-btn">
                  <i className="fas fa-check"></i> Create Trip
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowNewTripForm(false)}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            </form>
          )}
          
          {/* Trip List - Only show when not adding a new trip */}
          {!showNewTripForm && (
            <div className="trip-list">
              {trips.length > 0 ? (
                trips.map(trip => (
                  <div 
                    key={trip.id} 
                    className={`trip-item ${activeTrip && activeTrip.id === trip.id ? 'active' : ''}`}
                    onClick={() => handleSelectTrip(trip)}
                  >
                    <div className="trip-info">
                      <h3>{trip.name}</h3>
                      <p className="trip-destination">
                        <i className="fas fa-map-marker-alt"></i> {trip.destination}
                      </p>
                      
                      <div className="trip-budget">
                        <span className="total-budget">₹{parseFloat(trip.budget).toLocaleString('en-IN')}</span>
                        <span className="budget-divider">&bull;</span>
                        
                        {calculateTotalExpenses(trip.expenses) > 0 && (
                          <span className="spent-amount">
                            Spent: ₹{calculateTotalExpenses(trip.expenses).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      
                      {trip.startDate && trip.endDate && (
                        <div className="trip-dates">
                          <i className="fas fa-calendar"></i> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="trip-actions">
                      <button 
                        className="save-to-account-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveBudget();
                        }}
                        disabled={!isLoggedIn}
                        title={!isLoggedIn ? "Log in to save budgets to your account" : "Save this budget to your account"}
                      >
                        <i className="fas fa-cloud-upload-alt"></i>
                      </button>
                      <button 
                        className="delete-trip-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrip(trip.id);
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-trips-message">
                  <i className="fas fa-suitcase-rolling"></i>
                  <p>No trips yet. Create your first trip!</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className="main-content">
          {activeTrip && !showNewTripForm ? (
            <div className="trip-details">
              <div className="trip-details-header">
                <div className="trip-info">
                  <h2>{activeTrip.name}</h2>
                  <p className="trip-destination">
                    <i className="fas fa-map-marker-alt"></i> {activeTrip.destination}
                  </p>
                </div>
                
                <div className="trip-budget-summary">
                  <div className="budget-card total-budget">
                    <div className="budget-card-header">
                      <i className="fas fa-wallet"></i>
                      <h3>Total Budget</h3>
                    </div>
                    <div className="budget-amount">₹{parseFloat(activeTrip.budget).toLocaleString('en-IN')}</div>
                  </div>
                  
                  <div className="budget-card spent-budget">
                    <div className="budget-card-header">
                      <i className="fas fa-receipt"></i>
                      <h3>Total Spent</h3>
                    </div>
                    <div className="budget-amount">₹{calculateTotalExpenses(activeTrip.expenses).toLocaleString('en-IN')}</div>
                    
                    <div className="budget-percentage">
                      {calculateTotalExpenses(activeTrip.expenses) > 0 && (
                        <span>
                          {Math.round((calculateTotalExpenses(activeTrip.expenses) / parseFloat(activeTrip.budget)) * 100)}% of budget
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="budget-card remaining-budget">
                    <div className="budget-card-header">
                      <i className="fas fa-piggy-bank"></i>
                      <h3>Remaining</h3>
                    </div>
                    <div className="budget-amount">
                      ₹{(parseFloat(activeTrip.budget) - calculateTotalExpenses(activeTrip.expenses)).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Add Expense Form */}
              <div className="add-expense-section">
                <h3>Add New Expense</h3>
                <form onSubmit={handleAddExpense}>
                  <div className="expense-form-row">
                    <div className="form-group">
                      <label>Description</label>
                      <input 
                        type="text"
                        name="description"
                        value={newExpenseData.description}
                        onChange={handleExpenseInputChange}
                        placeholder="What did you spend on?"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Amount (₹)</label>
                      <input 
                        type="number"
                        name="amount"
                        value={newExpenseData.amount}
                        onChange={handleExpenseInputChange}
                        placeholder="How much did you spend?"
                        min="1"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        name="category"
                        value={newExpenseData.category}
                        onChange={handleExpenseInputChange}
                        required
                      >
                        <option value="accommodation">Accommodation</option>
                        <option value="food">Food & Dining</option>
                        <option value="transportation">Transportation</option>
                        <option value="activities">Activities & Tours</option>
                        <option value="shopping">Shopping</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Date</label>
                      <input 
                        type="date"
                        name="date"
                        value={newExpenseData.date}
                        onChange={handleExpenseInputChange}
                        required
                      />
                    </div>
                    
                    <button type="submit" className="add-expense-btn">
                      <i className="fas fa-plus"></i> Add Expense
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Expense List */}
              <div className="expenses-list">
                <h3>Expenses</h3>
                {activeTrip.expenses.length > 0 ? (
                  <div className="expenses-table-container">
                    <table className="expenses-table">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeTrip.expenses.map(expense => (
                          <tr key={expense.id}>
                            <td>{expense.description}</td>
                            <td>
                              <span className={`category-tag ${expense.category}`}>
                                {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                              </span>
                            </td>
                            <td>{new Date(expense.date).toLocaleDateString()}</td>
                            <td className="amount">₹{expense.amount.toLocaleString('en-IN')}</td>
                            <td>
                              <button 
                                className="delete-expense-btn"
                                onClick={() => handleDeleteExpense(expense.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-expenses-message">
                    <i className="fas fa-receipt"></i>
                    <p>No expenses added yet. Add your first expense!</p>
                  </div>
                )}
              </div>
              
              {/* Expense Breakdown */}
              {activeTrip.expenses.length > 0 && (
                <div className="expense-breakdown">
                  <h3>Expense Breakdown</h3>
                  <div className="breakdown-container">
                    {Object.entries(calculateExpensesByCategory(activeTrip.expenses)).map(([category, amount]) => {
                      if (amount > 0) {
                        const percentage = Math.round((amount / calculateTotalExpenses(activeTrip.expenses)) * 100);
                        return (
                          <div className="breakdown-item" key={category}>
                            <div className="breakdown-category">
                              <span className={`category-icon ${category}`}>
                                <i className={
                                  category === 'accommodation' ? 'fas fa-hotel' :
                                  category === 'food' ? 'fas fa-utensils' :
                                  category === 'transportation' ? 'fas fa-bus' :
                                  category === 'activities' ? 'fas fa-hiking' :
                                  category === 'shopping' ? 'fas fa-shopping-bag' :
                                  'fas fa-receipt'
                                }></i>
                              </span>
                              <span className="category-name">
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </span>
                            </div>
                            <div className="breakdown-amount">
                              <div className="amount-bar">
                                <div 
                                  className={`amount-fill ${category}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="amount-text">
                                <span className="amount">₹{amount.toLocaleString('en-IN')}</span>
                                <span className="percentage">{percentage}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-active-trip">
              {showNewTripForm ? (
                <>
                  <i className="fas fa-plane"></i>
                  <h2>Creating a New Trip</h2>
                  <p>Please fill out the form in the sidebar to create your new trip.</p>
                </>
              ) : (
                <>
                  <i className="fas fa-globe-americas"></i>
                  <h2>Welcome to Your Travel Budget Tracker</h2>
                  <p>Select a trip from the sidebar or create a new one to get started!</p>
                  <button 
                    className="create-first-trip-btn"
                    onClick={() => setShowNewTripForm(true)}
                  >
                    <i className="fas fa-plus"></i> Create Your First Trip
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Save Budget Modal */}
      {showSaveModal && (
        <div className="modal-overlay">
          <div className="budget-save-modal">
            <h3>Save Budget to Your Account</h3>
            <p>This will save your budget information to your account, allowing you to access it from any device and view it in your saved budgets.</p>
            
            <div className="save-budget-details">
              <div className="save-detail">
                <span>Trip Name:</span>
                <strong>{activeTrip.name}</strong>
              </div>
              <div className="save-detail">
                <span>Destination:</span>
                <strong>{activeTrip.destination}</strong>
              </div>
              <div className="save-detail">
                <span>Total Budget:</span>
                <strong>₹{parseFloat(activeTrip.budget).toLocaleString('en-IN')}</strong>
              </div>
              <div className="save-detail">
                <span>Expenses:</span>
                <strong>₹{calculateTotalExpenses(activeTrip.expenses).toLocaleString('en-IN')}</strong>
              </div>
            </div>
            
            <div className="save-budget-actions">
              <button 
                className="cancel-save-btn"
                onClick={() => setShowSaveModal(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className="confirm-save-btn"
                onClick={handleConfirmSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Budget'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetTracker; 