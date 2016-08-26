/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../typings/main.d.ts" />
	var index_config_1 = __webpack_require__(1);
	var index_run_1 = __webpack_require__(2);
	var telephone_directive_1 = __webpack_require__(3);
	var telephone_filter_1 = __webpack_require__(4);
	if (window.goog === undefined) {
	    goog = {
	        provide: angular.noop
	    };
	    i18n = {
	        phonenumbers: {
	            metadata: {}
	        }
	    };
	}
	var teljs;
	(function (teljs) {
	    'use strict';
	    angular.module('teljs', [])
	        .config(index_config_1.config)
	        .run(index_run_1.runBlock)
	        .directive('input', telephone_directive_1.telephoneDirective)
	        .filter('telephone', telephone_filter_1.telephoneFilter);
	})(teljs || (teljs = {}));


/***/ },
/* 1 */
/***/ function(module, exports) {

	/** @ngInject */
	config.$inject = ["$logProvider"];
	function config($logProvider) {
	    // enable log
	    $logProvider.debugEnabled(true);
	}
	exports.config = config;


/***/ },
/* 2 */
/***/ function(module, exports) {

	/** @ngInject */
	runBlock.$inject = ["$log"];
	function runBlock($log) {
	    $log.debug('runBlock end');
	}
	exports.runBlock = runBlock;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	telephoneDirective.$inject = ["$filter"];var telephone_filter_1 = __webpack_require__(4);
	/** @ngInject */
	function telephoneDirective($filter) {
	    return {
	        restrict: 'E',
	        require: '?ngModel',
	        link: function (scope, element, attrs, ngModel) {
	            var ctrl = new TelephoneController(scope, element, attrs, ngModel, $filter);
	            ctrl.init();
	        }
	    };
	}
	exports.telephoneDirective = telephoneDirective;
	var TelephoneController = (function () {
	    function TelephoneController(scope, element, attrs, ngModel, filterService) {
	        this.scope = scope;
	        this.element = element;
	        this.attrs = attrs;
	        this.ngModel = ngModel;
	        this.filterService = filterService;
	    }
	    TelephoneController.prototype.initializeProperties = function () {
	        this.international = !angular.isDefined(this.attrs.international) || this.attrs.international === 'true';
	        this.defaultAreaCode = this.attrs.defaultAreaCode;
	        if (this.international) {
	            this.mode = telephone_filter_1.Mode.E164;
	        }
	        else {
	            this.mode = telephone_filter_1.Mode.National;
	        }
	    };
	    TelephoneController.prototype.doFormatNumber = function (number, mode) {
	        return this.filterService('telephone')(number, mode, this.defaultAreaCode, true);
	    };
	    TelephoneController.prototype.formatNumber = function (value) {
	        var _this = this;
	        var result;
	        if (!angular.isDefined(value) || value === null || value === '') {
	            return '';
	        }
	        result = this.doFormatNumber(value, this.mode);
	        if (!result.valid) {
	            result.number = value;
	            this.ngModel.$setValidity('phoneNumber', false);
	        }
	        else {
	            var trimmedResult = '+' + telephone_filter_1.Util.trimNumber(this.doFormatNumber(value, telephone_filter_1.Mode.E164).number);
	            if (trimmedResult !== value) {
	                this.ngModel.$$rawModelValue = trimmedResult;
	                this.scope.$evalAsync(function () {
	                    _this.ngModel.$$parseAndValidate();
	                });
	            }
	        }
	        return result.number;
	    };
	    TelephoneController.prototype.parseNumber = function (value) {
	        var formatResult, returnVal;
	        value = value ? telephone_filter_1.Util.trimNumber(value) : value;
	        formatResult = this.doFormatNumber(value, telephone_filter_1.Mode.E164);
	        if (!formatResult.valid && (value === '' || value === undefined)) {
	            formatResult.valid = true;
	            formatResult.number = '';
	        }
	        this.ngModel.$setValidity('phoneNumber', formatResult.valid);
	        returnVal = formatResult.number !== '' ? '+' + telephone_filter_1.Util.trimNumber(formatResult.number) : '';
	        return returnVal;
	    };
	    TelephoneController.prototype.init = function () {
	        var _this = this;
	        if (this.attrs.type !== 'tel') {
	            return;
	        }
	        this.element.on('focus', function () { return _this.initializeProperties(); });
	        this.element.on('blur', function () {
	            if (_this.ngModel.$valid) {
	                _this.ngModel.$setViewValue(_this.formatNumber(_this.ngModel.$modelValue));
	                _this.ngModel.$render();
	            }
	        });
	        this.ngModel.$formatters = [];
	        this.ngModel.$parsers = [];
	        this.ngModel.$formatters.push(function (value) {
	            return _this.formatNumber(value);
	        });
	        this.ngModel.$parsers.push(function (value) {
	            return _this.parseNumber(value);
	        });
	        this.initializeProperties();
	    };
	    return TelephoneController;
	})();


/***/ },
/* 4 */
/***/ function(module, exports) {

	(function (Mode) {
	    Mode[Mode["E164"] = 0] = "E164";
	    Mode[Mode["National"] = 1] = "National";
	})(exports.Mode || (exports.Mode = {}));
	var Mode = exports.Mode;
	var Util = (function () {
	    function Util() {
	    }
	    Util.trimNumber = function (value) {
	        if (angular.isString(value)) {
	            return value.replace(/[\+\s\-\(\)]/g, '');
	        }
	        else {
	            return value;
	        }
	    };
	    return Util;
	})();
	exports.Util = Util;
	function telephoneFilter() {
	    return function (input, mode, defaultAreaCode, returnObject) {
	        var trimmedNumber, defaultGeneratedNumber, number;
	        var filter = new TelephoneFilter();
	        mode = mode ? mode : 'e164';
	        trimmedNumber = Util.trimNumber(input);
	        number = filter.formatNumber(trimmedNumber, mode);
	        if (number) {
	            return filter.wrapResult(input, number, returnObject);
	        }
	        if (defaultAreaCode && defaultAreaCode !== '') {
	            defaultGeneratedNumber = defaultAreaCode + '' + trimmedNumber;
	            number = filter.formatNumber(defaultGeneratedNumber, mode);
	            if (number) {
	                return filter.wrapResult(input, number, returnObject);
	            }
	        }
	        return filter.wrapResult(input, number, returnObject);
	    };
	}
	exports.telephoneFilter = telephoneFilter;
	var TelephoneFilter = (function () {
	    function TelephoneFilter() {
	        this.countryCodes = i18n.phonenumbers.metadata.countryCodeToRegionCodeMap;
	        this.countryMetaData = i18n.phonenumbers.metadata.countryToMetadata;
	        this.validRangeMap = {
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
	    }
	    TelephoneFilter.prototype.regionsFromNumber = function (e164) {
	        var regions, key, value;
	        for (key in this.countryCodes) {
	            value = this.countryCodes[key];
	            var reg = new RegExp('^' + key), ok;
	            ok = reg.exec(e164);
	            if (ok) {
	                regions = value;
	                break;
	            }
	        }
	        return regions;
	    };
	    TelephoneFilter.prototype.formatNumberForRegion = function (region, nationalNumber, mode, mainRegion) {
	        var metaData = this.countryMetaData[region], metaDataMain = this.countryMetaData[mainRegion], countryCode = metaData[10], nationalPrefix = metaData[12], nationalFormats = metaDataMain[19], internationalFormats = metaDataMain[20], number, international = (mode === Mode.E164), numberFormats = international && internationalFormats ? internationalFormats : nationalFormats, entry, i, matchNumber, matchLeadingDigits, validRange = false, range;
	        if (numberFormats) {
	            if (nationalPrefix && nationalNumber.substr(0, nationalPrefix.length) === nationalPrefix) {
	                nationalNumber = nationalNumber.substr(nationalPrefix.length);
	            }
	            for (var key in this.validRangeMap) {
	                entry = metaData[key];
	                if (new RegExp('^(' + entry[2] + ')$').exec(nationalNumber)) {
	                    validRange = true;
	                    range = this.validRangeMap[key];
	                    break;
	                }
	            }
	            if (validRange) {
	                for (i = 0; i < numberFormats.length; i++) {
	                    entry = numberFormats[i];
	                    matchNumber = new RegExp('^(' + entry[1] + ')$').exec(nationalNumber);
	                    if (!angular.isDefined(entry[3])) {
	                        matchLeadingDigits = true;
	                    }
	                    else if (angular.isString(entry[3])) {
	                        matchLeadingDigits = new RegExp('^(' + entry[3] + ')').exec(nationalNumber);
	                    }
	                    else if (angular.isArray(entry[3])) {
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
	                        }
	                        else {
	                            number = nationalNumber;
	                            number = number.replace(new RegExp(entry[1]), format);
	                            if (nationalPrefix) {
	                                number = nationalPrefix + '' + number;
	                            }
	                        }
	                        break;
	                    }
	                }
	            }
	        }
	        return number;
	    };
	    TelephoneFilter.prototype.formatNumber = function (number, mode) {
	        var regions = this.regionsFromNumber(number), region, i, countryCode, nationalPrefix, nationalNumber, result, mainRegion;
	        var finalMode;
	        if (typeof mode === 'string') {
	            finalMode = mode === 'e164' ? Mode.E164 : Mode.National;
	        }
	        else {
	            finalMode = mode;
	        }
	        if (angular.isNumber(number)) {
	            number = number.toString();
	        }
	        if (regions && regions.length > 0) {
	            mainRegion = regions[0];
	            for (i = 0; i < regions.length; i++) {
	                region = regions[i];
	                if (this.countryMetaData[region]) {
	                    countryCode = this.countryMetaData[region][10];
	                    nationalPrefix = this.countryMetaData[region][12];
	                    nationalNumber = number.substr(countryCode.toString().length);
	                    if (nationalPrefix && nationalNumber.substr(0, nationalPrefix.length) !== nationalPrefix) {
	                        nationalNumber = nationalPrefix + '' + nationalNumber;
	                    }
	                    result = this.formatNumberForRegion(region, nationalNumber, finalMode, mainRegion);
	                    if (result) {
	                        break;
	                    }
	                }
	            }
	        }
	        return result;
	    };
	    ;
	    TelephoneFilter.prototype.wrapResult = function (input, number, returnObject) {
	        var result;
	        if (returnObject) {
	            if (!number) {
	                result = {
	                    number: input,
	                    valid: false
	                };
	            }
	            else {
	                result = {
	                    number: number,
	                    valid: true
	                };
	            }
	        }
	        else {
	            if (!number) {
	                result = input;
	            }
	            else {
	                result = number;
	            }
	        }
	        return result;
	    };
	    ;
	    return TelephoneFilter;
	})();


/***/ }
/******/ ]);