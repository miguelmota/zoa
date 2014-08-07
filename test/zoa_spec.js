var assert = require('assert');
var zoa = require('../zoa');

describe('Zoa', function() {
    it('should set and trigger listeners', function() {
        var result;
        var once;
        var count = 0;

        function Test() {
            zoa.observable(this);

            this.on('msg', function(arg) {
                result = arg;
                count++;
            });

            this.on('msg', function(arg) {
                result = arg;
                count++;
            });

            this.one('once', function(arg) {
                once = arg;
            });

        }

        var t = new Test();

        t.trigger('msg', 'poop');
        t.trigger('once', 'boop');
        assert.equal(result, 'poop');
        assert.equal(once, 'boop');
        assert.equal(count, 2);
        assert.throws(t.trigger('once'));
    });

    it('should remove listeners', function() {
        var result;
        var count = 0;

        function Test() {
            zoa.observable(this);

            function f(arg) {
                result = arg;
                count++;
            }

            this.on('msg', f);
            this.off('msg', f);

            assert.throws(this.trigger('msg'));
        }

        var t = new Test();

    });

    it('should destroy humans', function() {
        var test = {};
        function Robot() {
            zoa.observable(this);

            this.on('attackHumans', function(attack) {
                console.log('Attacking with ' + attack + '.');
                test[1] = attack;
            });

            this.one('deathRay', function() {
                console.log('Death ray fired.');
                test[2] = true;
            });

        }

        var zod = new Robot();

        zod.trigger('attackHumans', 'lasers')
        zod.trigger('deathRay')

        assert.equal(test[1], 'lasers');
        assert.equal(test[2], true);
    });

    it('should inject dependencies', function() {
        function service() {
            return {
                foo: 'bar'
            };
        }
        var test = zoa.injector.resolve('service,', function(service, msg) {
            assert.equal(service().foo, 'bar');
            assert.equal(msg, 'poop');
        });

        var test2 = zoa.injector.resolve(function(service, msg) {
            assert.equal(service().foo, 'bar');
            assert.equal(msg, 'poop');
        });

        zoa.injector.register('service', service);
        var s = zoa.injector.get('service')

        assert(s().foo, 'bar');

        test('poop');

        function greeting(name) {
            return ['Hello,', name].join(' ');
        }

        zoa.injector.register('greeting', greeting);

        function greet(greeting) {
            return greeting('Dexter');
        }

        assert.equal(greeting('Dexter'), 'Hello, Dexter');
        assert.equal(zoa.injector.invoke(greet), 'Hello, Dexter');

    });

    it('should get robots', function() {

        function httpService() {
            return {
                get: function(url) {
                    console.log('Fetching ' + url + '.');
                    return url;
                }
            };
        }

        zoa.injector.register('httpService', httpService);

        function controller(httpService) {
            return {
                getRobots: function(myUrl) {
                    return httpService().get(myUrl);
                }
            };
        }

        var resolvedController = zoa.injector.resolve(controller);

        assert.equal(resolvedController().getRobots('robots.json'), 'robots.json');

        var ctrl = zoa.injector.invoke(controller);

        assert.equal(ctrl.getRobots('robots.json'), 'robots.json'); // Fetching robots.json
    });
});
