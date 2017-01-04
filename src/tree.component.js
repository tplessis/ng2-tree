"use strict";
var core_1 = require('@angular/core');
var tree_types_1 = require('./tree.types');
var node_draggable_service_1 = require('./draggable/node-draggable.service');
var draggable_types_1 = require('./draggable/draggable.types');
var tree_service_1 = require('./tree.service');
var event_utils_1 = require('./common/utils/event.utils');
var _ = require('lodash');
var tree_styles_1 = require('./tree.styles');
var TreeInternalComponent = (function () {
    function TreeInternalComponent(nodeDraggableService, treeService, element) {
        this.nodeDraggableService = nodeDraggableService;
        this.treeService = treeService;
        this.element = element;
        this.nodeRemoved = new core_1.EventEmitter();
        this.isSelected = false;
    }
    TreeInternalComponent.prototype.ngOnInit = function () {
        this.indexInParent = 0;
        this.isLeaf = true;
        if (Array.isArray(this.tree.children)) {
            if (this.tree.children.length > 0) {
                this.isLeaf = false;
            }
        }
        this.tree._indexInParent = this.indexInParent;
        this.setUpNodeSelectedEventHandler();
        this.setUpDraggableEventHandler();
    };
    TreeInternalComponent.prototype.setUpNodeSelectedEventHandler = function () {
        var _this = this;
        this.treeService.nodeSelected$
            .filter(function (e) { return _this.tree !== e.node; })
            .subscribe(function () { return _this.isSelected = false; });
    };
    TreeInternalComponent.prototype.setUpDraggableEventHandler = function () {
        var _this = this;
        this.nodeDraggableService.draggableNodeEvents$
            .filter(function (e) { return e.action === draggable_types_1.NodeDraggableEventAction.Remove; })
            .filter(function (e) { return e.captured.element === _this.element; })
            .subscribe(function (e) { return _this.onChildRemoved({ node: e.captured.tree }, _this.parentTree); });
        this.nodeDraggableService.draggableNodeEvents$
            .filter(function (e) { return e.action !== draggable_types_1.NodeDraggableEventAction.Remove; })
            .filter(function (e) { return e.target === _this.element; })
            .filter(function (e) { return !_this.hasChild(e.captured.tree); })
            .subscribe(function (e) {
            if (_this.isSiblingOf(e.captured.tree)) {
                return _this.swapWithSibling(e.captured.tree);
            }
            if (_this.isFolder()) {
                return _this.moveNodeToThisTreeAndRemoveFromPreviousOne(e);
            }
            else {
                return _this.moveNodeToParentTreeAndRemoveFromPreviousOne(e);
            }
        });
    };
    TreeInternalComponent.prototype.moveNodeToThisTreeAndRemoveFromPreviousOne = function (e) {
        this.tree.children.push(e.captured.tree);
        this.nodeDraggableService.draggableNodeEvents$.next(_.merge(e, { action: draggable_types_1.NodeDraggableEventAction.Remove }));
        this.treeService.nodeMoved$.next({
            node: e.captured.tree,
            parent: this.tree
        });
    };
    TreeInternalComponent.prototype.moveNodeToParentTreeAndRemoveFromPreviousOne = function (e) {
        this.parentTree.children.splice(this.indexInParent, 0, e.captured.tree);
        this.nodeDraggableService.draggableNodeEvents$.next(_.merge(e, { action: draggable_types_1.NodeDraggableEventAction.Remove }));
        this.treeService.nodeMoved$.next({
            node: e.captured.tree,
            parent: this.parentTree
        });
    };
    TreeInternalComponent.prototype.isFolder = function () {
        return !this.isLeaf;
    };
    TreeInternalComponent.prototype.hasChild = function (child) {
        return _.includes(this.tree.children, child);
    };
    TreeInternalComponent.prototype.isSiblingOf = function (child) {
        return this.parentTree && _.includes(this.parentTree.children, child);
    };
    TreeInternalComponent.prototype.swapWithSibling = function (sibling) {
        var siblingIndex = this.parentTree.children.indexOf(sibling);
        var thisTreeIndex = this.parentTree.children.indexOf(this.tree);
        this.parentTree.children[siblingIndex] = this.tree;
        this.parentTree.children[thisTreeIndex] = sibling;
        this.tree._indexInParent = siblingIndex;
        sibling._indexInParent = thisTreeIndex;
        this.treeService.nodeMoved$.next({
            node: this.tree,
            parent: this.parentTree
        });
    };
    TreeInternalComponent.prototype.isNodeExpanded = function () {
        return this.tree._foldingType === tree_types_1.FoldingType.Expanded;
    };
    TreeInternalComponent.prototype.switchFoldingType = function (e, tree) {
        this.handleFoldingType(e.target.parentNode.parentNode, tree);
    };
    TreeInternalComponent.prototype.getFoldingTypeCssClass = function (node) {
        if (!node._foldingType) {
            if (node.children && node.children.length > 0) {
                node._foldingType = tree_types_1.FoldingType.Expanded;
            }
            else {
                node._foldingType = tree_types_1.FoldingType.Leaf;
            }
        }
        return node._foldingType.cssClass;
    };
    TreeInternalComponent.prototype.getNextFoldingType = function (node) {
        if (node._foldingType === tree_types_1.FoldingType.Expanded) {
            return tree_types_1.FoldingType.Collapsed;
        }
        return tree_types_1.FoldingType.Expanded;
    };
    TreeInternalComponent.prototype.handleFoldingType = function (parent, node) {
        if (node._foldingType === tree_types_1.FoldingType.Leaf) {
            return;
        }
        node._foldingType = this.getNextFoldingType(node);
    };
    TreeInternalComponent.prototype.onChildRemoved = function (e, parent) {
        if (parent === void 0) { parent = this.tree; }
        var childIndex = _.findIndex(parent.children, function (child) { return child === e.node; });
        if (childIndex >= 0) {
            parent.children.splice(childIndex, 1);
        }
    };
    TreeInternalComponent.prototype.onNodeSelected = function (e) {
        if (event_utils_1.isLeftButtonClicked(e)) {
            this.isSelected = true;
            this.treeService.nodeSelected$.next({ node: this.tree });
        }
    };
    TreeInternalComponent.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'tree-internal',
                    styles: tree_styles_1.styles,
                    template: "\n  <ul class=\"tree\" *ngIf=\"tree\">\n    <li>\n      <div (contextmenu)=\"showMenu($event)\" [nodeDraggable]=\"element\" [tree]=\"tree\">\n        <div class=\"folding\" (click)=\"switchFoldingType($event, tree)\" [ngClass]=\"getFoldingTypeCssClass(tree)\"></div>\n        <div href=\"#\" class=\"node-value\" [class.node-selected]=\"isSelected\" (click)=\"onNodeSelected($event)\">{{tree.data.menu.title}}</div>\n\n      </div>\n\n      <template [ngIf]=\"isNodeExpanded()\">\n        <tree-internal *ngFor=\"let child of tree.children; let position = index\"\n              [parentTree]=\"tree\"\n              [indexInParent]=\"position\"\n              [tree]=\"child\"\n              (nodeRemoved)=\"onChildRemoved($event)\"></tree-internal>\n      </template>\n    </li>\n  </ul>\n  "
                },] },
    ];
    TreeInternalComponent.ctorParameters = function () { return [
        { type: node_draggable_service_1.NodeDraggableService, decorators: [{ type: core_1.Inject, args: [node_draggable_service_1.NodeDraggableService,] },] },
        { type: tree_service_1.TreeService, decorators: [{ type: core_1.Inject, args: [tree_service_1.TreeService,] },] },
        { type: core_1.ElementRef, decorators: [{ type: core_1.Inject, args: [core_1.ElementRef,] },] },
    ]; };
    TreeInternalComponent.propDecorators = {
        'tree': [{ type: core_1.Input },],
        'parentTree': [{ type: core_1.Input },],
        'indexInParent': [{ type: core_1.Input },],
        'nodeRemoved': [{ type: core_1.Output },],
    };
    return TreeInternalComponent;
}());
exports.TreeInternalComponent = TreeInternalComponent;
var TreeComponent = (function () {
    function TreeComponent(treeService) {
        this.treeService = treeService;
        this.nodeCreated = new core_1.EventEmitter();
        this.nodeRemoved = new core_1.EventEmitter();
        this.nodeRenamed = new core_1.EventEmitter();
        this.nodeSelected = new core_1.EventEmitter();
        this.nodeMoved = new core_1.EventEmitter();
    }
    TreeComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.routes) {
            var rootNode_1 = { path: '', data: {
                    menu: {
                        title: 'Menu'
                    }
                }, children: [], _status: tree_types_1.TreeStatus.New };
            this.routes.forEach(function (tree) {
                rootNode_1.children.push(tree);
            });
            this.tree = rootNode_1;
        }
        this.treeService.nodeRemoved$.subscribe(function (e) {
            _this.nodeRemoved.emit(e);
        });
        this.treeService.nodeRenamed$.subscribe(function (e) {
            _this.nodeRenamed.emit(e);
        });
        this.treeService.nodeCreated$.subscribe(function (e) {
            _this.nodeCreated.emit(e);
        });
        this.treeService.nodeSelected$.subscribe(function (e) {
            _this.nodeSelected.emit(e);
        });
        this.treeService.nodeMoved$.subscribe(function (e) {
            _this.nodeMoved.emit(e);
        });
    };
    TreeComponent.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'tree',
                    template: "<tree-internal [tree]=\"tree\"></tree-internal>",
                    providers: [tree_service_1.TreeService]
                },] },
    ];
    TreeComponent.ctorParameters = function () { return [
        { type: tree_service_1.TreeService, decorators: [{ type: core_1.Inject, args: [tree_service_1.TreeService,] },] },
    ]; };
    TreeComponent.propDecorators = {
        'routes': [{ type: core_1.Input },],
        'tree': [{ type: core_1.Input },],
        'nodeCreated': [{ type: core_1.Output },],
        'nodeRemoved': [{ type: core_1.Output },],
        'nodeRenamed': [{ type: core_1.Output },],
        'nodeSelected': [{ type: core_1.Output },],
        'nodeMoved': [{ type: core_1.Output },],
    };
    return TreeComponent;
}());
exports.TreeComponent = TreeComponent;
//# sourceMappingURL=tree.component.js.map