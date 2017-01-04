import { ElementRef, Renderer, OnDestroy } from '@angular/core';
import { TreeModel } from '../tree.types';
import { NodeDraggableService } from './node-draggable.service';
export declare class NodeDraggableDirective implements OnDestroy {
    private element;
    private nodeDraggableService;
    private renderer;
    static DATA_TRANSFER_STUB_DATA: string;
    nodeDraggable: ElementRef;
    tree: TreeModel;
    private nodeNativeElement;
    private disposersForDragListeners;
    constructor(element: ElementRef, nodeDraggableService: NodeDraggableService, renderer: Renderer);
    ngOnDestroy(): void;
    private handleDragStart(e);
    private handleDragOver(e);
    private handleDragEnter(e);
    private handleDragLeave(e);
    private handleDrop(e);
    private isDropPossible(e);
    private handleDragEnd(e);
    private containsElementAt(e);
    private addClass(className);
    private removeClass(className);
    private notifyThatNodeWasDropped();
}
