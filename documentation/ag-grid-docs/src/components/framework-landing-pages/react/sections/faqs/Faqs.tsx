import React, { useState } from 'react';

import styles from './Faqs.module.scss';
import faqs from './faqs.json';

const Faqs: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(-1);
    const handleToggle = (index: number) => {
        setActiveIndex(activeIndex === index ? -1 : index);
    };

    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <img
                    src="/landing-pages/misc/faqs-illustration.png"
                    alt="React Table FAQs Illustration"
                    className={styles.image}
                />
            </div>
            <div className={styles.listContainer}>
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className={`${styles.faqItem} ${activeIndex === index ? styles.active : ''}`}
                        onClick={() => handleToggle(index)}
                    >
                        <div className={styles.questionContainer}>
                            <div className={styles.questionIndex}>0{index + 1}</div>
                            <div className={styles.questionText}>{faq.question}</div>
                            <div className={styles.questionIcon}>{activeIndex === index ? '-' : '+'}</div>
                        </div>
                        <div className={styles.answersContainer}>
                            <div className={styles.faqAnswer}>{faq.answer}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Faqs;
