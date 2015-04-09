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
    if (value) {
        return value.replace(/[\+\s\-\(\)]/g, '');
    } else {
        return value;
    }
};

