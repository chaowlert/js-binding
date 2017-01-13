declare namespace jsonBinding {
    interface ICompiledExpressions {
        (context: any): any;
        assign(context: any, value: any): any;
    }
    interface IParseService {
        (expression: string): ICompiledExpressions;
    }
}