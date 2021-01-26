import { graphql, useStaticQuery } from 'gatsby';

export const useJsonFileNodes = () => {
    const { allFile: { nodes } } = useStaticQuery(graphql`
    {
        allFile(filter: { sourceInstanceName: { eq: "doc-pages" }, ext: { eq: ".json" } }) {
            nodes {
                relativePath
                internal {
                    content
                }
            }
        }
    }
    `);

    return nodes;
};

export default useJsonFileNodes;