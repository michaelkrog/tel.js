// import { NavbarController } from './navbar.directive';

/**
 * @todo Complete the test
 * This example is not perfect.
 * Test should check if MomentJS have been called
 */
describe('Unit testing teljs directive', function () {
  let $compile;
  let $rootScope;
  beforeEach(angular.mock.module('teljs'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('Formats a danish national number correctly', function () {
    $rootScope.number = '22334455';
    var element = $compile('<form name="myform"><input name="number" type="tel" international="false" default-area-code="45" ng-model="number"></form>')($rootScope);
    element = element.find('input');
    $rootScope.$digest();

    expect(element.val()).toContain('22 33 44 55');
    expect($rootScope.myform.number.$valid).toEqual(true);

    element.val('22334455');
    element.triggerHandler('change');
    $rootScope.$digest();

    expect($rootScope.myform.number.$valid).toEqual(true);
    expect($rootScope.number).toEqual('+4522334455');

  });

  it('does not format an invalid danish national number correctly', function () {
    $rootScope.number = '12341234';
    $compile('<form name="myform"><input name="number" type="tel" international="false" default-area-code="45" ng-model="number"></form>')($rootScope);
    $rootScope.$digest();
    expect($rootScope.myform.number.$valid).toEqual(false);

    expect($rootScope.number).toEqual('12341234');
  });

  it('Formats a danish international number as national correctly', function () {
    $rootScope.number = '+4522334455';
    var element = $compile('<input type="tel" international="false" default-area-code="45" ng-model="number">')($rootScope);
    $rootScope.$digest();

    expect(element.val()).toContain('22 33 44 55');
    expect($rootScope.number).toEqual('+4522334455');
  });

  it('Formats a danish national number correctly to international format using default-area-code', function () {
    $rootScope.number = '22334455';
    var element = $compile('<input type="tel" international="true" default-area-code="45" ng-model="number">')($rootScope);
    $rootScope.$digest();

    expect(element.val()).toContain('+45 22 33 44 55');

    element.val('22334455');
    element.triggerHandler('change');
    $rootScope.$digest();


    expect($rootScope.number).toEqual('+4522334455');
  });

  it('Formats a danish number correctly', function () {
    $rootScope.number = '4522334455';
    var element = $compile('<input type="tel" international="true" ng-model="number">')($rootScope);
    $rootScope.$digest();

    expect(element.val()).toContain('+45 22 33 44 55');
    expect($rootScope.number).toEqual('+4522334455');

    element.val('4522334455');
    element.triggerHandler('change');
    $rootScope.$digest();

    expect($rootScope.number).toEqual('+4522334455');
  });

  it('Formats a swedish number correctly', function () {
    $rootScope.number = '46114955200';
    var element = $compile('<input type="tel" international="true" ng-model="number">')($rootScope);
    $rootScope.$digest();
    $rootScope.$apply();

    expect(element.val()).toContain('+46 11 495 52 00');
    expect($rootScope.number).toEqual('+46114955200');
  });

  it('Formats a swedish number correctly when default areacode is danish', function () {
    $rootScope.number = '46114955200';
    var element = $compile('<input type="tel" international="true" default-area-code="45" ng-model="number">')($rootScope);
    $rootScope.$digest();

    expect(element.val()).toContain('+46 11 495 52 00');
    expect($rootScope.number).toEqual('+46114955200');
  });

  it('Formats a swedish number with needless areacode correctly', function () {
    $rootScope.number = '460114955200';
    var element = $compile('<input type="tel" international="true" ng-model="number">')($rootScope);
    $rootScope.$digest();

    expect(element.val()).toContain('+46 11 495 52 00');
    expect($rootScope.number).toEqual('+46114955200');
  });

  it('Formats a swedish national number correctly', function () {
    $rootScope.number = '0114955200';
    var element = $compile('<input type="tel" international="false" default-area-code="46" ng-model="number">')($rootScope);
    $rootScope.$digest();

    expect(element.val()).toContain('011-495 52 00');

    element.val('0114955200');
    element.triggerHandler('change');
    $rootScope.$digest();

    expect($rootScope.number).toEqual('+46114955200');
  });

  it('Formats a german national number correctly', function () {
    $rootScope.number = '081539308548';
    var element = $compile('<input type="tel" international="false" default-area-code="49" ng-model="number">')($rootScope);
    $rootScope.$digest();

    expect(element.val()).toContain('08153 9308548');

    element.val('081539308548');
    element.triggerHandler('change');
    $rootScope.$digest();

    expect($rootScope.number).toEqual('+4981539308548');
  });

  it('Formats a german international number correctly', function () {
    $rootScope.number = '+4981539308548';
    var element = $compile('<input type="tel" international="true" default-area-code="49" ng-model="number">')($rootScope);
    $rootScope.$digest();

    expect(element.val()).toContain('+49 8153 9308548');
  });

  it('Formats a faroese number correctly', function () {
    $rootScope.number = '298208080';
    var element = $compile('<input type="tel" international="true" ng-model="number">')($rootScope);
    $rootScope.$digest();

    expect(element.val()).toContain('+298 208080');

    element.val('298208080');
    element.triggerHandler('change');
    $rootScope.$digest();

    expect($rootScope.number).toEqual('+298208080');
  });

  it('handles unset value correctly', function () {
    var element = $compile('<input type="tel" international="true" ng-model="number">')($rootScope);
    $rootScope.$digest();
    expect(element.val()).toEqual('');

    $rootScope.number = '298208080';
    $rootScope.$digest();

    expect(element.val()).toContain('+298 208080');

    element.val('298208080');
    element.triggerHandler('change');
    $rootScope.$digest();

    expect($rootScope.number).toEqual('+298208080');
  });

  it('should initialize to a valid model and set valid', function () {

    $rootScope.number = '+298 208080';
    var form = $compile('<form name="myform"><input type="tel" name="number" international="true" ng-model="number"></form>')($rootScope);
    var element = form.find('input');
    $rootScope.$digest();
    expect(element.val()).toEqual('+298 208080');
    expect($rootScope.myform.number.$valid).toEqual(true);

    element.val('298208080');
    element.triggerHandler('change');
    $rootScope.$digest();

    expect($rootScope.number).toEqual('+298208080');
  });

  it('should initialize to an invalid model and set invalid', function () {

    $rootScope.number = '1234';
    var form = $compile('<form name="myform"><input type="tel" name="number" international="true" ng-model="number"></form>')($rootScope);
    var element = form.find('input');
    $rootScope.$digest();
    expect(element.val()).toEqual('1234');
    expect($rootScope.myform.number.$valid).toEqual(false);

    expect($rootScope.number).toEqual('1234');
  });

  it('should not set invalid on an empty value', function () {

    var form = $compile('<form name="myform"><input type="tel" name="number" international="true" ng-model="number"></form>')($rootScope);
    $rootScope.$digest();
    expect($rootScope.myform.number.$valid).toEqual(true);
    expect($rootScope.number).toEqual(undefined);
  });

  it('should not set invalid on an empty scope value', function () {

    $rootScope.number = '';
    var form = $compile('<form name="myform"><input type="tel" name="number" international="true" ng-model="number"></form>')($rootScope);
    $rootScope.$digest();
    expect($rootScope.myform.number.$valid).toEqual(true);
    expect($rootScope.number).toEqual('');
  });

  it('should not set invalid when view changes back to an empty value', function () {

    var element = angular.element('<form name="myform"><input type="tel" name="number" international="true" ng-model="number"></form>');
    var input = $compile(element)($rootScope);

    $rootScope.myform.number.$setViewValue('test');
    expect($rootScope.myform.number.$valid).toEqual(false);
    $rootScope.myform.number.$setViewValue('');
    expect($rootScope.myform.number.$valid).toEqual(true);
    expect($rootScope.number).toEqual('');
  });

  it('should be required if required is set', function () {

    var form = $compile('<form name="myform"><input type="tel" name="number" international="true" ng-model="number" required></form>')($rootScope);
    $rootScope.$digest();
    expect($rootScope.myform.number.$valid).toEqual(false);
    expect($rootScope.myform.number.$error.required).toEqual(true);
    expect($rootScope.number).toEqual(undefined);
  });
});
