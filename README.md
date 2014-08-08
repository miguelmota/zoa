```bash
 8888888888',8888'  ,o888888o.           .8.
        ,8',8888'. 8888     `88.        .888.
       ,8',8888',8 8888       `8b      :88888.
      ,8',8888' 88 8888        `8b    . `88888.
     ,8',8888'  88 8888         88   .8. `88888.
    ,8',8888'   88 8888         88  .8`8. `88888.
   ,8',8888'    88 8888        ,8P .8' `8. `88888.
  ,8',8888'     `8 8888       ,8P .8'   `8. `88888.
 ,8',8888'       ` 8888     ,88' .888888888. `88888.
,8',8888888888888   `8888888P'  .8'       `8. `88888.
```

# Zoa.js

A tiny JavaScript framework to help you write applications.

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

function controller(httpService) {
    return {
        getRobots: function(url) {
            httpService.get(url);
        }
    };
}

var resolvedController= zoa.injector.resolve(controller);

resolvedController().getRobots('robots.json'); // Fetching robots.json

// another way
var ctrl = zoa.injector.invoke(controller);
ctrl.getRobots('robots.json'); // Fetching robots.json

// get registered dependency
zoa.injector.get('httpService').get('weapons.json');
```

## Modules

```javascript
var app = zoa.app();

function work(task) {
  return 'Working ' + task + '.';
}

// does not instatiate dependency if set to false
app.injector.register('work', work, false);

app.module('robots', function(work) {
  return {
    doWork: function(task) {
      return = work(task);
    }
  };
});

var robots = app.module('robots');

robots.doWork('dishes'); // Working dishes.
```

Yep, zoa only has three features at the moment.

# Test

```bash
npm test
```

# License

Relesed under the MIT License.
