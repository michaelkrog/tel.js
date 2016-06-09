/// <reference path="../../typings/main.d.ts" />

import { config } from './index.config';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { telephoneDirective } from './components/directive/telephone.directive';
import { telephoneFilter } from './components/filter/telephone.filter';

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

module teljs {
  'use strict';

  angular.module('teljs', [])
    .config(config)
    .run(runBlock)
    .controller('MainController', MainController)
    .directive('input', telephoneDirective)
    .filter('telephone', telephoneFilter);
}
