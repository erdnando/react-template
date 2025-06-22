import React from 'react';
import './Card.css';

interface CardProps {
  title?: string;
  content?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  content, 
  footer, 
  children, 
  className = '',
  onClick 
}) => {
  const cardClasses = `card ${className} ${onClick ? 'card-clickable' : ''}`.trim();

  return (
    <div className={cardClasses} onClick={onClick}>
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      
      <div className="card-body">
        {content && <p className="card-content">{content}</p>}
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;