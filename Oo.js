const mandatory = (parameter) => {
    throw new Error(`The ${parameter} parameter is mandatory`);
};

export class Observe {
    constructor(target, fn = mandatory('callback'), changes = ['add', 'update', 'delete', 'reconfigure', 'setPrototype', 'preventExtensions']) {

        this.changes = changes;

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
            return Reflect.get(target, key, context);
        }
        else {
            throw new ReferenceError(`${key} doesnt exist`);
        }
    }

    set(target, key, value, context) {
        if (Reflect.has( target, key )) {
            console.log({ name: key, object: JSON.stringify(target), type: 'update', oldValue: target[key] });
            return Reflect.set(target, key, value, context);
        }
        else {
            console.log({ name: key, object: JSON.stringify(target), type: 'add' });
            return Reflect.set(target, key, value, context);
        }
    }

    deleteProperty(target, key) {
        console.log({ name: key, object: JSON.stringify(target), type: 'delete', oldValue: target[key] });
        return Reflect.deleteProperty(target, key);
    }

    defineProperty(target, key, desc) {
        console.log({name: key, object: JSON.stringify(target), type: 'reconfigure', descriptor: JSON.stringify(desc) });
        return Reflect.defineProperty(target, key, desc);
    }

    setPrototypeOf(target, proto) {
        console.log({ name: JSON.stringify(proto), object: JSON.stringify(target), type: 'setPrototype', oldValue: JSON.stringify(target) });
        return Reflect.setPrototypeOf(target, proto);
    }
}

Reflect.defineProperty(Observe.prototype, Symbol.toStringTag, {
    configurable: false,
    writable: false,
    enumerable: false,
    value: 'Observe',
});
