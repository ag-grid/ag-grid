import { Icon } from '@ag-website-shared/components/icon';
import classNames from 'classnames';
import React, { useState } from 'react';

import { Collapsible } from '../Collapsible';
import styles from './FAQ.module.scss';

// Single FAQ item component
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Function to toggle the FAQ item's open state
    const toggleOpen = () => setIsOpen(!isOpen);

    const questionID = question.toLowerCase().replace(' ', '-').replace('?', '').substring(0, 16);

    return (
        <div className={classNames(styles.faqItem, isOpen ? styles.isOpen : '')} onClick={toggleOpen}>
            <div className={styles.question}>
                {question}
                <Icon name="chevronDownAlt" svgClasses={styles.chevronDown} />
            </div>
            <div className={styles.answer}>
                <Collapsible id={questionID} isDisabled={false} isOpen={isOpen}>
                    <div className={styles.answerContent}>{answer}</div>
                </Collapsible>
            </div>
        </div>
    );
};

// FAQ component to display a list of FAQs
const FAQ = ({ faqs }) => {
    return (
        <div className={styles.faq}>
            {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
        </div>
    );
};

export default FAQ;
