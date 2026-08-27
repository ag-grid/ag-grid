import { Icon } from '@ag-website-shared/components/icon/Icon';
import { replaceHistoryUrl } from '@ag-website-shared/utils/historyUrl';
import { scrollIntoViewById } from '@ag-website-shared/utils/navigation';
import { useScrollSpy } from '@components/pages-navigation/hooks/useScrollSpy';
import { addNonBreakingSpaceBetweenLastWords } from '@utils/addNonBreakingSpaceBetweenLastWords';
import type { MarkdownHeading } from 'astro';

import styles from './SideNavigation.module.scss';

interface Props {
    headings: MarkdownHeading[];
    delayedScrollSpy?: boolean;
}

export function SideNavigation({ headings, delayedScrollSpy }: Props) {
    const menuRef = useScrollSpy({ headings, delayedScrollSpy });

    if (headings.length < 2) {
        return null;
    }

    return (
        <nav ref={menuRef} className={styles.sideNav}>
            <div>
                <ul>
                    {headings.map(({ slug, depth, text }, index) => {
                        const displayText = index === 0 ? 'On this page' : text;

                        return (
                            <li key={slug} className={styles[`level${depth}`]}>
                                <a
                                    href={`#${slug}`}
                                    className="nav-link"
                                    tabIndex={0}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        scrollIntoViewById(slug);
                                        replaceHistoryUrl(`#${slug}`);
                                    }}
                                >
                                    {addNonBreakingSpaceBetweenLastWords(displayText)}
                                </a>
                            </li>
                        );
                    })}
                </ul>
                <div className={styles.backToTop}>
                    <a
                        href="#top"
                        className="nav-link"
                        tabIndex={0}
                        onClick={(event) => {
                            event.preventDefault();
                            scrollIntoViewById('top');
                            replaceHistoryUrl('#top');
                        }}
                    >
                        <Icon name="backToTop" svgClasses={styles.backToTopIcon} />
                        Back to top
                    </a>
                </div>
            </div>
        </nav>
    );
}
