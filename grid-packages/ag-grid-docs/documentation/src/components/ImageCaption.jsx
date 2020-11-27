import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import classnames from 'classnames';
import styles from './ImageCaption.module.scss';

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
    if (minWidth != null) { style.minWidth = minWidth; }
    if (maxWidth != null) { style.maxWidth = maxWidth; }
    if (height != null) { style.height = height; }

    const description = children &&
        <div className={classnames(styles['image-caption__body'], { [styles['image-caption__body--description-top']]: descriptionTop })}>
            <p className={styles['image-caption__body-text']}>{children}</p>
        </div>;

    const imageClasses = classnames(
        styles['image-caption__image'],
        {
            [styles['image-caption__image--centered']]: centered,
            [styles['image-caption__image--constrained']]: constrained,
        });

    return (
        <div className={classnames(styles['image-caption'], { [styles['image-caption--centered']]: centered })} style={style}>
            {descriptionTop && description}
            <img src={imgSrc} className={imageClasses} alt={alt} />
            {!descriptionTop && description}
        </div>
    );
};

export default ImageCaption;