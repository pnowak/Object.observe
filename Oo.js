export class Observe {
    constructor(target) {

        const changes = ['add', 'update', 'delete', 'reconfigure', 'setPrototype', 'preventExtensions'];

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
            console.log();
            return Reflect.get(target, key, context);
        }
        else {
            throw new ReferenceError(`${key} doesnt exist`);
        }
    }

    set(target, key, value, context) {
        if (Reflect.has( target, key )) {
            console.log();
            return Reflect.set(target, key, value, context);
        }
        else {
            throw new ReferenceError(`${key} doesnt exist`);
        }
    }

    delete(target, key) {
        console.log({name: target[key], object: target, type: 'delete', oldValue: key});
        return Reflect.deleteProperty(target, key);
    }

    defineProperty(target, key, desc) {
        return Reflect.defineProperty(target, key, desc);
    }

    getOwnPropertyDescriptor(target, key) {
        console.log()
        return Reflect.getOwnPropertyDescriptor(target, key);
    }

    setPrototypeOf(target, proto) {
        return Reflect.setPrototypeOf(target, proto);
    }

    *[Symbol.iterator]() {
        for (let i = 0; i < this.length; i += 1) {
            yield this.get(i);
        }
    }
}

Reflect.defineProperty(Observe.prototype, Symbol.toStringTag, {
    configurable: false,
    writable: false,
    enumerable: false,
    value: 'Observe',
});

export default function oberve(target) {
    return new Observe(target);
}