import { MaybePromise } from 'maybe-promise';

export let $init: jsonBinding.IDirective = {
    name: '$init',
    priority: 450,
    link(value, template, $scope) {
        let result = this.parse(value)($scope);
        let maybe = new MaybePromise(result).chain(_ => template);
        return maybe.value();
    }
};