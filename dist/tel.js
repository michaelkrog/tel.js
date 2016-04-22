/*global angular */
/*jslint browser: true */
/* Fallback if google protocols is not defined - START*/
/* jshint ignore:start */
if (window.goog === undefined) {
    goog = {
        provide: angular.noop
    };

    i18n = {
        phonenumbers: {
            metadata: {
            }
        }
    };
}
/* jshint ignore:end */
/* Fallback if google protocols is not defined - END*/

var teljs = angular.module('teljs',[]);
teljs.trimNumber = function(value) {
    'use strict';
    if (angular.isString(value)) {
        return value.replace(/[\+\s\-\(\)]/g, '');
    } else {
        return value;
    }
};


'use strict';

/**
 * @ngdoc directive
 * @name blacktiger-app.directive:roomInfo
 * @description
 * # roomInfo
 */
angular.module('teljs')
        .directive('input', ["$filter", function ($filter) {
            return {
                restrict: 'E', // only activate on element attribute
                require: '?ngModel', // get a hold of NgModelController
                link: function (scope, element, attrs, ngModel) {
                    if (attrs.type !== 'tel') {
                        return;
                    }
                    
                    scope.initializeProperties = function() {
                        scope.international = attrs.international;
                        scope.defaultAreaCode = attrs.defaultAreaCode;

                        if (scope.international !== 'false') {
                            scope.mode = 'e164';
                        } else {
                            scope.mode = 'national';
                        }
                    };

                    element.on('focus', scope.initializeProperties);
                    element.on('blur', function () {
                        if (ngModel.$valid) {
                            ngModel.$setViewValue(scope.formatNumber(ngModel.$modelValue));
                            ngModel.$render();
                        }
                    });

                    scope.doFormatNumber = function (number, mode) {
                        return $filter('telephone')(number, mode, scope.defaultAreaCode, true);
                    };

                    scope.formatNumber = function (value) {
                        var result;
                        if (!angular.isDefined(value) || value === null || value === '') {
                            return '';
                        }

                        result = scope.doFormatNumber(value, scope.mode);
                        if (!result.valid) {
                            result.number = value;
                            ngModel.$setValidity('phoneNumber', false);
                        } else {
                            var trimmedResult = '+' + teljs.trimNumber(scope.doFormatNumber(value, 'e164').number);
                            if(trimmedResult !== value) {
                                ngModel.$$rawModelValue = trimmedResult;
                                scope.$evalAsync(function() {
                                    ngModel.$$parseAndValidate();
                                });
                            }
                        }
                        
                        
                        return result.number;
                    };

                    scope.parseNumber = function (value) {
                        var formatResult, returnVal;
                        value = value ? teljs.trimNumber(value) : value;
                        formatResult = scope.doFormatNumber(value, 'e164');

                        if (!formatResult.valid && (value === '' || value === undefined)) {
                            formatResult.valid = true;
                            formatResult.number = '';
                        }

                        ngModel.$setValidity('phoneNumber', formatResult.valid);
                        returnVal = formatResult.number !== '' ? '+' + teljs.trimNumber(formatResult.number) : '';
                        return returnVal;
                    };

                    ngModel.$formatters = [];
                    ngModel.$parsers = [];

                    ngModel.$formatters.push(scope.formatNumber);
                    ngModel.$parsers.push(scope.parseNumber);
                    
                    scope.initializeProperties();

                }
            };
        }]);

'use strict';

/**
 * @ngdoc filter
 * @name blacktiger-app.filter:timespan
 * @function
 * @description
 * # timespan
 * Converts milliseconds to a timespan visualized as hours as minutes(HH:mm).
 */
angular.module('teljs')
        .filter('telephone', function () {

            var countryCodes = i18n.phonenumbers.metadata.countryCodeToRegionCodeMap;
            var countryMetaData = i18n.phonenumbers.metadata.countryToMetadata;
            var validRangeMap = {
                2: 'fixedLine',
                3: 'mobile',
                4: 'tollFree',
                5: 'premiumRate',
                6: 'sharedCost',
                7: 'personalNumber',
                8: 'voip',
                21: 'pager',
                24: 'noInternationalDialing',
                25: 'uan',
                28: 'voiceMail'
            };

            var regionsFromNumber = function (e164) {
                var regions, key, value;
                for (key in countryCodes) {
                    value = countryCodes[key];
                    var reg = new RegExp('^' + key),
                            ok;

                    ok = reg.exec(e164);

                    if (ok) {
                        regions = value;
                        break;
                    }
                }

                return regions;
            };

            var formatNumberForRegion = function (region, nationalNumber, mode, mainRegion) {
                var metaData = countryMetaData[region],
                        metaDataMain = countryMetaData[mainRegion],
                        countryCode = metaData[10],
                        nationalPrefix = metaData[12],
                        nationalFormats = metaDataMain[19],
                        internationalFormats = metaDataMain[20],
                        number, international = (mode === 'e164'),
                        numberFormats = international && internationalFormats ? internationalFormats : nationalFormats,
                        entry, i, matchNumber, matchLeadingDigits, validRange = false, range;

                if (numberFormats) {

                    if (nationalPrefix && nationalNumber.substr(0, nationalPrefix.length) === nationalPrefix) {
                        nationalNumber = nationalNumber.substr(nationalPrefix.length);
                    }

                    for (var key in validRangeMap) {
                        entry = metaData[key];
                        if (new RegExp('^(' + entry[2] + ')$').exec(nationalNumber)) {
                            validRange = true;
                            range = validRangeMap[key];
                            break;
                        }
                    }

                    if (validRange) {
                        for (i = 0; i < numberFormats.length; i++) {
                            entry = numberFormats[i];
                            matchNumber = new RegExp('^(' + entry[1] + ')$').exec(nationalNumber);

                            if (!angular.isDefined(entry[3])) {
                                matchLeadingDigits = true;
                            } else if (angular.isString(entry[3])) {
                                matchLeadingDigits = new RegExp('^(' + entry[3] + ')').exec(nationalNumber);
                            } else if (angular.isArray(entry[3])) {
                                angular.forEach(entry[3], function (lead) {
                                    var result = new RegExp('^(' + lead + ')').exec(nationalNumber);
                                    if (result) {
                                        matchLeadingDigits = true;
                                    }
                                });
                            }

                            if (matchNumber && matchLeadingDigits) {
                                var format = entry[2];
                                if (international) {
                                    number = nationalNumber;
                                    number = number.replace(new RegExp(entry[1]), format);
                                    number = '+' + countryCode + ' ' + number;
                                } else {
                                    number = nationalNumber;
                                    if (nationalPrefix) {
                                        number = nationalPrefix + '' + number;
                                    }
                                    number = number.replace(new RegExp(entry[1]), format);
                                }
                                break;
                            }
                        }
                    }
                }
                return number;
            };

            var formatNumber = function (number, mode) {
                var regions = regionsFromNumber(number), region, i, countryCode, nationalPrefix, nationalNumber, result, mainRegion;

                if (angular.isNumber(number)) {
                  number = number.toString();
                }

                if (regions && regions.length > 0) {
                    mainRegion = regions[0];

                    for (i = 0; i < regions.length; i++) {
                        region = regions[i];
                        if (countryMetaData[region]) {
                            countryCode = countryMetaData[region][10];
                            nationalPrefix = countryMetaData[region][12];
                            nationalNumber = number.substr(countryCode.toString().length);
                            if (nationalPrefix && nationalNumber.substr(0, nationalPrefix.length) !== nationalPrefix) {
                                nationalNumber = nationalPrefix + '' + nationalNumber;
                            }
                            result = formatNumberForRegion(region, nationalNumber, mode, mainRegion);
                            if (result) {
                                break;
                            }
                        }
                    }
                }
                return result;
            };

            var wrapResult = function (input, number, returnObject) {
                var result;

                if (returnObject === true) {
                    if (!number) {
                        result = {
                            number: input,
                            valid: false
                        };
                    } else {
                        result = {
                            number: number,
                            valid: true
                        };
                    }
                } else {
                    if (!number) {
                        result = input;
                    } else {
                        result = number;
                    }
                }
                return result;
            };

            return function (input, mode, defaultAreaCode, returnObject) {

                var trimmedNumber, defaultGeneratedNumber, number;
                mode = mode ? mode : 'e164';
                trimmedNumber = teljs.trimNumber(input);
                if (defaultAreaCode && defaultAreaCode !== '') {
                    defaultGeneratedNumber = defaultAreaCode + '' + trimmedNumber;
                    number = formatNumber(defaultGeneratedNumber, mode);
                    if (number) {
                        return wrapResult(input, number, returnObject);
                    }
                }

                number = formatNumber(trimmedNumber, mode);
                return wrapResult(input, number, returnObject);
            };
        });
