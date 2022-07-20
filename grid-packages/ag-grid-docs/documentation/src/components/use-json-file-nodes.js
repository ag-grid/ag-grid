import { graphql, useStaticQuery } from 'gatsby';
const PRELOAD_PAGE_DATA = require("../preload-page-data.js");

/**
 * This provides access to the content of all JSON files, e.g. for use in API documentation.
 */
export const useJsonFileNodes = () => {
    if(PRELOAD_PAGE_DATA) {
        return null;
    }

    // const { allFile: { nodes } } = useStaticQuery(graphql`
    // {
    //     allFile(filter: { absolutePath: {regex: "/^((?!_gen).)*$/"}, sourceInstanceName: { eq: "doc-pages" }, ext: { eq: ".json" } }) {
    //         nodes {
    //             relativePath
    //             internal {
    //                 content
    //             }
    //         }
    //     }
    // }
    // `);
    //
    // return nodes;
};

export default useJsonFileNodes;
