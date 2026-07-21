const BLOCK_SIZE_KEY = 'scratch-block-size';
const BLOCK_AUDIO_HOVER_DELAY_KEY = 'scratch-block-audio-hover-delay';
const VISION_IMPAIRED_MODE_KEY = 'scratch-vision-impaired-mode';
const DEFAULT_BLOCK_SIZE = 'normal';
const DEFAULT_BLOCK_AUDIO_HOVER_DELAY = 'medium';
const BLOCK_SIZES = ['normal', 'large', 'extra-large'];
const BLOCK_AUDIO_HOVER_DELAYS = ['short', 'medium', 'long'];

const readSetting = (key, defaultValue) => {
    try {
        return localStorage.getItem(key) || defaultValue;
    } catch {
        return defaultValue;
    }
};

const writeSetting = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Ignore storage errors in private browsing or restricted environments.
    }
};

const detectBlockSize = () => {
    const blockSize = readSetting(BLOCK_SIZE_KEY, DEFAULT_BLOCK_SIZE);
    return BLOCK_SIZES.includes(blockSize) ? blockSize : DEFAULT_BLOCK_SIZE;
};

const persistBlockSize = blockSize => writeSetting(BLOCK_SIZE_KEY, blockSize);

const detectBlockAudioHoverDelay = () => {
    const delay = readSetting(BLOCK_AUDIO_HOVER_DELAY_KEY, DEFAULT_BLOCK_AUDIO_HOVER_DELAY);
    return BLOCK_AUDIO_HOVER_DELAYS.includes(delay) ? delay : DEFAULT_BLOCK_AUDIO_HOVER_DELAY;
};

const persistBlockAudioHoverDelay = delay => writeSetting(BLOCK_AUDIO_HOVER_DELAY_KEY, delay);

const detectVisionImpairedMode = () => readSetting(VISION_IMPAIRED_MODE_KEY, 'off') === 'on';

const persistVisionImpairedMode = enabled => writeSetting(
    VISION_IMPAIRED_MODE_KEY,
    enabled ? 'on' : 'off'
);

export {
    detectBlockAudioHoverDelay,
    detectBlockSize,
    detectVisionImpairedMode,
    persistBlockAudioHoverDelay,
    persistBlockSize,
    persistVisionImpairedMode
};
