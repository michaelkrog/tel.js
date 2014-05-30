/*global angular */
var teljs = angular.module('teljs',[]);
teljs.trimNumber = function(value) {
    if(value) {
        return value.replace(/[\+\s\-\(\)]/g, '');
    } else {
        return value;
    }
};

teljs.filter('telephone', function() {
    
    var countryCodes = teljs.countryAreaCodes;
            
    // [<areacode>, <nationalPrefix>, [[<formatPattern>, <leadingDigits<, <format>, <intlFormat>],...]]
    var countryMetaData = teljs.meta;
    
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
            countryCode = metaData[0],
            nationalPrefix = metaData[1],
            numberFormats = metaData[2],
            number, international = (mode === 'e164'),
            entry, i, matchNumber, matchLeadingDigits;

        if(nationalPrefix && nationalNumber.substr(0, nationalPrefix.length) === nationalPrefix) {
            nationalNumber = nationalNumber.substr(nationalPrefix.length);
        }
        
        for(i = 0;i<numberFormats.length;i++) {
            entry = numberFormats[i];
            matchNumber = new RegExp('^'+entry[0]+'$').exec(nationalNumber);

            if(entry[1] === null) {
                matchLeadingDigits = true;
            } else if(angular.isString(entry[1])) {
                matchLeadingDigits = new RegExp('^'+entry[1]).exec(nationalNumber);
            } else if(angular.isArray(entry[1])) {
                angular.forEach(entry[1], function(lead) {
                    if(new RegExp('^'+lead).exec(nationalNumber)) {
                        matchLeadingDigits = true;
                    }
                });
            }

            if(matchNumber && matchLeadingDigits) {
                var format = international && entry[3] ? entry[3] : entry[2];
                if(international) {
                    number = nationalNumber;
                    number = number.replace(new RegExp(entry[0]), format);
                    number = '+' + countryCode + ' ' + number;
                } else {
                    number = nationalNumber;
                    if(nationalPrefix) {
                        number = nationalPrefix + '' + number;
                    }
                    number = number.replace(new RegExp(entry[0]), format);
                }
                break;
            }
        }
        return number;
    };

    
    return function(input, mode, defaultAreaCode) {
        
        var regions, trimmedNumber, defaultGeneratedNumber, number, nationalNumber, i, countryCode, region, nationalPrefix;
        mode = mode ? mode : 'e164';
        trimmedNumber = teljs.trimNumber(input);
        if(defaultAreaCode && defaultAreaCode !== '') {
            defaultGeneratedNumber = defaultAreaCode + '' + trimmedNumber;
            regions = regionsFromNumber(defaultGeneratedNumber);

            if(regions) {
                for(i=0;i<regions.length;i++) {
                    region = regions[i];
                    countryCode = countryMetaData[region][0];
                    nationalPrefix = countryMetaData[region][1];
                    nationalNumber = defaultGeneratedNumber.substr(countryCode.length);
                    if(nationalPrefix && nationalNumber.substr(0, nationalPrefix.length) !== nationalPrefix) {
                        nationalNumber = nationalPrefix + '' + nationalNumber;
                    }
                    number = formatNumberForRegion(region, nationalNumber, mode);
                    if(number) break;
                }
            }
            if(number) return number;
        }   
        
        regions = regionsFromNumber(trimmedNumber);

        if(regions) {
            for(i=0;i<regions.length;i++) {
                region = regions[i];
                countryCode = countryMetaData[region][0];
                nationalPrefix = countryMetaData[region][1];
                nationalNumber = trimmedNumber.substr(countryCode.length);
                if(nationalPrefix && nationalNumber.substr(0, nationalPrefix.length) !== nationalPrefix) {
                    nationalNumber = nationalPrefix + '' + nationalNumber;
                }
                number = formatNumberForRegion(region, nationalNumber, mode);
                if(number) break;
            }
        }

        
        
        return number;


    };
});

teljs.directive('input', function ($filter) {
    return {
        restrict: 'E', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        scope: {
            international: '@',
            defaultAreaCode: '@'
        },
        link: function(scope, element, attrs, ngModel) {
            if (attrs.type !== 'tel') return;
            
            if(scope.international === 'true') {
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
                return $filter('telephone')(number, scope.mode, scope.defaultAreaCode);
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
                value = value ? teljs.trimNumber(value) : value;
                formatResult = scope.doFormatNumber(value);

                if(formatResult === undefined) {
                    result = undefined;
                    valid = false;
                } else {
                    result = teljs.trimNumber(formatResult);
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
});
