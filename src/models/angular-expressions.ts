declare module 'angular-expressions' {
    interface ICompiledService {
        (context: any): any;
        assign(context: any, value: any): any;
    }
    interface ICache {
        [text: string]: ICompiledService;
    }
    interface ICompileFunction {
        (expression: string): ICompiledService;
        cache: ICache;
    }
    interface IFilter {
        [name: string]: Function;
    }
    interface IToken {
        index: number;
        text: string;
        json: boolean;
    }
    interface ILexer {
        lex(text: string): IToken[];
    }
    interface ILexerConstructor {
        new (options?: any): ILexer;
    }
    interface IParser {
        parse(text: string): ICompiledService;
    }
    interface IParserConstructor {
        new (lexer: ILexer, $filter: IFilter, options?: any): IParser;
    }
    interface IParseService {
        compile: ICompileFunction;
        filter: IFilter;
        Lexer: ILexerConstructor;
        Parser: IParserConstructor;
    }
    let expressions: IParseService;
    export = expressions;
}