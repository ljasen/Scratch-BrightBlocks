import frenchMessages from './french-messages';
import {DEFAULT_EXPLANATIONS_BY_LOCALE} from './explanation-catalog';
import messages from './messages';
import {SPECIALISED_BLOCK_EXPLANATIONS} from '../specialised-blocks';
import {STARTER_BLOCK_EXPLANATIONS} from '../starter-blocks';

const BLOCK_AUDIO_MESSAGES = {
    motion_movesteps: {
        name: messages.motionMoveStepsName,
        explanation: messages.motionMoveStepsExplanation
    },
    motion_turnright: {
        name: messages.motionTurnRightName,
        explanation: messages.motionTurnRightExplanation
    },
    motion_turnleft: {
        name: messages.motionTurnLeftName,
        explanation: messages.motionTurnLeftExplanation
    },
    looks_say: {
        name: messages.looksSayName,
        explanation: messages.looksSayExplanation
    },
    looks_sayforsecs: {
        name: messages.looksSayName,
        explanation: messages.looksSayExplanation
    },
    looks_show: {
        name: messages.looksShowName,
        explanation: messages.looksShowExplanation
    },
    looks_hide: {
        name: messages.looksHideName,
        explanation: messages.looksHideExplanation
    },
    sound_play: {
        name: messages.soundPlayName,
        explanation: messages.soundPlayExplanation
    },
    sound_playuntildone: {
        name: messages.soundPlayName,
        explanation: messages.soundPlayExplanation
    },
    event_whenflagclicked: {
        name: messages.eventWhenFlagClickedName,
        explanation: messages.eventWhenFlagClickedExplanation
    },
    control_wait: {
        name: messages.controlWaitName,
        explanation: messages.controlWaitExplanation
    },
    control_repeat: {
        name: messages.controlRepeatName,
        explanation: messages.controlRepeatExplanation
    },
    control_forever: {
        name: messages.controlForeverName
    },
    control_repeat_until: {
        name: messages.controlRepeatUntilName
    }
};

const FALLBACK_MESSAGES = {
    name: messages.fallbackName,
    explanation: messages.fallbackExplanation
};

const LOOP_BLOCK_TYPES = new Set([
    'control_forever',
    'control_repeat',
    'control_repeat_until',
    'control_while',
    'control_for_each'
]);

const normalizeLocale = locale => (locale || 'en').toLowerCase().replace('_', '-');

const localMessagesForLocale = locale => {
    if (normalizeLocale(locale).startsWith('fr')) {
        return frenchMessages;
    }
    return {};
};

const formatMessage = (message, locale, localeMessages) => {
    if (!message) return '';
    if (localeMessages && localeMessages[message.id]) {
        return localeMessages[message.id];
    }
    const localMessages = localMessagesForLocale(locale);
    return localMessages[message.id] || message.defaultMessage;
};

const getBlockType = block => {
    if (!block) return null;
    return block.type || block.opcode || null;
};

const getRenderedBlockText = block => {
    if (!block || typeof block.toString !== 'function' || block.toString === Object.prototype.toString) return '';
    const text = block.toString();
    return typeof text === 'string' ? text.trim() : '';
};

const getMutationAttribute = (mutation, attributeName) => {
    if (!mutation) return '';
    if (typeof mutation.getAttribute === 'function') {
        return mutation.getAttribute(attributeName) || '';
    }
    return mutation[attributeName] || '';
};

const getProcedurePrototype = block => {
    if (!block) return null;
    if (getBlockType(block) === 'procedures_prototype') return block;
    if (typeof block.getInputTargetBlock === 'function') {
        return block.getInputTargetBlock('custom_block');
    }
    if (block.inputs && block.inputs.custom_block) {
        const input = block.inputs.custom_block;
        return Array.isArray(input) ? input[1] : input.block || null;
    }
    return null;
};

const cleanProcedureName = name => String(name || '')
    .replace(/%[snb]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const getProcedureName = block => {
    if (!block) return '';
    const blockType = getBlockType(block);
    const mutationName = getMutationAttribute(block.mutation, 'proccode');
    if (mutationName) return cleanProcedureName(mutationName);

    if (blockType === 'procedures_definition') {
        const prototype = getProcedurePrototype(block);
        const prototypeName = getMutationAttribute(prototype && prototype.mutation, 'proccode');
        if (prototypeName) return cleanProcedureName(prototypeName);
    }

    return cleanProcedureName(getRenderedBlockText(block));
};

const formatCustomProcedureExplanation = (block, locale) => {
    const blockType = getBlockType(block);
    if (!blockType || !blockType.startsWith('procedures_')) return '';

    const name = getProcedureName(block);
    if (!name) return '';

    if (isFrenchLocale(locale)) {
        return `Ceci est un bloc personnalise ${name}. Le programmeur a groupe plusieurs instructions ` +
            `ensemble et leur a donne le nom ${name}. Une contrainte importante : un bloc personnalise appartient ` +
            'au lutin ou il a ete cree ; il n est pas automatiquement disponible pour tous les lutins.';
    }
    return `This is a custom ${name} block. The programmer grouped several instructions together and gave them ` +
        `the name ${name}. One important constraint: a custom block belongs to the sprite where it was created; ` +
        'it is not automatically available to every sprite.';
};

const getLoopSuffix = locale => (normalizeLocale(locale).startsWith('fr') ? 'boucle' : 'loop');

const getRepeatTimesText = (renderedText, locale) => {
    const match = renderedText.match(/\d+/);
    if (!match) return '';
    return normalizeLocale(locale).startsWith('fr') ?
        `boucle repeter ${match[0]} fois` :
        `repeat ${match[0]} times loop`;
};

const getLoopRenderedBlockText = (blockType, renderedText, locale) => {
    if (!LOOP_BLOCK_TYPES.has(blockType)) return renderedText;

    const normalizedRenderedText = renderedText.toLowerCase();
    if (blockType === 'control_forever') {
        return normalizeLocale(locale).startsWith('fr') ? 'boucle repeter toujours' : 'forever loop';
    }
    if (blockType === 'control_repeat') {
        const repeatTimesText = getRepeatTimesText(renderedText, locale);
        if (repeatTimesText) return repeatTimesText;
    }
    if (!renderedText) return '';
    if (normalizedRenderedText.includes(getLoopSuffix(locale))) return renderedText;
    return normalizeLocale(locale).startsWith('fr') ?
        `boucle ${renderedText}` :
        `${renderedText} loop`;
};

const parseNumber = text => {
    const match = String(text || '').match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : null;
};

const parseNamedNumber = (text, name) => {
    const pattern = new RegExp(`${name}\\s*:?\\s*(-?\\d+(?:\\.\\d+)?)`, 'i');
    const match = String(text || '').match(pattern);
    return match ? Number(match[1]) : null;
};

const absoluteNumberText = value => String(Math.abs(value));

const isFrenchLocale = locale => normalizeLocale(locale).startsWith('fr');

const formatChangeAxisText = (axis, value, locale) => {
    if (value === null || Number.isNaN(value)) return '';
    const amount = absoluteNumberText(value);
    const positiveDirection = axis === 'x' ? 'right' : 'up';
    const negativeDirection = axis === 'x' ? 'left' : 'down';
    const direction = value >= 0 ? positiveDirection : negativeDirection;
    if (isFrenchLocale(locale)) {
        const frenchDirection = {
            right: 'a droite',
            left: 'a gauche',
            up: 'vers le haut',
            down: 'vers le bas'
        }[direction];
        return `deplacer le lutin ${frenchDirection} de ${amount}`;
    }
    return `move the sprite ${direction} by ${amount}`;
};

const formatSetAxisText = (axis, value, locale) => {
    if (value === null || Number.isNaN(value)) return '';
    const direction = axis === 'x' ?
        (value > 0 ? 'right of center' : 'left of center') :
        (value > 0 ? 'above center' : 'below center');
    if (value === 0) {
        return isFrenchLocale(locale) ?
            `placer le lutin a ${axis} 0, au centre` :
            `put the sprite at ${axis} 0, on the center line`;
    }
    if (isFrenchLocale(locale)) {
        const frenchDirection = {
            'right of center': 'a droite du centre',
            'left of center': 'a gauche du centre',
            'above center': 'au dessus du centre',
            'below center': 'en dessous du centre'
        }[direction];
        return `placer le lutin a ${axis} ${value}, ${frenchDirection}`;
    }
    return `put the sprite at ${axis} ${value}, ${direction}`;
};

const formatPositionText = (x, y, locale) => {
    if ([x, y].some(value => value === null || Number.isNaN(value))) return '';
    if (isFrenchLocale(locale)) {
        const xText = formatSetAxisText('x', x, locale).replace('placer le lutin a ', '');
        const yText = formatSetAxisText('y', y, locale).replace('placer le lutin a ', '');
        return `une position avec ${xText} et ${yText}`;
    }
    const xText = formatSetAxisText('x', x, locale).replace('put the sprite at ', '');
    const yText = formatSetAxisText('y', y, locale).replace('put the sprite at ', '');
    return `a position ${xText} and ${yText}`;
};

const getPlainMotionRenderedBlockText = (blockType, renderedText, locale) => {
    if (!renderedText) return '';

    if (blockType === 'motion_changexby') {
        return formatChangeAxisText('x', parseNumber(renderedText), locale);
    }
    if (blockType === 'motion_changeyby') {
        return formatChangeAxisText('y', parseNumber(renderedText), locale);
    }
    if (blockType === 'motion_setx') {
        return formatSetAxisText('x', parseNumber(renderedText), locale);
    }
    if (blockType === 'motion_sety') {
        return formatSetAxisText('y', parseNumber(renderedText), locale);
    }
    if (blockType === 'motion_gotoxy') {
        const x = parseNamedNumber(renderedText, 'x');
        const y = parseNamedNumber(renderedText, 'y');
        const positionText = formatPositionText(x, y, locale);
        return positionText ? `go to ${positionText}` : '';
    }
    if (blockType === 'motion_glidesecstoxy') {
        const seconds = parseNumber(renderedText);
        const x = parseNamedNumber(renderedText, 'x');
        const y = parseNamedNumber(renderedText, 'y');
        const positionText = formatPositionText(x, y, locale);
        if (!positionText) return '';
        if (seconds === null || Number.isNaN(seconds)) return `glide to ${positionText}`;
        const secondsText = seconds === 1 ? '1 second' : `${seconds} seconds`;
        return `glide for ${secondsText} to ${positionText}`;
    }
    return '';
};

const getCatalogExplanation = (blockType, locale) => {
    if (!blockType) return '';
    const normalizedLocale = normalizeLocale(locale);
    const language = normalizedLocale.split('-')[0];
    const localizedExplanations = DEFAULT_EXPLANATIONS_BY_LOCALE[language] || {};
    return localizedExplanations[blockType] || DEFAULT_EXPLANATIONS_BY_LOCALE.en[blockType] || '';
};

const getBlockAudioText = (block, mode, locale, localeMessages) => {
    const blockType = getBlockType(block);

    if (mode === 'name') {
        const renderedText = getRenderedBlockText(block);
        const plainMotionText = getPlainMotionRenderedBlockText(blockType, renderedText, locale);
        if (plainMotionText) return plainMotionText;
        const loopRenderedText = getLoopRenderedBlockText(blockType, renderedText, locale);
        if (loopRenderedText) return loopRenderedText;
    }

    if (mode === 'explanation') {
        const customProcedureExplanation = formatCustomProcedureExplanation(block, locale);
        if (customProcedureExplanation) return customProcedureExplanation;

        if (STARTER_BLOCK_EXPLANATIONS[blockType]) {
            return STARTER_BLOCK_EXPLANATIONS[blockType];
        }

        if (SPECIALISED_BLOCK_EXPLANATIONS[blockType]) {
            return SPECIALISED_BLOCK_EXPLANATIONS[blockType];
        }

        const explanation = getCatalogExplanation(blockType, locale);
        if (explanation) return explanation;
    }

    const blockMessages = BLOCK_AUDIO_MESSAGES[blockType] || FALLBACK_MESSAGES;
    return formatMessage(blockMessages[mode] || FALLBACK_MESSAGES[mode], locale, localeMessages);
};

export {
    BLOCK_AUDIO_MESSAGES,
    FALLBACK_MESSAGES,
    formatMessage,
    getBlockAudioText,
    getCatalogExplanation,
    getProcedureName,
    getRenderedBlockText,
    getBlockType,
    getLoopRenderedBlockText,
    getPlainMotionRenderedBlockText,
    normalizeLocale
};
