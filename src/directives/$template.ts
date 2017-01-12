import * as expressions from 'angular-expressions';

export let $template: jsonBinding.IDirective = {
    name: '$template',
    link(value: string, _, $scope) {
        let name = expressions.compile(value)($scope);
        return this.getTemplate(name);
    }
};