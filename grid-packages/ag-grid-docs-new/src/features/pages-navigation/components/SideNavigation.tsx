import styles from '@design-system/modules/SideNavigation.module.scss';
import { useScrollSpy } from '@features/pages-navigation/hooks/useScrollSpy';
import { addNonBreakingSpaceBetweenLastWords } from '@utils/addNonBreakingSpaceBetweenLastWords';
import { navigate, scrollIntoViewById } from '@utils/navigation';
import type { MarkdownHeading } from 'astro';
import { type RefObject, useEffect } from 'react';

interface Props {
    headings: MarkdownHeading[];
}

/**
 * Remove nav links of headings that are not shown
 *
 * This can happen when the markdoc uses variables within `if` tags, that are not processed
 * when `headings` are created.
 *
 * @see https://github.com/withastro/astro/blob/63b3cd19ee5d3f9616d6d748a6438e314b25b660/packages/integrations/markdoc/src/runtime.ts#L173-L175
 */
function useRemoveHiddenHeadings({
    headings,
    menuRef,
}: {
    headings: MarkdownHeading[];
    menuRef: RefObject<HTMLElement>;
}) {
    useEffect(() => {
        if (!menuRef?.current) {
            return;
        }
        const hiddenHeadings = headings.filter(({ slug }) => {
            return !document.getElementById(slug);
        });

        hiddenHeadings.forEach(({ slug }) => {
            const navHeading = menuRef.current!.querySelector(`a[href='#${slug}']`);
            if (!navHeading) {
                return;
            }
            const navHeadingContainer = navHeading.parentElement;
            navHeadingContainer?.classList.add(styles.hidden);
        });
    }, [headings, menuRef?.current]);
}

export function SideNavigation({ headings }: Props) {
    const menuRef = useScrollSpy({ headings });

    useRemoveHiddenHeadings({ headings, menuRef });

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
                                    navigate({ hash: slug });
                                }}
                            >
                                {addNonBreakingSpaceBetweenLastWords(text)}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
