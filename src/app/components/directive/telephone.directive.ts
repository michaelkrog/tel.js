import { Mode, Util} from '../filter/telephone.filter';

interface TelephoneAttrs extends ng.IAttributes {
  type: string;
  international: string;
  defaultAreaCode: string;
}



/** @ngInject */
export function telephoneDirective($filter: ng.IFilterService): angular.IDirective {

  return {
    restrict: 'E', // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    link: (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: TelephoneAttrs, ngModel) => {
      let ctrl = new TelephoneController(scope, element, attrs, ngModel, $filter);
      ctrl.init();
    }
  };

}

class TelephoneController {
  international: boolean;
  defaultAreaCode: string;
  mode: Mode;

  constructor(private scope: ng.IScope, private element: ng.IAugmentedJQuery, private attrs: TelephoneAttrs,
    private ngModel: any, private filterService: ng.IFilterService) {
  }

  private initializeProperties() {
    this.international = angular.isDefined(this.attrs.international) && this.attrs.international === 'true';
    this.defaultAreaCode = this.attrs.defaultAreaCode;

    if (this.international) {
      this.mode = Mode.E164;
    } else {
      this.mode = Mode.National;
    }
  }

  private doFormatNumber(number: string, mode: Mode) {
    return this.filterService('telephone')(number, mode, this.defaultAreaCode, true);
  }

  private formatNumber(value: string) {
    var result;
    if (!angular.isDefined(value) || value === null || value === '') {
      return '';
    }

    result = this.doFormatNumber(value, this.mode);
    if (!result.valid) {
      result.number = value;
      this.ngModel.$setValidity('phoneNumber', false);
    } else {
      var trimmedResult = '+' + Util.trimNumber(this.doFormatNumber(value, Mode.E164).number);
      if (trimmedResult !== value) {
        this.ngModel.$$rawModelValue = trimmedResult;
        this.scope.$evalAsync(() {
          this.ngModel.$$parseAndValidate();
        });
      }
    }


    return result.number;
  }

  private parseNumber(value: string) {
    var formatResult, returnVal;
    value = value ? Util.trimNumber(value) : value;
    formatResult = this.doFormatNumber(value, Mode.E164);

    if (!formatResult.valid && (value === '' || value === undefined)) {
      formatResult.valid = true;
      formatResult.number = '';
    }

    this.ngModel.$setValidity('phoneNumber', formatResult.valid);
    returnVal = formatResult.number !== '' ? '+' + Util.trimNumber(formatResult.number) : '';
    return returnVal;
  }

  public init() {

    if (this.attrs.type !== 'tel') {
      return;
    }


    this.element.on('focus', () => this.initializeProperties());
    this.element.on('blur', () => {
      if (this.ngModel.$valid) {
        this.ngModel.$setViewValue(this.formatNumber(this.ngModel.$modelValue));
        this.ngModel.$render();
      }
    });

    this.ngModel.$formatters = [];
    this.ngModel.$parsers = [];

    this.ngModel.$formatters.push((value) => {
      return this.formatNumber(value);
    });
    this.ngModel.$parsers.push((value) => {
      return this.parseNumber(value);
    });

    this.initializeProperties();

  }
}

