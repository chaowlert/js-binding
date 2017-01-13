import { $bind } from './directives/$bind';
import { $content } from './directives/$content';
import { $if } from './directives/$if';
import { $init } from './directives/$init';
import { $repeat } from './directives/$repeat';
import { $template } from './directives/$template';
import { MaybePromise } from 'maybe-promise';

/* @ngInject */
export class JsonBinder implements jsonBinding.IJsonBinder {

    constructor(private $parse?: jsonBinding.IParseService) {
        if (!this.$parse) {
            let expressions = require('angular-expressions');
            this.$parse = expressions.compile;
        }
    }

    private templates: Record<string, any> = {};
    registerTemplate(name: string, template: any) {
        this.templates[name] = template;
    }

    static DefaultDirectives = [
        $bind,
        $content,
        $if,
        $init,
        $repeat,
        $template,
    ];

    private directives: jsonBinding.IDirective[] = JsonBinder.DefaultDirectives.slice();
    private isDirectiveSorted = false;
    registerDirective(directive: jsonBinding.IDirective) {
        this.directives.push(directive);
        this.isDirectiveSorted = false;
    }

    newScope(isolate: boolean, parent?: any) {
        let result: any = {};
        if (!isolate) {
            Object.assign(result, parent);
        }
        result.$parent = parent;
        result.$root = parent && parent.$root || parent;
        return result;
    }

    private static EXPR_REGEX = /{{(.*?)}}/g;
    interpolate(text: string, $scope: any) {
        return text.replace(JsonBinder.EXPR_REGEX, (_, expr) => this.$parse(expr)($scope));
    }

    parse(expr: string) {
        return this.$parse(expr);
    }

    getTemplate(name: string) {
        return this.templates[name];
    }

    bind(template: any, $scope: any) {
        if (!this.isDirectiveSorted) {
           this.directives.sort((a, b) => (b.priority || 0) - (a.priority || 0));
           this.isDirectiveSorted = true;
        }
        let type = typeof template;
        switch (type) {
            case 'string':
                return this.interpolate(template, $scope);
            case 'object':
                return template instanceof Array 
                    ? this._bindArray(template, $scope) 
                    : this._bindObject(template, $scope);
            default:
                return template;
        }
    }

    private _bindObject(template: Record<string, any>, $scope: any): any {
        if (template.constructor !== Object) {
            return template;
        }

        //link directive
        for (let directive of this.directives) {
            let value = template[directive.name];
            if (value !== void(0)) {
                let cloned = Object.assign({}, template);
                delete cloned[directive.name];
                let result = directive.link.call(this, value, cloned, $scope);
                return this.bind(result, $scope);
            }
        }

        //evaluate all members
        let keys = Object.keys(template);
        let results: Record<string, any> = {};
        let maybe = new MaybePromise(results);
        for (let key of keys) {
            let interpolatedKey = this.interpolate(key, $scope);
            let value = template[key];
            let result = this.bind(value, $scope);

            maybe = maybe.chain(_ => result).chain(r => this.assignObject(results, interpolatedKey, r));
        }
        return maybe.value();
    }

    private assignObject(results: Record<string, any>, key: string, result: any) {
        if (result !== void(0)) {
            results[key] = result;
        }
        return results;
    }

    private _bindArray(template: any[], $scope: any) {
        let results: any[] = [];
        let maybe = new MaybePromise(results);
        for (let item of template) {
            let result = this.bind(item, $scope);

            maybe = maybe.chain(_ => result).chain(r => this.pushArray(results, item, r));
        }
        return maybe.value();
    }

    private pushArray(results: any[], item: any, result: any) {
        if (!(item instanceof Array) && result instanceof Array) {
            for (let r of result) {
                if (r !== void(0)) {
                    results.push(r);
                }
            }
        } else if (result !== void(0)) {
            results.push(result);
        }
        return results;
    }
}