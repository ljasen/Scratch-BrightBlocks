/* eslint-disable @stylistic/max-len */
import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {defineMessages, FormattedMessage, useIntl} from 'react-intl';

import {announceForAccessibility, ANNOUNCE_EVENT} from '../../lib/accessibility/announcer';
import SpeechSynthesizer from '../../lib/block-audio/speech-synthesizer';

import styles from './accessibility-shell.css';

const messages = defineMessages({
    skipLinksLabel: {
        id: 'gui.accessibility.skipLinks',
        defaultMessage: 'Skip links',
        description: 'ARIA label for skip links navigation'
    },
    shortcutTab: {
        defaultMessage: 'Tab moves through buttons and panels.',
        description: 'Keyboard shortcut help for Tab',
        id: 'gui.accessibility.shortcutTab'
    },
    shortcutActivate: {
        defaultMessage: 'Enter or Space activates the focused control.',
        description: 'Keyboard shortcut help for Enter and Space',
        id: 'gui.accessibility.shortcutActivate'
    },
    shortcutEscape: {
        defaultMessage: 'Escape closes menus and dialogs.',
        description: 'Keyboard shortcut help for Escape',
        id: 'gui.accessibility.shortcutEscape'
    },
    shortcutBlockSearch: {
        defaultMessage: 'Control K opens the block command palette in the code area.',
        description: 'Keyboard shortcut help for the block command palette',
        id: 'gui.accessibility.shortcutBlockSearch'
    },
    shortcutScriptNavigatorArrows: {
        defaultMessage: 'Alt plus arrows navigates the selected script. Up or Down moves by block. Left moves to parent. Right moves to child input.',
        description: 'Keyboard shortcut help for script navigator arrow keys',
        id: 'gui.accessibility.shortcutScriptNavigatorArrows'
    },
    shortcutScriptNavigatorStacks: {
        defaultMessage: 'Alt Home moves to the script root. Alt Page Down moves to the next stack.',
        description: 'Keyboard shortcut help for script navigator root and stack keys',
        id: 'gui.accessibility.shortcutScriptNavigatorStacks'
    },
    shortcutGuideNext: {
        defaultMessage: 'Press F1 to hear the next keyboard shortcut.',
        description: 'Spoken prompt after reading one keyboard shortcut',
        id: 'gui.accessibility.shortcutGuide.next'
    }
});

const AccessibilityShell = ({enabled}) => {
    const intl = useIntl();
    const [announcement, setAnnouncement] = useState('');
    const shortcutIndexRef = useRef(0);
    const synthesizerRef = useRef(new SpeechSynthesizer());
    const shortcutMessages = useMemo(() => ([
        messages.shortcutTab,
        messages.shortcutActivate,
        messages.shortcutEscape,
        messages.shortcutBlockSearch,
        messages.shortcutScriptNavigatorArrows,
        messages.shortcutScriptNavigatorStacks
    ]), []);

    useEffect(() => {
        const handleAnnouncement = event => {
            setAnnouncement('');
            requestAnimationFrame(() => {
                setAnnouncement(event.detail?.message || '');
            });
        };
        window.addEventListener(ANNOUNCE_EVENT, handleAnnouncement);
        return () => window.removeEventListener(ANNOUNCE_EVENT, handleAnnouncement);
    }, []);

    useEffect(() => {
        if (!enabled) return () => {};
        const handleShortcutGuideKeyDown = event => {
            if ((event.key || '').toLowerCase() !== 'f1') return;

            event.preventDefault();
            event.stopPropagation();
            const shortcutMessage = shortcutMessages[shortcutIndexRef.current];
            shortcutIndexRef.current = (shortcutIndexRef.current + 1) % shortcutMessages.length;
            const text = `${intl.formatMessage(shortcutMessage)} ${intl.formatMessage(messages.shortcutGuideNext)}`;
            announceForAccessibility(text);
            synthesizerRef.current.speak(text, intl.locale);
        };
        document.addEventListener('keydown', handleShortcutGuideKeyDown, true);
        return () => document.removeEventListener('keydown', handleShortcutGuideKeyDown, true);
    }, [enabled, intl, shortcutMessages]);

    return (
        <React.Fragment>
            <nav
                aria-label={intl.formatMessage(messages.skipLinksLabel)}
                className={styles.skipLinks}
            >
                <a href="#scratch-menu-bar">
                    <FormattedMessage
                        defaultMessage="Skip to menu"
                        description="Skip link to the menu bar"
                        id="gui.accessibility.skipMenu"
                    />
                </a>
                <a href="#scratch-code-panel">
                    <FormattedMessage
                        defaultMessage="Skip to code"
                        description="Skip link to the code panel"
                        id="gui.accessibility.skipCode"
                    />
                </a>
                <a href="#scratch-stage-panel">
                    <FormattedMessage
                        defaultMessage="Skip to stage"
                        description="Skip link to the stage panel"
                        id="gui.accessibility.skipStage"
                    />
                </a>
                <a href="#scratch-target-pane">
                    <FormattedMessage
                        defaultMessage="Skip to sprites"
                        description="Skip link to the sprite and stage target pane"
                        id="gui.accessibility.skipSprites"
                    />
                </a>
            </nav>
            <div
                aria-live="polite"
                aria-atomic="true"
                className={styles.liveAnnouncer}
            >
                {announcement}
            </div>
            {enabled ? (
                <details className={styles.shortcuts}>
                    <summary>
                        <FormattedMessage
                            defaultMessage="Keyboard shortcuts"
                            description="Summary label for keyboard shortcuts help"
                            id="gui.accessibility.shortcuts"
                        />
                    </summary>
                    <ul>
                        <li>
                            <FormattedMessage {...messages.shortcutTab} />
                        </li>
                        <li>
                            <FormattedMessage {...messages.shortcutActivate} />
                        </li>
                        <li>
                            <FormattedMessage {...messages.shortcutEscape} />
                        </li>
                        <li>
                            <FormattedMessage {...messages.shortcutBlockSearch} />
                        </li>
                        <li>
                            <FormattedMessage {...messages.shortcutScriptNavigatorArrows} />
                        </li>
                        <li>
                            <FormattedMessage {...messages.shortcutScriptNavigatorStacks} />
                        </li>
                    </ul>
                </details>
            ) : null}
        </React.Fragment>
    );
};

AccessibilityShell.propTypes = {
    enabled: PropTypes.bool
};

export default AccessibilityShell;
