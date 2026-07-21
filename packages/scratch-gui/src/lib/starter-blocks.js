const STARTER_BLOCK_CATEGORY_ID = 'starter';
const STARTER_BLOCK_CATEGORY_NAME = 'Starter';

const STARTER_BLOCKS = [
    {
        opcode: 'starter_jump',
        label: 'jump',
        explanation: 'This starter block moves the character upward like a simple jump. It is a small built-in ' +
            'action for beginners. For a better jump with gravity, the child can build a longer script later.'
    },
    {
        opcode: 'starter_walk',
        label: 'walk %1 steps',
        inputs: [{
            name: 'STEPS',
            type: 'math_number',
            defaultValue: '10'
        }],
        explanation: 'This starter block means walk by the number of steps you choose. The number input is ' +
            'controlled ' +
            'by the child: bigger numbers walk farther, smaller numbers walk a shorter distance.'
    },
    {
        opcode: 'starter_playanimation',
        label: 'play animation',
        explanation: 'This starter block switches to the next costume once. If the sprite has several costumes, ' +
            'pressing it again and again can look like a simple animation.'
    },
    {
        opcode: 'starter_saymessage',
        label: 'say %1',
        inputs: [{
            name: 'MESSAGE',
            type: 'text',
            defaultValue: 'Hello!'
        }],
        explanation: 'This starter block means make the character say the message in the text box. The child writes ' +
            'the words, and the sprite can show those words in a speech bubble.'
    },
    {
        opcode: 'starter_takedamage',
        label: 'take damage',
        explanation: 'This starter block makes the character look damaged by shrinking it a little. Later, the ' +
            'child can connect this idea to a health variable.'
    },
    {
        opcode: 'starter_resetcharacter',
        label: 'reset character',
        explanation: 'This starter block means put the character back to a starting state. That might include ' +
            'moving ' +
            'to the start position, showing the normal costume, setting health back, and making the sprite visible.'
    },
    {
        opcode: 'starter_spawnobject',
        label: 'spawn object',
        explanation: 'This starter block creates a clone of the current sprite. Children can use clones for ' +
            'objects like coins, enemies, or power-ups.'
    },
    {
        opcode: 'starter_drawshape',
        label: 'draw shape',
        explanation: 'This starter block means draw a shape with code. It does not decide the shape by itself. The ' +
            'child chooses the shape, such as a square, triangle, or circle, by adding pen and movement blocks.'
    },
    {
        opcode: 'starter_startlevel',
        label: 'start level',
        explanation: 'This starter block means set up a level before play begins. A child might use it to choose a ' +
            'backdrop, place characters, reset score, and start the first challenge.'
    },
    {
        opcode: 'starter_checkgameover',
        label: 'check if game over',
        explanation: 'This starter block means check whether the game should end. The child decides the rule, such ' +
            'as health reaching zero, time running out, or the player touching an enemy.'
    }
];

const STARTER_BLOCK_EXPLANATIONS = STARTER_BLOCKS.reduce((map, block) => {
    map[block.opcode] = block.explanation;
    return map;
}, {});

const STARTER_LEGACY_PROCEDURE_CODES = new Set([
    'jump',
    'walk %s',
    'play animation',
    'say %s',
    'take damage',
    'reset character',
    'spawn object',
    'draw shape',
    'start level',
    'check if game over'
]);

const getProcedureCodeFromFlyoutNode = node => {
    if (!node || node.getAttribute('type') !== 'procedures_call') return '';
    const mutation = node.querySelector && node.querySelector('mutation');
    return mutation ? mutation.getAttribute('proccode') || '' : '';
};

const filterStarterProcedureDuplicates = xmlList => (
    xmlList.filter(node => !STARTER_LEGACY_PROCEDURE_CODES.has(getProcedureCodeFromFlyoutNode(node)))
);

export {
    STARTER_BLOCK_CATEGORY_ID,
    STARTER_BLOCK_CATEGORY_NAME,
    STARTER_BLOCKS,
    STARTER_BLOCK_EXPLANATIONS,
    filterStarterProcedureDuplicates
};
