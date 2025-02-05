import type { FunctionComponent } from 'react';

import styles from './features.module.scss';

interface Props {
    type: string;
}

const FeaturesSection: FunctionComponent<Props> = ({ type }) => {
    const communityFeatures = [
        {
            title: 'Data Grid Essentials',
            description: 'Row and column configurations, sorting, filtering, and pagination.',
        },
        {
            title: 'Cell Rendering',
            description: 'Custom cell rendering - use your own components inside cells.',
        },
        {
            title: 'Themes and Styling',
            description: 'Pre-built themes and CSS customization.',
        },
        {
            title: 'Accessibility Support',
            description: 'ARIA support and keyboard navigation.',
        },
        {
            title: 'Performance Optimisations',
            description: 'Column and row virtualization enabled by default.',
        },
        {
            title: 'Major Frameworks',
            description: 'Support for React, Angular and Vue, in addition to vanilla JavaScript.',
        },
    ];

    const enterpriseFeatures = [
        {
            title: 'Server-Side Row Model',
            description: 'Efficiently handle large datasets by loading data on-demand from the server.',
        },
        {
            title: 'Excel Export',
            description: 'Advanced export options, including styles and formulas.',
        },
        {
            title: 'Pivot Tables & Aggregations',
            description: 'Built-in pivot and aggregation capabilities for complex data analysis.',
        },
        {
            title: 'Range Selection',
            description: 'Select and manipulate ranges of data.',
        },
        {
            title: 'Integrated Charts',
            description: 'Create and customize charts directly within the grid.',
        },
        {
            title: 'Master/Detail View',
            description: 'Nested grid views for hierarchical data representation.',
        },
        {
            title: 'Row Grouping & Multi-Column Sorting',
            description: 'Advanced grouping and sorting options for better data organization.',
        },
        {
            title: 'Clipboard Operations',
            description: 'Enhanced copy and paste functionality, including support for Excel-like behaviour.',
        },
        {
            title: 'Tool Panels',
            description: 'Built-in configuration panels for columns and filters, or create your own custom panels.',
        },
        {
            title: 'Custom Context Menu & Sidebars',
            description: 'Additional UI elements for enhanced user interaction and customization.',
        },
    ];

    return (
        <div className={styles.container}>
            {type === 'community'
                ? communityFeatures.map((feature, index) => (
                      <div key={index} className={styles.card}>
                          <div className={styles.titleIcon}>
                              <h4 className={styles.title}>{feature.title}</h4>
                          </div>
                          <p className={styles.description}>{feature.description}</p>
                      </div>
                  ))
                : enterpriseFeatures.map((feature, index) => (
                      <div key={index} className={styles.card}>
                          <div className={styles.titleIcon}>
                              <h4 className={styles.title}>{feature.title}</h4>
                          </div>
                          <p className={styles.description}>{feature.description}</p>
                      </div>
                  ))}
        </div>
    );
};

export default FeaturesSection;
