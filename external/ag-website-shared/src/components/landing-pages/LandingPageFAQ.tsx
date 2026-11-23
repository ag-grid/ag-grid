import { Collapsible } from '@ag-website-shared/components/collapsible/Collapsible';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import { useId, useState } from 'react';
import type { FunctionComponent } from 'react';

import styles from './LandingPageFAQ.module.scss';
import type { RenderedFAQItem } from './renderFAQAnswers';

const DEFAULT_ANALYTICS_EVENT_NAME = 'react-table-expand-faq';

interface FAQItemProps {
    itemData: RenderedFAQItem;
    isOpen: boolean;
    onClick: () => void;
    analyticsEventName: string;
}

interface Props {
    FAQData: RenderedFAQItem[];
    /** Plausible tagged-event name recorded when a question is expanded. */
    analyticsEventName?: string;
}

const FAQItem: FunctionComponent<FAQItemProps> = ({ itemData, isOpen, onClick, analyticsEventName }) => {
    const answerId = useId();

    return (
        <div className={classnames(styles.questionContainer, `plausible-event-name=${analyticsEventName}`)}>
            <button
                type="button"
                className={classnames('button-style-none', styles.titleContainer)}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={onClick}
            >
                <span className={styles.question}>{itemData.question}</span>
                <Icon svgClasses={classnames(styles.expandIcon, { [styles.iconDown]: isOpen })} name={'chevronRight'} />
            </button>

            <Collapsible id={answerId} isOpen={isOpen} ariaHidden={!isOpen}>
                <div className={styles.answerContainer} dangerouslySetInnerHTML={{ __html: itemData.answerHtml }} />
            </Collapsible>
        </div>
    );
};

export const LandingPageFAQ: FunctionComponent<Props> = ({
    FAQData,
    analyticsEventName = DEFAULT_ANALYTICS_EVENT_NAME,
}) => {
    const [activeItemIndex, setActiveItemIndex] = useState(-1);

    const clickHandler = (activeIndex: number) => {
        setActiveItemIndex(activeIndex !== activeItemIndex ? activeIndex : -1);
    };

    const getColumnItems = (columnIndex: number) => {
        return FAQData.map((item, i) => {
            if (i % 2 !== columnIndex) return;

            return (
                <FAQItem
                    itemData={item}
                    key={i}
                    isOpen={activeItemIndex === i}
                    onClick={() => {
                        clickHandler(i);
                    }}
                    analyticsEventName={analyticsEventName}
                />
            );
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.column}> {getColumnItems(0)}</div>
            <div className={styles.column}> {getColumnItems(1)}</div>
        </div>
    );
};
