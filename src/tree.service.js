"use strict";
var Rx_1 = require('rxjs/Rx');
var core_1 = require('@angular/core');
var TreeService = (function () {
    function TreeService() {
        this.nodeMoved$ = new Rx_1.Subject();
        this.nodeRemoved$ = new Rx_1.Subject();
        this.nodeRenamed$ = new Rx_1.Subject();
        this.nodeCreated$ = new Rx_1.Subject();
        this.nodeSelected$ = new Rx_1.Subject();
    }
    TreeService.decorators = [
        { type: core_1.Injectable },
    ];
    TreeService.ctorParameters = function () { return []; };
    return TreeService;
}());
exports.TreeService = TreeService;
//# sourceMappingURL=tree.service.js.map