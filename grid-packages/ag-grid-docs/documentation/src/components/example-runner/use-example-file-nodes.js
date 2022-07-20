import {graphql, useStaticQuery} from 'gatsby';

const PRELOAD_PAGE_DATA = require("../../preload-page-data.js");

/**
 * This returns information about all example files, including the HTML fragment from template index.html files.
 */
export const useExampleFileNodes = () => {
    if (PRELOAD_PAGE_DATA) {
        return null;
    }

    // const {allFile: {nodes}} = useStaticQuery(graphql`
    // {
    //     allFile(filter: { sourceInstanceName: { eq: "doc-pages" }, relativeDirectory: { regex: "/.*\/examples\/.*/" } }) {
    //         nodes {
    //             relativePath
    //             publicURL
    //             base
    //             childHtmlRehype {
    //                 html
    //             }
    //             mtimeMs
    //         }
    //     }
    // }
    // `);
    // return nodes;
};
