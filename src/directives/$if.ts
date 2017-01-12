import * as expressions from 'angular-expressions';

import { MaybePromise } from 'maybe-promise';

export let $if: jsonBinding.IDirective = {
    name: '$if',
    priority: 600,
    link(value, template, $scope) {
        let condition = expressions.compile(value)($scope);
        let maybe = new MaybePromise(condition).chain(c => {
            let $else = template.$else;
            delete template.$else;
            return c ? template : $else;
        });
        return maybe.value();
    }
};