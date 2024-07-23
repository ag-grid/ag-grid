import { Icon } from '@ag-website-shared/components/icon/Icon';
import React, { useState } from 'react';

import styles from './Examples.module.scss';

const Examples: React.FC = () => {
    const cards = [
        {
            id: 1,
            img: 'quick-start.png',
            title: 'Quick Start',
            content:
                'Create your first React Table and learn the key concepts of AG Grid. Perfect for first-time users who are already familiar with tables.',
        },
        {
            id: 2,
            img: 'beginner-tutorial.png',
            title: 'Beginner Tutorial',
            content:
                'A step-by-step guide to creating a React Table with basic functionality and customisations, to help familiarise you with how our React Table works.',
        },
        {
            id: 2,
            title: 'Custom Components',
            content: 'Learn how to add custom components, like buttons and dropdowns, to your React Table.',
        },
        {
            id: 2,
            title: 'Integrated Charts',
            content:
                'Explore our Integrated Charts feature and build charts programatically, or let users create their own on the fly.',
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.examplesContainer}>
                <div className={styles.cardsContainer}>
                    {cards.map((card) => (
                        <div key={card.id} className={styles.card}>
                            <img className={styles.cardImage} src={`landing-pages/examples/${card.img}`}></img>
                            <div className={styles.cardDetails}>
                                <h3>{card.title}</h3>
                                <p>{card.content}</p>
                            </div>
                            <div className={styles.cardCta}>
                                <a>Source Code</a>
                                <a>Docs</a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Examples;
