describe('Unit testing teljs filter', function() {
    var $filter;
    

    beforeEach(module('teljs'));

    beforeEach(inject(function(_$filter_){
      
      $filter = _$filter_;
    }));

    it('Formats a danish number correctly', function() {
        var number = $filter('telephone')('4522334455');
        expect(number).toContain('+45 22 33 44 55');
    });
    
    it('Formats a danish number correctly using default area code', function() {
        var number = $filter('telephone')('22334455', 'e164', '45');
        expect(number).toContain('+45 22 33 44 55');
    });

    it('Formats a swedish number correctly', function() {
        var number = $filter('telephone')('46114955200');
        expect(number).toContain('+46 11 495 52 00');
    });
    
    it('Formats another swedish number correctly', function() {
        var number = $filter('telephone')('4612012345');
        expect(number).toContain('+46 120 123 45');
    });


    it('Formats a swedish number with needless areacode correctly', function() {
        var number = $filter('telephone')('460114955200');
        expect(number).toContain('+46 11 495 52 00');
    });

    it('Formats a faroese number correctly', function() {
        var number = $filter('telephone')('298208080');
        expect(number).toContain('+298 208080');
    });
    
    
});
