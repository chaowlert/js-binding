export let $bind: jsonBinding.IDirective = {
    name: '$bind',
    link(value, _, $scope) {
        return this.parse(value)($scope);
    },
};