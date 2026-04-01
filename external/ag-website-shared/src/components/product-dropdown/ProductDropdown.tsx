import ChartsDark from '@ag-website-shared/images/inline-svgs/chart-dark.svg?react';
import ChartsLight from '@ag-website-shared/images/inline-svgs/chart-light.svg?react';
import GridDark from '@ag-website-shared/images/inline-svgs/grid-dark.svg?react';
import GridLight from '@ag-website-shared/images/inline-svgs/grid-light.svg?react';
import StudioDark from '@ag-website-shared/images/inline-svgs/studio-dark.svg?react';
import StudioLight from '@ag-website-shared/images/inline-svgs/studio-light.svg?react';
import { useCallback, useEffect, useRef, useState } from 'react';

import styles from './ProductDropdown.module.scss';

export const ProductDropdown = ({ items, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const open = useCallback(() => {
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        closeTimeout.current = setTimeout(() => {
            setIsOpen(false);
        }, 200);
    }, []);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            if (closeTimeout.current) clearTimeout(closeTimeout.current);
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
            if (closeTimeout.current) clearTimeout(closeTimeout.current);
        };
    }, [handleClickOutside]);

    const getIconComponent = (title: string) => {
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
            case 'AG Studio':
                return (
                    <>
                        <StudioLight className={styles.iconLight} />
                        <StudioDark className={styles.iconDark} />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div
            ref={dropdownRef}
            className={`${styles.customMenu} ${isOpen ? styles.open : ''}`}
            onMouseEnter={open}
            onMouseLeave={close}
        >
            <button
                className={`${styles.customTrigger} ${isOpen ? styles.open : ''}`}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                Products
                <span className={styles.arrow}></span>
            </button>
            <div className={styles.customContent}>
                {items.map((item: { url: string; title: string; description: string }, index: number) => (
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
        </div>
    );
};
