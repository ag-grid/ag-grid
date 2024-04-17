import styles from './FigmaPreview.module.scss';

const previewSrc =
    'https://www.figma.com/embed?embed_host=fastma&community_viewer=true&hub_file_id=1360600846643230092';

export const FigmaPreview = () => {
    return <iframe className={styles.previewIframe} src={previewSrc}></iframe>;
};
