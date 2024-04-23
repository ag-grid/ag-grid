import { useApplicationConfigAtom } from '@components/theme-builder/model/application-config';
import styled from '@emotion/styled';
import * as Dialog from '@radix-ui/react-dialog';

export const WelcomeModal = () => {
    const [dismissed, setDismissed] = useApplicationConfigAtom('welcomeModalDismissed');
    if (dismissed) return null;
    return (
        <Dialog.Root
            onOpenChange={(open) => {
                if (!open) setDismissed(true);
            }}
            defaultOpen
        >
            <Dialog.Portal>
                <StyledOverlay />
                <StyledContent>
                    <StyledTitle>Title</StyledTitle>
                    <StyledDescription>Description</StyledDescription>
                    <StyledClose>Close!</StyledClose>
                </StyledContent>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

const StyledOverlay = styled(Dialog.Overlay)`
    background-color: color-mix(in srgb, transparent, var(--color-bg-primary) 75%);
    z-index: 1000;
    position: fixed;
    inset: 0;
`;

const StyledContent = styled(Dialog.Content)`
    background-color: white;
    border-radius: 6px;
    box-shadow:
        hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
        hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 450px;
    max-height: 85vh;
    padding: 25px;
    z-index: 1000;
    &:focus {
        outline: none;
    }
`;

const StyledTitle = styled(Dialog.Title)`
    margin: 0;
    font-weight: 500;
    color: var(--mauve-12);
    font-size: 17px;
`;

const StyledDescription = styled(Dialog.Description)`
    margin: 10px 0 20px;
    color: var(--mauve-11);
    font-size: 15px;
    line-height: 1.5;
`;

const StyledClose = styled(Dialog.Close)``;
