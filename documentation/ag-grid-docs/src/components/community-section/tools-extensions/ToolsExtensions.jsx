import { Icon } from '@components/icon/Icon';
import styles from '@design-system/modules/community-section/ToolsExtensions.module.scss';
import React, { useEffect, useReducer, useState } from 'react';

import tools from '../../../content/community/tools-extensions.json';

const frameworks = [
    'React',
    'JavaScript',
    'TypeScript',
    'Angular',
    'Vue',
    'Python',
    'Svelte',
    'Laravel',
    '.NET',
    'Rust',
];

const ToolsExtensions = ({ limit = -1 }) => {
    const applyLimit = (arr) => arr?.slice(0, limit == -1 ? tools.length : limit);
    const filterFrameworks = (framework) => {
        let filter = framework ? tools.filter((item) => item.frameworks?.includes(framework)) : tools;
        setSelectedFramework(framework);
        setFilteredTools(applyLimit(filter));
    };

    const [filteredTools, setFilteredTools] = useState(applyLimit(tools));
    const [selectedFramework, setSelectedFramework] = useState();

    return (
        <div className={styles.container}>
            <div>
                <div className={styles.filterPanel}>
                    <div className={styles.filterButtonContainer}>
                        {/* Default / Reset Filter */}
                        <button
                            className={styles.filterButton}
                            {...(!selectedFramework ? { active: 'true' } : {})}
                            onClick={() => filterFrameworks(null)}
                        >
                            <Icon alt={`... logo`} name="listBoxes" svgClasses={styles.filterIcon} />
                            All
                        </button>

                        {/* Display all frameworks */}
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

            <div className={styles.listContainer}>
                {filteredTools.map(
                    (tool, index) =>
                        (!selectedFramework || tool.frameworks?.includes(selectedFramework)) && (
                            <a href={tool.link} target="_blank" className={styles.linkWrapper}>
                                <div key={index} className={styles.itemContainer}>
                                    <div className={styles.image}>
                                        <img src={`/community/tools-extensions/${tool.img || 'sample.png'}`} />
                                    </div>
                                    <div className={styles.content}>
                                        <div className={styles.toolHeader}>
                                            <span className={styles.title}>
                                                {tool.title}
                                            </span>
                                            {tool.repo && (
                                                <a target="_blank" href={tool.repo}>
                                                    <div className={styles.logoContainer}>
                                                        <Icon
                                                            alt={`GitHub logo`}
                                                            name="github"
                                                            svgClasses={styles.githubIcon}
                                                        />
                                                    </div>
                                                </a>
                                            )}
                                        </div>
                                        <span className={styles.description}>
                                            {tool.description}
                                        </span>
                                        <div className={styles.tagContainer}>
                                            {tool?.frameworks?.map((framework, index) => (
                                                <span key={index} className={styles.tag}>
                                                    <img
                                                        src={`/community/frameworks/${framework.toLowerCase()}.svg`}
                                                        className={styles.frameworkLogo}
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
                    )
                }   
            </div>
        </div>
    );
};

export default ToolsExtensions;
