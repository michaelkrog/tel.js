tel.js - An input[tel] directive for AngularJS.
=================

A filter and a directive for input type 'tel' that formats and parses international phone numbers.
Based on metadata from libphonenumber.

Demo: http://michaelkrog.github.io/tel.js/
 
###Used by###
[Skveege](http://skveege.com)
...and others. 

#FILTER#

###Usage###

####In HTML Template Binding####
```html
{{phonenumber_expression | telephone}}
```

####In Javascript####
```javascript
$filter('telephone')(phonenumber, mode, defaultAreaCode, returnObject);
```

###Arguments###

Param                      | Type      | Details
---------------------------|-----------|----------------------
phonenumber                | string    | Phonenumber to format.
mode (optional)            | string    | 'e164'(international) or 'national' format. Default 'e164'. 
defaultAreaCode (optional) | string    | If specified phonenumbers from this area will be formatted even without an areacode.
returnObject (optional)    | boolean   | If true the result will be an object of the form `{number:<number>,valid:<true|false>}`. If false or not specified the result will be the formatted result of the valid number, otherwise 'unspecified'.

#DIRECTIVE#

###Usage###
Load the tel.js module:
```html
angular.module('<your module>', ['teljs']);
```

Use the directive as follows:
```html
<input type="tel"
    ng-model=""
    [international=""]
    [default-area-code=""]>
```

###Arguments###
Param                      | Type      | Details
---------------------------|-----------|----------------------
ngModel                    | string    | Assignable angular expression to data-bind to.
international (optional)   | string    | Wether number should be formatted as 'e164' or 'national' format. 'true' or 'false'. Default 'true'. 
defaultAreaCode (optional) | string    | If specified phonenumbers from this area will be formatted even without an areacode.


#Install#

You can install tel.js via bower like this:
```
bower install teljs --save
```

Alternatively you can download the full source as a ZIP file from [Github](https://github.com/michaelkrog/tel.js/archive/master.zip).


#FILE FORMAT#
The metadatalite.js file is taken directly from the libphonenumber repository. The format is defined by Google protobuf definitions and is therefore not very human readable. The following is a partial definition of the format - enough to build tel.js around the file.

__It is two Objects__

The whole file consists of 2 objects in the variables `i18n.phonenumbers.metadata.countryCodeToRegionCodeMap` and `i18n.phonenumbers.metadata.countryToMetadata`.

`i18n.phonenumbers.metadata.countryCodeToRegionCodeMap` holds a map of which countries use a given areacode.(fx. +45 is Denmark only, but +1 is a [NANPA](http://www.nanpa.com/) number and is used for USA, Canada and at least 20 other countries. The map refers to an array of countrycodes that uses a given area code having the main country as the first element in the array.

`i18n.phonenumbers.metadata.countryToMetadata` holds metadata for each country. Each metadata entry is retrieved by its countrycode(fx. 'DK'). The metadata entry is an array whici format is partly explained in the following table:

Field | Note
------|-----------
0     | unknown
1     | generalDesc: [unknown, unknown, nationalNumberPattern, possibleNumberPattern]
2     | fixedLine: [unknown, unknown, nationalNumberPattern, possibleNumberPattern]
3     | mobile: [unknown, unknown, nationalNumberPattern, possibleNumberPattern]
4     | tollfree: [unknown, unknown, nationalNumberPattern, possibleNumberPattern]
5     | premiumrat: [unknown, unknown, nationalNumberPattern, possibleNumberPattern]
6     | sharedCost: [unknown, unknown, nationalNumberPattern, possibleNumberPattern]
7     | personalNumber: [unknown, unknown, nationalNumberPattern, possibleNumberPattern]
8     | voip: [unknown, unknown, nationalNumberPattern, possibleNumberPattern]
9     | ISO countrycode (fx. 'DK') 
10    | areacode (fx. 45 for DK, 46 for SE etc.)
11    | internation prefix
12    | national prefix
13    | preferred extension prefix
14    | unknown
15    | national prefix for parsing
16    | national prefix transform rule
17    | preferred international prefix
18    | same mobile and fixed line pattern (boolean)
19    | national number formats. Array with entries of the following format: [unknown, pattarn, format, [leadingdigits...], nationalPrefixFormattingRule, unknown, unknown]
20    | international number formats. Array with entries of the following format: [unknown, pattarn, format, [leadingdigits...]]
21    | pager: [unknown, unknown, nationalNumberPattern, possibleNumberPattern]
22    | main country for code
23    | leading digits
24    | no international dialing: [unknown, unknown, nationalNumberPattern, possibleNumberPattern]
25    | uan: [unknown, unknown, nationalNumberPattern, possibleNumberPattern]
26    | leading zero possible
27    | emergency
28    | voicemail: [unknown, unknown, nationalNumberPattern, possibleNumberPattern]


