import classnames from 'classnames';
import { useEffect, useState } from 'react';
import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { SECTIONS, SECTION_GROUPS } from '../sections';

/**
 * Tracks which section is currently in view.
 *
 * Uses one observer over all sections and picks the topmost intersecting entry, rather than
 * marking whichever section last fired. Sections here are tall and several are visible at once, so
 * "last fired" jumps around as you scroll.
 */
const useActiveSection = (): string | undefined => {
    const [active, setActive] = useState<string>();

    useEffect(() => {
        const elements = SECTIONS.map(({ id }) => document.getElementById(id)).filter(
            (element): element is HTMLElement => element != null
        );

        if (elements.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            () => {
                // Recompute from live geometry rather than from the entries, so the active item is
                // correct even when a scroll skips past several sections between callbacks.
                const topmost = elements
                    .map((element) => ({ id: element.id, top: element.getBoundingClientRect().top }))
                    .filter(({ top }) => top < window.innerHeight * 0.4)
                    .pop();

                setActive(topmost?.id ?? elements[0].id);
            },
            // A tall root margin keeps the callback firing throughout the scroll rather than only
            // as a section edge crosses the viewport.
            { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.01, 0.5, 1] }
        );

        elements.forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, []);

    return active;
};

/** Grouped, deep-linkable navigation for the guide. */
export const Sidebar: FunctionComponent = () => {
    const active = useActiveSection();

    return (
        <nav className={styles.sidebar} aria-label="Style guide sections">
            {SECTION_GROUPS.map(({ group, entries }) => (
                <div key={group} className={styles.sidebarGroup}>
                    <h2 className={styles.sidebarGroupTitle}>{group}</h2>
                    <ul className="list-style-none">
                        {entries.map(({ id, label }) => (
                            <li key={id}>
                                <a
                                    href={`#${id}`}
                                    className={classnames(styles.sidebarLink, {
                                        [styles.sidebarLinkActive]: id === active,
                                    })}
                                    aria-current={id === active ? 'true' : undefined}
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    );
};
