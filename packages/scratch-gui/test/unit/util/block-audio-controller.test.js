import BlockAudioController from '../../../src/lib/block-audio/block-audio-controller';
import {requestScriptHelp} from '../../../src/lib/block-audio/script-help-client';

jest.mock('../../../src/lib/block-audio/script-help-client', () => ({
    requestScriptHelp: jest.fn()
}));

describe('BlockAudioController', () => {
    let ScratchBlocks;
    let workspace;
    let rootElement;
    let synthesizer;
    let controller;
    let locale;

    beforeEach(() => {
        locale = 'fr';
        requestScriptHelp.mockReset();
        ScratchBlocks = {
            Events: {
                UI: 'ui'
            },
            glowStack: jest.fn()
        };
        workspace = {
            addChangeListener: jest.fn(),
            centerOnBlock: jest.fn(),
            getAllBlocks: jest.fn(() => []),
            getMetrics: jest.fn(() => ({
                viewWidth: 600,
                viewHeight: 300
            })),
            newBlock: jest.fn(),
            removeChangeListener: jest.fn(),
            scale: 1,
            scrollX: 0,
            scrollY: 0,
            getBlockById: jest.fn(id => ({id, type: 'motion_movesteps'}))
        };
        rootElement = document.createElement('div');
        synthesizer = {
            speak: jest.fn()
        };
        controller = new BlockAudioController({
            ScratchBlocks,
            workspace,
            rootElement,
            getLocale: () => locale,
            getMessages: () => ({}),
            synthesizer
        });
    });

    afterEach(() => {
        controller.dispose();
    });

    test('speaks selected block names in the current locale', () => {
        const listener = workspace.addChangeListener.mock.calls[0][0];

        listener({
            type: 'ui',
            element: 'selected',
            newValue: 'block-id'
        });

        expect(workspace.getBlockById).toHaveBeenCalledWith('block-id');
        expect(synthesizer.speak).toHaveBeenCalledWith('avancer', 'fr');
    });

    test('ignores non-selection workspace events', () => {
        const listener = workspace.addChangeListener.mock.calls[0][0];

        listener({
            type: 'change',
            element: 'field',
            newValue: 'block-id'
        });

        expect(synthesizer.speak).not.toHaveBeenCalled();
    });

    test('speaks the selected block explanation', () => {
        const listener = workspace.addChangeListener.mock.calls[0][0];

        listener({
            type: 'ui',
            element: 'selected',
            newValue: 'block-id'
        });
        synthesizer.speak.mockClear();

        controller.explainSelectedBlock();

        expect(workspace.getBlockById).toHaveBeenLastCalledWith('block-id');
        expect(synthesizer.speak).toHaveBeenCalledWith('Ce bloc fait avancer le lutin du nombre de pas choisi.', 'fr');
    });

    test('keeps explaining the selected block after another block is hovered', () => {
        const listener = workspace.addChangeListener.mock.calls[0][0];
        const moveBlock = {
            id: 'move-id',
            type: 'motion_movesteps',
            toString: () => 'move 10 steps'
        };
        const soundBlock = {
            id: 'sound-id',
            type: 'sound_play',
            toString: () => 'start sound Meow'
        };
        workspace.getBlockById.mockImplementation(id => ({
            'move-id': moveBlock,
            'sound-id': soundBlock
        }[id]));
        const soundElement = document.createElement('g');
        soundElement.setAttribute('data-id', 'sound-id');
        rootElement.appendChild(soundElement);

        listener({
            type: 'ui',
            element: 'selected',
            newValue: 'move-id'
        });
        soundElement.dispatchEvent(new MouseEvent('mouseover', {
            bubbles: true
        }));
        synthesizer.speak.mockClear();

        controller.explainSelectedBlock();

        expect(synthesizer.speak).toHaveBeenCalledWith(
            'Ce bloc fait avancer le lutin du nombre de pas choisi.',
            'fr'
        );
    });

    test('highlights a clicked block as the current block for explanation', () => {
        const block = {
            id: 'clicked-block-id',
            type: 'motion_movesteps',
            toString: () => 'move 10 steps',
            select: jest.fn()
        };
        workspace.getBlockById.mockReturnValue(block);
        const blockElement = document.createElement('g');
        blockElement.setAttribute('data-id', 'clicked-block-id');
        rootElement.appendChild(blockElement);

        blockElement.dispatchEvent(new MouseEvent('mousedown', {
            bubbles: true
        }));
        controller.explainSelectedBlock();

        expect(block.select).toHaveBeenCalled();
        expect(blockElement.classList.contains('block-audio-selected-block')).toBe(true);
        expect(synthesizer.speak).toHaveBeenCalledWith('Ce bloc fait avancer le lutin du nombre de pas choisi.', 'fr');
    });

    test('explains a selected sound block through the same selected-block path', () => {
        const listener = workspace.addChangeListener.mock.calls[0][0];
        const block = {
            id: 'sound-id',
            type: 'sound_play',
            toString: () => 'start sound Meow'
        };
        workspace.getBlockById.mockReturnValue(block);
        const blockElement = document.createElement('g');
        blockElement.setAttribute('data-id', 'sound-id');
        rootElement.appendChild(blockElement);

        listener({
            type: 'ui',
            element: 'selected',
            newValue: 'sound-id'
        });
        synthesizer.speak.mockClear();
        controller.explainSelectedBlock();

        expect(blockElement.classList.contains('block-audio-selected-block')).toBe(true);
        expect(synthesizer.speak).toHaveBeenCalledWith(
            'Ce bloc demarre le son choisi. Le script peut continuer sans attendre la fin du son.',
            'fr'
        );
    });

    test('uses workspace selected block before stale cached block ids', () => {
        locale = 'en';
        const motionBlock = {
            id: 'move-id',
            type: 'motion_movesteps',
            toString: () => 'move 10 steps'
        };
        const soundBlock = {
            id: 'sound-id',
            type: 'sound_play',
            toString: () => 'start sound Meow',
            workspace
        };
        workspace.getSelected = jest.fn(() => soundBlock);
        workspace.getBlockById.mockImplementation(id => ({
            'move-id': motionBlock,
            'sound-id': soundBlock
        }[id]));

        controller._lastClickedBlockId = 'move-id';
        controller.explainSelectedBlock();

        expect(synthesizer.speak).toHaveBeenCalledWith(
            'This block starts playing the sound you choose, then the next block can start right away.',
            'en'
        );
    });

    test('ignores global selected objects from another workspace', () => {
        locale = 'en';
        const motionBlock = {
            id: 'move-id',
            type: 'motion_movesteps',
            toString: () => 'move 10 steps',
            workspace
        };
        const otherWorkspaceBlock = {
            id: 'sound-id',
            type: 'sound_play',
            toString: () => 'start sound Meow',
            workspace: {}
        };
        ScratchBlocks.selected = otherWorkspaceBlock;
        workspace.getBlockById.mockImplementation(id => ({
            'move-id': motionBlock,
            'sound-id': otherWorkspaceBlock
        }[id]));

        controller._lastClickedBlockId = 'move-id';
        controller.explainSelectedBlock();

        expect(synthesizer.speak).toHaveBeenCalledWith(
            'This block moves the sprite forward by the number of steps you choose.',
            'en'
        );
    });

    test('speaks a rule-based script explanation for a selected stack', () => {
        const turn = {
            id: 'turn-id',
            type: 'motion_turnright',
            toString: () => 'turn 15 degrees',
            getNextBlock: () => null
        };
        const move = {
            id: 'move-id',
            type: 'motion_movesteps',
            toString: () => 'move 10 steps',
            getNextBlock: () => turn
        };
        const forever = {
            id: 'forever-id',
            type: 'control_forever',
            getInputTargetBlock: () => move,
            getNextBlock: () => null,
            getRootBlock: () => forever
        };
        workspace.getBlockById.mockReturnValue(forever);
        const listener = workspace.addChangeListener.mock.calls[0][0];

        listener({
            type: 'ui',
            element: 'selected',
            newValue: 'block-id'
        });
        synthesizer.speak.mockClear();
        controller.explainSelectedBlock();

        expect(ScratchBlocks.glowStack).toHaveBeenCalledWith('forever-id', true);
        expect(synthesizer.speak).toHaveBeenCalledWith(
            'Ceci est une boucle qui repete toujours. Tout ce qui est dedans se repete tout le temps.',
            'fr',
            expect.any(Function)
        );
    });

    test('moves guided highlights forward after speech ends', () => {
        let onEnd;
        synthesizer.speak.mockImplementation((text, _speechLocale, callback) => {
            onEnd = callback;
            return true;
        });
        const turn = {
            id: 'turn-id',
            type: 'motion_turnright',
            toString: () => 'turn 15 degrees',
            getNextBlock: () => null
        };
        const move = {
            id: 'move-id',
            type: 'motion_movesteps',
            toString: () => 'move 10 steps',
            getNextBlock: () => turn
        };
        const forever = {
            id: 'forever-id',
            type: 'control_forever',
            getInputTargetBlock: () => move,
            getNextBlock: () => null,
            getRootBlock: () => forever
        };
        workspace.getBlockById.mockReturnValue(forever);

        controller._lastInteractedBlockId = 'forever-id';
        controller.explainSelectedBlock();
        onEnd();

        expect(ScratchBlocks.glowStack).toHaveBeenCalledWith('forever-id', false);
        expect(ScratchBlocks.glowStack).toHaveBeenCalledWith('move-id', true);
        expect(ScratchBlocks.glowStack).not.toHaveBeenCalledWith('turn-id', true);
        expect(synthesizer.speak).toHaveBeenLastCalledWith(
            'Le lutin avance.',
            'fr',
            expect.any(Function)
        );
    });

    test('explains the script root when a child block was clicked', () => {
        const forever = {
            id: 'forever-id',
            type: 'control_forever',
            getInputTargetBlock: () => move,
            getNextBlock: () => null
        };
        const move = {
            type: 'motion_movesteps',
            toString: () => 'move 10 steps',
            getNextBlock: () => null,
            getRootBlock: () => forever
        };
        workspace.getBlockById.mockReturnValue(move);

        controller._lastInteractedBlockId = 'move-id';
        controller.explainSelectedBlock();

        expect(ScratchBlocks.glowStack).toHaveBeenCalledWith('forever-id', true);
        expect(synthesizer.speak).toHaveBeenCalledWith(
            'Ceci est une boucle qui repete toujours. Tout ce qui est dedans se repete tout le temps.',
            'fr',
            expect.any(Function)
        );
    });

    test('speaks the last clicked block explanation when clicking runs the block', () => {
        const blockElement = document.createElement('g');
        blockElement.setAttribute('data-id', 'clicked-block-id');
        rootElement.appendChild(blockElement);

        blockElement.dispatchEvent(new MouseEvent('mousedown', {
            bubbles: true
        }));
        controller.explainSelectedBlock();

        expect(workspace.getBlockById).toHaveBeenCalledWith('clicked-block-id');
        expect(synthesizer.speak).toHaveBeenCalledWith('Ce bloc fait avancer le lutin du nombre de pas choisi.', 'fr');
    });

    test('speaks a custom block explanation when a custom block is clicked', () => {
        locale = 'en';
        workspace.getBlockById.mockReturnValue({
            id: 'custom-block-id',
            type: 'procedures_call',
            mutation: {
                proccode: 'jump'
            }
        });
        const blockElement = document.createElement('g');
        blockElement.setAttribute('data-id', 'custom-block-id');
        rootElement.appendChild(blockElement);

        blockElement.dispatchEvent(new MouseEvent('mousedown', {
            bubbles: true
        }));

        expect(synthesizer.speak).toHaveBeenCalledWith(
            'This is a custom jump block. The programmer grouped several instructions together and gave them ' +
            'the name jump. One important constraint: a custom block belongs to the sprite where it was created; ' +
            'it is not automatically available to every sprite.',
            'en'
        );
    });

    test('speaks the last hovered block explanation', () => {
        const blockElement = document.createElement('g');
        blockElement.setAttribute('data-id', 'hovered-block-id');
        rootElement.appendChild(blockElement);

        blockElement.dispatchEvent(new MouseEvent('mouseover', {
            bubbles: true
        }));
        synthesizer.speak.mockClear();
        controller.explainSelectedBlock();

        expect(workspace.getBlockById).toHaveBeenCalledWith('hovered-block-id');
        expect(synthesizer.speak).toHaveBeenCalledWith('Ce bloc fait avancer le lutin du nombre de pas choisi.', 'fr');
    });

    test('uses configured hover delay before speaking hovered block names', () => {
        jest.useFakeTimers();
        controller.dispose();
        controller = new BlockAudioController({
            ScratchBlocks,
            workspace,
            rootElement,
            getLocale: () => 'fr',
            getMessages: () => ({}),
            getHoverDelay: () => 1000,
            synthesizer
        });
        const blockElement = document.createElement('g');
        blockElement.setAttribute('data-id', 'hovered-block-id');
        rootElement.appendChild(blockElement);

        blockElement.dispatchEvent(new MouseEvent('mouseover', {
            bubbles: true
        }));
        jest.advanceTimersByTime(999);
        expect(synthesizer.speak).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1);

        expect(synthesizer.speak).toHaveBeenCalledWith('avancer', 'fr');
        jest.useRealTimers();
    });

    test('speaks audio labels when controls receive focus', () => {
        const button = document.createElement('button');
        button.setAttribute('data-audio-label', 'Block Commands');
        rootElement.appendChild(button);

        button.dispatchEvent(new FocusEvent('focusin', {
            bubbles: true
        }));

        expect(synthesizer.speak).toHaveBeenCalledWith('Block Commands', 'fr');
    });

    test('speaks a fixed response when no block is selected', () => {
        controller.explainSelectedBlock();

        expect(synthesizer.speak).toHaveBeenCalledWith('Choisis un bloc d abord.', 'fr');
    });

    test('returns searchable blocks from the workspace', () => {
        workspace.getAllBlocks.mockReturnValue([{
            id: 'move-id',
            type: 'motion_movesteps',
            toString: () => 'move 10 steps'
        }, {
            id: 'turn-id',
            type: 'motion_turnright',
            toString: () => 'turn 15 degrees'
        }]);

        expect(controller.getSearchableBlocks('move')).toEqual([{
            id: 'move-id',
            text: 'move 10 steps',
            type: 'motion_movesteps'
        }]);
    });

    test('returns create and find items for the command palette', () => {
        workspace.getAllBlocks.mockReturnValue([{
            id: 'move-id',
            type: 'motion_movesteps',
            toString: () => 'move 10 steps'
        }]);

        const items = controller.getCommandPaletteItems('move');

        expect(items).toEqual(expect.arrayContaining([expect.objectContaining({
            action: 'create',
            id: 'create-motion-movesteps',
            text: 'Ajouter avancer de 10 pas'
        }), expect.objectContaining({
            action: 'find',
            id: 'move-id',
            text: 'Trouver move 10 steps'
        })]));
    });

    test('creates a block from a command palette item', () => {
        const makeBlock = (id, type) => {
            const inputConnection = {
                connect: jest.fn()
            };
            return {
                id,
                type,
                getInput: jest.fn(() => ({
                    connection: inputConnection
                })),
                initSvg: jest.fn(),
                moveBy: jest.fn(),
                outputConnection: {
                    connect: jest.fn()
                },
                render: jest.fn(),
                select: jest.fn(),
                setFieldValue: jest.fn(),
                setShadow: jest.fn(),
                toString: () => type
            };
        };
        const moveBlock = makeBlock('created-move-id', 'motion_movesteps');
        const numberBlock = makeBlock('created-number-id', 'math_number');
        workspace.newBlock
            .mockReturnValueOnce(moveBlock)
            .mockReturnValueOnce(numberBlock);

        expect(controller.runCommandPaletteItem({
            action: 'create',
            id: 'create-motion-movesteps'
        })).toBe(true);

        expect(workspace.newBlock).toHaveBeenCalledWith('motion_movesteps');
        expect(workspace.newBlock).toHaveBeenCalledWith('math_number');
        expect(numberBlock.setFieldValue).toHaveBeenCalledWith('10', 'NUM');
        expect(numberBlock.setShadow).toHaveBeenCalledWith(true);
        expect(numberBlock.outputConnection.connect).toHaveBeenCalled();
        expect(moveBlock.moveBy).toHaveBeenCalledWith(300, 100);
        expect(moveBlock.select).toHaveBeenCalled();
        expect(synthesizer.speak).toHaveBeenCalledWith('motion_movesteps', 'fr');
    });

    test('focuses and speaks a block from command search', () => {
        const block = {
            id: 'move-id',
            type: 'motion_movesteps',
            toString: () => 'move 10 steps',
            select: jest.fn()
        };
        workspace.getBlockById.mockReturnValue(block);

        expect(controller.focusBlockById('move-id')).toBe(true);

        expect(block.select).toHaveBeenCalled();
        expect(workspace.centerOnBlock).toHaveBeenCalledWith('move-id');
        expect(synthesizer.speak).toHaveBeenCalledWith('move 10 steps', 'fr');
    });

    test('navigates to the next block with location speech', () => {
        locale = 'en';
        const turn = {
            id: 'turn-id',
            type: 'motion_turnright',
            toString: () => 'turn 15 degrees',
            getNextBlock: () => null,
            select: jest.fn()
        };
        const move = {
            id: 'move-id',
            type: 'motion_movesteps',
            toString: () => 'move 10 steps',
            getNextBlock: () => turn,
            select: jest.fn()
        };
        const forever = {
            id: 'forever-id',
            type: 'control_forever',
            inputList: [{
                name: 'SUBSTACK'
            }],
            getInputTargetBlock: () => move,
            getNextBlock: () => null,
            getRootBlock: () => forever,
            select: jest.fn(),
            toString: () => 'forever'
        };
        move.getRootBlock = () => forever;
        move.getSurroundParent = () => forever;
        turn.getRootBlock = () => forever;
        turn.getSurroundParent = () => forever;
        workspace.getBlockById.mockImplementation(id => ({
            'forever-id': forever,
            'move-id': move,
            'turn-id': turn
        }[id]));

        controller._lastInteractedBlockId = 'move-id';

        expect(controller.navigateScript('next')).toBe(true);

        expect(turn.select).toHaveBeenCalled();
        expect(workspace.centerOnBlock).toHaveBeenCalledWith('turn-id');
        expect(synthesizer.speak).toHaveBeenCalledWith(
            'Block 3 of 3, inside forever loop. turn 15 degrees.',
            'en'
        );
    });

    test('navigates between parent, child input, and script root', () => {
        locale = 'en';
        const forever = {
            id: 'forever-id',
            type: 'control_forever',
            inputList: [{
                name: 'SUBSTACK'
            }],
            getInputTargetBlock: () => move,
            getNextBlock: () => null,
            getRootBlock: () => forever,
            select: jest.fn(),
            toString: () => 'forever'
        };
        const move = {
            id: 'move-id',
            type: 'motion_movesteps',
            toString: () => 'move 10 steps',
            getNextBlock: () => null,
            getRootBlock: () => forever,
            getSurroundParent: () => forever,
            select: jest.fn()
        };
        workspace.getBlockById.mockImplementation(id => ({
            'forever-id': forever,
            'move-id': move
        }[id]));

        controller._lastInteractedBlockId = 'forever-id';
        expect(controller.navigateScript('child')).toBe(true);
        expect(move.select).toHaveBeenCalled();
        expect(synthesizer.speak).toHaveBeenLastCalledWith(
            'Block 2 of 2, inside forever loop. move 10 steps.',
            'en'
        );

        controller._lastInteractedBlockId = 'move-id';
        expect(controller.navigateScript('parent')).toBe(true);
        expect(forever.select).toHaveBeenCalled();

        controller._lastInteractedBlockId = 'move-id';
        expect(controller.navigateScript('root')).toBe(true);
        expect(workspace.centerOnBlock).toHaveBeenLastCalledWith('forever-id');
    });

    test('navigates to the next top-level stack', () => {
        locale = 'en';
        const first = {
            id: 'first-id',
            type: 'event_whenflagclicked',
            getNextBlock: () => null,
            getRootBlock: () => first,
            select: jest.fn(),
            toString: () => 'when green flag clicked'
        };
        const second = {
            id: 'second-id',
            type: 'event_whenkeypressed',
            getNextBlock: () => null,
            getRootBlock: () => second,
            select: jest.fn(),
            toString: () => 'when space key pressed'
        };
        workspace.getTopBlocks = jest.fn(() => [first, second]);

        controller._lastInteractedBlockId = 'first-id';
        workspace.getBlockById.mockReturnValue(first);

        expect(controller.navigateScript('next-stack')).toBe(true);

        expect(second.select).toHaveBeenCalled();
        expect(workspace.centerOnBlock).toHaveBeenCalledWith('second-id');
        expect(synthesizer.speak).toHaveBeenCalledWith(
            'Block 1 of 1. when space key pressed.',
            'en'
        );
    });

    test('asks AI for a hint the first time help is pressed', async () => {
        requestScriptHelp.mockResolvedValue('Try checking the loop.');
        const forever = {
            id: 'forever-id',
            type: 'control_forever',
            toString: () => 'forever',
            inputList: [],
            getNextBlock: () => null,
            getRootBlock: () => forever
        };
        workspace.getBlockById.mockReturnValue(forever);

        controller._lastInteractedBlockId = 'forever-id';
        await controller.helpSelectedScript();

        expect(requestScriptHelp).toHaveBeenCalledWith({
            context: expect.objectContaining({
                selectedBlock: expect.objectContaining({
                    id: 'forever-id',
                    type: 'control_forever',
                    text: 'forever'
                }),
                connections: expect.objectContaining({
                    isTopLevel: true,
                    startsWithEvent: false
                })
            }),
            mode: 'hint',
            locale: 'fr'
        });
        expect(synthesizer.speak).toHaveBeenCalledWith('Je regarde ce script.', 'fr');
        expect(synthesizer.speak).toHaveBeenLastCalledWith('Try checking the loop.', 'fr');
    });

    test('asks AI for a solution when help is pressed again for the same script', async () => {
        requestScriptHelp.mockResolvedValue('Put the move block inside forever.');
        const forever = {
            id: 'forever-id',
            type: 'control_forever',
            toString: () => 'forever',
            inputList: [],
            getNextBlock: () => null,
            getRootBlock: () => forever
        };
        workspace.getBlockById.mockReturnValue(forever);

        controller._lastInteractedBlockId = 'forever-id';
        await controller.helpSelectedScript();
        await controller.helpSelectedScript();

        expect(requestScriptHelp).toHaveBeenLastCalledWith({
            context: expect.objectContaining({
                selectedBlock: expect.objectContaining({
                    id: 'forever-id'
                })
            }),
            mode: 'solution',
            locale: 'fr'
        });
    });

    test('sends the selected block connections and other workspace scripts to AI help', async () => {
        requestScriptHelp.mockResolvedValue('Check how this stack starts.');
        const jump = {
            id: 'jump-id',
            type: 'procedures_call',
            toString: () => 'jump',
            inputList: [],
            getNextBlock: () => null
        };
        const keyCheck = {
            id: 'if-id',
            type: 'control_if',
            toString: () => 'if space key pressed then',
            inputList: [],
            getNextBlock: () => null,
            getPreviousBlock: () => null,
            getParent: () => null,
            getSurroundParent: () => null,
            getRootBlock: () => keyCheck
        };
        const forever = {
            id: 'forever-id',
            type: 'control_forever',
            toString: () => 'forever',
            inputList: [],
            getNextBlock: () => null,
            getRootBlock: () => forever
        };
        keyCheck.inputList = [{
            name: 'SUBSTACK',
            connection: {
                targetBlock: () => jump
            },
            fieldRow: []
        }];
        workspace.getBlockById.mockReturnValue(keyCheck);
        workspace.getTopBlocks = jest.fn(() => [keyCheck, forever]);

        controller._lastInteractedBlockId = 'if-id';
        await controller.helpSelectedScript();

        expect(requestScriptHelp).toHaveBeenCalledWith({
            context: expect.objectContaining({
                selectedBlock: expect.objectContaining({id: 'if-id'}),
                selectedScript: expect.objectContaining({id: 'if-id'}),
                connections: expect.objectContaining({
                    isTopLevel: true,
                    hasPreviousBlock: false,
                    startsWithEvent: false
                }),
                workspaceScripts: [
                    expect.objectContaining({id: 'forever-id'})
                ],
                workspaceScriptCount: 2,
                workspaceScriptsTruncated: false
            }),
            mode: 'hint',
            locale: 'fr'
        });
    });

    test('speaks an AI help error if the request fails', async () => {
        requestScriptHelp.mockRejectedValue(new Error('missing key'));
        const block = {
            id: 'block-id',
            type: 'motion_movesteps',
            toString: () => 'move 10 steps',
            inputList: [],
            getNextBlock: () => null,
            getRootBlock: () => block
        };
        workspace.getBlockById.mockReturnValue(block);

        controller._lastInteractedBlockId = 'block-id';
        await controller.helpSelectedScript();

        expect(synthesizer.speak).toHaveBeenLastCalledWith(
            'Communication with assistant not established.',
            'fr'
        );
    });

    test('disposes listeners', () => {
        const listener = workspace.addChangeListener.mock.calls[0][0];

        controller.dispose();

        expect(workspace.removeChangeListener).toHaveBeenCalledWith(listener);
    });
});
