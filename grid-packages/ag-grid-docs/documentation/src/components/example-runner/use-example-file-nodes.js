import { graphql, useStaticQuery } from 'gatsby';

export const useExampleFileNodes = () => {
    const { allFile: { nodes } } = useStaticQuery(graphql`
    {
        allFile(filter: { sourceInstanceName: { eq: "pages" }, relativeDirectory: { regex: "/.*\/examples\/.*/" } }) {
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
