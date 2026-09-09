import AiSparkleIcon from '@ag-website-shared/images/inline-svgs/ai-sparkle.svg?react';
import ChatGptLogo from '@ag-website-shared/images/inline-svgs/chatgpt-logo.svg?react';
import ClaudeLogo from '@ag-website-shared/images/inline-svgs/claude-logo.svg?react';
import CopyDocumentIcon from '@ag-website-shared/images/inline-svgs/copy-document.svg?react';
import MarkdownLogo from '@ag-website-shared/images/inline-svgs/markdown-logo.svg?react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { trackMarkdownActions } from '@utils/analytics';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FunctionComponent, ReactNode } from 'react';

import styles from './MarkdownActions.module.scss';

interface Props {
    markdownHref: string;
    framework?: string;
}

type CopyState = 'idle' | 'copied' | 'failed';

const TRIGGER_LABELS: Record<CopyState, string> = {
    idle: 'AI Options',
    copied: 'Copied',
    failed: 'Copy failed',
};

const COPY_LABEL_RESET_MS = 2000;

const COPY_MARKDOWN_LABEL = 'Copy Markdown';
const VIEW_AS_MARKDOWN_LABEL = 'View as Markdown';
const COPY_PROMPT_LABEL = 'Copy Prompt';

// The chat apps fetch the .md themselves, so they need an absolute, publicly
// reachable URL — on localhost the page will open but the fetch won't resolve.
const buildChatPrompt = (markdownUrl: string) => `Read ${markdownUrl} so I can ask questions about it.`;

const CHAT_APPS = [
    {
        label: 'Open in Claude',
        description: 'Ask questions about this page',
        icon: <ClaudeLogo />,
        buildUrl: (prompt: string) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
    },
    {
        label: 'Open in ChatGPT',
        description: 'Ask questions about this page',
        icon: <ChatGptLogo className={styles.monochromeIcon} />,
        buildUrl: (prompt: string) => `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`,
    },
];

interface ItemContentProps {
    icon: ReactNode;
    label: string;
    description: string;
}

const ItemContent: FunctionComponent<ItemContentProps> = ({ icon, label, description }) => (
    <>
        <span className={styles.itemIcon}>{icon}</span>
        <span className={styles.itemText}>
            <span className={styles.itemLabel}>{label}</span>
            <span className={styles.itemDescription}>{description}</span>
        </span>
    </>
);

/**
 * Dropdown exposing the markdown/LLM actions for the current page. The whole
 * button opens the menu, matching the framework selector it sits beside.
 * Consumers pass the page's `.md` URL and place it wherever the page header
 * has room.
 */
export const MarkdownActions: FunctionComponent<Props> = ({ markdownHref, framework }) => {
    const [copyState, setCopyState] = useState<CopyState>('idle');
    const resetTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        return () => clearTimeout(resetTimeoutRef.current);
    }, []);

    // Plausible records the page URL against every custom event, so only the
    // action and the framework need to be sent as properties.
    const trackAction = useCallback(
        (action: string) => {
            trackMarkdownActions({ action, framework });
        },
        [framework]
    );

    const flashCopyState = useCallback((state: CopyState) => {
        setCopyState(state);
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = setTimeout(() => setCopyState('idle'), COPY_LABEL_RESET_MS);
    }, []);

    const copyMarkdown = useCallback(async () => {
        trackAction(COPY_MARKDOWN_LABEL);
        const markdownText = fetch(markdownHref).then(async (response) => {
            if (!response.ok) {
                throw new Error(`Request for ${markdownHref} failed with status ${response.status}`);
            }
            return response.text();
        });
        try {
            // ClipboardItem takes the pending text so the write starts inside the click's
            // user activation — Safari rejects a plain writeText after an await.
            if (typeof ClipboardItem !== 'undefined') {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'text/plain': markdownText.then((text) => new Blob([text], { type: 'text/plain' })),
                    }),
                ]);
            } else {
                await navigator.clipboard.writeText(await markdownText);
            }
            flashCopyState('copied');
        } catch (error) {
            console.error('Could not copy the markdown version of this page', error);
            flashCopyState('failed');
        }
    }, [markdownHref, flashCopyState, trackAction]);

    const copyPrompt = useCallback(async () => {
        trackAction(COPY_PROMPT_LABEL);
        try {
            const markdownUrl = new URL(markdownHref, window.location.href).toString();
            await navigator.clipboard.writeText(buildChatPrompt(markdownUrl));
            flashCopyState('copied');
        } catch (error) {
            console.error('Could not copy the page prompt', error);
            flashCopyState('failed');
        }
    }, [markdownHref, flashCopyState, trackAction]);

    const openChatApp = useCallback(
        (label: string, buildUrl: (prompt: string) => string) => {
            trackAction(label);
            const markdownUrl = new URL(markdownHref, window.location.href).toString();
            window.open(buildUrl(buildChatPrompt(markdownUrl)), '_blank', 'noopener,noreferrer');
        },
        [markdownHref, trackAction]
    );

    return (
        <div className={styles.markdownActions}>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger tabIndex={0} className={styles.trigger} aria-label={TRIGGER_LABELS.idle}>
                    {/* aria-hidden so the flashing copy feedback never becomes the
                        trigger's accessible name; the srOnly region announces it. */}
                    <span className={styles.triggerLabel} aria-hidden="true">
                        <AiSparkleIcon className={styles.triggerIcon} />
                        {/* Hidden copies of every label reserve room for the longest one, so
                            the copy feedback cannot resize the button. */}
                        <span className={styles.labelStack}>
                            {Object.values(TRIGGER_LABELS).map((label) => (
                                <span key={label} className={styles.labelSizer}>
                                    {label}
                                </span>
                            ))}
                            <span>{TRIGGER_LABELS[copyState]}</span>
                        </span>
                    </span>
                    <ChevronDown className={styles.chevron} />
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                    <DropdownMenu.Content className={styles.content} align="end" sideOffset={4}>
                        {CHAT_APPS.map(({ label, description, icon, buildUrl }) => (
                            <DropdownMenu.Item
                                key={label}
                                className={styles.item}
                                onSelect={() => openChatApp(label, buildUrl)}
                            >
                                <ItemContent icon={icon} label={label} description={description} />
                            </DropdownMenu.Item>
                        ))}

                        <DropdownMenu.Item className={styles.item} onSelect={copyMarkdown}>
                            <ItemContent
                                icon={<MarkdownLogo className={styles.monochromeIcon} />}
                                label={COPY_MARKDOWN_LABEL}
                                description="Copy this page content in Markdown"
                            />
                        </DropdownMenu.Item>

                        <DropdownMenu.Item className={styles.item} asChild>
                            {/* data-astro-reload: the view-transitions router must not intercept
                                a navigation to a non-HTML resource. */}
                            <a
                                href={markdownHref}
                                data-markdown-link
                                data-astro-reload
                                onClick={() => trackAction(VIEW_AS_MARKDOWN_LABEL)}
                            >
                                <ItemContent
                                    icon={<MarkdownLogo className={styles.monochromeIcon} />}
                                    label={VIEW_AS_MARKDOWN_LABEL}
                                    description="Open this page in Markdown format"
                                />
                            </a>
                        </DropdownMenu.Item>

                        <DropdownMenu.Item className={styles.item} onSelect={copyPrompt}>
                            <ItemContent
                                icon={<CopyDocumentIcon className={styles.monochromeIcon} />}
                                label={COPY_PROMPT_LABEL}
                                description="Ask questions in your AI tool"
                            />
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <span className={styles.srOnly} aria-live="polite">
                {copyState === 'idle' ? '' : TRIGGER_LABELS[copyState]}
            </span>
        </div>
    );
};
