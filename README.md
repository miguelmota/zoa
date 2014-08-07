```bash
███████╗ ██████╗  █████╗
╚══███╔╝██╔═══██╗██╔══██╗
  ███╔╝ ██║   ██║███████║
 ███╔╝  ██║   ██║██╔══██║
███████╗╚██████╔╝██║  ██║
╚══════╝ ╚═════╝ ╚═╝  ╚═╝
```

# Zoa.js

A tiny JavaScript library to help you take over the world (or simply get things done)

# Install

Available via [bower](http://bower.io/)

```bash
bower install zoa
```

Available via [npm](https://www.npmjs.org/)

```bash
npm install zoa
```

# Features

## Event Emitter

```javascript
function Robot() {
    zoa.observable(this);

    this.on('attackHumans', function(attack) {
        console.log('Attacking with ' + attack + '.');
    });

    this.one('deathRay', function() {
        console.log('Death ray fired.');
    });
}

var zod = new Robot();

zod.trigger('attackHumans', 'lasers'); // Attacking with lasers.

zod.trigger('deathRay'); // Death ray fired

zod.off('attackHumans');

// all events
zod.off('*');

// certain event
zod.off(<event>, <function>)
```

## Dependency Injection

```javascript
function httpService() {
    return {
        get: function(url) {
            console.log('Fetching ' + url);
        }
    };
}

zoa.injector.register('httpService', httpService);

var controller  = zoa.injector.resolve(function(httpService, myUrl) {
    return {
        getRobots: function() {
            httpService().get(myUrl);
        }
    };
});

controller().getRobots('robots.json'); // Fetching robots.json

// another way
var ctrl = zoa.injector.invoke(controller);
ctrl.getRobots('robots.json'); // Fetching robots.json

// get registered dependency
zoa.injector.get('httpService').get('weapons.json');
```

Yep, zoa only has two features at the moment.

# Test

```bash
npm test
```

# License

Relesed under the MIT License.
