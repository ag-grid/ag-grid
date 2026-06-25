import Card from '@ag-website-shared/components/card/Card';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import Pill from '@ag-website-shared/components/pill/Pill';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';
import React, { useState } from 'react';

import type { RoadmapItem } from '../../types';
import styles from './RoadmapCard.module.scss';

interface RoadmapCardProps {
    data: RoadmapItem;
    framework: string;
    dimmed?: boolean;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({
    data: { id, title, desc, why, status, link },
    framework,
    dimmed,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const colorMap: Record<string, 'blue' | 'green' | 'yellow'> = {
        'in-progress': 'blue',
        shipped: 'green',
        planned: 'yellow',
    };

    return (
        <Card
            key={id}
            aria-label={title}
            className={classnames(styles.roadmapItem, {
                [styles.expanded]: isExpanded,
                [styles.dimmed]: dimmed,
            })}
            onClick={() => {
                if (why) {
                    setIsExpanded(!isExpanded);
                }
            }}
        >
            <span className={styles.itemHeader}>
                <h5 className={styles.cardTitle}>{title}</h5>
                {why && <Icon name="chevronDown" svgClasses={isExpanded ? 'expand-icon expanded' : 'expand-icon'} />}
            </span>
            <span className={styles.itemId}>{id}</span>
            <p className={styles.cardDescription}>{desc}</p>
            {why ? (
                <span className={styles.why}>
                    <span className={styles.whyContent}>
                        <h6>Why are we building this?</h6>
                        <p className={styles.whyText}>{why}</p>
                    </span>
                </span>
            ) : null}
            <div className={styles.bottomRow}>
                <Pill className={styles.status} color={colorMap[status] || 'blue'} text={status.replace(/-/g, ' ')} />
                {link ? (
                    <a
                        href={urlWithPrefix({ url: link, framework: framework })}
                        onClick={(e) => e.stopPropagation()}
                        className={styles.readmoreLink}
                        target="_blank"
                        title={`Read more about ${title}`}
                    >
                        View Docs <Icon name="chevronRight" />
                    </a>
                ) : null}
            </div>
        </Card>
    );
};
