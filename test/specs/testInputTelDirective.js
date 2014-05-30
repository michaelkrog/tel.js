describe('Unit testing teljs directive', function() {
    var $compile;
    var $rootScope;

    beforeEach(module('teljs'));

    beforeEach(inject(function(_$compile_, _$rootScope_){
      // The injector unwraps the underscores (_) from around the parameter names when matching
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));

    it('Formats a danish national number correctly', function() {
        $rootScope.number = '12341234';
        var element = $compile('<input type="tel" international="false" default-area-code="45" ng-model="number">')($rootScope);
        $rootScope.$digest();

        expect(element.val()).toContain('12 34 12 34');
    });
    
        it('Formats a danish international number as national correctly', function() {
        $rootScope.number = '+4512341234';
        var element = $compile('<input type="tel" international="false" default-area-code="45" ng-model="number">')($rootScope);
        $rootScope.$digest();

        expect(element.val()).toContain('12 34 12 34');
    });
    
    it('Formats a danish national number correctly to international format using default-area-code', function() {
        $rootScope.number = '12341234';
        var element = $compile('<input type="tel" international="true" default-area-code="45" ng-model="number">')($rootScope);
        $rootScope.$digest();

        expect(element.val()).toContain('+45 12 34 12 34');
    });
    
    it('Formats a danish number correctly', function() {
        $rootScope.number = '4512341234';
        var element = $compile('<input type="tel" international="true" ng-model="number">')($rootScope);
        $rootScope.$digest();

        expect(element.val()).toContain('+45 12 34 12 34');
    });

    it('Formats a swedish number correctly', function() {
        $rootScope.number = '46114955200';
        var element = $compile('<input type="tel" international="true" ng-model="number">')($rootScope);
        $rootScope.$digest();

        expect(element.val()).toContain('+46 11 495 52 00');
    });

    it('Formats a swedish number with needless areacode correctly', function() {
        $rootScope.number = '460114955200';
        var element = $compile('<input type="tel" international="true" ng-model="number">')($rootScope);
        $rootScope.$digest();

        expect(element.val()).toContain('+46 11 495 52 00');
    });
    
    it('Formats a swedish national number correctly', function() {
        $rootScope.number = '0114955200';
        var element = $compile('<input type="tel" international="false" default-area-code="46" ng-model="number">')($rootScope);
        $rootScope.$digest();

        expect(element.val()).toContain('011-495 52 00');
    });

    it('Formats a faroese number correctly', function() {
        $rootScope.number = '298123456';
        var element = $compile('<input type="tel" international="true" ng-model="number">')($rootScope);
        $rootScope.$digest();

        expect(element.val()).toContain('+298 123456');
    });
    
    
});
