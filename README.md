# js-binding
Simplified json generation

## Install

```
npm install json-binding --save
```

## Usage

This library allows to create json template and bind with your model, for example:

This is json template.
```
{
    '{{type}}Id': '{{id}}',
    list: [
        { 
            $repeat: 'item in items', 
            $if: 'item.confirm', 
            amount: {{item.amount}} 
        }
    ]
}
```

This is model.
```
{
    id: 1,
    type: 'order',
    items: [
        { amount: 4, confirm: true },
        { amount: 9, confirm: false },
    ]
}
```

And you can bind template and model together by:
```
let jsonBinder = new JsonBinder();
let result = jsonBinder.bind(template, model);
```

And the result will be:
```
{
    orderId: 1,
    list: [
        { amount: 4 }
    ]
}
```

## Directives

### $bind

`$bind` is to output from your model.
```
result = jsonBinder.bind(
    { test: { $bind: 'foo' } }, 
    { foo: ['bar'] }
);
expect(result).deep.equals({ test: ['bar'] });
```

### $content

`$content` is to return object inside this directive.
```
result = jsonBinder.bind(
    { test: { $content: ['bar'] } }, 
    { }
);
expect(result).deep.equals({ test: ['bar'] });
```

### $if

`$if` is to conditionally add or not add object.

```
result = jsonBinder.bind({
    foo: { $if: 'x == 1', fooKey: 'fooValue' },
    bar: { $if: 'x == 2', barKey: 'barValue' },
}, { x: 1 });
expect(result).deep.equals({ foo: { fooKey: 'fooValue' } });
```

You can use `$if` in conjuction with `$content` and `$else`.

```
result = jsonBinder.bind(
    { test: { $if: 'x == 2', $content: 'yes', $else: 'no' } }, 
    { x: 1 }
);
expect(result).deep.equals({ test: 'no' });
```

### $init

`$init` is to run command when binding.

```
result = jsonBinder.bind({ $init: 'x = 2', $content: '{{x}}' }, { x: 1 });
expect(result).equals('2');
```

### $repeat

`$repeat` is to loop your model and bind to template.
```
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
```

You can loop through object.

```
result = jsonBinder.bind(
    { 
        $repeat: '(key, value) in obj', 
        $content: '{{key}}={{value}}' 
    }, 
    { obj: { a: 'b', c: 'd' } }
);
expect(result).deep.equals(['a=b', 'c=d']);
```

In `$repeat`, you can access to index by `$index`, and access to parent scope by `$parent`.

### $template

You can add template by `registerTemplate` and bind model to template by `$template`.
```
jsonBinder.registerTemplate('baz', { foo: 'baz' });

result = jsonBinder.bind({ $template: 'template' }, { template: 'baz' });
expect(result).deep.equals({ foo: 'baz' });
```

## Custom Directives

You can add custom directives by `registerDirective`. Please see example in unit test.

## Promise

If one of operation is `Promise`, `bind` method will return `Promise`. Otherwise `JsonBinder` will return non-promise value.

## Plug to AngularJS

This library can be used in NodeJS or on browser without AngularJS. If you would like to register `JsonBinder` to AngularJS and using AngularJS filters, you can do following.

```
angular.module('yourModule')
    .service('jsonBinder', JsonBinder);
```

Now you can use AngularJS filters.

```
{
    totalValue: '{{ vm.sumTotal() | number:2 }}'
}
```