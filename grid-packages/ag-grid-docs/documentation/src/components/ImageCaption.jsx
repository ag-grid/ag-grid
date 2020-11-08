import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import styles from './image-caption.module.scss';

const ImageCaption = ({ src, alt, centered, children, constrained, descriptiontop, height, maxwidth, width }) => {
    const { allFile: { nodes } } = useStaticQuery(graphql`
    {
        allFile(filter: { sourceInstanceName: { eq: "pages" }, relativePath: { regex: "/(?:.jpg|.jpg|png|.svg|.gif)$/" } }) {
            nodes {
                relativePath
                publicURL
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
    if (maxwidth != null) { style.maxWidth = maxwidth; }
    if (height != null) { style.height = height; }

    const className = `${styles.imageCaption} ${centered ? styles.imageCaptionCentered : ''}`;
    const bodyClass = `${styles.imageCaption__body} ${descriptiontop ? styles.imageCaptionDescriptionTop : null}`;
    const imageClass= `${styles.imageCaption__top} ${constrained ? styles.imageCaptionConstrained: null}`;

    const content = [
        <img src={img.childImageSharp == null ? img.publicURL : img.childImageSharp.fluid.src} className={imageClass} alt={alt} />,
        children 
            ? <div className={bodyClass}><p className={styles.imageCaption__bodyText}>{children}</p></div>
            : null
    ]

    return (
        <div className={className} style={style}>
            { descriptiontop ? content.reverse() : content }
        </div>
    );
};

export default ImageCaption;