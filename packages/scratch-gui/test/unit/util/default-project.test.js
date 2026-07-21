import defaultProjectGenerator from '../../../src/lib/default-project/index';

describe('defaultProject', () => {
    // This test ensures that the assets referenced in the default project JSON
    // do not get out of sync with the raw assets that are included alongside.
    // see https://github.com/LLK/scratch-gui/issues/4844
    test('assets referenced by the project are included', () => {
        const translatorFn = () => '';
        const defaultProject = defaultProjectGenerator(translatorFn);
        const includedAssetIds = defaultProject.map(obj => obj.id);
        const projectData = JSON.parse(defaultProject[0].data);
        projectData.targets.forEach(target => {
            target.costumes.forEach(costume => {
                expect(includedAssetIds.includes(costume.assetId)).toBe(true);
            });
            target.sounds.forEach(sound => {
                expect(includedAssetIds.includes(sound.assetId)).toBe(true);
            });
        });
    });

    test('new projects start with an empty code workspace', () => {
        const defaultProject = defaultProjectGenerator();
        const projectData = JSON.parse(defaultProject[0].data);
        const stageBlocks = projectData.targets.find(target => target.isStage).blocks;
        const spriteBlocks = projectData.targets.find(target => !target.isStage).blocks;

        expect(Object.keys(stageBlocks)).toHaveLength(0);
        expect(Object.keys(spriteBlocks)).toHaveLength(0);
    });
});
