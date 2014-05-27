var teljs = angular.module('teljs',[]);
teljs.directive('input', function () {
    return {
        restrict: 'E', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        scope: {
            international: '@',
        },
        link: function(scope, element, attrs, ngModel) {
            if (attrs.type !== 'tel') return;
            scope.international = 'true' === scope.international;
            scope.countryCodes = teljs.countryAreaCodes;

            // [<areacode>, <nationalPrefix>, [[<formatPattern>, <leadingDigits<, <format>, <intlFormat>],...]]
            scope.countryMetaData = teljs.meta;

            element.on('blur', function() {
                if(ngModel.$valid) {
                    ngModel.$setViewValue(scope.formatNumber(ngModel.$modelValue));
                    ngModel.$render();
                }
            });

            scope.trimNumber = function(value) {
                if(value) {
                    return value.replace(/[\+\s\-\(\)]/g, '');
                } else {
                    return value;
                }
            };


            scope.doFormatNumber = function(orgNumber) {
                var regions, number, trimNumber;
                angular.forEach(scope.countryCodes, function(value, key) {
                    var reg = new RegExp('^'+key),
                    ok, tmp;

                    tmp = scope.trimNumber(orgNumber);
                    ok = reg.exec(tmp);

                    if(ok) {
                        trimNumber = tmp.substring(key.length);
                        regions = value;
                        return false;
                    }
                });

                angular.forEach(regions, function(region) {
                    var metaData = scope.countryMetaData[region],
                    countryCode = metaData[0],
                    nationalPrefix = metaData[1],
                    numberFormats = metaData[2];

                    angular.forEach(numberFormats, function(entry) {
                        var matchNumber, matchLeadingDigits;

                        matchNumber = new RegExp('^'+entry[0]).exec(trimNumber);

                        if(entry[1] === null) {
                            matchLeadingDigits = true;
                        } else if(angular.isString(entry[1])) {
                            matchLeadingDigits = new RegExp('^'+entry[1]).exec(trimNumber);
                        } else if(angular.isArray(entry[1])) {
                            angular.forEach(entry[1], function(lead) {
                                if(new RegExp('^'+lead).exec(trimNumber)) {
                                    matchLeadingDigits = true;
                                    return false;
                                }
                            });
                        }

                        if(matchNumber && matchLeadingDigits) {
                            var format = scope.international && entry[3] ? entry[3] : entry[2];
                            if(scope.international) {
                                number = trimNumber;
                                if(nationalPrefix && number.substr(0, nationalPrefix.length) === nationalPrefix) {
                                    number = number.substr(nationalPrefix.length);
                                }

                                number = number.replace(new RegExp(entry[0]), format);
                                number = '+' + countryCode + ' ' + number;
                            } else {
                                throw "national formatting not support yet.";
                            }
                            return false;
                        }
                    });
                });

                return number;
            };

            scope.formatNumber = function(value) {
                var result = scope.doFormatNumber(value);
                if(!result) {
                    result = value;
                    ngModel.$setValidity('phoneNumber', false);
                }
                return result;
            };

            scope.parseNumber = function(value) {
                var valid = false, result, formatResult;
                value = value ? scope.trimNumber(value) : value;
                formatResult = scope.doFormatNumber(value);

                if(formatResult === undefined) {
                    result = undefined;
                    valid = false;
                } else {
                    result = value;
                    valid = true;
                }

                ngModel.$setValidity('phoneNumber', valid);
                return result;
            };

            ngModel.$formatters.push(scope.formatNumber);
            ngModel.$parsers.push(scope.parseNumber);

        }
    };
});
