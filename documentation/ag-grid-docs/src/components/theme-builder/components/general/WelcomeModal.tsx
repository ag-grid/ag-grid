import { useApplicationConfigAtom } from '@components/theme-builder/model/application-config';
import * as Dialog from '@radix-ui/react-dialog';
import { useIsSmallScreenSize } from '@utils/hooks/useIsSmallScreenSize';
import classnames from 'classnames';

import styles from './Dialog.module.scss';
import welcomeStyles from './WelcomeModal.module.scss';

const SMALL_SCREEN_WIDTH = 800;

export const WelcomeModal = () => {
    const [dismissed, setDismissed] = useApplicationConfigAtom('welcomeModalDismissed');
    const isSmallScreenSize = useIsSmallScreenSize(SMALL_SCREEN_WIDTH);

    return (
        <Dialog.Root
            open={!isSmallScreenSize && !dismissed}
            onOpenChange={(open) => {
                setDismissed(!open);
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.content}>
                    <img className={welcomeStyles.lightImage} src="/theme-builder/theme-builder.gif"></img>
                    <img className={welcomeStyles.darkImage} src="/theme-builder/theme-builder-dark.gif"></img>
                    <div className={styles.contentModal}>
                        <Dialog.Title className={styles.title}>Welcome to Theme Builder</Dialog.Title>
                        <Dialog.Description className={styles.description}>
                            Here you can customise your grid's <b>spacing</b>, <b>colors</b>, and <b>typography</b> all
                            in one place.
                            <br />
                            <br />
                            Select from presets above the grid to get inspired. Then configure the controls on the left
                            to find your perfect theme.
                        </Dialog.Description>
                    </div>
                    <div className={classnames(styles.actions, styles.noSeparator)}>
                        <Dialog.Close className={classnames('button-tertiary', styles.fullWidth)}>
                            Get started
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
