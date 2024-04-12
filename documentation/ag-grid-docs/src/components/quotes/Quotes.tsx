import styles from '@legacy-design-system/modules/Quotes.module.scss';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classNames from 'classnames';

import type { QuotesData, QuotesDataItem } from './quotesData';

function filterAndSortByKey(data: QuotesData, sortKey: keyof QuotesDataItem) {
    return Object.values(data)
        .filter((d) => {
            const value = d[sortKey];
            return value !== undefined && value >= 0;
        })
        .sort((a, b) => {
            return a[sortKey]! - b[sortKey]!;
        });
}

const QuoteItems = ({ quotes }: { quotes: QuotesDataItem[] }) => {
    return (
        <>
            {quotes.map(({ name, avatarUrl, orgName, orgIconUrl, orgRole, text }) => {
                return (
                    <li key={name}>
                        <figure>
                            <blockquote>
                                <svg
                                    className={styles.quoteBubbleTail}
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 18 22"
                                >
                                    <path d="M0 21V0h18L1.8 21.6c-.577.769-1.8.361-1.8-.6Z" />
                                </svg>

                                <p>{text}</p>
                            </blockquote>
                            <figcaption>
                                <img
                                    className={styles.avatar}
                                    title={name}
                                    src={urlWithBaseUrl(avatarUrl)}
                                    alt={name}
                                />
                                <span className={classNames(styles.name, 'text-xl', 'text-bold')}>{name}</span>
                                <div className={styles.orgContainer}>
                                    <span className="text-xs text-secondary">{orgRole}</span>
                                    <img
                                        className={styles.orgIcon}
                                        title={orgName}
                                        src={urlWithBaseUrl(orgIconUrl)}
                                        alt={orgName}
                                    />
                                    <span className="text-xs">{orgName}</span>
                                </div>
                            </figcaption>
                        </figure>
                    </li>
                );
            })}
        </>
    );
};

export const Quotes = ({ data }: { data: QuotesData }) => {
    const quotes = filterAndSortByKey(data, 'order');

    return (
        <ul className={classNames(styles.container, 'list-style-none')}>
            <QuoteItems quotes={quotes} />
        </ul>
    );
};
