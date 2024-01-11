import React, { useState } from 'react';
import styles from '@design-system/modules/ProductDropdown.module.scss';

export const Dropdown = ({ items, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
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
            <div className={styles.itemsWrapper} key={index}>
              <div className={styles.placeholderIcon}>{item.icon}</div>
              <div className={styles.placeholderTitle}>{item.title}</div>
              <div className={styles.placeholderDescription}>{item.description}</div>
            </div>
          ))}
          {children}
        </div>
      )}
    </div>
  );
};