angular-input-tel
=================

A directive for input type 'tel' for formatting and parsing international phone numbers.
Based on a subset of metadata from libphonnumber.

### USAGE ###
```html
<!DOCTYPE html>
<html ng-app="teljs">
    <head>
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular.min.js"></script>
        <script src="tel.js"></script>
        <script src="tel_meta.js"></script>

    </head>
    <body ng-init="number='45'">
        <input type="tel" international="true" ng-model="number">
    </body>
</html>

```

