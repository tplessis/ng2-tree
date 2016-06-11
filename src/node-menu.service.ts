import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Rx';
import {NodeMenuEvent} from './types';

@Injectable()
export class NodeMenuService {
  public nodeMenuEvents$: Subject<NodeMenuEvent> = new Subject<NodeMenuEvent>();
}
