import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import styles from '@design-system/modules/community-section/news-updates/Podcasts.module.scss';
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

    const colDefs = [
        {
            field: 'link',
            headerName: '',
            cellRenderer: PodcastPlayerRenderer,
            autoHeight: true,
            cellStyle: {
                'vertical-align': 'middle',
            },
        },
        {
            field: 'title',
            cellStyle: {
                padding: '8px',
                'white-space': 'normal',
                'line-height': '1.5', // Adjust the line-height as needed for minimal spacing
            },
            autoHeight: true, // Enable auto height for the cell to accommodate wrapped content
        },
        {
            field: 'description',
            cellStyle: {
                padding: '8px',
                'white-space': 'normal',
                'line-height': '1.5', // Adjust the line-height as needed for minimal spacing
            },
            autoHeight: true, // Enable auto height for the cell to accommodate wrapped content
        },
        {
            field: 'guests',
            valueFormatter: (p) => {
                p.value.map((guest) => {
                    return guest;
                });
            },
            cellStyle: {
                'vertical-align': 'middle',
            },
        },
        { field: 'published', headerName: 'Released' },
        { field: 'host' },
        { field: 'publication' },
    ];

    return (
        <>
            <div className={styles.container}>
                {podcasts.map((podcast, index) => (
                    <>
                        <div className={styles.podcastContainer}>
                            <div className={styles.podcastDetailsContainer}>
                              <span className={styles.published}>{podcast.published}</span>
                              <span className={styles.title}>{podcast.title}</span>
                              <span className={styles.description}>{podcast.description}</span>
                              <div className={styles.creditsContainer}>
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
                        </div>
                        {index != podcasts.length - 1 && <hr className={styles.divider} />}
                    </>
                ))}
            </div>
            {/* <div className={styles.container}>
                <div className="ag-theme-quartz-dark" style={{ height: 400, width: '100%' }}>
                    <AgGridReact rowData={podcasts} columnDefs={colDefs} />
                </div>
            </div> */}
        </>
    );
};

const PodcastPlayerRenderer = (props) => {
    // The audio source URL is passed through the `value` prop by AG Grid.
    const audioSrc = props.value;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <audio controls src={audioSrc} style={{ width: '100%' }}>
                Your browser does not support the audio element.
            </audio>
        </div>
    );
};

const centerAlignRenderer = (params) => {
    return `<div style="display: flex; align-items: center; height: 100%;">${params.value}</div>`;
};

export default Podcasts;
