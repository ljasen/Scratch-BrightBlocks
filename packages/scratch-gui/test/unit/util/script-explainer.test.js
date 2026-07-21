import {explainScript, explainScriptSteps, hasScriptShape} from '../../../src/lib/block-audio/script-explainer';

const block = ({type, text, next = null, substack = null, substack2 = null, mutation = null}) => ({
    id: `${type}-id`,
    type,
    mutation,
    toString: () => text,
    getNextBlock: () => next,
    getInputTargetBlock: name => {
        if (name === 'SUBSTACK') return substack;
        if (name === 'SUBSTACK2') return substack2;
        return null;
    }
});

test('explains jump and clone actions nested in an if block', () => {
    const clone = block({
        type: 'control_create_clone_of',
        text: 'create clone of myself'
    });
    const jump = block({
        type: 'procedures_call',
        text: 'jump',
        mutation: {proccode: 'jump'},
        next: clone
    });
    const condition = block({
        type: 'sensing_keypressed',
        text: 'space key pressed?'
    });
    const ifBlock = block({
        type: 'control_if',
        text: 'if space key pressed then',
        substack: jump
    });
    ifBlock.getInputTargetBlock = inputName => (inputName === 'CONDITION' ? condition : (
        inputName === 'SUBSTACK' ? jump : null
    ));

    expect(explainScriptSteps(ifBlock, 'en', {})).toEqual([
        {
            blockIds: ['control_if-id', 'sensing_keypressed-id'],
            text: 'If space key pressed is yes, the blocks inside run.'
        },
        {
            blockIds: ['procedures_call-id'],
            text: 'Your character jumps.'
        },
        {
            blockIds: ['control_create_clone_of-id'],
            text: 'Then create clone of myself. A clone is a copy of your character.'
        }
    ]);
});

describe('script explainer', () => {
    test('explains forever move and turn as a curved path', () => {
        const turn = block({
            type: 'motion_turnright',
            text: 'turn 15 degrees'
        });
        const move = block({
            type: 'motion_movesteps',
            text: 'move 10 steps',
            next: turn
        });
        const forever = block({
            type: 'control_forever',
            text: 'forever',
            substack: move
        });

        expect(explainScript(forever, 'en', {})).toBe(
            'This forever loop repeats forever. The sprite moves forward, then turns. ' +
            'It keeps doing that again and again, so it moves in a curved path.'
        );
    });

    test('explains event stacks as sequences', () => {
        const say = block({
            type: 'looks_say',
            text: 'say hello'
        });
        const move = block({
            type: 'motion_movesteps',
            text: 'move 10 steps',
            next: say
        });
        const hat = block({
            type: 'event_whenflagclicked',
            text: 'when green flag clicked',
            next: move
        });

        expect(explainScript(hat, 'en', {})).toBe(
            'When the green flag is clicked, move 10 steps, then say hello.'
        );
    });

    test('creates guided explanation steps for green flag forever movement', () => {
        const turn = block({
            type: 'motion_turnright',
            text: 'turn 15 degrees'
        });
        const move = block({
            type: 'motion_movesteps',
            text: 'move 10 steps',
            next: turn
        });
        const forever = block({
            type: 'control_forever',
            text: 'forever',
            substack: move
        });
        const hat = block({
            type: 'event_whenflagclicked',
            text: 'when green flag clicked',
            next: forever
        });

        expect(explainScriptSteps(hat, 'en', {})).toEqual([
            {
                blockIds: ['event_whenflagclicked-id'],
                text: 'This script starts when the green flag is clicked.'
            },
            {
                blockIds: ['control_forever-id'],
                text: 'This is a forever loop. Everything inside this block repeats continuously.'
            },
            {
                blockIds: ['motion_movesteps-id'],
                text: 'The sprite moves forward.'
            },
            {
                blockIds: ['motion_turnright-id'],
                text: 'Then the sprite turns. Because this is inside forever, moving and turning can make a curved path.'
            }
        ]);
    });

    test('keeps explaining blocks after a move-turn pattern inside forever', () => {
        const goTo = block({
            type: 'motion_goto',
            text: 'go to random position'
        });
        const turn = block({
            type: 'motion_turnright',
            text: 'turn 15 degrees',
            next: goTo
        });
        const move = block({
            type: 'motion_movesteps',
            text: 'move 10 steps',
            next: turn
        });
        const forever = block({
            type: 'control_forever',
            text: 'forever',
            substack: move
        });

        expect(explainScriptSteps(forever, 'en', {})).toEqual([
            {
                blockIds: ['control_forever-id'],
                text: 'This is a forever loop. Everything inside this block repeats continuously.'
            },
            {
                blockIds: ['motion_movesteps-id'],
                text: 'The sprite moves forward.'
            },
            {
                blockIds: ['motion_turnright-id'],
                text: 'Then the sprite turns. Because this is inside forever, moving and turning can make a curved path.'
            },
            {
                blockIds: ['motion_goto-id'],
                text: 'Then this block also runs inside the forever loop: go to random position.'
            }
        ]);
    });

    test('ignores single blocks without script structure', () => {
        expect(hasScriptShape(block({
            type: 'motion_movesteps',
            text: 'move 10 steps'
        }))).toBe(false);
    });
});
