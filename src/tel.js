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

var teljs = angular.module('teljs',[]);
teljs.trimNumber = function(value) {
    if(value) {
        return value.replace(/[\+\s\-\(\)]/g, '');
    } else {
        return value;
    }
};

teljs.filter('telephone', function() {
    
    var countryCodes = i18n.phonenumbers.metadata.countryCodeToRegionCodeMap;//teljs.countryAreaCodes;
            
    // [<areacode>, <nationalPrefix>, [[<formatPattern>, <leadingDigits<, <format>, <intlFormat>],...]]
    /*
    * [<0:PhoneMetadata>,
    *     [<unknown>,<unknown>,<nationalNumberPattern>,<possibleNumberPattern>], (1:generalDesc)
    *     [<unknown>,<unknown>,<nationalNumberPattern>,<possibleNumberPattern>], (2:fixedLine)
    *     [<unknown>,<unknown>,<nationalNumberPattern>,<possibleNumberPattern>], (3:mobile)
    *     [<unknown>,<unknown>,<nationalNumberPattern>,<possibleNumberPattern>], (4:tollfree)
    *     [<unknown>,<unknown>,<nationalNumberPattern>,<possibleNumberPattern>], (5:premiumrate)
    *     [,,"NA","NA"], (6:shared_cost)
    *     [,,"NA","NA"], (7:personal_number)
    *     [,,"NA","NA"], (8:voip)
    *     <9:id>,<10:countryCode>,<11:internationalPrefix>,<12:national_prefix>,<13:preferred_extn_prefix>,
    *     <14:unknown>,<15:national_prefix_for_parsing>,<16:national_prefix_transform_rule>,
    *     <17:preferred_international_prefix>,<18:same_mobile_and_fixed_line_pattern>,
    *     [ (19:numberformat)
    *         [<unknown>,<pattern>,<format>,[<leadingdigits>],<nationalPrefixFormattingRule>,"",0]  (numberformat)
    *     ],
    *     [ (20:internation numberformat)
    *         [<unknown>,<pattern>,<format>,[<leadingdigits>]]  (numberformat)
    *     ],
    *     [<unknown>,<unknown>,"NA","NA"], (21:pager)
    *     <22:main_country_for_code>,<23:leading_digits>,
    *     [<unknown>,<unknown>,"NA","NA"], (24:no_international_dialling)
    *     [<unknown>,<unknown>,"NA","NA"], (25:uan)
    *     <26:leading_zero_possible>,<27:emergency>,
    *     [<unknown>,<unknown>,"NA","NA"] (28:voicemail)
    * ]
    */
    var countryMetaData = i18n.phonenumbers.metadata.countryToMetadata; //teljs.meta;
    
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
            entry, i, matchNumber, matchLeadingDigits, validRange = false;

        if(numberFormats) {
            
            if(nationalPrefix && nationalNumber.substr(0, nationalPrefix.length) === nationalPrefix) {
                nationalNumber = nationalNumber.substr(nationalPrefix.length);
            }
            
            angular.forEach([1,2,3,4,5,6,7,8,21,24,25,28], function(validRangeFormatIndex) {
                entry = metaData[validRangeFormatIndex];
                if(new RegExp('^('+entry[2]+')$').exec(nationalNumber)) {
                    validRange = true;
                }
            });
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
                    countryCode = countryMetaData[region][10];
                    nationalPrefix = countryMetaData[region][12];
                    nationalNumber = defaultGeneratedNumber.substr(countryCode.toString().length);
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
                countryCode = countryMetaData[region][10];
                nationalPrefix = countryMetaData[region][12];
                nationalNumber = trimmedNumber.substr(countryCode.toString().length);
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
