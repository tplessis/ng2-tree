import { OnInit, EventEmitter, ElementRef } from '@angular/core';
import { TreeModel, NodeEvent } from './tree.types';
import { NodeDraggableService } from './draggable/node-draggable.service';
import { TreeService } from './tree.service';
import { Routes } from "@angular/router";
export declare class TreeInternalComponent implements OnInit {
    private nodeDraggableService;
    private treeService;
    private element;
    tree: TreeModel;
    parentTree: TreeModel;
    indexInParent: number;
    nodeRemoved: EventEmitter<NodeEvent>;
    private isLeaf;
    private isSelected;
    constructor(nodeDraggableService: NodeDraggableService, treeService: TreeService, element: ElementRef);
    ngOnInit(): void;
    private setUpNodeSelectedEventHandler();
    private setUpDraggableEventHandler();
    private moveNodeToThisTreeAndRemoveFromPreviousOne(e);
    private moveNodeToParentTreeAndRemoveFromPreviousOne(e);
    private isFolder();
    private hasChild(child);
    private isSiblingOf(child);
    private swapWithSibling(sibling);
    private isNodeExpanded();
    private switchFoldingType(e, tree);
    private getFoldingTypeCssClass(node);
    private getNextFoldingType(node);
    private handleFoldingType(parent, node);
    private onChildRemoved(e, parent?);
    private onNodeSelected(e);
}
export declare class TreeComponent implements OnInit {
    private treeService;
    routes: Routes;
    tree: TreeModel;
    nodeCreated: EventEmitter<any>;
    nodeRemoved: EventEmitter<any>;
    nodeRenamed: EventEmitter<any>;
    nodeSelected: EventEmitter<any>;
    nodeMoved: EventEmitter<any>;
    constructor(treeService: TreeService);
    ngOnInit(): void;
}
