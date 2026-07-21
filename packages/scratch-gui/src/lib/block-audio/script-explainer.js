import {getBlockAudioText, getBlockType, getRenderedBlockText} from './text';

const MAX_SEQUENCE_LENGTH = 8;

const PHRASES = {
    en: {
        foreverMoveTurn: 'This forever loop repeats forever. The sprite moves forward, then turns. ' +
            'It keeps doing that again and again, so it moves in a curved path.',
        foreverStep: 'This is a forever loop. Everything inside this block repeats continuously.',
        moveInLoopStep: 'The sprite moves forward.',
        turnInLoopStep: 'Then the sprite turns. Because this is inside forever, ' +
            'moving and turning can make a curved path.',
        loopActionPrefix: 'Then this block also runs inside the forever loop: ',
        greenFlagStep: 'This script starts when the green flag is clicked.',
        keyStep: 'This script starts when the chosen key is pressed.',
        clickStep: 'This script starts when this sprite is clicked.',
        broadcastStep: 'This script starts when this message is received.',
        foreverPrefix: 'This forever loop repeats forever. ',
        repeatPrefix: 'This repeat loop repeats the blocks inside. ',
        ifPrefix: 'This checks a question. If the answer is yes, ',
        ifCondition: condition => `If ${condition} is yes, the blocks inside run.`,
        jumpAction: 'Your character jumps.',
        cloneAction: renderedText => `Then ${renderedText}. A clone is a copy of your character.`,
        ifElsePrefix: 'This checks a question. If yes, it runs the first blocks. If no, it runs the other blocks.',
        greenFlagPrefix: 'When the green flag is clicked, ',
        keyPrefix: 'When the chosen key is pressed, ',
        clickPrefix: 'When this sprite is clicked, ',
        broadcastPrefix: 'When this message is received, ',
        sequencePrefix: 'This script ',
        then: ', then ',
        andKeepsGoing: ', and then keeps going.',
        runInside: 'it runs the blocks inside.',
        empty: ''
    },
    fr: {
        foreverMoveTurn: 'Cette boucle se repete toujours. Le lutin avance, puis il tourne. ' +
            'Il recommence encore et encore, donc il se deplace en courbe.',
        foreverStep: 'Ceci est une boucle qui repete toujours. Tout ce qui est dedans se repete tout le temps.',
        moveInLoopStep: 'Le lutin avance.',
        turnInLoopStep: 'Puis le lutin tourne. Comme c est dans forever, avancer et tourner peut faire une courbe.',
        loopActionPrefix: 'Puis ce bloc se lance aussi dans la boucle forever : ',
        greenFlagStep: 'Ce script commence quand le drapeau vert est clique.',
        keyStep: 'Ce script commence quand la touche choisie est appuyee.',
        clickStep: 'Ce script commence quand ce lutin est clique.',
        broadcastStep: 'Ce script commence quand ce message est recu.',
        foreverPrefix: 'Cette boucle se repete toujours. ',
        repeatPrefix: 'Cette boucle repete les blocs dedans. ',
        ifPrefix: 'Ceci pose une question. Si la reponse est oui, ',
        ifCondition: condition => `Si ${condition} est vrai, les blocs dedans se lancent.`,
        jumpAction: 'Ton personnage saute.',
        cloneAction: renderedText => `Puis ${renderedText}. Un clone est une copie de ton personnage.`,
        ifElsePrefix: 'Ceci pose une question. Si oui, il lance les premiers blocs. Sinon, il lance les autres blocs.',
        greenFlagPrefix: 'Quand le drapeau vert est clique, ',
        keyPrefix: 'Quand la touche choisie est appuyee, ',
        clickPrefix: 'Quand ce lutin est clique, ',
        broadcastPrefix: 'Quand ce message est recu, ',
        sequencePrefix: 'Ce script ',
        then: ', puis ',
        andKeepsGoing: ', puis continue.',
        runInside: 'il lance les blocs dedans.',
        empty: ''
    }
};

const getPhrases = locale => PHRASES[(locale || 'en').toLowerCase().split('-')[0]] || PHRASES.en;

const getInputBlock = (block, inputName) => {
    if (!block) return null;
    if (typeof block.getInputTargetBlock === 'function') {
        return block.getInputTargetBlock(inputName);
    }
    if (!block.inputList) return null;
    const input = block.inputList.find(item => item.name === inputName);
    if (!input || !input.connection || typeof input.connection.targetBlock !== 'function') return null;
    return input.connection.targetBlock();
};

const getNextBlock = block => {
    if (!block || typeof block.getNextBlock !== 'function') return null;
    return block.getNextBlock();
};

const getSubstack = block => getInputBlock(block, 'SUBSTACK');

const getSecondSubstack = block => getInputBlock(block, 'SUBSTACK2');

const isHatBlock = block => {
    const type = getBlockType(block);
    return type && (
        type.startsWith('event_when') ||
        type === 'control_start_as_clone'
    );
};

const collectSequence = startBlock => {
    const blocks = [];
    let block = startBlock;
    while (block && blocks.length < MAX_SEQUENCE_LENGTH) {
        blocks.push(block);
        block = getNextBlock(block);
    }
    return blocks;
};

const getBlockId = block => (block && block.id) || '';

const blockIdsFor = blocks => blocks.map(getBlockId).filter(Boolean);

const hasNestedBlocks = block => Boolean(getSubstack(block) || getSecondSubstack(block));

const hasScriptShape = block => Boolean(getNextBlock(block) || hasNestedBlocks(block) || isHatBlock(block));

const isMoveTurnSequence = blocks => {
    if (blocks.length < 2) return false;
    return getBlockType(blocks[0]) === 'motion_movesteps' && (
        getBlockType(blocks[1]) === 'motion_turnright' ||
        getBlockType(blocks[1]) === 'motion_turnleft'
    );
};

const simpleActionText = (block, locale, localeMessages) => {
    const renderedText = getRenderedBlockText(block);
    if (renderedText) return renderedText;
    return getBlockAudioText(block, 'name', locale, localeMessages);
};

const getProcedureName = block => {
    if (!block || !block.mutation) return '';
    if (block.mutation.proccode) return block.mutation.proccode;
    if (typeof block.mutation.getAttribute === 'function') {
        return block.mutation.getAttribute('proccode') || '';
    }
    return '';
};

const explainSequence = (startBlock, locale, localeMessages) => {
    const phrases = getPhrases(locale);
    const blocks = collectSequence(startBlock);
    if (!blocks.length) return phrases.empty;
    const actions = blocks.map(block => simpleActionText(block, locale, localeMessages).toLowerCase());
    const text = actions.join(phrases.then);
    if (getNextBlock(blocks[blocks.length - 1])) {
        return `${text}${phrases.andKeepsGoing}`;
    }
    return text;
};

const explainActionStep = (block, locale, localeMessages, optPrefix = '') => {
    const phrases = getPhrases(locale);
    const type = getBlockType(block);
    const procedureName = getProcedureName(block)
        .trim()
        .toLowerCase();
    if (type === 'procedures_call' && procedureName === 'jump') {
        return {
            blockIds: blockIdsFor([block]),
            text: phrases.jumpAction
        };
    }
    if (type === 'control_create_clone_of') {
        const renderedText = simpleActionText(block, locale, localeMessages).toLowerCase();
        return {
            blockIds: blockIdsFor([block]),
            text: phrases.cloneAction(renderedText)
        };
    }
    return {
        blockIds: blockIdsFor([block]),
        text: `${optPrefix}${simpleActionText(block, locale, localeMessages).toLowerCase()}.`
    };
};

const explainIfSteps = (block, locale, localeMessages) => {
    const phrases = getPhrases(locale);
    const condition = getInputBlock(block, 'CONDITION');
    const conditionText = simpleActionText(condition, locale, localeMessages)
        .toLowerCase()
        .replace(/\?$/, '');
    const conditionStep = {
        blockIds: blockIdsFor([block, condition]),
        text: conditionText ? phrases.ifCondition(conditionText) : phrases.ifElsePrefix
    };
    const actionSteps = collectSequence(getSubstack(block))
        .map(action => explainActionStep(action, locale, localeMessages));
    return [conditionStep].concat(actionSteps);
};

const explainSequenceSteps = (startBlock, locale, localeMessages, optPrefix = '') => (
    collectSequence(startBlock).flatMap((block, index) => (
        getBlockType(block) === 'control_if' ?
            explainIfSteps(block, locale, localeMessages) :
            [explainActionStep(block, locale, localeMessages, index === 0 ? optPrefix : '')]
    ))
);

const explainForever = (block, locale, localeMessages) => {
    const phrases = getPhrases(locale);
    const substack = getSubstack(block);
    const innerBlocks = collectSequence(substack);
    if (isMoveTurnSequence(innerBlocks)) return phrases.foreverMoveTurn;
    const sequence = explainSequence(substack, locale, localeMessages);
    return sequence ? `${phrases.foreverPrefix}${sequence}.` : `${phrases.foreverPrefix}${phrases.runInside}`;
};

const explainForeverSteps = (block, locale, localeMessages) => {
    const phrases = getPhrases(locale);
    const substack = getSubstack(block);
    const innerBlocks = collectSequence(substack);
    const steps = [{
        blockIds: blockIdsFor([block]),
        text: phrases.foreverStep
    }];

    if (isMoveTurnSequence(innerBlocks)) {
        steps.push({
            blockIds: blockIdsFor([innerBlocks[0]]),
            text: phrases.moveInLoopStep
        });
        steps.push({
            blockIds: blockIdsFor([innerBlocks[1]]),
            text: phrases.turnInLoopStep
        });
        const remainingBlocks = innerBlocks.slice(2);
        return steps.concat(explainSequenceSteps(
            remainingBlocks[0],
            locale,
            localeMessages,
            phrases.loopActionPrefix
        ));
    }

    return steps.concat(explainSequenceSteps(substack, locale, localeMessages));
};

const explainRepeat = (block, locale, localeMessages) => {
    const phrases = getPhrases(locale);
    const sequence = explainSequence(getSubstack(block), locale, localeMessages);
    return sequence ? `${phrases.repeatPrefix}${sequence}.` : `${phrases.repeatPrefix}${phrases.runInside}`;
};

const explainIf = (block, locale, localeMessages) => {
    const phrases = getPhrases(locale);
    const sequence = explainSequence(getSubstack(block), locale, localeMessages);
    return sequence ? `${phrases.ifPrefix}${sequence}.` : `${phrases.ifPrefix}${phrases.runInside}`;
};

const explainEvent = (block, locale, localeMessages) => {
    const phrases = getPhrases(locale);
    const type = getBlockType(block);
    const sequence = explainSequence(getNextBlock(block), locale, localeMessages);
    const suffix = sequence ? `${sequence}.` : phrases.runInside;
    if (type === 'event_whenflagclicked') return `${phrases.greenFlagPrefix}${suffix}`;
    if (type === 'event_whenkeypressed') return `${phrases.keyPrefix}${suffix}`;
    if (type === 'event_whenthisspriteclicked') return `${phrases.clickPrefix}${suffix}`;
    if (type === 'event_whenbroadcastreceived') return `${phrases.broadcastPrefix}${suffix}`;
    return `${phrases.sequencePrefix}${suffix}`;
};

const eventStepText = (block, locale) => {
    const phrases = getPhrases(locale);
    const type = getBlockType(block);
    if (type === 'event_whenflagclicked') return phrases.greenFlagStep;
    if (type === 'event_whenkeypressed') return phrases.keyStep;
    if (type === 'event_whenthisspriteclicked') return phrases.clickStep;
    if (type === 'event_whenbroadcastreceived') return phrases.broadcastStep;
    return '';
};

const explainScript = (block, locale, localeMessages) => {
    if (!block || !hasScriptShape(block)) return '';
    const type = getBlockType(block);
    if (type === 'control_forever') return explainForever(block, locale, localeMessages);
    if (type === 'control_repeat') return explainRepeat(block, locale, localeMessages);
    if (type === 'control_if') return explainIf(block, locale, localeMessages);
    if (type === 'control_if_else') return getPhrases(locale).ifElsePrefix;
    if (isHatBlock(block)) return explainEvent(block, locale, localeMessages);

    const sequence = explainSequence(block, locale, localeMessages);
    return sequence ? `${getPhrases(locale).sequencePrefix}${sequence}.` : '';
};

const explainScriptSteps = (block, locale, localeMessages) => {
    if (!block || !hasScriptShape(block)) return [];
    const type = getBlockType(block);
    if (type === 'control_forever') return explainForeverSteps(block, locale, localeMessages);
    if (type === 'control_if') return explainIfSteps(block, locale, localeMessages);

    if (isHatBlock(block)) {
        const steps = [];
        const hatText = eventStepText(block, locale);
        if (hatText) {
            steps.push({
                blockIds: blockIdsFor([block]),
                text: hatText
            });
        }
        const nextBlock = getNextBlock(block);
        if (getBlockType(nextBlock) === 'control_forever') {
            return steps.concat(explainForeverSteps(nextBlock, locale, localeMessages));
        }
        if (getBlockType(nextBlock) === 'control_if') {
            return steps.concat(explainIfSteps(nextBlock, locale, localeMessages));
        }
        return steps.concat(explainSequenceSteps(nextBlock, locale, localeMessages));
    }

    const explanation = explainScript(block, locale, localeMessages);
    return explanation ? [{
        blockIds: blockIdsFor([block]),
        text: explanation
    }] : [];
};

export {
    collectSequence,
    explainScript,
    explainScriptSteps,
    hasScriptShape
};
