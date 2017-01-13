export let $template: jsonBinding.IDirective = {
    name: '$template',
    link(value: string, _, $scope) {
        let name = this.parse(value)($scope);
        return this.getTemplate(name);
    }
};