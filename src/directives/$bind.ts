import * as expressions from 'angular-expressions';

export let $bind: jsonBinding.IDirective = {
    name: '$bind',
    link: (value, _, $scope) => expressions.compile(value)($scope),
};