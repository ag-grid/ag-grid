import { Icon } from '@ag-website-shared/components/icon/Icon';
import React, { useState } from 'react';

import styles from './Faqs.module.scss';
import faqs from './faqs.json';

const Faqs: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(-1);

    const handleToggle = (index: number) => {
        setActiveIndex(activeIndex === index ? -1 : index);
    };

    const midIndex = Math.ceil(faqs.length / 2);
    const firstColumnFaqs = faqs.slice(0, midIndex);
    const secondColumnFaqs = faqs.slice(midIndex);

    const linkMap = {
        'AG Grid Community': 'https://www.ag-grid.com/react-data-grid/getting-started/',
        'AG Grid Enterprise': 'https://www.ag-grid.com/license-pricing/',
        'React Charts': 'https://www.ag-grid.com/charts/react/quick-start/',
        'AG Charts': 'https://www.ag-grid.com/charts/',
        'AG Grid licence': 'https://www.ag-grid.com/license-pricing/',
        'Pricing page': 'https://www.ag-grid.com/license-pricing/',
        themes: 'https://www.ag-grid.com/react-data-grid/themes/',
        'Theme Builder': 'https://www.ag-grid.com/theme-builder/',
    };

    // Function to update FAQ json with links
    const createLinkedText = (text: string, linkMap: Record<string, string>) => {
        const elements: React.ReactNode[] = [];
        let remainingText = text;
        Object.keys(linkMap).forEach((term) => {
            const url = linkMap[term];
            const parts = remainingText.split(term);
            if (parts.length > 1) {
                elements.push(parts.shift());
                elements.push(
                    <a href={url} target="_blank" rel="noopener noreferrer" key={url}>
                        {term}
                    </a>
                );
                remainingText = parts.join(term);
            }
        });
        elements.push(remainingText);
        return elements;
    };

    return (
        <div className={styles.container}>
            <div className={styles.column}>
                {firstColumnFaqs.map((faq, index) => (
                    <React.Fragment key={index}>
                        <div
                            className={`${styles.questionContainer} plausible-event-name=react-table-expand-faq`}
                            onClick={() => handleToggle(index)}
                        >
                            <div className={styles.titleContainer}>
                                <span className={styles.question}>{faq.question}</span>
                                <Icon
                                    svgClasses={styles.expandIcon}
                                    name={activeIndex === index ? 'chevronDown' : 'chevronRight'}
                                />
                            </div>
                            {activeIndex === index && (
                                <div className={styles.answerContainer}>{createLinkedText(faq.answer, linkMap)}</div>
                            )}
                        </div>
                        <hr />
                    </React.Fragment>
                ))}
            </div>
            <div className={styles.column}>
                {secondColumnFaqs.map((faq, index) => (
                    <React.Fragment key={index + midIndex}>
                        <div
                            className={`${styles.questionContainer} plausible-event-name=react-table-expand-faq`}
                            onClick={() => handleToggle(index + midIndex)}
                        >
                            <div className={styles.titleContainer}>
                                <span className={styles.question}>{faq.question}</span>
                                <Icon
                                    svgClasses={styles.expandIcon}
                                    name={activeIndex === index + midIndex ? 'chevronDown' : 'chevronRight'}
                                />
                            </div>
                            {activeIndex === index + midIndex && (
                                <div className={styles.answerContainer}>{createLinkedText(faq.answer, linkMap)}</div>
                            )}
                        </div>
                        <hr />
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Faqs;
