import * as expressions from 'angular-expressions';

export let $template: jsonBinding.IDirective = {
    name: '$template',
    link(this: jsonBinding.IJsonBinder, value: string, _, $scope) {
        let name = expressions.compile(value)($scope);
        return this.getTemplate(name);
    }
};