import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import styles from './image-caption.module.scss';

const ImageCaption = ({ src, alt, centered, width, height, caption }) => {
    const { allFile: { nodes } } = useStaticQuery(graphql`
    {
        allFile(filter: { sourceInstanceName: { eq: "pages" }, relativePath: { regex: "/(?:.jpg|.jpg|png|.svg|.gif)$/" } }) {
            nodes {
                relativePath
                childImageSharp {
                    fluid {
                        src
                    }
                }
            }
        }
    }
    `);

    const img = nodes.filter(file => file.relativePath === src)[0];
    const style = {};

    if (width != null) { style.width = width; }
    if (height != null) { style.height = height; }

    const className = `${styles.imageCaption} ${centered ? styles.imageCaptionCentered : ''}`;

    return (
        <div className={className} style={style}>
            <img src={img.childImageSharp.fluid.src} className={styles.imageCaption__top} alt={alt} />
            <div className={styles.imageCaption__body}>
                <p className={styles.imageCaption__bodyText}>{caption}</p>
            </div>
        </div>
    );
}

export default ImageCaption;