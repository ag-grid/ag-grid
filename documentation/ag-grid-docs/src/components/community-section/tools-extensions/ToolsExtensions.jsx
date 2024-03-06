import { Icon } from '@components/icon/Icon';
import styles from '@design-system/modules/community-section/ToolsExtensions.module.scss';
import React, { useEffect, useReducer, useState } from 'react';

import tools from '../../../content/community/tools-extensions.json';

const FilterPanel = () => {
    return <></>;
};

const List = () => {
    return <></>;
};

const ToolsExtensions = ({ limit = -1 }) => {
    const [filteredTools, setFilteredTools] = useState(tools);
    const [selectedFramework, setSelectedFramework] = useState();
    const frameworks = [
        'JavaScript',
        'TypeScript',
        'React',
        'Angular',
        'Vue',
        'Python',
        'Svelte',
        'Laravel',
        '.NET',
        'Rust',
    ];

    const filterFrameworks = (framework) => {
        let filter = framework ? tools.filter((item) => item.frameworks?.includes(framework)) : tools;
        setSelectedFramework(framework);
        setFilteredTools(filter);
    };

    return (
        <div className={styles.container}>
            <div className={styles.filterContainer}>
                <div className={styles.filterPanel}>
                    <div className={styles.header}>
                        {/* <span className={styles.title}>Filters</span> */}
                        {selectedFramework && (
                            <img
                                onClick={() => filterFrameworks(null)}
                                className={styles.img}
                                src={'/community/tools-extensions/clear-filter.svg'}
                            />
                        )}
                    </div>
                    <div className={styles.body}>
                        <div className={styles.filterSection}>
                            <div className={styles.filterButtonContainer}>
                                {frameworks.map((framework, index) => (
                                    <button
                                        className={styles.filterButton}
                                        {...(selectedFramework === framework ? { active: 'true' } : {})}
                                        onClick={() => filterFrameworks(framework)}
                                    >
                                        <img
                                            src={`/community/frameworks/${framework.toLowerCase()}.svg`}
                                            alt={`${framework}`}
                                        />
                                        {framework}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.listContainer}>
                {filteredTools.slice(0, limit == -1 ? tools.length : limit).map(
                    (tool, index) =>
                        (selectedFramework == undefined || tool.frameworks?.includes(selectedFramework)) && (
                            <a href={tool.link} className={styles.linkWrapper}>
                                <div key={index} className={styles.itemContainer}>
                                    <div className={styles.image}>
                                        <img src={`/community/tools-extensions/${tool.img || 'sample.png'}`} />
                                    </div>
                                    <div className={styles.content}>
                                        <div className={styles.header}>
                                            <span className={styles.title}>{tool.title}</span>
                                            <div className={styles.logoContainer}>
                                                {tool.repo && (
                                                    <a href={tool.repo}>
                                                        <img
                                                            src={`/community/support/github-white.svg`}
                                                            className={styles.frameworkLogo}
                                                        />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <span className={styles.description}>{tool.description}</span>
                                        <div className={styles.tagContainer}>
                                            {tool?.frameworks?.map((framework, index) => (
                                                <span key={index} className={styles.tag}>
                                                    <img
                                                        src={`/community/frameworks/${framework.toLowerCase()}.svg`}
                                                        style={{ width: 18, height: 18, marginRight: 6 }}
                                                    />
                                                    {framework}
                                                </span>
                                            ))}
                                            {tool?.tags?.map((tag, index) => (
                                                <span key={index} className={styles.tag}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </a>
                        )
                )}
            </div>
        </div>
    );
};

export default ToolsExtensions;
