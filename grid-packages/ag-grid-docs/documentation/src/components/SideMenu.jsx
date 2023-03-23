import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import styles from './SideMenu.module.scss';

/**
 * This renders the right-hand menu that allows the user to navigate between different headings on a page.
 * It will initially load with the headings from the Markdown, but then re-calculate headings after loading to ensure
 * that it picks up e.g. headings from API documentation.
 */
const SideMenu = ({ headings = [], pageName, pageTitle, hideMenu }) => {
    const [allHeadings, setAllHeadings] = useState(headings);
    const menuRef = useRef(null);

    useEffect(() => {
        // this checks for headings once the page has rendered
        let headings = [];
        let maxLevel = 1;

        const selector = [2, 3, 4, 5, 6].map((depth) => `#doc-content h${depth}:not(.side-menu-exclude)`).join(',');
        const headingsFromDom = document.querySelectorAll(selector);

        for (let i = 0; i < headingsFromDom.length; i++) {
            const heading = headingsFromDom[i];
            const depth = parseInt(heading.tagName.match(/\d/)[0], 10);
            const { id } = heading;

            if (!id) {
                continue;
            }

            headings.push({ depth, id, value: heading.innerText });

            if (depth > maxLevel) {
                maxLevel = depth;
            }
        }

        // limit the length of the side menu
        while (headings.length > 30 && maxLevel > 2) {
            const topLevel = maxLevel;
            headings = headings.filter((h) => h.depth < topLevel);
            maxLevel--;
        }

        setAllHeadings(headings);

        if (headings.length < 1) {
            // no point in showing the menu if there are no links
            hideMenu();
        }
    }, [hideMenu]);

    useEffect(() => {
        if (!menuRef.current) {
            return;
        }

        $('body').scrollspy({ target: '#side-menu', offset: 120 });
    }, [menuRef.current]);

    return (
        allHeadings.length > 0 && (
            <nav
                id="side-menu"
                ref={menuRef}
                className={classNames(styles.sideNav, 'ag-styles', 'font-size-responsive')}
            >
                <div>
                    <ul className="list-style-none">
                        <li className={styles['level-1']}>
                            <a href="#top" className={classNames(styles.topLink, 'nav-link')}>
                                {pageTitle}
                            </a>
                        </li>

                        {allHeadings.map((heading) => (
                            <li key={`${pageName}_${heading.id}`} className={styles[`level-${heading.depth}`]}>
                                <a className="nav-link" href={`#${heading.id}`}>
                                    {heading.value}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        )
    );
};

export default SideMenu;
