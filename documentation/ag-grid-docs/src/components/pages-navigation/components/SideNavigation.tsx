import { navigate, scrollIntoViewById } from '@ag-website-shared/utils/navigation';
import { useScrollSpy } from '@components/pages-navigation/hooks/useScrollSpy';
import { addNonBreakingSpaceBetweenLastWords } from '@utils/addNonBreakingSpaceBetweenLastWords';
import type { MarkdownHeading } from 'astro';

import styles from './SideNavigation.module.scss';

interface Props {
    headings: MarkdownHeading[];
    delayedScrollSpy?: boolean;
}

const OnThisPageIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.level1Icon}
    >
        <path d="M2.44434 12.6665H13.5554" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M2.44434 3.3335H13.5554" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M2.44434 8H7.33323" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
);

export function SideNavigation({ headings, delayedScrollSpy }: Props) {
    const menuRef = useScrollSpy({ headings, delayedScrollSpy });

    if (headings.length < 2) {
        return null;
    }

    return (
        <nav ref={menuRef} className={styles.sideNav}>
            <div>
                <ul>
                    {headings.map(({ slug, depth, text }) => (
                        <li key={slug} className={styles[`level${depth}`]}>
                            <a
                                href={`#${slug}`}
                                className="nav-link"
                                onClick={(event) => {
                                    event.preventDefault();
                                    scrollIntoViewById(slug);
                                    navigate({ search: window.location.search, hash: slug });
                                }}
                            >
                                {depth === 1 && <OnThisPageIcon />}
                                {depth === 1 ? 'On this page' : addNonBreakingSpaceBetweenLastWords(text)}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
