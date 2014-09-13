tel.js - An input[tel] directive for AngularJS.
=================

A filter and a directive for input type 'tel' that formats and parses international phone numbers.
Based on a subset of metadata from libphonenumber.

Demo: http://michaelkrog.github.io/tel.js/

### USAGE ###

__FILTER__
```javascript
var formattedNumber = $filter('telephone')('4512341234');
```
Result: +45 12 34 12 34

__DIRECTIVE__

```html
<!DOCTYPE html>
<html ng-app="teljs">
    <head>
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular.min.js"></script>
        <script src="tel.js"></script>
        <script src="tel_meta.js"></script>

    </head>
    <body ng-init="number='4512341234'">
        <input type="tel" ng-model="number">
    </body>
</html>
```
