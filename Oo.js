'use strict';

const mandatory = (parameter) => {
    throw new Error(`The ${parameter} parameter is mandatory`);
};

export class Observe {
    constructor(target, fn = mandatory('callback'), changes = ['add', 'update', 'delete', 'reconfigure', 'setPrototype', 'preventExtensions']) {

        this.fn = fn;
        
        return new Proxy(target, this);
    }

    get(target, key, context) {
        if (Reflect.has(target, key)) {
            this.fn.apply(this, [{ name: key, object: JSON.stringify(target), type: 'check' }]);
            return Reflect.get(target, key, context);
        }
        else {
            throw new ReferenceError(`${key} doesnt exist`);
        }
    }

    set(target, key, value, context) {
        if (Reflect.has( target, key )) {
            this.fn.apply(this, [{ name: key, object: JSON.stringify(target), type: 'update', oldValue: target[key] }]);
            return Reflect.set(target, key, value, context);
        } else {
            this.fn.apply(this, [{ name: key, object: JSON.stringify(target), type: 'add' }]);
            return Reflect.set(target, key, value, context);
        }
    }

    deleteProperty(target, key) {
        this.fn.apply(this, [{ name: key, object: JSON.stringify(target), type: 'delete', oldValue: target[key] }]);
        return Reflect.deleteProperty(target, key);
    }

    defineProperty(target, key, desc) {
        this.fn.apply(this, [{ name: key, object: JSON.stringify(target), type: 'reconfigure', descriptor: JSON.stringify(desc) }]);
        return Reflect.defineProperty(target, key, desc);
    }

    setPrototypeOf(target, proto) {
        this.fn.apply(this, [{ name: JSON.stringify(proto), object: JSON.stringify(target), type: 'setPrototype', oldValue: JSON.stringify(target) }]);
        return Reflect.setPrototypeOf(target, proto);
    }
}

Reflect.defineProperty(Observe.prototype, Symbol.toStringTag, {
    configurable: false,
    writable: false,
    enumerable: false,
    value: 'Observe',
});