import styles from '../DocsExamples.module.scss';

const getNxGenerateOneExample = ({ pageName, exampleName }: { pageName: string; exampleName: string }) => {
    return `nx run generate-docs-example --page=${pageName} --example=${exampleName}`;
};

export function ActionsCellRenderer({ data }) {
    if (!data) {
        return;
    }

    const { pageName, exampleName } = data;
    return (
        <div className={styles.linksContainer}>
            <button
                className="button-as-link"
                onClick={() => {
                    const nxCommand = getNxGenerateOneExample({ pageName, exampleName });
                    navigator.clipboard.writeText(nxCommand);
                }}
            >
                Copy nx generate command
            </button>
        </div>
    );
}
