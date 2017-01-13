declare namespace jsonBinding {
    interface IJsonBinder {
        registerTemplate(name: string, template: any): void;
        registerDirective(directive: IDirective): void;
        newScope(isolate: boolean, parent: any): any;
        interpolate(text: string, $scope: any): string;
        parse(expr: string): ICompiledExpressions;
        bind(template: any, $scope: any): any;
        getTemplate(name: string): any;
    }
}