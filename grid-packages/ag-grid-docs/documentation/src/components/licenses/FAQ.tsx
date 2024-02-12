import React, { useState } from 'react';
import styles from '@design-system/modules/FAQ.module.scss';

// Single FAQ item component
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    // Function to toggle the FAQ item's open state
    const toggleOpen = () => setIsOpen(!isOpen);
  
    return (
      <div className={styles.faqItem}>
        <div className={styles.question} onClick={toggleOpen}>
          {question}

          {/* Need to remove lucide-react */}
          {/* <ChevronDown className={`${styles.chevronDown} ${isOpen ? styles.chevronOpen : ''}`} /> */}
        </div>
        <div
          className={`${styles.answer} ${isOpen ? styles.open : ''}`}
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