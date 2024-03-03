import styles from '@design-system/modules/ProductDropdown.module.scss';
import ChartsDark from '@images/inline-svgs/chart-dark.svg?react';
import ChartsLight from '@images/inline-svgs/chart-light.svg?react';
import GridDark from '@images/inline-svgs/grid-dark.svg?react';
import GridLight from '@images/inline-svgs/grid-light.svg?react';
import { useEffect, useRef, useState } from 'react';

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

    const getIconComponent = (title: any) => {
        switch (title) {
            case 'AG Charts':
                return (
                    <>
                        <ChartsLight className={styles.iconLight} />
                        <ChartsDark className={styles.iconDark} />
                    </>
                );
            case 'AG Grid':
                return (
                    <>
                        <GridLight className={styles.iconLight} /> <GridDark className={styles.iconDark} />
                    </>
                );
            default:
                return null; // Handle other cases or provide a default icon
        }
    };

    return (
        <div ref={dropdownRef} className={`${styles.customMenu} ${isOpen ? styles.open : ''}`}>
            <button className={`${styles.customTrigger} ${isOpen ? styles.open : ''}`} onClick={handleMenuToggle}>
                Products
                <span className={styles.arrow}></span>
            </button>
            {isOpen && (
                <div className={styles.customContent}>
                    {items.map((item, index) => (
                        <a key={index} href={item.link} className={styles.itemsWrapper}>
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
