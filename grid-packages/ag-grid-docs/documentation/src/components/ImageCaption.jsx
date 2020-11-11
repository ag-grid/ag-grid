import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import styles from './image-caption.module.scss';

const ImageCaption = ({ src, alt, centered, children, constrained, descriptiontop: descriptionTop, height, maxwidth: maxWidth, minwidth: minWidth, width }) => {
    const { fluidImages: { nodes: fluidImages }, images: { nodes: images } } = useStaticQuery(graphql`
    {
        fluidImages: allFile(filter: { sourceInstanceName: { eq: "pages" }, relativePath: { regex: "/.(jpg|png)$/" } }) {
            nodes {
                relativePath
                childImageSharp {
                    fluid {
                        src
                    }
                }
            }
        }
        images: allFile(filter: { sourceInstanceName: { eq: "pages" }, relativePath: { regex: "/.(svg|gif)$/" } }) {
            nodes {
                relativePath
                publicURL
            }
        }
    }
    `);

    const getImage = (images, src) => images.filter(file => file.relativePath === src)[0];

    let imgSrc;

    const fluidImage = getImage(fluidImages, src);

    if (fluidImage) {
        imgSrc = fluidImage.childImageSharp.fluid.src;
    } else {
        const image = getImage(images, src);

        if (image) {
            imgSrc = image.publicURL;
        }
    }

    if (!imgSrc) {
        throw new Error(`Could not find requested image: ${src}`);
    }

    
    const style = {};

    if (width != null) { style.width = width; }
    if (minWidth != null) { style.minWidth = minWidth }
    if (maxWidth != null) { style.maxWidth = maxWidth; }
    if (height != null) { style.height = height; }

    const className = `${styles.imageCaption} ${centered ? styles.imageCaptionCentered : ''}`;
    const bodyClass = `${styles.imageCaption__body} ${descriptionTop ? styles.imageCaption__bodyDescriptionTop : ''}`;
    const imageClass = `${styles.imageCaption__image} ${constrained ? styles.imageCaptionConstrained : ''}`;
    const description = children &&
        <div className={bodyClass}>
            <p className={styles.imageCaption__bodyText}>{children}</p>
        </div>;

    return (
        <div className={className} style={style}>
            {descriptionTop && description}
            <img src={imgSrc} className={imageClass} alt={alt} />
            {!descriptionTop && description}
        </div>
    );
};

export default ImageCaption;