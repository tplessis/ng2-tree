"use strict";
var core_1 = require('@angular/core');
var Rx_1 = require('rxjs/Rx');
var NodeDraggableService = (function () {
    function NodeDraggableService() {
        this.draggableNodeEvents$ = new Rx_1.Subject();
    }
    NodeDraggableService.prototype.captureNode = function (node) {
        this.capturedNode = node;
    };
    NodeDraggableService.prototype.getCapturedNode = function () {
        return this.capturedNode;
    };
    NodeDraggableService.prototype.releaseCapturedNode = function () {
        this.capturedNode = null;
    };
    NodeDraggableService.decorators = [
        { type: core_1.Injectable },
    ];
    NodeDraggableService.ctorParameters = function () { return []; };
    return NodeDraggableService;
}());
exports.NodeDraggableService = NodeDraggableService;
//# sourceMappingURL=node-draggable.service.js.map