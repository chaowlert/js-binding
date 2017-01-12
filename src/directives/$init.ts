import * as expressions from 'angular-expressions';

import { MaybePromise } from 'maybe-promise';

export let $init: jsonBinding.IDirective = {
    name: '$init',
    priority: 450,
    link(value, template, $scope) {
        let result = expressions.compile(value)($scope);
        let maybe = new MaybePromise(result).chain(_ => template);
        return maybe.value();
    }
};