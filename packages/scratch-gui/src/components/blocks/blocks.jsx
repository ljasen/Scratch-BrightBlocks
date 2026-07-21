import PropTypes from 'prop-types';
import classNames from 'classnames';
import React from 'react';
import Box from '../box/box.jsx';
import styles from './blocks.css';

const stopEventPropagation = event => {
    event.stopPropagation();
};

const BlocksComponent = props => {
    const {
        blockSize,
        blockCommandQuery,
        blockCommandItems,
        blockCommandSearchOpen,
        blockSearchButtonLabel,
        blockSearchCloseLabel,
        blockSearchEmptyLabel,
        blockSearchLabel,
        containerRef,
        dragOver,
        explainButtonLabel,
        helpButtonLabel,
        onBlockCommandQueryChange,
        onBlockCommandSearchKeyDown,
        onBlockCommandSearchClose,
        onBlockCommandSearchOpen,
        onBlockCommandSelect,
        onExplainSelectedBlock,
        onHelpSelectedScript,
        visionImpairedMode,
        ...componentProps
    } = props;
    return (
        <Box
            className={classNames(styles.blocks, {
                [styles.dragOver]: dragOver,
                [styles.largeBlocks]: blockSize === 'large',
                [styles.extraLargeBlocks]: blockSize === 'extra-large'
            })}
            {...componentProps}
        >
            <Box
                className={styles.workspace}
                componentRef={containerRef}
            />
            {blockCommandSearchOpen ? (
                <div
                    aria-label={blockSearchLabel}
                    aria-modal="true"
                    className={styles.commandSearch}
                    role="dialog"
                    onClick={stopEventPropagation}
                    onKeyDown={onBlockCommandSearchKeyDown}
                    onMouseDown={stopEventPropagation}
                >
                    <div className={styles.commandSearchHeader}>
                        <label htmlFor="scratch-block-command-search">
                            {blockSearchLabel}
                        </label>
                        <button
                            aria-label={blockSearchCloseLabel}
                            data-audio-label={blockSearchCloseLabel}
                            type="button"
                            onClick={onBlockCommandSearchClose}
                            onMouseDown={onBlockCommandSearchClose}
                        >
                            {blockSearchCloseLabel}
                        </button>
                    </div>
                    <input
                        autoFocus
                        data-audio-label={blockSearchLabel}
                        id="scratch-block-command-search"
                        type="search"
                        value={blockCommandQuery}
                        onChange={onBlockCommandQueryChange}
                    />
                    <ul className={styles.commandSearchResults}>
                        {blockCommandItems.length ? blockCommandItems.map(item => (
                            <li key={`${item.action}-${item.id}`}>
                                <button
                                    data-audio-label={item.text}
                                    data-command-action={item.action}
                                    data-command-id={item.id}
                                    type="button"
                                    onClick={onBlockCommandSelect}
                                >
                                    <span>{item.text}</span>
                                    <small>{item.type}</small>
                                </button>
                            </li>
                        )) : (
                            <li className={styles.commandSearchEmpty}>
                                {blockSearchEmptyLabel}
                            </li>
                        )}
                    </ul>
                </div>
            ) : null}
            {onExplainSelectedBlock || onHelpSelectedScript || visionImpairedMode ? (
                <div className={styles.audioButtonGroup}>
                    {visionImpairedMode ? (
                        <button
                            aria-label={blockSearchButtonLabel}
                            className={styles.explainButton}
                            data-audio-label={blockSearchButtonLabel}
                            title={blockSearchButtonLabel}
                            type="button"
                            onClick={onBlockCommandSearchOpen}
                        >
                            {blockSearchButtonLabel}
                        </button>
                    ) : null}
                    {onExplainSelectedBlock ? (
                        <button
                            aria-label={explainButtonLabel}
                            className={styles.explainButton}
                            data-audio-label={explainButtonLabel}
                            title={explainButtonLabel}
                            type="button"
                            onClick={onExplainSelectedBlock}
                        >
                            {explainButtonLabel}
                        </button>
                    ) : null}
                    {onHelpSelectedScript ? (
                        <button
                            aria-label={helpButtonLabel}
                            className={styles.explainButton}
                            data-audio-label={helpButtonLabel}
                            title={helpButtonLabel}
                            type="button"
                            onClick={onHelpSelectedScript}
                        >
                            {helpButtonLabel}
                        </button>
                    ) : null}
                </div>
            ) : null}
        </Box>
    );
};
BlocksComponent.propTypes = {
    blockSize: PropTypes.string,
    blockCommandItems: PropTypes.arrayOf(PropTypes.shape({
        action: PropTypes.string,
        id: PropTypes.string,
        text: PropTypes.string,
        type: PropTypes.string
    })),
    blockCommandQuery: PropTypes.string,
    blockCommandSearchOpen: PropTypes.bool,
    blockSearchButtonLabel: PropTypes.string,
    blockSearchCloseLabel: PropTypes.string,
    blockSearchEmptyLabel: PropTypes.string,
    blockSearchLabel: PropTypes.string,
    containerRef: PropTypes.func,
    dragOver: PropTypes.bool,
    explainButtonLabel: PropTypes.string,
    helpButtonLabel: PropTypes.string,
    onBlockCommandQueryChange: PropTypes.func,
    onBlockCommandSearchKeyDown: PropTypes.func,
    onBlockCommandSearchClose: PropTypes.func,
    onBlockCommandSearchOpen: PropTypes.func,
    onBlockCommandSelect: PropTypes.func,
    onExplainSelectedBlock: PropTypes.func,
    onHelpSelectedScript: PropTypes.func,
    visionImpairedMode: PropTypes.bool
};
export default BlocksComponent;
