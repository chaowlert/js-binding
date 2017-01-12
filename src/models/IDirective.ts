declare namespace jsonBinding {
    interface IDirective {
        name: string;
        priority?: number;
        link(this: IJsonBinder, value: any, template: any, $scope: any): any;
    }
}