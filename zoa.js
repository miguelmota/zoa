(function(zoa) {

    /**
     * Observable
     */
    zoa.observable = function(el) {
        var _this = this,
            __slice = Function.prototype.call.bind([].slice);
            callbacks = {},
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

    /**
     * Dependency injection
     */
    zoa.injector = (function() {
        var injector = {
            dependencies: {},
            register: function(k, v) {
                this.dependencies[k] = v;
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
                            args.push(self.dependencies[d] && d != '' ? self.dependencies[d] : a.shift())
                            return acc;
                       }, 0);
                       return fn.apply(scope || {}, args);
                    };
            }
        };

        return injector;
    })  ();

})(typeof window !== 'undefined' ? window.zoa = {} : exports);
