import BryntumCalendarDark from '@ag-website-shared/images/inline-svgs/bryntum-calendar-dark.svg?react';
import BryntumCalendarLight from '@ag-website-shared/images/inline-svgs/bryntum-calendar.svg?react';
import BryntumGanttDark from '@ag-website-shared/images/inline-svgs/bryntum-gantt-dark.svg?react';
import BryntumGanttLight from '@ag-website-shared/images/inline-svgs/bryntum-gantt.svg?react';
import BryntumSchedulerDark from '@ag-website-shared/images/inline-svgs/bryntum-scheduler-dark.svg?react';
import BryntumSchedulerProDark from '@ag-website-shared/images/inline-svgs/bryntum-scheduler-pro-dark.svg?react';
import BryntumSchedulerProLight from '@ag-website-shared/images/inline-svgs/bryntum-scheduler-pro.svg?react';
import BryntumSchedulerLight from '@ag-website-shared/images/inline-svgs/bryntum-scheduler.svg?react';
import BryntumTaskBoardDark from '@ag-website-shared/images/inline-svgs/bryntum-task-board-dark.svg?react';
import BryntumTaskBoardLight from '@ag-website-shared/images/inline-svgs/bryntum-task-board.svg?react';
import ChartsDark from '@ag-website-shared/images/inline-svgs/chart-dark.svg?react';
import ChartsLight from '@ag-website-shared/images/inline-svgs/chart-light.svg?react';
import GridDark from '@ag-website-shared/images/inline-svgs/grid-dark.svg?react';
import GridLight from '@ag-website-shared/images/inline-svgs/grid-light.svg?react';
import StudioDark from '@ag-website-shared/images/inline-svgs/studio-dark.svg?react';
import StudioLight from '@ag-website-shared/images/inline-svgs/studio-light.svg?react';
import { Fragment, useEffect, useRef, useState } from 'react';

import styles from './ProductDropdown.module.scss';

interface ProductItem {
    title: string;
    description: string;
    url: string;
    // Optional inline heading rendered above this item — used to mark a
    // category boundary mid-column (e.g. "Bryntum" between the AG products
    // and the Bryntum products in the same column).
    inlineHeading?: string;
}

interface ProductGroup {
    label: string;
    items: ProductItem[];
}

/**
 * The menu prop accepts either the new grouped shape (`ProductGroup[]`) or
 * the legacy flat list (`ProductItem[]`). The flat list is wrapped in a
 * single unnamed group on the fly so older call-sites keep working without
 * needing to be touched.
 */
type ProductMenu = ProductGroup[] | ProductItem[];

const isGrouped = (menu: ProductMenu): menu is ProductGroup[] => {
    // Inspect the first element to decide which shape we were handed. Guard
    // against an empty array or a malformed/non-object first entry so a stray
    // `menu.json` can't crash this shared component.
    const first = menu[0];
    return first != null && typeof first === 'object' && 'items' in first;
};

export const ProductDropdown = ({ items, children }: { items: ProductMenu; children?: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const groups: ProductGroup[] = isGrouped(items) ? items : [{ label: '', items }];

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

    const getIconComponent = (item: ProductItem) => {
        switch (item.title) {
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
            case 'Bryntum Gantt':
                return (
                    <>
                        <BryntumGanttLight className={styles.iconLight} />
                        <BryntumGanttDark className={styles.iconDark} />
                    </>
                );
            case 'Bryntum Scheduler':
                return (
                    <>
                        <BryntumSchedulerLight className={styles.iconLight} />
                        <BryntumSchedulerDark className={styles.iconDark} />
                    </>
                );
            case 'Bryntum Scheduler Pro':
                return (
                    <>
                        <BryntumSchedulerProLight className={styles.iconLight} />
                        <BryntumSchedulerProDark className={styles.iconDark} />
                    </>
                );
            case 'Bryntum Calendar':
                return (
                    <>
                        <BryntumCalendarLight className={styles.iconLight} />
                        <BryntumCalendarDark className={styles.iconDark} />
                    </>
                );
            case 'Bryntum Task Board':
                return (
                    <>
                        <BryntumTaskBoardLight className={styles.iconLight} />
                        <BryntumTaskBoardDark className={styles.iconDark} />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div ref={dropdownRef} className={`${styles.customMenu} ${isOpen ? styles.open : ''}`}>
            <button className={`${styles.customTrigger} ${isOpen ? styles.open : ''}`} onClick={handleMenuToggle}>
                Products
                <span className={styles.arrow}></span>
            </button>
            {/*
             * Always render the content so its open *and* close transitions
             * can both play. Visibility/pointer-events are driven from CSS via
             * the parent `.open` class so the dropdown is fully removed from
             * the accessibility tree and pointer interactions while collapsed.
             */}
            <div className={styles.customContent}>
                {groups.map((group, groupIndex) => (
                    <div key={groupIndex} className={styles.column}>
                        {group.label && <div className={styles.columnHeading}>{group.label}</div>}
                        {group.items.map((item, index) => {
                            const isBryntum = item.title.startsWith('Bryntum');
                            const placeholderClass = isBryntum
                                ? `${styles.placeholderIcon} ${styles.placeholderIconBryntum}`
                                : styles.placeholderIcon;
                            return (
                                <Fragment key={index}>
                                    {item.inlineHeading && (
                                        <div className={`${styles.columnHeading} ${styles.inlineHeading}`}>
                                            {item.inlineHeading}
                                        </div>
                                    )}
                                    <a href={item.url} className={styles.itemsWrapper}>
                                        <div className={placeholderClass}>{getIconComponent(item)}</div>
                                        <div className={styles.productsWrapper}>
                                            <div className={styles.productTitle}>{item.title}</div>
                                            <div className={styles.productDescription}>{item.description}</div>
                                        </div>
                                    </a>
                                </Fragment>
                            );
                        })}
                    </div>
                ))}
                {children}
            </div>
        </div>
    );
};
