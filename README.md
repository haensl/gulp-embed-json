# gulp-embed-json

Gulp plugin to inline/embed JSON data into HTML files.

[![NPM](https://nodei.co/npm/gulp-embed-json.png?downloads=true)](https://nodei.co/npm/gulp-embed-json/)

[![npm version](https://badge.fury.io/js/gulp-embed-json.svg)](http://badge.fury.io/js/gulp-embed-json)
[![Build Status](https://travis-ci.org/haensl/gulp-embed-json.svg?branch=master)](https://travis-ci.org/haensl/gulp-embed-json)

## Installation

```shell
npm i --save-dev gulp-embed-json
```

## Quick Start
```javascript
const embedJSON = require('gulp-embed-json');

gulp.task('embedJSON', () =>
  gulp.src('*.html')
    .pipe(embedJSON())
    .pipe(gulp.dest('dist/')));
```

This gulp task will inline/embed any scripts with JSON source attribute and respective mime type.

## Options

### mimeTypes `string | Array<string>`

Provide custom mime types to specify which `<script>` tags should be embedded.

#### default: `application/json, application/ld+json`

##### Example: Embed only tags with `type="application/ld+json"`

HTML layout
```html
<html>
  <head><!-- ... --></head>
  <body>
    <!-- ... -->
    <script type="application/json" src="data.json"></script>
    <script type="application/ld+json" src="structured-data.json"></script>
    <!-- ... -->
  </body>
</html>
```

Gulp task
```javascript
const embedJSON = requrie('gulp-embed-json');

// ...

gulp.task('embedJSON', () =>
  gulp.src('*.html')
    .pipe(embedJSON({
      mimeTypes: 'application/ld+json'
    }))
    .pipe(gulp.dest('dist/')));
```

Output
```html
<html>
  <head><!-- ... --></head>
  <body>
    <!-- ... -->
    <script type="application/json" src="data.json"></script>
    <script type="application/ld+json"><!-- contents of structured-data.json --></script>
    <!-- ... -->
  </body>
</html>
```

### root `string`

Provide the directory root where JSON files are located.

#### default: `__dirname`

The folder in which the module is executed.

#### Example: Alternative JSON file root

HTML layout
```html
<html>
  <head><!-- ... --></head>
  <body>
    <!-- ... -->
    <script type="application/json" src="data.json"></script>
    <!-- ... -->
  </body>
</html>
```

Folder structure
```shell
/src
  index.html
  gulpfile.js
  /assets
    /json
      data.json
```

Gulp task
```javascript
const embedJSON = requrie('gulp-embed-json');

// ...

gulp.task('embedJSON', () =>
  gulp.src('*.html')
    .pipe(embedJSON({
      root: './assets/json'
    }))
    .pipe(gulp.dest('dist/')));
```

### encoding `string`

Provide the encoding of your JSON files.

#### default: `utf8`

## [Changelog](CHANGELOG.md)

## [License](LICENSE)
