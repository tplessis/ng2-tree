"use strict";
var core_1 = require('@angular/core');
var tree_component_1 = require('./tree.component');
var common_1 = require('@angular/common');
var node_draggable_directive_1 = require('./draggable/node-draggable.directive');
var node_draggable_service_1 = require('./draggable/node-draggable.service');
var tree_service_1 = require('./tree.service');
var TreeModule = (function () {
    function TreeModule() {
    }
    TreeModule.decorators = [
        { type: core_1.NgModule, args: [{
                    imports: [common_1.CommonModule],
                    declarations: [node_draggable_directive_1.NodeDraggableDirective, tree_component_1.TreeComponent, tree_component_1.TreeInternalComponent],
                    exports: [tree_component_1.TreeComponent],
                    providers: [node_draggable_service_1.NodeDraggableService, tree_service_1.TreeService]
                },] },
    ];
    TreeModule.ctorParameters = function () { return []; };
    return TreeModule;
}());
exports.TreeModule = TreeModule;
//# sourceMappingURL=tree.module.js.map