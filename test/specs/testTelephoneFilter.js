describe('Unit testing teljs filter', function() {
    var $filter;
    

    beforeEach(module('teljs'));

    beforeEach(inject(function(_$filter_){
      
      $filter = _$filter_;
    }));

    it('Formats a danish number correctly', function() {
        var number = $filter('telephone')('4512341234');
        expect(number).toContain('+45 12 34 12 34');
    });
    
    it('Formats a danish number correctly using default area code', function() {
        var number = $filter('telephone')('12341234', 'e164', '45');
        expect(number).toContain('+45 12 34 12 34');
    });

    it('Formats a swedish number correctly', function() {
        var number = $filter('telephone')('46114955200');
        expect(number).toContain('+46 114 95 52 00');
    });

    it('Formats a swedish number with needless areacode correctly', function() {
        var number = $filter('telephone')('460114955200');
        expect(number).toContain('+46 114 95 52 00');
    });

    it('Formats a faroese number correctly', function() {
        var number = $filter('telephone')('298123456');
        expect(number).toContain('+298 123456');
    });
    
    
});
