import { navigate, scrollIntoViewById } from '@ag-website-shared/utils/navigation';
import { useScrollSpy } from '@components/pages-navigation/hooks/useScrollSpy';
import { addNonBreakingSpaceBetweenLastWords } from '@utils/addNonBreakingSpaceBetweenLastWords';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { useEffect, useState } from 'react';
import type { MarkdownHeading } from 'astro';

import styles from './SideNavigation.module.scss';

interface Props {
    headings: MarkdownHeading[];
    delayedScrollSpy?: boolean;
}

export function SideNavigation({ headings, delayedScrollSpy }: Props) {
    const menuRef = useScrollSpy({ headings, delayedScrollSpy });
    const [iconSvg, setIconSvg] = useState<string>('');

    useEffect(() => {
        fetch(urlWithBaseUrl('/images/on-this-page-icon.svg'))
            .then((res) => res.text())
            .then((svg) => setIconSvg(svg))
            .catch(() => {
                // Fallback if fetch fails
            });
    }, []);

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
                                {depth === 1 && iconSvg && (
                                    <span
                                        className={styles.level1Icon}
                                        dangerouslySetInnerHTML={{ __html: iconSvg }}
                                    />
                                )}
                                {depth === 1 ? 'On this page' : addNonBreakingSpaceBetweenLastWords(text)}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
