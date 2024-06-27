import ChartsDark from '@ag-website-shared/images/inline-svgs/chart-dark.svg?react';
import ChartsLight from '@ag-website-shared/images/inline-svgs/chart-light.svg?react';
import GridDark from '@ag-website-shared/images/inline-svgs/grid-dark.svg?react';
import GridLight from '@ag-website-shared/images/inline-svgs/grid-light.svg?react';
import { useEffect, useRef, useState } from 'react';

import styles from './ProductDropdown.module.scss';

export const ProductDropdown = ({ items, children }) => {
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

    const getIconComponent = (title) => {
        switch (title) {
            case 'AG Grid':
                return (
                    <>
                        <GridLight className={styles.iconLight} /> <GridDark className={styles.iconDark} />
                    </>
                );
            case 'AG Charts':
                return (
                    <>
                        <ChartsLight className={styles.iconLight} />
                        <ChartsDark className={styles.iconDark} />
                    </>
                );
            default:
                return null; // Handle other cases or provide a default icon
        }
    };

    return (
        <div
            ref={dropdownRef}
            className={`${styles.customMenu} ${isOpen ? styles.open : ''}`}
            onMouseEnter={() => {
                setIsOpen(true);
            }}
            onMouseLeave={() => {
                setIsOpen(false);
            }}
        >
            <button className={`${styles.customTrigger} ${isOpen ? styles.open : ''}`} onClick={handleMenuToggle}>
                Products
                <span className={styles.arrow}></span>
            </button>
            {isOpen && (
                <div className={styles.customContent}>
                    {items.map((item, index) => (
                        <a key={index} href={item.url} className={styles.itemsWrapper}>
                            <div className={styles.placeholderIcon}>{getIconComponent(item.title)}</div>
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
