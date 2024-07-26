import { Icon } from '@ag-website-shared/components/icon/Icon';
import React, { useState } from 'react';

import styles from './Examples.module.scss';
import examples from './examples.json';

const Examples: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.examplesContainer}>
                <div className={styles.cardsContainer}>
                    {examples.map((card, index) => (
                        <div key={index} className={styles.card}>
                            <img className={styles.cardImage} src={`landing-pages/examples/${card.img}`}></img>
                            <div className={styles.cardDetails}>
                                <h3>{card.title}</h3>
                                <p>{card.content}</p>
                            </div>
                            <div className={styles.cardCta}>
                                <a href={card.demo} target="_blank">
                                    Live Demo
                                </a>
                                <a href={card.docs} target="_blank">
                                    Docs
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Examples;
