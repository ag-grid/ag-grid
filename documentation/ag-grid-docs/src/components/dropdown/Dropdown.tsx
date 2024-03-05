import styles from '@design-system/modules/Dropdown.module.scss';
import React, { useEffect, useRef, useState } from 'react';

export const Dropdown = ({ triggerLabel, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleMenuToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef} className={`${styles.customMenu} ${isOpen ? styles.open : ''}`}>
            <button className={`${styles.customTrigger} ${isOpen ? styles.open : ''}`} onClick={handleMenuToggle}>
                {triggerLabel}
                <span className={styles.arrow}></span>
            </button>
            {isOpen && <div className={styles.customContent}>{children}</div>}
        </div>
    );
};
