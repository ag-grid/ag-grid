import styles from '@design-system/modules/community-section/ToolsExtensions.module.scss';
import React from 'react';
import { Icon } from '@components/icon/Icon';
import tools from '../../../content/community/tools-extensions.json';

const FilterPanel = () => {
    return <></>;
};

const List = () => {
    return <></>;
};

const ToolsExtensions = () => {
    return (
        <div className={styles.container}>
            <div className={styles.filterContainer}>
                <div className={styles.filterPanel}>
                    <div className={styles.header}>
                        <span className={styles.title}>Filters</span>
                        <hr className={styles.divider} />
                    </div>
                    <div className={styles.body}>
                        <div className={styles.filterSection}>
                            <div className={styles.filterButtonContainer}>
                                <button className={styles.filterButton}><img src="/community/frameworks/javascript.svg" />Javascript</button>
                                <button className={styles.filterButton}><img src="/community/frameworks/typescript.svg" />Typescript</button>
                                <button className={styles.filterButton}><img src="/community/frameworks/react.svg" />React</button>
                                <button className={styles.filterButton}><img src="/community/frameworks/angular.svg" />Angular</button>
                                <button className={styles.filterButton}><img src="/community/frameworks/vue.svg" />Vue</button>
                                <button className={styles.filterButton}><img src="/community/frameworks/solid.svg" />Solid</button>
                                <button className={styles.filterButton}><img src="/community/frameworks/python.svg" />Python</button>
                                <button className={styles.filterButton}><img src="/community/frameworks/svelte.svg" />Svelte</button>
                                <button className={styles.filterButton}><img src="/community/frameworks/dot-net.svg" />.NET</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.listContainer}>
                {tools.map((tool, index) => (
                    tool.type != "Integration" &&
                    <div key={index} className={styles.itemContainer}>
                        <div className={styles.image}>
                            <img src={`/community/tools-extensions/${tool.img || "sample.png" }`} />
                        </div>
                        <div className={styles.content}>
                            <div className={styles.header}>
                                <span className={styles.title}>{tool.title}</span>
                            </div>
                            <span className={styles.description}>{tool.description}</span>
                            <div className={styles.tagContainer}>
                                {tool?.tags?.map((tag, index) => (
                                    <span className={styles.tag}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ToolsExtensions;
