/**
 * @license Angular v2.1.2
 * (c) 2010-2016 Google, Inc. https://angular.io/
 * License: MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/http'), require('rxjs/ReplaySubject'), require('rxjs/Subject'), require('rxjs/operator/take')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/http', 'rxjs/ReplaySubject', 'rxjs/Subject', 'rxjs/operator/take'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.http = global.ng.http || {}, global.ng.http.testing = global.ng.http.testing || {}),global.ng.core,global.ng.http,global.Rx,global.Rx,global.Rx.Observable.prototype));
}(this, function (exports,_angular_core,_angular_http,rxjs_ReplaySubject,rxjs_Subject,rxjs_operator_take) { 'use strict';

    /**
     *
     * Mock Connection to represent a {@link Connection} for tests.
     *
     * @experimental
     */
    var MockConnection = (function () {
        function MockConnection(req) {
            this.response = rxjs_operator_take.take.call(new rxjs_ReplaySubject.ReplaySubject(1), 1);
            this.readyState = _angular_http.ReadyState.Open;
            this.request = req;
        }
        /**
         * Sends a mock response to the connection. This response is the value that is emitted to the
         * {@link EventEmitter} returned by {@link Http}.
         *
         * ### Example
         *
         * ```
         * var connection;
         * backend.connections.subscribe(c => connection = c);
         * http.request('data.json').subscribe(res => console.log(res.text()));
         * connection.mockRespond(new Response(new ResponseOptions({ body: 'fake response' }))); //logs
         * 'fake response'
         * ```
         *
         */
        MockConnection.prototype.mockRespond = function (res) {
            if (this.readyState === _angular_http.ReadyState.Done || this.readyState === _angular_http.ReadyState.Cancelled) {
                throw new Error('Connection has already been resolved');
            }
            this.readyState = _angular_http.ReadyState.Done;
            this.response.next(res);
            this.response.complete();
        };
        /**
         * Not yet implemented!
         *
         * Sends the provided {@link Response} to the `downloadObserver` of the `Request`
         * associated with this connection.
         */
        MockConnection.prototype.mockDownload = function (res) {
            // this.request.downloadObserver.onNext(res);
            // if (res.bytesLoaded === res.totalBytes) {
            //   this.request.downloadObserver.onCompleted();
            // }
        };
        // TODO(jeffbcross): consider using Response type
        /**
         * Emits the provided error object as an error to the {@link Response} {@link EventEmitter}
         * returned
         * from {@link Http}.
         *
         * ### Example
         *
         * ```
         * var connection;
         * backend.connections.subscribe(c => connection = c);
         * http.request('data.json').subscribe(res => res, err => console.log(err)));
         * connection.mockError(new Error('error'));
         * ```
         *
         */
        MockConnection.prototype.mockError = function (err) {
            // Matches ResourceLoader semantics
            this.readyState = _angular_http.ReadyState.Done;
            this.response.error(err);
        };
        return MockConnection;
    }());
    /**
     * A mock backend for testing the {@link Http} service.
     *
     * This class can be injected in tests, and should be used to override providers
     * to other backends, such as {@link XHRBackend}.
     *
     * ### Example
     *
     * ```
     * import {BaseRequestOptions, Http} from '@angular/http';
     * import {MockBackend} from '@angular/http/testing';
     * it('should get some data', inject([AsyncTestCompleter], (async) => {
     *   var connection;
     *   var injector = Injector.resolveAndCreate([
     *     MockBackend,
     *     {provide: Http, useFactory: (backend, options) => {
     *       return new Http(backend, options);
     *     }, deps: [MockBackend, BaseRequestOptions]}]);
     *   var http = injector.get(Http);
     *   var backend = injector.get(MockBackend);
     *   //Assign any newly-created connection to local variable
     *   backend.connections.subscribe(c => connection = c);
     *   http.request('data.json').subscribe((res) => {
     *     expect(res.text()).toBe('awesome');
     *     async.done();
     *   });
     *   connection.mockRespond(new Response('awesome'));
     * }));
     * ```
     *
     * This method only exists in the mock implementation, not in real Backends.
     *
     * @experimental
     */
    var MockBackend = (function () {
        function MockBackend() {
            var _this = this;
            this.connectionsArray = [];
            this.connections = new rxjs_Subject.Subject();
            this.connections.subscribe(function (connection) { return _this.connectionsArray.push(connection); });
            this.pendingConnections = new rxjs_Subject.Subject();
        }
        /**
         * Checks all connections, and raises an exception if any connection has not received a response.
         *
         * This method only exists in the mock implementation, not in real Backends.
         */
        MockBackend.prototype.verifyNoPendingRequests = function () {
            var pending = 0;
            this.pendingConnections.subscribe(function (c) { return pending++; });
            if (pending > 0)
                throw new Error(pending + " pending connections to be resolved");
        };
        /**
         * Can be used in conjunction with `verifyNoPendingRequests` to resolve any not-yet-resolve
         * connections, if it's expected that there are connections that have not yet received a response.
         *
         * This method only exists in the mock implementation, not in real Backends.
         */
        MockBackend.prototype.resolveAllConnections = function () { this.connections.subscribe(function (c) { return c.readyState = 4; }); };
        /**
         * Creates a new {@link MockConnection}. This is equivalent to calling `new
         * MockConnection()`, except that it also will emit the new `Connection` to the `connections`
         * emitter of this `MockBackend` instance. This method will usually only be used by tests
         * against the framework itself, not by end-users.
         */
        MockBackend.prototype.createConnection = function (req) {
            if (!req || !(req instanceof _angular_http.Request)) {
                throw new Error("createConnection requires an instance of Request, got " + req);
            }
            var connection = new MockConnection(req);
            this.connections.next(connection);
            return connection;
        };
        MockBackend.decorators = [
            { type: _angular_core.Injectable },
        ];
        /** @nocollapse */
        MockBackend.ctorParameters = [];
        return MockBackend;
    }());

    exports.MockConnection = MockConnection;
    exports.MockBackend = MockBackend;

}));
