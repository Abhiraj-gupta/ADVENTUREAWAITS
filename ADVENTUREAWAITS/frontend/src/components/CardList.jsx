
import React from 'react';
import Card from './Card';
import '../styles/CardList.css';

const CardList = ({ items, category, stateId }) => {
  // Check if items exist and is an array
  const hasItems = Array.isArray(items) && items.length > 0;
  
  return (
    <div className="card-list">
      {hasItems ? (
        items.map((item) => (
          <Card 
            key={item.id} 
            item={item} 
            type={category} 
            stateId={stateId} 
          />
        ))
      ) : (
        <div className="no-items">
          <i className="fas fa-search"></i>
          <p>No items found</p>
          <span>Try adjusting your search or filters</span>
        </div>
      )}
    </div>
  );
};

export default CardList;
