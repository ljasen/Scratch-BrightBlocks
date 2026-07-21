import {detectColorMode} from '../lib/settings/color-mode/persistence';
import {detectTheme} from '../lib/settings/theme/persistence';
import {
    detectBlockAudioHoverDelay,
    detectBlockSize,
    detectVisionImpairedMode
} from '../lib/settings/accessibility/persistence';

const SET_COLOR_MODE = 'scratch-gui/settings/SET_COLOR_MODE';
const SET_THEME = 'scratch-gui/settings/SET_THEME';
const SET_BLOCK_SIZE = 'scratch-gui/settings/SET_BLOCK_SIZE';
const SET_BLOCK_AUDIO_HOVER_DELAY = 'scratch-gui/settings/SET_BLOCK_AUDIO_HOVER_DELAY';
const SET_VISION_IMPAIRED_MODE = 'scratch-gui/settings/SET_VISION_IMPAIRED_MODE';

const BLOCK_SIZE_NORMAL = 'normal';
const BLOCK_SIZE_LARGE = 'large';
const BLOCK_SIZE_EXTRA_LARGE = 'extra-large';

const BLOCK_SIZE_SCALE = {
    [BLOCK_SIZE_NORMAL]: 0.675,
    [BLOCK_SIZE_LARGE]: 0.85,
    [BLOCK_SIZE_EXTRA_LARGE]: 1
};

const BLOCK_AUDIO_HOVER_DELAY_SHORT = 'short';
const BLOCK_AUDIO_HOVER_DELAY_MEDIUM = 'medium';
const BLOCK_AUDIO_HOVER_DELAY_LONG = 'long';

const BLOCK_AUDIO_HOVER_DELAY_MS = {
    [BLOCK_AUDIO_HOVER_DELAY_SHORT]: 500,
    [BLOCK_AUDIO_HOVER_DELAY_MEDIUM]: 1000,
    [BLOCK_AUDIO_HOVER_DELAY_LONG]: 1500
};

const initialState = {
    colorMode: detectColorMode(),
    blockAudioHoverDelay: detectBlockAudioHoverDelay(),
    blockSize: detectBlockSize(),
    visionImpairedMode: detectVisionImpairedMode(),
    theme: detectTheme()
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
    case SET_COLOR_MODE:
        return {...state, colorMode: action.colorMode};
    case SET_THEME:
        return {...state, theme: action.theme};
    case SET_BLOCK_SIZE:
        return {...state, blockSize: action.blockSize};
    case SET_BLOCK_AUDIO_HOVER_DELAY:
        return {...state, blockAudioHoverDelay: action.blockAudioHoverDelay};
    case SET_VISION_IMPAIRED_MODE:
        return {...state, visionImpairedMode: action.visionImpairedMode};
    default:
        return state;
    }
};

const setColorMode = colorMode => ({
    type: SET_COLOR_MODE,
    colorMode
});

const setTheme = theme => ({
    type: SET_THEME,
    theme
});

const setBlockSize = blockSize => ({
    type: SET_BLOCK_SIZE,
    blockSize
});

const setBlockAudioHoverDelay = blockAudioHoverDelay => ({
    type: SET_BLOCK_AUDIO_HOVER_DELAY,
    blockAudioHoverDelay
});

const setVisionImpairedMode = visionImpairedMode => ({
    type: SET_VISION_IMPAIRED_MODE,
    visionImpairedMode
});

export {
    BLOCK_AUDIO_HOVER_DELAY_LONG,
    BLOCK_AUDIO_HOVER_DELAY_MEDIUM,
    BLOCK_AUDIO_HOVER_DELAY_MS,
    BLOCK_AUDIO_HOVER_DELAY_SHORT,
    BLOCK_SIZE_EXTRA_LARGE,
    BLOCK_SIZE_LARGE,
    BLOCK_SIZE_NORMAL,
    BLOCK_SIZE_SCALE,
    reducer as default,
    initialState as settingsInitialState,
    setBlockAudioHoverDelay,
    setBlockSize,
    setColorMode,
    setTheme,
    setVisionImpairedMode
};
