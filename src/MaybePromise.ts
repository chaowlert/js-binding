function isPromise(value: any): value is Promise<any> {
    return value && typeof value.then === 'function';
}

export class MaybePromise<T> {
    constructor(private state: Promise<T>|T) { }

    chain<T2>(next: (value: T) => Promise<T2>|T2) {
        if (isPromise(this.state)) {
            let promise = this.state.then(next);
            return new MaybePromise(promise);
        } else {
            let value = next(this.state);
            return new MaybePromise(value);
        }
    }

    value() {
        return this.state;
    }
}