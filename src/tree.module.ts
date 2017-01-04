import { NgModule } from '@angular/core';
import { TreeComponent, TreeInternalComponent } from './tree.component';
import { CommonModule } from '@angular/common';
import { NodeDraggableDirective } from './draggable/node-draggable.directive';
import { NodeDraggableService } from './draggable/node-draggable.service';
import { TreeService } from './tree.service';

@NgModule({
  imports: [CommonModule],
  declarations: [NodeDraggableDirective, TreeComponent, TreeInternalComponent],
  exports: [TreeComponent],
  providers: [NodeDraggableService, TreeService]
})
export class TreeModule {
}
