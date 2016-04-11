[![Build Status](https://travis-ci.org/duojs/babel.svg)](https://travis-ci.org/babel/duo-babel)

# @segment/duo-babel

> A temporary babel plugin for duo that supports babel 6 that Segment can use during our transition to webpack.


## Installation

```sh
$ npm install @segment/duo-babel
```


## Usage

From the CLI:

```sh
$ duo --use @segment/duo-babel
```

Using the API:

```js
var Duo = require('duo');
var babel = require('@segment/duo-babel');

Duo(__dirname)
  .entry('index.js')
  .use(babel())
  .run(function (err, results) {
    // ...
  });
```


## API

### babel([options])

Initialize a duo plugin. Available `options`:

 - `extensions` a list of file extensions that should be transpiled (default: `['.js', '.jsx', '.es', '.es6']`)
 - anything else is passed directly to [babel](https://babeljs.io/docs/usage/options/)

### Source Maps

ES6 source-maps are turned on automatically when duo has enabled source-maps.
