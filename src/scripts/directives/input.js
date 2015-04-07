'use strict';

/**
 * @ngdoc directive
 * @name blacktiger-app.directive:roomInfo
 * @description
 * # roomInfo
 */
angular.module('teljs')
        .directive('input', function ($filter) {
            return {
                restrict: 'E', // only activate on element attribute
                require: '?ngModel', // get a hold of NgModelController
                link: function (scope, element, attrs, ngModel) {
                    if (attrs.type !== 'tel') {
                        return;
                    }
                    scope.international = attrs.international;
                    scope.defaultAreaCode = attrs.defaultAreaCode;

                    if (scope.international !== 'false') {
                        scope.mode = 'e164';
                    } else {
                        scope.mode = 'national';
                    }

                    element.on('blur', function () {
                        scope.international = attrs.international;
                        scope.defaultAreaCode = attrs.defaultAreaCode;

                        if (scope.international !== 'false') {
                            scope.mode = 'e164';
                        } else {
                            scope.mode = 'national';
                        }

                        if (ngModel.$valid || true) {
                            ngModel.$setViewValue(scope.formatNumber(ngModel.$modelValue));
                            ngModel.$render();
                        }
                    });

                    scope.doFormatNumber = function (number, mode) {
                        return $filter('telephone')(number, mode, scope.defaultAreaCode, true);
                    };

                    scope.formatNumber = function (value) {
                        var result;

                        if (!angular.isDefined(value) || value === '') {
                            return '';
                        }

                        result = scope.doFormatNumber(value, scope.mode);
                        if (!result.valid) {
                            result.number = value;
                            ngModel.$setValidity('phoneNumber', false);
                        }
                        return result.number;
                    };

                    scope.parseNumber = function (value) {
                        var formatResult;
                        value = value ? teljs.trimNumber(value) : value;
                        formatResult = scope.doFormatNumber(value, 'e164');

                        if (!formatResult.valid && (value === '' || value === undefined)) {
                            formatResult.valid = true;
                            formatResult.number = '';
                        }

                        ngModel.$setValidity('phoneNumber', formatResult.valid);
                        return formatResult.number !== '' ? '+' + teljs.trimNumber(formatResult.number) : '';
                    };

                    ngModel.$formatters = [];
                    ngModel.$parsers = [];

                    ngModel.$formatters.push(scope.formatNumber);
                    ngModel.$parsers.push(scope.parseNumber);

                }
            };
        });
