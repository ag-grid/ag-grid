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

    return (
        <div className={styles.container}>
            <div className={styles.column}>
                {firstColumnFaqs.map((faq, index) => (
                    <React.Fragment key={index}>
                        <div className={styles.questionContainer} onClick={() => handleToggle(index)}>
                            <div className={styles.titleContainer}>
                                <span className={styles.question}>{faq.question}</span>
                                <Icon
                                    svgClasses={styles.expandIcon}
                                    name={activeIndex === index ? 'chevronDown' : 'chevronRight'}
                                />
                            </div>
                            {activeIndex === index && <div className={styles.answerContainer}>{faq.answer}</div>}
                        </div>
                        <hr />
                    </React.Fragment>
                ))}
            </div>
            <div className={styles.column}>
                {secondColumnFaqs.map((faq, index) => (
                    <React.Fragment key={index + midIndex}>
                        <div className={styles.questionContainer} onClick={() => handleToggle(index + midIndex)}>
                            <div className={styles.titleContainer}>
                                <span className={styles.question}>{faq.question}</span>
                                <Icon
                                    svgClasses={styles.expandIcon}
                                    name={activeIndex === index + midIndex ? 'chevronDown' : 'chevronRight'}
                                />
                            </div>
                            {activeIndex === index + midIndex && (
                                <div className={styles.answerContainer}>{faq.answer}</div>
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
