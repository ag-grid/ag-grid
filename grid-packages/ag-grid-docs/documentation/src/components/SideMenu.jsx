import React, { useState, useEffect } from 'react';
import styles from './side-menu.module.scss';

const SideMenu = ({ headings, pageName, setShowSideMenu }) => {
    const [allHeadings, setAllHeadings] = useState(headings);

    useEffect(() => {
        let headings = [];
        let maxLevel = 1;

        const selector = [1, 2, 3, 4, 5, 6].map(depth => `#doc-content h${depth}`).join(',');
        const headingsFromDom = document.querySelectorAll(selector);

        for (let i = 0; i < headingsFromDom.length; i++) {
            const heading = headingsFromDom[i];
            const depth = parseInt(heading.tagName.match(/\d/)[0], 10);

            headings.push({ depth, id: heading.id, value: heading.innerText });

            if (depth > maxLevel) {
                maxLevel = depth;
            }
        }

        // limit the length of the side menu
        while (headings.length > 30 && maxLevel > 2) {
            const topLevel = maxLevel;
            headings = headings.filter(h => h.depth < topLevel);
            maxLevel--;
        }

        setAllHeadings(headings);
    }, [pageName]);

    if (!allHeadings || allHeadings.filter(h => h.id).length < 2) {
        setShowSideMenu(false);
        return null;
    }

    setShowSideMenu(true);

    return <ul className={styles.sideNav}>
        {allHeadings.map(heading => <li key={`${pageName}_${heading.id}`} className={styles[`sideNav__itemLevel${heading.depth}`]}>
            <a className={styles.sideNav__link} href={`#${heading.id}`}>{heading.value}</a>
        </li>
        )}
    </ul>;
};

export default SideMenu;
