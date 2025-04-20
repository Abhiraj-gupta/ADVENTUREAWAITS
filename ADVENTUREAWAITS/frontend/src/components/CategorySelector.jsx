import React from 'react';
import '../styles/CategorySelector.css';

const CategorySelector = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { id: 'hotels', icon: 'fa-hotel', label: 'Hotels' },
    { id: 'restaurants', icon: 'fa-utensils', label: 'Restaurants' },
    { id: 'attractions', icon: 'fa-landmark', label: 'Attractions' }
  ];

  return (
    <div className="category-selector">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
          onClick={() => onCategoryChange(category.id)}
        >
          <i className={`fas ${category.icon}`}></i>
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategorySelector;
