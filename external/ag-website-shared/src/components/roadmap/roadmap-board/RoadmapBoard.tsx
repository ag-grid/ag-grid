import ButtonGroup, { type ButtonType } from '@ag-website-shared/components/button-group/ButtonGroup';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import classnames from 'classnames';
import React, { useState } from 'react';

import type { RoadmapItem } from '../types';
import styles from './RoadmapBoard.module.scss';
import { RoadmapCard } from './roadmap-card/RoadmapCard';

interface RoadmapBoardProps {
    roadmapData: {
        items: RoadmapItem[];
    };
}

export const RoadmapBoard: React.FC<RoadmapBoardProps> = ({ roadmapData: { items } }) => {
    const [filter, setFilter] = useState<'all' | 'planned' | 'in-progress' | 'shipped'>('all');
    const framework = useFrameworkFromStore();

    const groupedByQuarter = items.reduce<Record<string, RoadmapItem[]>>((acc, item) => {
        const key = String(item.q);
        (acc[key] ??= []).push(item);
        return acc;
    }, {});

    const statusList = [...new Set(items.map((item) => item.status))];

    const filterButtons: ButtonType[] = [
        {
            text: 'All',
            onClick: () => setFilter('all'),
            className: classnames(styles.all, {
                [styles.hasPlanned]: statusList.includes('planned'),
                [styles.hasInprogress]: statusList.includes('in-progress'),
                [styles.hasShipped]: statusList.includes('shipped'),
            }),
            active: filter === 'all',
        },
        ...statusList.map((status) => ({
            text: status.replace(/-/g, ' '),
            onClick: () => setFilter(status),
            className: styles[status.replace(/-/g, '')],
            active: filter === status,
        })),
    ];

    return (
        <section className={styles.roadmapSection}>
            <ButtonGroup buttons={filterButtons} preText="Filter by status" className={styles.filters} />
            <section className={styles.swimlanesContainer}>
                <div className={styles.swimlanes}>
                    {Object.entries(groupedByQuarter).map(([quarter, quarterItems]) => (
                        <div key={quarter} className={styles.swimlane}>
                            <div className={styles.swimlaneHeader}>
                                <span>
                                    Q{quarter} {new Date().getFullYear().toString()}
                                </span>
                                <span className={styles.featureCount}>
                                    {quarterItems.length} feature{quarterItems.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className={styles.swimlaneCards}>
                                {quarterItems.map((item) => (
                                    <RoadmapCard
                                        key={item.id}
                                        data={item}
                                        framework={framework}
                                        dimmed={filter !== 'all' && item.status !== filter}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </section>
    );
};
