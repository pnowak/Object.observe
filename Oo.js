const mandatory = (parameter) => {
    throw new Error(`The ${parameter} parameter is mandatory`);
};

export class Observe {
    constructor(target, fn = mandatory('callback'), changes = ['add', 'update', 'delete', 'reconfigure', 'setPrototype', 'preventExtensions']) {

        this.fn = fn;

        const baseDescriptor = {
            configurable: false,
            enumerable: false,
            writable: true,
        };

        Reflect.defineProperty(this, 'start', { baseDescriptor, value: 'start' });

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
        if (Reflect.isExtensible(target)) {
            if (Reflect.has( target, key )) {
                this.fn.apply(this, [{ name: key, object: JSON.stringify(target), type: 'update', oldValue: target[key] }]);
                return Reflect.set(target, key, value, context);
            }
            else {
                this.fn.apply(this, [{ name: key, object: JSON.stringify(target), type: 'add' }]);
                return Reflect.set(target, key, value, context);
            }
        } else {
            throw new TypeError(`${target} is not extensible`);
        }
    }

    deleteProperty(target, key) {
        if (Reflect.isExtensible(target)) {
            this.fn.apply(this, [{ name: key, object: JSON.stringify(target), type: 'delete', oldValue: target[key] }]);
            return Reflect.deleteProperty(target, key);
        } else {
            throw new TypeError(`${target} is not extensible`);
        }
    }

    defineProperty(target, key, desc) {
        if (Reflect.isExtensible(target)) {
            this.fn.apply(this, [{ name: key, object: JSON.stringify(target), type: 'reconfigure', descriptor: JSON.stringify(desc) }]);
            return Reflect.defineProperty(target, key, desc);
        } else {
            throw new TypeError(`${target} is not extensible`);
        }
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

// gdy zrobimy na przykład tak, że
// Object.defineProperty(oo, 'a', { writable: false });
// przy próbie nadpisania takiej własności powinniśmy otrzymać informację, iż jest to niemożliwie bo..