import { graphql, useStaticQuery } from 'gatsby';

export const useExampleFileNodes = () => {
    const { allFile: { nodes } } = useStaticQuery(graphql`
    {
        allFile(filter: { sourceInstanceName: { eq: "examples" }, relativePath: { regex: "/.*\/examples\/.*/" } }) {
            nodes {
                relativePath
                publicURL
                base
                childHtmlRehype {
                    html
                }
            }
        }
    }
    `);

    return nodes;
};
