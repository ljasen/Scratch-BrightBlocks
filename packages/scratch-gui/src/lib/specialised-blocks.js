const SPECIALISED_BLOCK_CATEGORY_ID = 'specialised';
const SPECIALISED_BLOCK_CATEGORY_NAME = 'Specialised';

const input = (name, type, defaultValue) => ({
    name,
    type,
    defaultValue
});

const SPECIALISED_BLOCKS = [
    {
        opcode: 'specialised_playsoundfromdirection',
        label: 'play sound %1 from direction %2',
        inputs: [input('SOUND', 'text', 'meow'), input('DIRECTION', 'math_number', '0')],
        explanation: 'This audio-spatial block plays a sound as if it comes from a direction. Negative numbers ' +
            'mean left, zero means centre, and positive numbers mean right.'
    },
    {
        opcode: 'specialised_playsoundatposition',
        label: 'play sound %1 at x %2 y %3',
        inputs: [input('SOUND', 'text', 'meow'), input('X', 'math_number', '0'), input('Y', 'math_number', '0')],
        explanation: 'This block represents a sound source at a place on the stage. A game can use the x and y ' +
            'position to decide whether the sound should be left, right, near, or far away.'
    },
    {
        opcode: 'specialised_setvolumefromdistance',
        label: 'set volume from distance %1 maximum %2',
        inputs: [input('DISTANCE', 'math_number', '50'), input('RANGE', 'math_number', '200')],
        explanation: 'This block turns distance into loudness. Nearby sounds should be louder, and faraway sounds ' +
            'should be quieter. The maximum number is the distance where the sound becomes very quiet.'
    },
    {
        opcode: 'specialised_setpanfromdirection',
        label: 'set pan from direction %1',
        inputs: [input('DIRECTION', 'math_number', '0')],
        explanation: 'This block turns a direction into stereo position. Left directions should move the sound to ' +
            'the left speaker, right directions should move it to the right speaker, and zero should stay centred.'
    },
    {
        opcode: 'specialised_pointsoundtoward',
        label: 'point sound toward %1',
        inputs: [input('TARGET', 'text', 'target')],
        explanation: 'This block means aim audio feedback toward a target. It can help a player hear whether an ' +
            'object is left, right, ahead, or behind.'
    },
    {
        opcode: 'specialised_startbeacon',
        label: 'start beacon for %1',
        inputs: [input('TARGET', 'text', 'target')],
        explanation: 'This block starts an audio beacon for a target. A beacon can beep faster, louder, or more ' +
            'centred as the player gets closer.'
    },
    {
        opcode: 'specialised_updatebeacon',
        label: 'update beacon for %1',
        inputs: [input('TARGET', 'text', 'target')],
        explanation: 'This block updates an audio beacon while the game is running. It should recalculate the ' +
            'target direction and distance so the guidance stays useful.'
    },
    {
        opcode: 'specialised_stopbeacon',
        label: 'stop beacon',
        explanation: 'This block stops the current audio beacon when guidance is no longer needed.'
    },
    {
        opcode: 'specialised_announcesurroundings',
        label: 'announce nearby objects within %1',
        inputs: [input('RANGE', 'math_number', '100')],
        explanation: 'This block describes nearby objects in spoken language or short sounds. For example, it might ' +
            'say that a door is on the left or an enemy is ahead.'
    },
    {
        opcode: 'specialised_announceobjectdirection',
        label: 'announce %1 direction and distance',
        inputs: [input('OBJECT', 'text', 'key')],
        explanation: 'This block gives a simple spoken location for one object, such as key nearby on the right. ' +
            'It combines object identity, direction, and distance into one helpful message.'
    },
    {
        opcode: 'specialised_playfootsteps',
        label: 'play footsteps on %1',
        inputs: [input('SURFACE', 'text', 'grass')],
        explanation: 'This block plays footsteps for a surface type. Different sounds for grass, wood, water, or ' +
            'stone help a blind player understand where they are walking.'
    },
    {
        opcode: 'specialised_playwallwarning',
        label: 'play wall warning at distance %1',
        inputs: [input('DISTANCE', 'math_number', '20')],
        explanation: 'This block warns that a wall or obstacle is nearby. The warning can become faster or louder ' +
            'as the player gets closer.'
    },
    {
        opcode: 'specialised_warnobstacleahead',
        label: 'warn obstacle ahead',
        explanation: 'This block gives quick audio feedback that something blocks the way in front of the player.'
    },
    {
        opcode: 'specialised_announcecollision',
        label: 'announce collision with %1',
        inputs: [input('OBJECT', 'text', 'wall')],
        explanation: 'This block explains what the player bumped into, instead of silently stopping movement. It ' +
            'might say wall, locked door, enemy, or another object name.'
    },
    {
        opcode: 'specialised_playenemysound',
        label: 'play enemy sound for %1',
        inputs: [input('ENEMY', 'text', 'enemy')],
        explanation: 'This block gives an enemy a recognisable sound identity. The sound can also communicate where ' +
            'the enemy is and how close it is.'
    },
    {
        opcode: 'specialised_playdangerwarning',
        label: 'play danger warning level %1',
        inputs: [input('LEVEL', 'math_number', '1')],
        explanation: 'This block turns danger into an audio pattern. Low danger might be a slow pulse, higher danger ' +
            'might become faster, and urgent danger might become an alarm.'
    },
    {
        opcode: 'specialised_announcehealth',
        label: 'announce health',
        explanation: 'This block speaks the player health in simple terms, such as healthy, hurt, or health very low.'
    },
    {
        opcode: 'specialised_confirmaction',
        label: 'confirm action %1',
        inputs: [input('ACTION', 'text', 'key collected')],
        explanation: 'This block confirms that an important action happened. It is useful for item collected, door ' +
            'opened, jump, attack, menu selected, or ability unavailable.'
    },
    {
        opcode: 'specialised_playidentitysound',
        label: 'play identity sound for %1',
        inputs: [input('OBJECT_TYPE', 'text', 'door')],
        explanation: 'This block plays a consistent earcon for an object type. A door, enemy, goal, hazard, or coin ' +
            'can each have its own recognisable sound.'
    },
    {
        opcode: 'specialised_speakmenuoption',
        label: 'speak menu option %1',
        inputs: [input('TEXT', 'text', 'Start game')],
        explanation: 'This interface block speaks the currently selected menu option so a player can navigate menus ' +
            'without reading the screen.'
    },
    {
        opcode: 'specialised_movemenuselection',
        label: 'move menu selection %1',
        inputs: [input('DIRECTION', 'text', 'next')],
        explanation: 'This interface block means change the selected menu item, play a movement sound, and announce ' +
            'the newly selected option.'
    },
    {
        opcode: 'specialised_announcegamestate',
        label: 'announce game state',
        explanation: 'This block speaks important state, such as game paused, level two, two keys collected, or ' +
            'three enemies remaining.'
    },
    {
        opcode: 'specialised_playspatialsoundfromobject',
        label: 'play spatial sound %1 from %2',
        inputs: [input('SOUND', 'text', 'meow'), input('OBJECT', 'text', 'object')],
        explanation: 'This high-level block means play a sound from an object and automatically think about pan, ' +
            'volume, distance, and direction. It hides the hard math from younger programmers.'
    },
    {
        opcode: 'specialised_guideplayerto',
        label: 'guide player to %1',
        inputs: [input('OBJECT', 'text', 'goal')],
        explanation: 'This high-level block means guide the player toward an object using beeps or spoken hints ' +
            'until they reach it.'
    }
];

const SPECIALISED_BLOCK_EXPLANATIONS = SPECIALISED_BLOCKS.reduce((map, block) => {
    map[block.opcode] = block.explanation;
    return map;
}, {});

export {
    SPECIALISED_BLOCK_CATEGORY_ID,
    SPECIALISED_BLOCK_CATEGORY_NAME,
    SPECIALISED_BLOCKS,
    SPECIALISED_BLOCK_EXPLANATIONS
};
