import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { trackMarkdownActions } from '@utils/analytics';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FunctionComponent } from 'react';

import styles from './MarkdownActions.module.scss';

interface Props {
    markdownHref: string;
    framework?: string;
}

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_LABELS: Record<CopyState, string> = {
    idle: 'Copy as Markdown',
    copied: 'Copied',
    failed: 'Copy failed',
};

const COPY_LABEL_RESET_MS = 2000;

const VIEW_AS_MARKDOWN_LABEL = 'View as Markdown';

// The chat apps fetch the .md themselves, so they need an absolute, publicly
// reachable URL — on localhost the page will open but the fetch won't resolve.
const buildChatPrompt = (markdownUrl: string) => `Read ${markdownUrl} so I can ask questions about it.`;

const CHAT_APPS = [
    {
        label: 'Open in Claude',
        buildUrl: (prompt: string) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
    },
    {
        label: 'Open in ChatGPT',
        buildUrl: (prompt: string) => `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`,
    },
];

/**
 * Split button exposing the markdown version of the current page: the primary action
 * copies it, and the chevron reveals the remaining markdown/LLM actions. Consumers
 * pass the page's `.md` URL and place it wherever the page header has room.
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
        trackAction(COPY_LABELS.idle);
        try {
            const response = await fetch(markdownHref);
            if (!response.ok) {
                throw new Error(`Request for ${markdownHref} failed with status ${response.status}`);
            }
            await navigator.clipboard.writeText(await response.text());
            flashCopyState('copied');
        } catch (error) {
            console.error('Could not copy the markdown version of this page', error);
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
            <button type="button" tabIndex={0} className={styles.primaryAction} onClick={copyMarkdown}>
                {/* The hidden copy reserves room for the longest label so confirming a
                    copy cannot resize the button and shift the controls beside it. */}
                <span className={styles.labelStack}>
                    <span aria-hidden="true" className={styles.labelSizer}>
                        {COPY_LABELS.idle}
                    </span>
                    <span aria-live="polite">{COPY_LABELS[copyState]}</span>
                </span>
            </button>

            <DropdownMenu.Root>
                <DropdownMenu.Trigger tabIndex={0} className={styles.trigger} aria-label="More markdown actions">
                    <ChevronDown className={styles.chevron} />
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                    <DropdownMenu.Content className={styles.content} align="end" sideOffset={0}>
                        <DropdownMenu.Item className={styles.item} asChild>
                            <a
                                href={markdownHref}
                                data-markdown-link
                                onClick={() => trackAction(VIEW_AS_MARKDOWN_LABEL)}
                            >
                                {VIEW_AS_MARKDOWN_LABEL}
                            </a>
                        </DropdownMenu.Item>

                        {CHAT_APPS.map(({ label, buildUrl }) => (
                            <DropdownMenu.Item
                                key={label}
                                className={styles.item}
                                onSelect={() => openChatApp(label, buildUrl)}
                            >
                                {label}
                            </DropdownMenu.Item>
                        ))}
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    );
};
