(function(zoa) {
    'use strict';

    var __slice = Function.prototype.call.bind([].slice);

    /**
     * @ignore
     * @func __clone
     * @param {object} object - object to clone
     */
    function __clone(obj) {
        if (null == obj || 'object' != typeof obj) return obj;
        var copy = obj.constructor(),
        attr;
        for (attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    /**
     * @func observable
     * @param {object} object - object to set as observable
     * @return observable object
     * @desc Adds event functionality to object.
     * @example
     * function Robot() {
     *  zoa.observable(this);
     *
     *  this.on('attackhumans', function(attack) {
     *    console.log('Attacking with ' + attack + '.');
     *  }
     *
     *  this.one('deathRay', function() {
     *    console.log('Death ray fired.');
     *  });
     *
     * var zod = new Robot();
     *
     * zod.trigger('attackHumans', 'lasers'); // Attacking with lasers.
     * zod.trigger('deathRay'); // Death ray fired
     *
     * zod.off('attackHumans');
     * // all events
     * zod.off('*');
     *
     * // certain event
     *
     * zod.off(<event>, <function>)
     */
    zoa.observable = (function() {
        function observable(el) {
            var _this = this,
            callbacks = {};

            el.on = function(name, fn) {
                if (typeof fn !== 'function') {
                    throw new TypeError('Second argument for "on" method must be a function.');
                }
                (callbacks[name] = callbacks[name] || []).push(fn);
                return el;
            };

            el.one = function(name, fn) {
                fn.one = true;
                return el.on.call(el, name, fn);
            };

            el.off = function(name, fn) {
                if (name === '*') return callbacks = {};
                if (!callbacks[name]) throw new ReferenceError(['Listener "',name,'" does not exist']);
                if (fn) {
                    if (typeof fn !== 'function') {
                        throw new TypeError('Second argument for "off" method must be a function.');
                    }
                    callbacks[name] = callbacks[name].map(function(fm, i) {
                        if (fm === fn) {
                            callbacks[name].splice(i, 1);
                        }
                    })
                } else {
                    delete callbacks[name];
                }
            };

            el.trigger = function(name /*, args */) {
                if (!callbacks[name]) throw new ReferenceError(['Listener "',name,'" does not exist']);
                var args = __slice(arguments, 1);
                callbacks[name].forEach(function(fn, i) {
                    if (fn) {
                        fn.call(fn, args);
                        if (fn.one) callbacks[name].splice(i, 1);
                    }
                });
                return el;
            };

            return el;
        }

        return observable;
    })();

    /**
     * @func injector
     * @desc injector object that is responsible for register and holding dependencies.
     * @example
     *
     * function httpService() {
     *     return {
     *         get: function(url) {
     *             console.log('Fetching ' + url);
     *         }
     *     };
     * }
     *
     * zoa.injector.register('httpService', httpService);
     *
     * function controller(httpService) {
     *     return {
     *         getRobots: function(url) {
     *             httpService.get(url);
     *         }
     *     };
     * }
     *
     * var resolvedController= zoa.injector.resolve(controller);
     *
     * resolvedController().getRobots('robots.json'); // Fetching robots.json
     *
     * // another way
     * var ctrl = zoa.injector.invoke(controller);
     * ctrl.getRobots('robots.json'); // Fetching robots.json
     *
     * // get registered dependency
     * zoa.injector.get('httpService').get('weapons.json');
     */

    zoa.injector = (function() {
        var injector = {
            dependencies: {},
            register: function(name, fn, instantiate) {
                this.dependencies[name] =
                (
                    instantiate === false ?
                    fn :
                    new fn()
                );
            },
            get: function(s) {
                return this.dependencies[s];
            },
            invoke: function(fn) {
                return this.resolve(fn).call(fn);
            },
            resolve: function() {
                var fn, deps, scope, args = [],
                self = this;
                if  (typeof arguments[0] === 'string') {
                    fn = arguments[1];
                    deps = arguments[0].replace(/ /g, '').split(',');
                    scope = arguments[2] || {};
                } else {
                    fn = arguments[0];
                    deps = fn.toString().match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].replace(/ /g, '').split(',');
                    scope = arguments[1] || {};
                }

                return function() {
                    var a = [].slice.call(arguments, 0);
                    deps.reduce(function(acc,d,i) {
                        args.push(
                            self.dependencies[d] && d != '' ?
                            self.dependencies[d] :
                            a.shift()
                        );
                        return acc;
                    }, 0);
                    return fn.apply(scope || {}, args);
                };
            }
        };

        return injector;
    })();

    /**
     * @func app
     * @param {string} - App name
     * @return New app instance.
     * @desc Create a new app instance.
     * @example
     *  function work(task) {
     *     return 'Working ' + task + '.';
     *  }
     *
     *  // does not instatiate dependency if set to false
     *  app.injector.register('work', work, false);
     *
     *  app.module('robots', function(work) {
     *     return {
     *       doWork: function(task) {
     *         return = work(task);
     *       }
     *     };
     *  });
     *
     *  var robots = app.module('robots');
     *
     *  robots.doWork('dishes'); // Working dishes.
     */
    zoa.app = (function() {
        function App(name) {
            if (!(this instanceof App)) {
                return new App(name);
            }
            var _this = this;
            _this.name = name || 'zoa-app-' + (Math.random() * 1000 | 0)
        }

        App.prototype.module = function module(name, fn) {
            var _this = this;
            var args = __slice(arguments);
            if (!args.length) {
                throw new TypeError('Must specify a module name') ;
            } else if (args.length === 1) {
                var f = _this.modules[name];
                return _this.injector.invoke(f);
            } else if (args.length >= 2) {
                _this.registerModule(name, fn);
                return _this.modules[name];
            }
        };

        App.prototype.injector = (function() {
            var injector = __clone(zoa.injector);
            injector.dependencies = {};
            return injector;
        })();

        App.prototype.registerModule = function(name, fn) {
            var _this = this;

            _this.modules[name] = _this.injector.resolve(fn);
        };

        App.prototype.modules = {};

        return App;
    })();

})(typeof window !== 'undefined' ? window.zoa = {} : exports);
