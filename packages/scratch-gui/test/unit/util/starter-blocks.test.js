import {filterStarterProcedureDuplicates} from '../../../src/lib/starter-blocks';

const makeProcedureCall = proccode => {
    const block = document.createElement('block');
    const mutation = document.createElement('mutation');
    block.setAttribute('type', 'procedures_call');
    mutation.setAttribute('proccode', proccode);
    block.appendChild(mutation);
    return block;
};

describe('starter blocks', () => {
    test('filters legacy starter custom block duplicates from My Blocks flyout XML', () => {
        const createButton = document.createElement('button');
        const legacyJump = makeProcedureCall('jump');
        const legacyWalk = makeProcedureCall('walk %s');
        const userProcedure = makeProcedureCall('my real custom block');

        const filtered = filterStarterProcedureDuplicates([
            createButton,
            legacyJump,
            legacyWalk,
            userProcedure
        ]);

        expect(filtered).toEqual([
            createButton,
            userProcedure
        ]);
    });
});
