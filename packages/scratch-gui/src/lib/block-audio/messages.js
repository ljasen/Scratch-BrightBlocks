import {defineMessages} from 'react-intl';

const messages = defineMessages({
    fallbackName: {
        defaultMessage: 'block',
        description: 'Fallback spoken name for a Scratch block when no specific block audio name is available',
        id: 'gui.blockAudio.fallback.name'
    },
    fallbackExplanation: {
        defaultMessage: 'This is a Scratch block.',
        description: 'Fallback spoken explanation for a Scratch block when no specific block audio explanation ' +
            'is available',
        id: 'gui.blockAudio.fallback.explanation'
    },
    explainButtonLabel: {
        defaultMessage: 'Explain',
        description: 'Label for a button that speaks a short explanation for the selected Scratch block',
        id: 'gui.blockAudio.explainButton.label'
    },
    helpButtonLabel: {
        defaultMessage: 'Help',
        description: 'Label for a button that asks AI for child-friendly help with the selected Scratch script',
        id: 'gui.blockAudio.helpButton.label'
    },
    blockSearchButtonLabel: {
        defaultMessage: 'Block Commands',
        description: 'Label for a button that opens keyboard block command palette',
        id: 'gui.blockAudio.blockSearchButton.label'
    },
    blockSearchLabel: {
        defaultMessage: 'Search or add blocks',
        description: 'Label for the block command palette dialog and input',
        id: 'gui.blockAudio.blockSearch.label'
    },
    blockSearchCloseLabel: {
        defaultMessage: 'Close',
        description: 'Label for closing the block search dialog',
        id: 'gui.blockAudio.blockSearch.close'
    },
    blockSearchEmptyLabel: {
        defaultMessage: 'No matching commands or blocks',
        description: 'Message shown when block command palette has no results',
        id: 'gui.blockAudio.blockSearch.empty'
    },
    blockSearchOpened: {
        defaultMessage: 'Block command palette opened.',
        description: 'Screen reader announcement when block command palette opens',
        id: 'gui.blockAudio.blockSearch.opened'
    },
    blockSearchClosed: {
        defaultMessage: 'Block command palette closed.',
        description: 'Screen reader announcement when block command palette closes',
        id: 'gui.blockAudio.blockSearch.closed'
    },
    blockSearchMatching: {
        defaultMessage: 'matching items.',
        description: 'Screen reader announcement suffix for block command palette result count',
        id: 'gui.blockAudio.blockSearch.matching'
    },
    blockCommandCreatePrefix: {
        defaultMessage: 'Add',
        description: 'Prefix for block command palette commands that add a new block',
        id: 'gui.blockAudio.blockCommand.createPrefix'
    },
    blockCommandFindPrefix: {
        defaultMessage: 'Find',
        description: 'Prefix for block command palette results that find an existing block',
        id: 'gui.blockAudio.blockCommand.findPrefix'
    },
    blockCommandCreated: {
        defaultMessage: 'Added block.',
        description: 'Screen reader announcement after a block command creates a block',
        id: 'gui.blockAudio.blockCommand.created'
    },
    blockCommandMoveSteps: {
        defaultMessage: 'move 10 steps',
        description: 'Block command label for adding a move steps block',
        id: 'gui.blockAudio.blockCommand.moveSteps'
    },
    blockCommandTurnRight: {
        defaultMessage: 'turn right 15 degrees',
        description: 'Block command label for adding a turn right block',
        id: 'gui.blockAudio.blockCommand.turnRight'
    },
    blockCommandSayHello: {
        defaultMessage: 'say Hello!',
        description: 'Block command label for adding a say block',
        id: 'gui.blockAudio.blockCommand.sayHello'
    },
    blockCommandPlaySound: {
        defaultMessage: 'start sound',
        description: 'Block command label for adding a start sound block',
        id: 'gui.blockAudio.blockCommand.playSound'
    },
    blockCommandWhenGreenFlag: {
        defaultMessage: 'when green flag clicked',
        description: 'Block command label for adding a when green flag clicked block',
        id: 'gui.blockAudio.blockCommand.whenGreenFlag'
    },
    blockCommandWait: {
        defaultMessage: 'wait 1 seconds',
        description: 'Block command label for adding a wait block',
        id: 'gui.blockAudio.blockCommand.wait'
    },
    blockCommandRepeat: {
        defaultMessage: 'repeat 10 times loop',
        description: 'Block command label for adding a repeat block',
        id: 'gui.blockAudio.blockCommand.repeat'
    },
    blockCommandForever: {
        defaultMessage: 'forever loop',
        description: 'Block command label for adding a forever block',
        id: 'gui.blockAudio.blockCommand.forever'
    },
    noSelectedBlockExplanation: {
        defaultMessage: 'Select a block first.',
        description: 'Spoken message when the explain button is pressed without a selected Scratch block',
        id: 'gui.blockAudio.noSelectedBlock.explanation'
    },
    noSelectedBlockHelp: {
        defaultMessage: 'Pick the script you want help with first.',
        description: 'Spoken message when the help button is pressed without a selected Scratch script',
        id: 'gui.blockAudio.noSelectedBlockHelp'
    },
    helpWaiting: {
        defaultMessage: 'Let me look at this script.',
        description: 'Spoken message while AI script help is loading',
        id: 'gui.blockAudio.helpWaiting'
    },
    helpError: {
        defaultMessage: 'Communication with assistant not established.',
        description: 'Spoken message when AI script help fails',
        id: 'gui.blockAudio.helpError'
    },
    motionMoveStepsName: {
        defaultMessage: 'move steps',
        description: 'Spoken name for the Scratch motion move steps block',
        id: 'gui.blockAudio.motionMoveSteps.name'
    },
    motionMoveStepsExplanation: {
        defaultMessage: 'This block moves the sprite forward.',
        description: 'Short child-friendly spoken explanation for the Scratch motion move steps block',
        id: 'gui.blockAudio.motionMoveSteps.explanation'
    },
    motionTurnRightName: {
        defaultMessage: 'turn right',
        description: 'Spoken name for the Scratch motion turn right block',
        id: 'gui.blockAudio.motionTurnRight.name'
    },
    motionTurnRightExplanation: {
        defaultMessage: 'This block turns the sprite to the right.',
        description: 'Short child-friendly spoken explanation for the Scratch motion turn right block',
        id: 'gui.blockAudio.motionTurnRight.explanation'
    },
    motionTurnLeftName: {
        defaultMessage: 'turn left',
        description: 'Spoken name for the Scratch motion turn left block',
        id: 'gui.blockAudio.motionTurnLeft.name'
    },
    motionTurnLeftExplanation: {
        defaultMessage: 'This block turns the sprite to the left.',
        description: 'Short child-friendly spoken explanation for the Scratch motion turn left block',
        id: 'gui.blockAudio.motionTurnLeft.explanation'
    },
    looksSayName: {
        defaultMessage: 'say',
        description: 'Spoken name for the Scratch looks say block',
        id: 'gui.blockAudio.looksSay.name'
    },
    looksSayExplanation: {
        defaultMessage: 'This block makes the sprite show words.',
        description: 'Short child-friendly spoken explanation for the Scratch looks say block',
        id: 'gui.blockAudio.looksSay.explanation'
    },
    looksShowName: {
        defaultMessage: 'show',
        description: 'Spoken name for the Scratch looks show block',
        id: 'gui.blockAudio.looksShow.name'
    },
    looksShowExplanation: {
        defaultMessage: 'This block makes the sprite appear.',
        description: 'Short child-friendly spoken explanation for the Scratch looks show block',
        id: 'gui.blockAudio.looksShow.explanation'
    },
    looksHideName: {
        defaultMessage: 'hide',
        description: 'Spoken name for the Scratch looks hide block',
        id: 'gui.blockAudio.looksHide.name'
    },
    looksHideExplanation: {
        defaultMessage: 'This block makes the sprite disappear.',
        description: 'Short child-friendly spoken explanation for the Scratch looks hide block',
        id: 'gui.blockAudio.looksHide.explanation'
    },
    soundPlayName: {
        defaultMessage: 'start sound',
        description: 'Spoken name for the Scratch sound start sound block',
        id: 'gui.blockAudio.soundPlay.name'
    },
    soundPlayExplanation: {
        defaultMessage: 'This block starts a sound.',
        description: 'Short child-friendly spoken explanation for the Scratch sound start sound block',
        id: 'gui.blockAudio.soundPlay.explanation'
    },
    eventWhenFlagClickedName: {
        defaultMessage: 'when green flag clicked',
        description: 'Spoken name for the Scratch event when green flag clicked block',
        id: 'gui.blockAudio.eventWhenFlagClicked.name'
    },
    eventWhenFlagClickedExplanation: {
        defaultMessage: 'This block starts code when you press the green flag.',
        description: 'Short child-friendly spoken explanation for the Scratch event when green flag clicked block',
        id: 'gui.blockAudio.eventWhenFlagClicked.explanation'
    },
    controlWaitName: {
        defaultMessage: 'wait',
        description: 'Spoken name for the Scratch control wait block',
        id: 'gui.blockAudio.controlWait.name'
    },
    controlWaitExplanation: {
        defaultMessage: 'This block makes the sprite pause for a little while.',
        description: 'Short child-friendly spoken explanation for the Scratch control wait block',
        id: 'gui.blockAudio.controlWait.explanation'
    },
    controlRepeatName: {
        defaultMessage: 'repeat loop',
        description: 'Spoken name for the Scratch control repeat block',
        id: 'gui.blockAudio.controlRepeat.name'
    },
    controlForeverName: {
        defaultMessage: 'forever loop',
        description: 'Spoken name for the Scratch control forever block',
        id: 'gui.blockAudio.controlForever.name'
    },
    controlRepeatUntilName: {
        defaultMessage: 'repeat until loop',
        description: 'Spoken name for the Scratch control repeat until block',
        id: 'gui.blockAudio.controlRepeatUntil.name'
    },
    controlRepeatExplanation: {
        defaultMessage: 'This repeat loop does the blocks inside it again and again.',
        description: 'Short child-friendly spoken explanation for the Scratch control repeat block',
        id: 'gui.blockAudio.controlRepeat.explanation'
    }
});

export default messages;
