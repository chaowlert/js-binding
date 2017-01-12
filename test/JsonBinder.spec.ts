import { JsonBinder } from '../src/index';
import { expect } from 'chai';

let $merge: jsonBinding.IDirective = {
    name: '$merge',
    link: (value, template) => Object.assign({}, value, template),
};

describe('JsonBinder', () => {
    let jsonBinder = new JsonBinder();

    jsonBinder.registerTemplate('baz', { foo: 'baz' });
    jsonBinder.registerDirective($merge);

    it('should be able to bind', () => {
        let result: any;

        //number
        result = jsonBinder.bind(1, null);
        expect(result).equals(1);

        //string
        result = jsonBinder.bind('Hello, {{name}}!', { name: 'World' });
        expect(result).equals('Hello, World!');

        //object
        result = jsonBinder.bind({ '{{key}}': '{{value}}' }, { key: 'foo', value: 'bar' });
        expect(result).deep.equals({ foo: 'bar' });

        //array
        result = jsonBinder.bind([ '{{key}}', '{{value}}' ], { key: 'foo', value: 'bar' });
        expect(result).deep.equals([ 'foo', 'bar' ]);

        //$bind
        result = jsonBinder.bind(
            { test: { $bind: 'foo' } }, 
            { foo: ['bar'] }
        );
        expect(result).deep.equals({ test: ['bar'] });

        //$content
        result = jsonBinder.bind(
            { test: { $content: ['bar'] } }, 
            { }
        );
        expect(result).deep.equals({ test: ['bar'] });

        //$if
        result = jsonBinder.bind(
            { test: { $if: 'x == 1', foo: 'bar' } }, 
            { x: 1 }
        );
        expect(result).deep.equals({ test: { foo: 'bar' } });

        result = jsonBinder.bind(
            { test: { $if: 'x == 2', foo: 'bar' } }, 
            { x: 1 }
        );
        expect(result).deep.equals({ });

        result = jsonBinder.bind(
            { test: { $if: 'x == 1', $content: 'yes', $else: 'no' } }, 
            { x: 1 }
        );
        expect(result).deep.equals({ test: 'yes' });

        result = jsonBinder.bind(
            { test: { $if: 'x == 2', $content: 'yes', $else: 'no' } }, 
            { x: 1 }
        );
        expect(result).deep.equals({ test: 'no' });

        result = jsonBinder.bind({
            foo: { $if: 'x == 1', fooKey: 'fooValue' },
            bar: { $if: 'x == 2', barKey: 'barValue' },
        }, { x: 1 });
        expect(result).deep.equals({ foo: { fooKey: 'fooValue' } });

        //$init
        result = jsonBinder.bind({ $init: 'x = 2', $content: '{{x}}' }, { x: 1 });
        expect(result).equals('2');

        //$repeat
        result = jsonBinder.bind({ $repeat: 'item in list', value: '{{item+$index}}' }, { list: [2, 4, 6] });
        expect(result).deep.equals([
            { value: '2' },
            { value: '5' },
            { value: '8' },
        ]);

        result = jsonBinder.bind({ $repeat: '(key, value) in obj', $content: '{{key}}={{value}}' }, { obj: { a: 'b', c: 'd' } });
        expect(result).deep.equals(['a=b', 'c=d']);

        result = jsonBinder.bind(
            { list: [ { $repeat: 'item in items', $if: 'item != "c"', value: '{{item}}' } ] }, 
            { items: [ 'a', 'b', 'c' ]}
        );
        expect(result).deep.equals({ 
            list: [
                { value: 'a' },
                { value: 'b' },
            ]
        });

        result = jsonBinder.bind(
            { list: { $repeat: 'item in items', $if: 'item != "c"', value: '{{item}}' } }, 
            { items: [ 'a', 'b', 'c' ]}
        );
        expect(result).deep.equals({ 
            list: [
                { value: 'a' },
                { value: 'b' },
            ]
        });

        //$template
        result = jsonBinder.bind({ $template: 'template' }, { template: 'baz' });
        expect(result).deep.equals({ foo: 'baz' });

        //custom directive
        result = jsonBinder.bind({ $merge: { foo: 'foo' }, bar: 'bar' }, { });
        expect(result).deep.equals({ foo: 'foo', bar: 'bar' });
    });

    it('should be able to bind asynchronously', async() => {
        let result = jsonBinder.bind({ $bind: 'getValue()' }, { 
            getValue() {
                return new Promise<string>(resolve => setTimeout(() => resolve('test'), 100));
            }
        });

        expect(result.then).not.undefined;

        result = await result;
        expect(result).to.equals('test');
    });
});