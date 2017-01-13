import { MaybePromise } from 'maybe-promise';

let REPEAT_REGEX = /^\s*(.+?)\s+in\s+(.+)$/;
let KEY_REGEX = /^(?:([$\w]+)|\(\s*([$\w]+)\s*,\s*([$\w]+)\s*\))$/;

export let $repeat: jsonBinding.IDirective = {
    name: '$repeat',
    priority: 1000,
    link(value: string, template, $scope) {
        let match = value.match(REPEAT_REGEX);
        if (!match) {
            throw `Expect expression in form of '_item_ in _collection_' but got '${value}'`;
        }

        let lhs = match[1];
        let rhs = match[2];

        match = lhs.match(KEY_REGEX);
        if (!match) {
            throw `Expect expression in form of '_item_ in _collection_' or '(_key_, _value_) in _collection_' but got '${value}'`;
        }

        let valueIdentifier = match[3] || match[1];
        let keyIdentifier = match[2] || '$index';

        let result = this.parse(rhs)($scope);
        let maybe = new MaybePromise(result);
        maybe = maybe.chain(r => {
            let array: any[] = [];
            let maybeItem = new MaybePromise<any>(array);
            let keys: any[] = r instanceof Array ? Array.apply(null, {length: r.length}).map(Number.call, Number) : Object.keys(r);
            for (let key of keys) {
                let item = r[key];
                let $itemScope = this.newScope(false, $scope);
                $itemScope[valueIdentifier] = item;
                $itemScope[keyIdentifier] = key;
                let itemResult = this.bind(template, $itemScope);
                maybeItem = maybeItem.chain(_ => itemResult).chain(i => (array.push(i), array));
            }
            return maybeItem.value();
        });

        return maybe.value();
    }

};