import { useScrollSpy } from '@features/pages-navigation/hooks/useScrollSpy';
import styles from '@legacy-design-system/modules/SideNavigation.module.scss';
import { addNonBreakingSpaceBetweenLastWords } from '@utils/addNonBreakingSpaceBetweenLastWords';
import { navigate, scrollIntoViewById } from '@utils/navigation';
import type { MarkdownHeading } from 'astro';

interface Props {
    headings: MarkdownHeading[];
}

export function SideNavigation({ headings }: Props) {
    const menuRef = useScrollSpy({ headings });

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
