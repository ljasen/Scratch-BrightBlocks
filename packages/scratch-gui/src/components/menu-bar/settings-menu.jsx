import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {useIntl, FormattedMessage, defineMessage} from 'react-intl';
import {connect} from 'react-redux';
import useMenuNavigation from '../../hooks/use-menu-navigation';

import LanguageMenu from './language-menu.jsx';
import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuSection} from '../menu/menu.jsx';
import PreferenceMenu from './preference-menu.jsx';

import {DEFAULT_MODE, HIGH_CONTRAST_MODE, colorModeMap} from '../../lib/settings/color-mode/index.js';
import {themeMap} from '../../lib/settings/theme/index.js';
import {persistColorMode} from '../../lib/settings/color-mode/persistence.js';
import {persistTheme} from '../../lib/settings/theme/persistence.js';
import {
    persistBlockAudioHoverDelay,
    persistBlockSize,
    persistVisionImpairedMode
} from '../../lib/settings/accessibility/persistence.js';
import {
    BLOCK_AUDIO_HOVER_DELAY_LONG,
    BLOCK_AUDIO_HOVER_DELAY_MEDIUM,
    BLOCK_AUDIO_HOVER_DELAY_SHORT,
    BLOCK_SIZE_EXTRA_LARGE,
    BLOCK_SIZE_LARGE,
    BLOCK_SIZE_NORMAL,
    setBlockAudioHoverDelay,
    setBlockSize,
    setColorMode,
    setTheme,
    setVisionImpairedMode
} from '../../reducers/settings.js';

import menuBarStyles from './menu-bar.css';
import styles from './settings-menu.css';

import dropdownCaret from './dropdown-caret.svg';
import settingsIcon from './icon--settings.svg';
import themeIcon from '../../lib/assets/icon--theme.svg';

const settingsMenuAriaMessage = defineMessage({
    id: 'gui.aria.settingsMenu',
    defaultMessage: 'Settings menu',
    description: 'accessibility label for settings menu'
});

const enabledColorModes = [DEFAULT_MODE, HIGH_CONTRAST_MODE];

const blockSizeMap = {
    [BLOCK_SIZE_NORMAL]: {
        label: {
            id: 'gui.menuBar.blockSize.normal',
            defaultMessage: 'Normal',
            description: 'Normal block size setting'
        }
    },
    [BLOCK_SIZE_LARGE]: {
        label: {
            id: 'gui.menuBar.blockSize.large',
            defaultMessage: 'Large',
            description: 'Large block size setting'
        }
    },
    [BLOCK_SIZE_EXTRA_LARGE]: {
        label: {
            id: 'gui.menuBar.blockSize.extraLarge',
            defaultMessage: 'Extra Large',
            description: 'Extra large block size setting'
        }
    }
};

const hoverDelayMap = {
    [BLOCK_AUDIO_HOVER_DELAY_SHORT]: {
        label: {
            id: 'gui.menuBar.hoverAudioDelay.short',
            defaultMessage: 'Short',
            description: 'Short hover audio delay setting'
        }
    },
    [BLOCK_AUDIO_HOVER_DELAY_MEDIUM]: {
        label: {
            id: 'gui.menuBar.hoverAudioDelay.medium',
            defaultMessage: 'Medium',
            description: 'Medium hover audio delay setting'
        }
    },
    [BLOCK_AUDIO_HOVER_DELAY_LONG]: {
        label: {
            id: 'gui.menuBar.hoverAudioDelay.long',
            defaultMessage: 'Long',
            description: 'Long hover audio delay setting'
        }
    }
};

const visionImpairedModeMap = {
    off: {
        label: {
            id: 'gui.menuBar.visionImpairedMode.off',
            defaultMessage: 'Off',
            description: 'Off option for vision impaired mode'
        }
    },
    on: {
        label: {
            id: 'gui.menuBar.visionImpairedMode.on',
            defaultMessage: 'On',
            description: 'On option for vision impaired mode'
        }
    }
};

const SettingsMenu = ({
    canChangeLanguage,
    canChangeColorMode,
    canChangeTheme,
    hasActiveMembership,
    isRtl,
    activeColorMode,
    activeBlockAudioHoverDelay,
    activeBlockSize,
    activeVisionImpairedMode,
    onChangeColorMode,
    onChangeBlockAudioHoverDelay,
    onChangeBlockSize,
    onChangeVisionImpairedMode,
    activeTheme,
    onChangeTheme,
    depth
}) => {
    const intl = useIntl();

    const enabledColorModesMap = useMemo(() => Object.keys(colorModeMap).reduce((acc, colorMode) => {
        if (enabledColorModes.includes(colorMode)) {
            acc[colorMode] = colorModeMap[colorMode];
        }
        return acc;
    }, {}), []);
    const availableThemesMap = useMemo(() => Object.keys(themeMap).reduce((acc, themeKey) => {
        const theme = themeMap[themeKey];
        if (theme.isAvailable?.({hasActiveMembership})) {
            acc[themeKey] = theme;
        }
        return acc;
    }, {}), [hasActiveMembership]);
    const availableThemesLength = useMemo(() => Object.keys(availableThemesMap).length, [availableThemesMap]);

    const {
        isExpanded,
        handleOnOpen,
        handleOnClose,
        handleKeyDown,
        menuRef
    } = useMenuNavigation({
        depth,
        isRtl
    });

    return (<div
        className={classNames(menuBarStyles.menuBarItem, menuBarStyles.hoverable, menuBarStyles.themeMenu, {
            [menuBarStyles.active]: isExpanded()
        })}
        aria-expanded={isExpanded()}
        aria-haspopup="menu"
        aria-label={intl.formatMessage(settingsMenuAriaMessage)}
        onClick={handleOnOpen}
        onKeyDown={handleKeyDown}
        ref={menuRef}
        role="button"
        tabIndex={0}
    >
        <img src={settingsIcon} />
        <span className={styles.dropdownLabel}>
            <FormattedMessage
                defaultMessage="Settings"
                description="Settings menu"
                id="gui.menuBar.settings"
            />
        </span>
        <img src={dropdownCaret} />
        <MenuBarMenu
            className={menuBarStyles.menuBarMenu}
            open={isExpanded()}
            place={isRtl ? 'left' : 'right'}
            onRequestClose={handleOnClose}
        >
            <MenuSection>
                {canChangeLanguage && <LanguageMenu depth={depth + 1} />}
                {canChangeTheme &&
                    // TODO: Consider always showing the theme menu, even if there is a single available theme
                    availableThemesLength > 1 &&
                    <PreferenceMenu
                        itemsMap={availableThemesMap}
                        onChange={onChangeTheme}
                        defaultMenuIconSrc={themeIcon}
                        submenuLabel={{
                            defaultMessage: 'Theme',
                            description: 'Theme sub-menu',
                            id: 'gui.menuBar.theme'
                        }}
                        selectedItemKey={activeTheme}
                        isRtl={isRtl}
                        depth={depth + 1}
                    />}
                {canChangeColorMode && <PreferenceMenu
                    itemsMap={enabledColorModesMap}
                    onChange={onChangeColorMode}
                    submenuLabel={{
                        defaultMessage: 'Color Mode',
                        description: 'Color mode sub-menu',
                        id: 'gui.menuBar.colorMode'
                    }}
                    selectedItemKey={activeColorMode}
                    isRtl={isRtl}
                    depth={depth + 1}
                />}
                <PreferenceMenu
                    itemsMap={visionImpairedModeMap}
                    onChange={onChangeVisionImpairedMode}
                    submenuLabel={{
                        defaultMessage: 'Vision Impaired Mode',
                        description: 'Vision impaired mode sub-menu',
                        id: 'gui.menuBar.visionImpairedMode'
                    }}
                    selectedItemKey={activeVisionImpairedMode ? 'on' : 'off'}
                    isRtl={isRtl}
                    depth={depth + 1}
                />
                <PreferenceMenu
                    itemsMap={blockSizeMap}
                    onChange={onChangeBlockSize}
                    submenuLabel={{
                        defaultMessage: 'Block Size',
                        description: 'Block size sub-menu',
                        id: 'gui.menuBar.blockSize'
                    }}
                    selectedItemKey={activeBlockSize}
                    isRtl={isRtl}
                    depth={depth + 1}
                />
                <PreferenceMenu
                    itemsMap={hoverDelayMap}
                    onChange={onChangeBlockAudioHoverDelay}
                    submenuLabel={{
                        defaultMessage: 'Hover Audio Delay',
                        description: 'Hover audio delay sub-menu',
                        id: 'gui.menuBar.hoverAudioDelay'
                    }}
                    selectedItemKey={activeBlockAudioHoverDelay}
                    isRtl={isRtl}
                    depth={depth + 1}
                />
            </MenuSection>
        </MenuBarMenu>
    </div>);
};

SettingsMenu.propTypes = {
    canChangeLanguage: PropTypes.bool,
    canChangeColorMode: PropTypes.bool,
    canChangeTheme: PropTypes.bool,
    hasActiveMembership: PropTypes.bool,
    isRtl: PropTypes.bool,
    activeBlockAudioHoverDelay: PropTypes.string,
    activeBlockSize: PropTypes.string,
    activeColorMode: PropTypes.string,
    activeVisionImpairedMode: PropTypes.bool,
    onChangeBlockAudioHoverDelay: PropTypes.func,
    onChangeBlockSize: PropTypes.func,
    onChangeColorMode: PropTypes.func,
    onChangeVisionImpairedMode: PropTypes.func,
    activeTheme: PropTypes.string,
    onChangeTheme: PropTypes.func,
    depth: PropTypes.number
};

const mapStateToProps = state => ({
    activeBlockAudioHoverDelay: state.scratchGui.settings.blockAudioHoverDelay,
    activeBlockSize: state.scratchGui.settings.blockSize,
    activeColorMode: state.scratchGui.settings.colorMode,
    activeVisionImpairedMode: state.scratchGui.settings.visionImpairedMode,
    activeTheme: state.scratchGui.settings.theme,
    isRtl: state.locales.isRtl
});

const mapDispatchToProps = dispatch => ({
    onChangeBlockAudioHoverDelay: delay => {
        dispatch(setBlockAudioHoverDelay(delay));
        persistBlockAudioHoverDelay(delay);
    },
    onChangeBlockSize: blockSize => {
        dispatch(setBlockSize(blockSize));
        persistBlockSize(blockSize);
    },
    onChangeVisionImpairedMode: mode => {
        const enabled = mode === 'on';
        dispatch(setVisionImpairedMode(enabled));
        persistVisionImpairedMode(enabled);
    },
    onChangeColorMode: colorMode => {
        dispatch(setColorMode(colorMode));
        persistColorMode(colorMode);
    },
    onChangeTheme: theme => {
        dispatch(setTheme(theme));
        persistTheme(theme);
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SettingsMenu);
