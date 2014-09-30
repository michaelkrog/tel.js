/*global angular, goog, i18n */
/*jslint browser: true */
/* Fallback if google protocols is not defined - START*/
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
/* Fallback if google protocols is not defined - END*/

function telephoneFilter() {
    
    var countryCodes = i18n.phonenumbers.metadata.countryCodeToRegionCodeMap;
    var countryMetaData = i18n.phonenumbers.metadata.countryToMetadata;
    var validRangeMap = {
        2: "fixedLine",
        3: "mobile",
        4: "tollFree",
        5: "premiumRate",
        6: "sharedCost",
        7: "personalNumber",
        8: "voip",
        21: "pager",
        24: "noInternationalDialing",
        25: "uan",
        28: "voiceMail"
    };
    
    var regionsFromNumber = function(e164) {
        var regions, key, value;
        for(key in countryCodes) {
            value = countryCodes[key];
            var reg = new RegExp('^'+key),
            ok;

            ok = reg.exec(e164);

            if(ok) {
                regions = value;
                break;
            }
        }

        return regions;
    };

    var formatNumberForRegion = function(region, nationalNumber, mode) {
        var metaData = countryMetaData[region],
            countryCode = metaData[10],
            nationalPrefix = metaData[12],
            nationalFormats = metaData[19],
            internationalFormats = metaData[20],
            number, international = (mode === 'e164'),
            numberFormats = international && internationalFormats ? internationalFormats : nationalFormats,
            entry, i, matchNumber, matchLeadingDigits, validRange = false, range;

        if(numberFormats) {
            
            if(nationalPrefix && nationalNumber.substr(0, nationalPrefix.length) === nationalPrefix) {
                nationalNumber = nationalNumber.substr(nationalPrefix.length);
            }
            
            for (var key in validRangeMap) {
                entry = metaData[key];
                if(new RegExp('^('+entry[2]+')$').exec(nationalNumber)) {
                    validRange = true;
                    range = validRangeMap[key];
                    break;
                }
            }

            if(validRange) {
                for(i = 0;i<numberFormats.length;i++) {
                    entry = numberFormats[i];
                    matchNumber = new RegExp('^('+entry[1]+')$').exec(nationalNumber);

                    if(!angular.isDefined(entry[3])) {
                        matchLeadingDigits = true;
                    } else if(angular.isString(entry[3])) {
                        matchLeadingDigits = new RegExp('^('+entry[3]+')').exec(nationalNumber);
                    } else if(angular.isArray(entry[3])) {
                        angular.forEach(entry[3], function(lead) {
                            var result = new RegExp('^('+lead+')').exec(nationalNumber);
                            if(result) {
                                matchLeadingDigits = true;
                            }
                        });
                    }

                    if(matchNumber && matchLeadingDigits) {
                        var format = entry[2];
                        if(international) {
                            number = nationalNumber;
                            number = number.replace(new RegExp(entry[1]), format);
                            number = '+' + countryCode + ' ' + number;
                        } else {
                            number = nationalNumber;
                            if(nationalPrefix) {
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
    
    var formatNumber = function(number, mode) {
        var regions = regionsFromNumber(number), region, i, countryCode, nationalPrefix, nationalNumber, result;

        if(regions) {
            for(i=0;i<regions.length;i++) {
                region = regions[i];
                countryCode = countryMetaData[region][10];
                nationalPrefix = countryMetaData[region][12];
                nationalNumber = number.substr(countryCode.toString().length);
                if(nationalPrefix && nationalNumber.substr(0, nationalPrefix.length) !== nationalPrefix) {
                    nationalNumber = nationalPrefix + '' + nationalNumber;
                }
                result = formatNumberForRegion(region, nationalNumber, mode);
                if(result) break;
            }
        }
        return result;
    };

    var wrapResult = function(input, number, returnObject) {
        var result;
        
        if(returnObject === true) {
            if(!number) {
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
            if(!number) {
                result = input;
            } else {
                result = number;
            }
        }
        return result;
    };
    
    return function(input, mode, defaultAreaCode, returnObject) {
        
        var trimmedNumber, defaultGeneratedNumber, number;
        mode = mode ? mode : 'e164';
        trimmedNumber = teljs.trimNumber(input);
        if(defaultAreaCode && defaultAreaCode !== '') {
            defaultGeneratedNumber = defaultAreaCode + '' + trimmedNumber;
            number = formatNumber(defaultGeneratedNumber, mode);
            if(number) return wrapResult(input, number, returnObject);
        }   
        
        number = formatNumber(trimmedNumber, mode);
        return wrapResult(input, number, returnObject);


    };
}

function telephoneDirective($filter) {
    return {
        restrict: 'E', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        scope: {
            international: '@',
            defaultAreaCode: '@'
        },
        link: function(scope, element, attrs, ngModel) {
            if (attrs.type !== 'tel') return;
            
            if(scope.international !== 'false') {
                scope.mode = 'e164';
            } else {
                scope.mode = 'national';
            }
            
            element.on('blur', function() {
                if(ngModel.$valid) {
                    ngModel.$setViewValue(scope.formatNumber(ngModel.$modelValue));
                    ngModel.$render();
                }
            });

            scope.doFormatNumber = function(number) {
                return $filter('telephone')(number, scope.mode, scope.defaultAreaCode, true);
            };
            
            scope.formatNumber = function(value) {
                var result = scope.doFormatNumber(value);
                if(!result.valid) {
                    result = value;
                    ngModel.$setValidity('phoneNumber', false);
                }
                return result.number;
            };

            scope.parseNumber = function(value) {
                var valid = false, result, formatResult;
                value = value ? teljs.trimNumber(value) : value;
                formatResult = scope.doFormatNumber(value);

                if(!formatResult.valid) {
                    result = undefined;
                    valid = false;
                
                } else {
                    result = teljs.trimNumber(formatResult.number);
                    valid = true;
                }

                ngModel.$setValidity('phoneNumber', valid);
                
                if(result) {
                    return scope.mode === 'e164' ? '+' + result : result;
                } else {
                    return undefined;
                }
            };

            ngModel.$formatters.push(scope.formatNumber);
            ngModel.$parsers.push(scope.parseNumber);

        }
    };
}
telephoneDirective.$inject = ['$filter'];


/********** BOOTSTRAP ************/
var teljs = angular.module('teljs',[]);
teljs.trimNumber = function(value) {
    if(value) {
        return value.replace(/[\+\s\-\(\)]/g, '');
    } else {
        return value;
    }
};

teljs.filter('telephone', telephoneFilter);
teljs.directive('input', telephoneDirective);
