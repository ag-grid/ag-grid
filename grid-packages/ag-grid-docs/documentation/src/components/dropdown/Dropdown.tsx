import React, { useState } from 'react';
import styles from '@design-system/modules/ProductDropdown.module.scss';

import GridLight from '../../images/inline-svgs/grid-light.svg';
import ChartsLight from '../../images/inline-svgs/chart-light.svg';

export const Dropdown = ({ items, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  const getIconComponent = (title) => {
    switch (title) {
      case 'AG Charts':
        return <ChartsLight />;
      case 'AG Grid':
        return <GridLight />;
      default:
        return null; // Handle other cases or provide a default icon
    }
  };

  

  return (
    <div className={`${styles.customMenu} ${isOpen ? styles.open : ''}`}>
      <button
        className={`${styles.customTrigger} ${isOpen ? styles.open : ''}`}
        onClick={handleMenuToggle}
      >
        Products
        <span className={styles.arrow}></span>
      </button>
      {isOpen && (
        <div className={styles.customContent}>
          {items.map((item, index) => (
            <a
            key={index}
            href={item.link} // Add the link property to each item
            className={styles.itemsWrapper}
          >
            <div className={styles.placeholderIcon}>
              {getIconComponent(item.title)}
            </div>
            <div className={styles.productsWrapper}>
              <div className={styles.productTitle}>{item.title}</div>
              <div className={styles.productDescription}>{item.description}</div>
            </div>
          </a>
          ))}
          {children}
        </div>
      )}
    </div>
  );
};