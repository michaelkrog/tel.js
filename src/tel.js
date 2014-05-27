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
            scope.countryCodes = teljs.countryAreaCodes;/*{
                '1': ['US'],
                '44': ['GB'],
                '45': ['DK'],
                '298': ['FO'],
                '299': ['GL'],
                '354': ['IS'],
                '47': ['NO'],
                '46': ['SE']
            };*/

            // [<areacode>, <nationalPrefix>, [[<formatPattern>, <leadingDigits<, <format>, <intlFormat>],...]]
            scope.countryMetaData = teljs.meta;/*{
                'US': ['1', null, [['(\\d{3})(\\d{4})', null, '$1-$2', null], ['(\\d{3})(\\d{3})(\\d{4})', null, '($1) $2-$3', '$1-$2-$3']]],
                'DK': ['45', null, [['(\\d{2})(\\d{2})(\\d{2})(\\d{2})', null, '$1 $2 $3 $4', null]]],
                'FO': ['298', null, [['(\\d{6})', null, '$1', null]]],
                'SE': ['46', '0',[['(8)(\\d{2,3})(\\d{2,3})(\\d{2})', '8', '$1-$2 $3 $4', '$1 $2 $3 $4'],
                ['([1-69]\\d)(\\d{3})(\\d{2})', '1[13689]|2[136]|3[1356]|4[0246]|54|6[03]|90', '$1-$2 $3', '$1 $2 $3'],
                ['(\\d{3})(\\d{2})(\\d{2})(\\d{2})', '1[2457]|2[2457-9]|3[0247-9]|4[1357-9]|5[0-35-9]|6[124-9]|9(?:[125-8]|3[0-5]|4[0-3])', '$1-$2 $3 $4', '$1 $2 $3 $4'],
                ['(\\d{3})(\\d{2,3})(\\d{2})', '1[2457]|2[2457-9]|3[0247-9]|4[1357-9]|5[0-35-9]|6[124-9]|9(?:[125-8]|3[0-5]|4[0-3])', '$1-$2 $3', '$1 $2 $3'],
                ['(7\\d)(\\d{3})(\\d{2})(\\d{2})', '7', '$1-$2 $3 $4', '$1 $2 $3 $4'],
                ['(77)(\\d{2})(\\d{2})', '7', '$1-$2$3', '$1 $2 $3'],
                ['(20)(\\d{2,3})(\\d{2})', '20', '$1-$2 $3', '$1 $2 $3'],
                ['(9[034]\\d)(\\d{2})(\\d{2})(\\d{3})', '9[034]', '$1-$2 $3 $4', '$1 $2 $3 $4'],
                ['(9[034]\\d)(\\d{4})', '9[034]', '$1-$2', '$1 $2']]],
                'NO': ['47', null, [['([489]\\d{2})(\\d{2})(\\d{3})', '[489]', '$1 $2 $3', null], ['([235-7]\\d)(\\d{2})(\\d{2})(\\d{2})', '[235-7]', '$1 $2 $3 $4', null]]],
                'IS': ['354', null, [['(\\d{3})(\\d{4})', '[4-9]', '$1 $2', null], ['(3\\d{2})(\\d{3})(\\d{3})', '3', '$1 $2 $3']]],
                'GB': ['44', null, [['(\\d{2})(\\d{4})(\\d{4})', ['2|5[56]|7(?:0|6[013-9])', '2|5[56]|7(?:0|6(?:[013-9]|2[0-35-9]))'], '$1 $2 $3', null],
                ['(\\d{3})(\\d{3})(\\d{4})', '1(?:1|\\d1)|3|9[018]', '$1 $2 $3', null],
                ['(\\d{5})(\\d{4,5})', ['1(?:38|5[23]|69|76|94)', '1(?:387|5(?:24|39)|697|768|946)', '1(?:3873|5(?:242|39[456])|697[347]|768[347]|9467)'], '$1 $2', null],
                ['(1\\d{3})(\\d{5,6})', '1', '$1 $2', null],
                ['(7\\d{3})(\\d{6})', ['7(?:[1-5789]|62)', '7(?:[1-5789]|624)'] , '$1 $2', null],
                ['(800)(\\d{4})', ['800', '8001', '80011', '800111', '8001111'], '$1 $2 $3', null],
                ['(845)(46)(4\\d)', ['845', '8454', '84546', '845464'], '$1 $2 $3', null],
                ['(8\\d{2})(\\d{3})(\\d{4})', '8(?:4[2-5]|7[0-3])', '$1 $2 $3', null],
                ['(80\\d)(\\d{3})(\\d{4})', '80', '$1 $2 $3', null],
                ['([58]00)(\\d{6})', '[58]00', '$1 $2', null]]],
                'GL': ['299', null, [['(\\d{2})(\\d{2})(\\d{2})', null, '$1 $2 $3', null]]]
            };*/

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

            //scope.parseNumber(scope.$modelValue);
        }
    };
});
