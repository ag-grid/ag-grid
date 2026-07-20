import styled from '@emotion/styled';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

import { Collapsible } from '../collapsible/Collapsible';

export type CollapsibleSectionProps = {
    heading: string;
    isOpen: boolean;
    onToggle: () => void;
    children: ReactNode;
};

export const CollapsibleSection = ({ heading, isOpen, onToggle, children }: CollapsibleSectionProps) => (
    <Section>
        <Header>
            <Trigger type="button" onClick={onToggle} aria-expanded={isOpen}>
                {heading} <OpenCloseChevron size={16} isOpen={isOpen} />
            </Trigger>
        </Header>
        <Collapsible isOpen={isOpen}>
            <SectionContent>{children}</SectionContent>
        </Collapsible>
    </Section>
);

const Section = styled('div')`
    margin: 0;
`;

const Header = styled('div')`
    margin-bottom: 10px;
    margin-top: 6px;
    padding-left: 6px;
    padding-right: 10px;
`;

const Trigger = styled('button')`
    all: unset;
    color: var(--color-fg-secondary);
    background: none !important;
    font-size: 15px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;
    transition:
        opacity 0.25s ease-in-out,
        color 0.25s ease-in-out;
    opacity: 0.85;

    &:hover {
        opacity: 1;
        color: var(--color-brand-500);

        [data-dark-mode='true'] & {
            color: var(--color-brand-300);
        }
    }
`;

const SectionContent = styled('div')`
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    margin-bottom: 20px;
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 6px;
    padding-right: 10px;
`;

const OpenCloseChevron = styled(ChevronDown, { shouldForwardProp: (prop) => prop !== 'isOpen' })<{ isOpen: boolean }>`
    opacity: 0.6;
    transition: transform 300ms cubic-bezier(0.87, 0, 0.13, 1);
    transform: ${(props) => (props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;
