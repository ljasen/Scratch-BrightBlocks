import bindAll from 'lodash.bindall';
import React from 'react';
import PropTypes from 'prop-types';

import {connect} from 'react-redux';
import VM from '@scratch/scratch-vm';

class TargetHighlight extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'getPageCoords'
        ]);
    }

    // Transform scratch coordinates into page coordinates
    getPageCoords (x, y) {
        const {stageWidth, stageHeight, vm} = this.props;
        // The renderers "nativeSize" is the [width, height] of the stage in scratch-units
        const nativeSize = vm.renderer.getNativeSize();
        if (!nativeSize || nativeSize.length < 2 || !nativeSize[0] || !nativeSize[1]) return null;
        return [
            ((stageWidth / nativeSize[0]) * x) + (stageWidth / 2),
            -((stageHeight / nativeSize[1]) * y) + (stageHeight / 2)
        ];
    }

    render () {
        const {
            className,
            highlightedTargetId,
            highlightedTargetTime,
            vm
        } = this.props;

        if (!(highlightedTargetId && vm && vm.renderer && vm.runtime)) return null;

        const target = vm.runtime.getTargetById(highlightedTargetId);
        if (!target || typeof target.drawableID === 'undefined' || target.drawableID === null ||
                !vm.renderer || typeof vm.renderer.getBounds !== 'function') {
            console.warn('TargetHighlight.render: target drawable is not available', {
                highlightedTargetId,
                hasTarget: Boolean(target),
                drawableID: target && target.drawableID
            });
            return null;
        }

        let bounds = null;
        try {
            bounds = vm.renderer.getBounds(target.drawableID);
        } catch (error) {
            console.warn('TargetHighlight.render: renderer bounds are not available', {
                highlightedTargetId,
                drawableID: target.drawableID,
                error
            });
            return null;
        }
        if (!bounds || [bounds.left, bounds.top, bounds.right, bounds.bottom].some(value => (
            typeof value !== 'number' || Number.isNaN(value)
        ))) {
            return null;
        }
        const topLeft = this.getPageCoords(bounds.left, bounds.top);
        const bottomRight = this.getPageCoords(bounds.right, bounds.bottom);
        if (!topLeft || !bottomRight) return null;

        const [left, top] = topLeft;
        const [right, bottom] = bottomRight;
        if ([left, top, right, bottom].some(value => typeof value !== 'number' || Number.isNaN(value))) {
            return null;
        }

        const pad = 2; // px

        return (
            <div
                className={className}
                // Ensure new DOM element each update to restart animation
                key={highlightedTargetTime}
                style={{
                    position: 'absolute',
                    top: `${top - pad}px`,
                    left: `${left - pad}px`,
                    width: `${(right - left) + (2 * pad)}px`,
                    height: `${(bottom - top) + (2 * pad)}px`
                }}
            />
        );
    }
}

TargetHighlight.propTypes = {
    className: PropTypes.string,
    highlightedTargetId: PropTypes.string,
    highlightedTargetTime: PropTypes.number,
    stageHeight: PropTypes.number,
    stageWidth: PropTypes.number,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
    highlightedTargetTime: state.scratchGui.targets.highlightedTargetTime,
    highlightedTargetId: state.scratchGui.targets.highlightedTargetId,
    vm: state.scratchGui.vm
});

const mapDispatchToProps = () => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TargetHighlight);
