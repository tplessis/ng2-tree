import { Input, Component, OnInit, EventEmitter, Output, ElementRef, Inject } from '@angular/core';
import { TreeStatus, TreeModel, FoldingType, NodeEvent, NodeSelectedEvent } from './tree.types';
import { NodeDraggableService } from './draggable/node-draggable.service';
import { NodeDraggableEventAction, NodeDraggableEvent } from './draggable/draggable.types';
import { TreeService } from './tree.service';
import { Routes } from "@angular/router";
import { isLeftButtonClicked } from './common/utils/event.utils';
import * as _ from 'lodash';
import { styles } from './tree.styles';

@Component({
  selector: 'tree-internal',
  styles: styles,
  template: `
  <ul class="tree" *ngIf="tree">
    <li>
      <div (contextmenu)="showMenu($event)" [nodeDraggable]="element" [tree]="tree">
        <div class="folding" (click)="switchFoldingType($event, tree)" [ngClass]="getFoldingTypeCssClass(tree)"></div>
        <div href="#" class="node-value" [class.node-selected]="isSelected" (click)="onNodeSelected($event)">{{tree.data.menu.title}}</div>

      </div>

      <template [ngIf]="isNodeExpanded()">
        <tree-internal *ngFor="let child of tree.children; let position = index"
              [parentTree]="tree"
              [indexInParent]="position"
              [tree]="child"
              (nodeRemoved)="onChildRemoved($event)"></tree-internal>
      </template>
    </li>
  </ul>
  `
})
export class TreeInternalComponent implements OnInit {
  @Input()
  public tree: TreeModel;

  @Input()
  public parentTree: TreeModel;

  @Input()
  public indexInParent: number;

  @Output()
  public nodeRemoved: EventEmitter<NodeEvent> = new EventEmitter<NodeEvent>();

  private isLeaf: boolean;
  private isSelected: boolean = false;

  public constructor(@Inject(NodeDraggableService) private nodeDraggableService: NodeDraggableService,
                     @Inject(TreeService) private treeService: TreeService,
                     @Inject(ElementRef) private element: ElementRef) {
  }

  public ngOnInit(): void {
    this.indexInParent = 0;
    this.isLeaf = true;

    if(Array.isArray(this.tree.children)) {
      if(this.tree.children.length > 0) {
        this.isLeaf = false;
      }
    }

    this.tree._indexInParent = this.indexInParent;

    this.setUpNodeSelectedEventHandler();
    this.setUpDraggableEventHandler();
  }

  private setUpNodeSelectedEventHandler(): void {
    this.treeService.nodeSelected$
      .filter((e: NodeSelectedEvent) => this.tree !== e.node)
      .subscribe(() => this.isSelected = false);
  }

  // DRAG-N-DROP -------------------------------------------------------------------------------------------------------

  private setUpDraggableEventHandler(): void {
    this.nodeDraggableService.draggableNodeEvents$
      .filter((e: NodeDraggableEvent) => e.action === NodeDraggableEventAction.Remove)
      .filter((e: NodeDraggableEvent) => e.captured.element === this.element)
      .subscribe((e: NodeDraggableEvent) => this.onChildRemoved({node: e.captured.tree}, this.parentTree));

    this.nodeDraggableService.draggableNodeEvents$
      .filter((e: NodeDraggableEvent) => e.action !== NodeDraggableEventAction.Remove)
      .filter((e: NodeDraggableEvent) => e.target === this.element)
      .filter((e: NodeDraggableEvent) => !this.hasChild(e.captured.tree))
      .subscribe((e: NodeDraggableEvent) => {
        if (this.isSiblingOf(e.captured.tree)) {
          return this.swapWithSibling(e.captured.tree);
        }

        if (this.isFolder()) {
          return this.moveNodeToThisTreeAndRemoveFromPreviousOne(e);
        } else {
          return this.moveNodeToParentTreeAndRemoveFromPreviousOne(e);
        }
      });
  }

  private moveNodeToThisTreeAndRemoveFromPreviousOne(e: NodeDraggableEvent): void {
    this.tree.children.push(e.captured.tree);
    this.nodeDraggableService.draggableNodeEvents$.next(_.merge(e, {action: NodeDraggableEventAction.Remove}));

    this.treeService.nodeMoved$.next({
      node: e.captured.tree,
      parent: this.tree
    });
  }

  private moveNodeToParentTreeAndRemoveFromPreviousOne(e: NodeDraggableEvent): void {
    this.parentTree.children.splice(this.indexInParent, 0, e.captured.tree);
    this.nodeDraggableService.draggableNodeEvents$.next(_.merge(e, {action: NodeDraggableEventAction.Remove}));

    this.treeService.nodeMoved$.next({
      node: e.captured.tree,
      parent: this.parentTree
    });
  }

  private isFolder(): boolean {
    return !this.isLeaf;
  }

  private hasChild(child: TreeModel): boolean {
    return _.includes(this.tree.children, child);
  }

  private isSiblingOf(child: TreeModel): boolean {
    return this.parentTree && _.includes(this.parentTree.children, child);
  }

  private swapWithSibling(sibling: TreeModel): void {
    const siblingIndex = this.parentTree.children.indexOf(sibling);
    const thisTreeIndex = this.parentTree.children.indexOf(this.tree);

    this.parentTree.children[siblingIndex] = this.tree;
    this.parentTree.children[thisTreeIndex] = sibling;

    this.tree._indexInParent = siblingIndex;
    sibling._indexInParent = thisTreeIndex;

    this.treeService.nodeMoved$.next({
      node: this.tree,
      parent: this.parentTree
    });
  }

  // FOLDING -----------------------------------------------------------------------------------------------------------

  private isNodeExpanded(): boolean {
    return this.tree._foldingType === FoldingType.Expanded;
  }

  private switchFoldingType(e: any, tree: TreeModel): void {
    this.handleFoldingType(e.target.parentNode.parentNode, tree);
  }

  private getFoldingTypeCssClass(node: TreeModel): string {
    if (!node._foldingType) {
      if (node.children && node.children.length > 0) {
        node._foldingType = FoldingType.Expanded;
      } else {
        node._foldingType = FoldingType.Leaf;
      }
    }

    return node._foldingType.cssClass;
  }

  private getNextFoldingType(node: TreeModel): FoldingType {
    if (node._foldingType === FoldingType.Expanded) {
      return FoldingType.Collapsed;
    }

    return FoldingType.Expanded;
  }

  private handleFoldingType(parent: TreeModel, node: TreeModel): void {
    if (node._foldingType === FoldingType.Leaf) {
      return;
    }

    node._foldingType = this.getNextFoldingType(node);
  }

  private onChildRemoved(e: NodeEvent, parent: TreeModel = this.tree): void {
    const childIndex = _.findIndex(parent.children, (child: any) => child === e.node);
    if (childIndex >= 0) {
      parent.children.splice(childIndex, 1);
    }
  }

  private onNodeSelected(e: MouseEvent): void {
    if (isLeftButtonClicked(e)) {
      this.isSelected = true;
      this.treeService.nodeSelected$.next({node: this.tree});
    }
  }
}

@Component({
  selector: 'tree',
  template: `<tree-internal [tree]="tree"></tree-internal>`,
  providers: [TreeService]
})
export class TreeComponent implements OnInit {
  @Input()
  public routes: Routes;

  @Input()
  public tree: TreeModel;

  @Output()
  public nodeCreated: EventEmitter<any> = new EventEmitter();

  @Output()
  public nodeRemoved: EventEmitter<any> = new EventEmitter();

  @Output()
  public nodeRenamed: EventEmitter<any> = new EventEmitter();

  @Output()
  public nodeSelected: EventEmitter<any> = new EventEmitter();

  @Output()
  public nodeMoved: EventEmitter<any> = new EventEmitter();

  public constructor(@Inject(TreeService) private treeService: TreeService) {
  }

  public ngOnInit(): void {
    if (this.routes) {
      const rootNode: TreeModel = {path: '', data: {
        menu: {
          title: 'Menu'
        }
      }, children: [], _status: TreeStatus.New};

      this.routes.forEach((tree:TreeModel) => {
        rootNode.children.push(tree);
      });

      this.tree = rootNode;
    }

    this.treeService.nodeRemoved$.subscribe((e: NodeEvent) => {
      this.nodeRemoved.emit(e);
    });

    this.treeService.nodeRenamed$.subscribe((e: NodeEvent) => {
      this.nodeRenamed.emit(e);
    });

    this.treeService.nodeCreated$.subscribe((e: NodeEvent) => {
      this.nodeCreated.emit(e);
    });

    this.treeService.nodeSelected$.subscribe((e: NodeEvent) => {
      this.nodeSelected.emit(e);
    });

    this.treeService.nodeMoved$.subscribe((e: NodeEvent) => {
      this.nodeMoved.emit(e);
    });
  }
}
