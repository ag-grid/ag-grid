import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classNames from 'classnames';

import styles from './Quotes.module.scss';
import type { QuotesData, QuotesDataItem } from './quotesData';
import { getOrderedQuotes, statsData } from './quotesData';

const QuoteItems = ({ quotes }: { quotes: QuotesDataItem[] }) => {
    return (
        <>
            {quotes.map(({ name, avatarUrl, orgName, orgIconUrl, orgRole, text }) => {
                return (
                    <div className={styles.quote} key={name}>
                        <blockquote>
                            <p>{text}</p>
                        </blockquote>

                        <footer>
                            <img className={styles.avatar} src={urlWithBaseUrl(avatarUrl)} alt={name} />
                            <div>
                                <h4 className={classNames(styles.name, 'text-lg')}>{name}</h4>
                                <p className={classNames(styles.role, 'text-base')}>
                                    {orgRole} {orgName}
                                </p>
                            </div>
                            <img className={styles.orgIcon} src={urlWithPrefix({ url: orgIconUrl })} alt={orgName} />
                        </footer>
                    </div>
                );
            })}
        </>
    );
};

export const Quotes = ({ data }: { data: QuotesData }) => {
    const quotes = getOrderedQuotes(data);

    return (
        <div>
            <div className={styles.statsOuter}>
                {statsData.map(({ value, label }) => (
                    <div className={styles.stat} key={label}>
                        <h4 className="text-2xl">{value}</h4>
                        <p>{label}</p>
                    </div>
                ))}
            </div>

            <ul className={classNames(styles.container, 'list-style-none')}>
                <QuoteItems quotes={quotes} />
            </ul>
        </div>
    );
};
