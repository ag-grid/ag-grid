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

const BackToTopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" className={styles.backToTopIcon}>
        <path
            fill="currentColor"
            d="m11 7.825l-4.9 4.9q-.3.3-.7.288t-.7-.313q-.275-.3-.288-.7t.288-.7l6.6-6.6q.15-.15.325-.212T12 4.425t.375.063t.325.212l6.6 6.6q.275.275.275.688t-.275.712q-.3.3-.712.3t-.713-.3L13 7.825V19q0 .425-.288.713T12 20t-.712-.288T11 19z"
        />
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
                                {depth === 1 ? 'On this page' : addNonBreakingSpaceBetweenLastWords(text)}
                            </a>
                        </li>
                    ))}
                </ul>
                <div className={styles.backToTop}>
                    <a
                        href="#top"
                        className="nav-link"
                        onClick={(event) => {
                            event.preventDefault();
                            scrollIntoViewById('top');
                            navigate({ search: window.location.search, hash: 'top' });
                        }}
                    >
                        <BackToTopIcon />
                        Back to top
                    </a>
                </div>
            </div>
        </nav>
    );
}
