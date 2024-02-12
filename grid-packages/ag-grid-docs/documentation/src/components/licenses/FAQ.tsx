import classNames from 'classnames';
import React, { useState } from 'react';
import styles from '@design-system/modules/FAQ.module.scss';
import { Icon } from '../Icon';

// Single FAQ item component
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    // Function to toggle the FAQ item's open state
    const toggleOpen = () => setIsOpen(!isOpen);
  
    return (
        <div className={classNames(styles.faqItem, isOpen ? styles.isOpen : '')}>
            <div className={styles.question} onClick={toggleOpen}>
                {question}
                <Icon name="chevronDownAlt" svgClasses={styles.chevronDown}/>
            </div>
            <div
                className={styles.answer}
                style={{ maxHeight: isOpen ? '1000px' : '0' }}
            >
                <div className={styles.answerContent}>{answer}</div>
            </div>
        </div>
    );
  };

// FAQ component to display a list of FAQs
const FAQ = ({ faqs }) => {
    return (
        <div className="faq">
            {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
        </div>
    );
};

export default FAQ;