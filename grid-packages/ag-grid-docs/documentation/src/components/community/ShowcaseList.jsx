import React from 'react';
import showcaseStyles from '@design-system/modules/CommunityShowcase.module.scss';
import classnames from 'classnames';
import { Icon } from '../../components/Icon';
import sampleImage from './sample.png'

const ShowcaseList = ({ products }) => {
    const showcaseSortedByStars = products.sort((a, b) => b.stars - a.stars);
    return (
        <div className={showcaseStyles.showcaseContainer}>
        {showcaseSortedByStars.map((project, index) => (
            <a key={index} target="_blank" href={project.link} className={showcaseStyles.projectCard}>
                <img src={project.img ? `../../images/community/${project.img}` : `${sampleImage}`} alt={project.title} />
                <div className={showcaseStyles.cardBody}>
                    <div className={showcaseStyles.titleSection}>
                        <h4>{project.title}</h4>
                        <a href={project.repo}>
                            <Icon name="github" className={showcaseStyles.githubButtonIcon} />
                        </a>
                    </div>
                    <p>{project.description}</p>
                    <div className={showcaseStyles.tagsContainer}>
                        {project.tags?.map((tag, index) => (
                            <span className={showcaseStyles.tag}>{tag}</span>
                        ))}
                    </div>
                </div>
            </a>
        ))}

        </div>
    );
};

export default ShowcaseList;
