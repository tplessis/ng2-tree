import { Component } from '@angular/core';
import { Routes } from "@angular/router";
import { NodeEvent, TreeModel, RenamableNode } from '../index';

declare const alertify: any;

@Component({
  selector: 'app',
  template: `
    <div class="tree-demo-app">
      <div class="tree-container">
        <p>Top menu</p>
        <tree
          [routes]="navbarMenu" 
          (nodeRemoved)="onNodeRemoved($event)"
          (nodeRenamed)="onNodeRenamed($event)"
          (nodeSelected)="onNodeSelected($event)"
          (nodeMoved)="onNodeMoved($event)"
          (nodeCreated)="onNodeCreated($event)">
        </tree>
      </div>
    </div>
    `,
  styles: [`
   .tree-demo-app {
      margin: auto;
      width: -moz-fit-content;
      width: -webkit-fit-content;
      width: fit-content;
    }
    .tree-demo-app .tree-container {
      float: left;
      vertical-align: top;
      width: 500px;
    }
    .tree-demo-app .tree-container p {
      color: #40a070;
      font-size: 2em;
    } 
  `]
})
export class AppComponent {

  public navbarMenu:Routes = [
    {
      path: 'home',
      data: {
        menu: {
          title: 'Home',
          order: 1,
        }
      },
      children: [
        {
          path: 'welcome',
          data: {
            menu: {
              title: 'Welcome',
              order: 1
            }
          },
          children: []
        },
        {
          path: 'news',
          data: {
            menu: {
              title: 'News',
              order: 2
            }
          },
          loadChildren: 'app/news/news.module#NewsModule'
        }
      ]
    },
    {
      path: 'blog',
      data: {
        menu: {
          title: 'Blog',
          order: 2,
        }
      },
      children: [
        {
          path: 'posts',
          data: {
            menu: {
              title: 'Posts',
              order: 1
            }
          },
          children: []
        },
        {
          path: 'categories',
          data: {
            menu: {
              title: 'Categories',
              order: 2
            }
          },
          children: []
        }
      ]
    },
    {
      path: 'admin',
      data: {
        menu: {
          title: 'Admin',
          order: 5,
        }
      },
      children: []
    }
  ];


  public onNodeRemoved(e: NodeEvent): void {
    this.logEvent(e, 'Removed');
  }

  public onNodeMoved(e: NodeEvent): void {
    this.logEvent(e, 'Moved');
  }

  public onNodeRenamed(e: NodeEvent): void {
    this.logEvent(e, 'Renamed');
  }

  public onNodeCreated(e: NodeEvent): void {
    this.logEvent(e, 'Created');
  }

  public onNodeSelected(e: NodeEvent): void {
    this.logEvent(e, 'Selected');
  }

  public logEvent(e: NodeEvent, message: string): void {
    console.log(this.navbarMenu);
  }
}
