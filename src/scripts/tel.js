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
    if (value) {
        return value.replace(/[\+\s\-\(\)]/g, '');
    } else {
        return value;
    }
};

