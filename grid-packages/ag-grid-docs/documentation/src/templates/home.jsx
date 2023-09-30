import classnames from 'classnames';
import { convertUrl } from 'components/documentation-helpers';
import MenuView from 'components/menu-view/MenuView';
import { SEO } from 'components/SEO';
import logos from 'images/logos';
import React from 'react';
import menuData from '../../doc-pages/licensing/menu.json';
import { Icon } from '../components/Icon';
import tileStyles from '../components/menu-view/Tile.module.scss';
import supportedFrameworks from '../utils/supported-frameworks';
import featuredVideos from './featuredVideos.json';
import styles from './home.module.scss';

const flatRenderItems = (items, framework) => {
    return items.reduce((prev, curr) => {
        let ret = prev;

        if (curr.frameworks && curr.frameworks.indexOf(framework) === -1) {
            return ret;
        }

        ret = prev.concat(
            Object.assign({}, { title: curr.title, url: curr.url }, curr.icon ? { icon: curr.icon } : {})
        );

        if (!curr.items) {
            return ret;
        }

        return ret.concat(flatRenderItems(curr.items, framework));
    }, []);
};

const VideoPanel = ({ videos }) => {
    const title = `Videos`;
    return (
        <div className={styles.section}>
            <h2>{title}</h2>
            <div className={styles.sectionInner}>
                {videos.map((video) => (
                    <div
                        className={classnames(tileStyles.tile, tileStyles.videoTile, tileStyles.linkTile)}
                        key={video.id}
                    >
                        <a
                            href={`https://www.youtube.com/watch?v=${video.id}&list=${video.list}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img
                                style={{ height: '100%', width: '100%' }}
                                alt={video.title || title}
                                src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
                            />
                        </a>
                    </div>
                ))}
                <a href="./videos/" className={classnames(tileStyles.tile, tileStyles.linkTile)}>
                    <div className={styles.allVideosInner}>
                        <Icon name="playCircle" svgClasses={styles.allVideosIcon} />
                        <div className={tileStyles.linkTileTitle}>All Videos</div>
                    </div>
                </a>
            </div>
        </div>
    );
};

/**
 * This is the home page for the documentation.
 */
const HomePage = ({ pageContext: { framework } }) => {
    const frameworkVideos = featuredVideos[framework];

    const otherFrameworks = () => {
        const frameworks = supportedFrameworks.filter((f) => {
            return f !== framework;
        });

        return (
            <span style={{ textTransform: 'capitalize' }}>
                <a href={`../${frameworks[0]}-data-grid/`}>{frameworks[0]}</a>,{' '}
                <a href={`../${frameworks[1]}-data-grid/`}>{frameworks[1]}</a>, or{' '}
                <a href={`../${frameworks[2]}-data-grid/`}>{frameworks[2]}</a>
            </span>
        );
    };

    return (
        <div className={styles.docsHome}>
            {/*eslint-disable-next-line react/jsx-pascal-case*/}
            <SEO
                title="Documentation"
                description="Our documentation will help you to get up and running with AG Grid."
                framework={framework}
                pageName="home"
            />

            <div className={classnames(styles.section, styles.introSection, 'font-size-responsive')}>
                <h1>AG Grid {framework} Documentation</h1>
                <p className="font-size-extra-large">Start developing with the best JavaScript Grid in the world.</p>
                <p className="font-size-medium">
                    You can get started with <a href="./getting-started/">a simple sample project and tutorial</a>,
                    watch our extensive selection of <a href="./videos/">videos</a>, or review the{' '}
                    <a href="./grid-options/">grid options</a>.
                </p>
                <p className="font-size-medium">
                    Looking for documentation for another framework? Switch to {otherFrameworks()}.
                </p>
            </div>

            {frameworkVideos && frameworkVideos.length > 0 && (
                <VideoPanel framework={framework} videos={frameworkVideos} />
            )}
        </div>
    );
};

export default HomePage;
