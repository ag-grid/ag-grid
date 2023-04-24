import {graphql, useStaticQuery} from 'gatsby';

/**
 * This returns information about all example files, including the HTML fragment from template index.html files.
 */
export const useExampleFileNodes = () => {
    const {allFile: {nodes}} = useStaticQuery(graphql`
    {
        allFile(filter: { sourceInstanceName: { eq: "doc-pages" }, relativeDirectory: { regex: "/.*\/examples\/.*/" } }) {
            nodes {
                relativePath
                publicURL
                base
                childHtmlRehype {
                    html
                }
                mtimeMs
            }
        }
    }
    `);
    return nodes;
};
