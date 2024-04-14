import { quotesData } from '@components/quotes/quotesData';
import classNames from 'classnames';
import React from 'react';

import styles from './SocialProof.module.scss';

const CellsIllustration = () => {
    return (
        <div className={styles.cellsIllustration}>
            <span className={styles.cellOne}></span>
            <span className={styles.cellTwo}></span>
        </div>
    );
};

const Quote = ({ quoteData }) => {
    return (
        <div className={styles.quote}>
            <blockquote>
                <p>{quoteData.text}</p>
            </blockquote>

            <footer>
                <img className={styles.avatar} src={`../${quoteData.avatarUrl}`} alt={quoteData.name} />
                <div>
                    <h4 className={classNames(styles.name, 'text-lg')}>{quoteData.name}</h4>
                    <p className={classNames(styles.role, 'text-base')}>
                        {quoteData.orgRole} {quoteData.orgName}
                    </p>
                </div>
                <img className={styles.orgIcon} src={`../${quoteData.orgIconUrl}`} alt={quoteData.orgName} />
            </footer>
        </div>
    );
};

const SocialProof = () => {
    return (
        <div className={classNames(styles.socialProof, 'text-lg')}>
            <div className={styles.header}>
                <CellsIllustration />
                <p>For developers, by developers</p>
                <h3 className="text-2xl">Join the AG Grid community</h3>
            </div>

            <div className={styles.statsOuter}>
                <div className={styles.stat}>
                    <h4 className="text-2xl">90%</h4>
                    <p>Of the Fortune 500 use AG Grid</p>
                </div>

                <div className={styles.stat}>
                    <h4 className="text-2xl">1M+</h4>
                    <p>Weekly NPM downloads</p>
                </div>

                <div className={styles.stat}>
                    <h4 className="text-2xl">12k</h4>
                    <p>Stars on GitHub</p>
                </div>

                <div className={styles.stat}>
                    <h4 className="text-2xl">150+</h4>
                    <p>Contributors</p>
                </div>
            </div>

            <div className={styles.advocates}>
                <Quote quoteData={quotesData.tannerLinsley} />
                <Quote quoteData={quotesData.brianLove} />
            </div>

            <div className={styles.footer}>
                <CellsIllustration />
            </div>
        </div>
    );
};

export default SocialProof;
