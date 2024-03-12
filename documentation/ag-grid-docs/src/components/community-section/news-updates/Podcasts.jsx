import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import styles from '@design-system/modules/CommunityPodcasts.module.scss';
import { Icon } from '@components/icon/Icon';

import React from 'react';

import podcasts from '../../../content/community/news-updates/podcasts.json';

// Register AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const Podcasts = () => {
  const guestsToString = (arr) => {
    if (!arr.length) return '';
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(', ') + ' & ' + arr[arr.length - 1];
  };

    return (
        <>
            <div className={styles.container}>
                {podcasts.map((podcast, index) => (
                    <a href={podcast.website} target='_blank' className={styles.podcastContainer} key={index}>
                        <div className={styles.podcastDetailsContainer}>
                            <div className={styles.titleContainer}>
                                <span className={styles.title}>{podcast.title}</span>
                                <span className={styles.published}>{podcast.published}</span>
                            </div>
                          <span className={styles.description}>{podcast.description}</span>
                          <div className={styles.creditsContainer}>
                            <img className={styles.publicationLogo} src={`/community/podcasts/${podcast.publicationLogo}`} />
                            <span className={styles.publication}>{podcast.publication}</span>
                            <span>|</span>
                            <span className={styles.host}>{podcast.host}</span>
                            <span>|</span>
                            <span className={styles.guests}>{guestsToString(podcast.guests)}</span>
                          </div>
                        </div>
                        <div className={styles.podcastPlayerContainer}>
                          <audio controls src={podcast.link}>
                              Your browser does not support the audio element.
                          </audio>
                        </div>
                    </a>
                ))}
            </div>
        </>
    );
};

export default Podcasts;
