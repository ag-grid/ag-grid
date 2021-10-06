import { graphql, useStaticQuery } from 'gatsby';

/**
 * This provides access to information about all image files.
 */
export const useImageFileNodes = () => {
    const { fluidImages: { nodes: fluidImages }, images: { nodes: images } } = useStaticQuery(graphql`
    {
        fluidImages: allFile(filter: { sourceInstanceName: { eq: "doc-pages" }, ext: { in: [".jpg", ".png"] } }, limit: 100) {
            nodes {
                relativePath
                childImageSharp {
                    fluid {
                        src
                    }
                }
            }
        }
        images: allFile(filter: { sourceInstanceName: { eq: "doc-pages" }, ext: { in: [".svg", ".gif"] } }) {
            nodes {
                relativePath
                publicURL
            }
        }
    }
    `);

    return { fluidImages, images };
};

export const getImage = (images, pageName, src) => images
    .filter(file =>
        file.relativePath === src ||
        file.relativePath === `${pageName}/${src}` ||
        file.relativePath === `${pageName}/resources/${src}`)[0];

export default useImageFileNodes;