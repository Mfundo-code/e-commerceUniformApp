import React from 'react';
import { useNavigate } from 'react-router-dom';

const ImageHolder = ({ product, onOrder }) => {
  const navigate = useNavigate();

  const handleOrderClick = () => {
    // Navigate directly to communication screen
    navigate('/communication');
  };

  return (
    <div style={styles.container}>
      <div style={styles.imageContainer}>
        {product.image ? (
          <img 
            src={product.image}
            alt={product.name} 
            style={styles.image} 
          />
        ) : (
          <div style={styles.placeholder}>
            <i className="fas fa-image" style={styles.placeholderIcon} />
          </div>
        )}
      </div>
      
      <h3 style={styles.title}>{product.name}</h3>
      <p style={styles.price}>R{parseFloat(product.price).toFixed(2)}</p>
      
      <button 
        style={styles.orderButton} 
        onClick={handleOrderClick}
      >
        Order
      </button>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '15px',
    textAlign: 'center',
    transition: 'transform 0.3s',
    ':hover': {
      transform: 'translateY(-5px)'
    }
  },
  imageContainer: {
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px'
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: '4px'
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px'
  },
  placeholderIcon: {
    fontSize: '48px',
    color: '#ddd'
  },
  title: {
    margin: '5px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333'
  },
  price: {
    margin: '5px 0 10px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#4e73df'
  },
  orderButton: {
    backgroundColor: '#4e73df',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    width: '100%',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#2e59d9'
    }
  }
};

export default ImageHolder;