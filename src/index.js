function defaultResultFunc(...values) {
    return values;
}

export function createSelectorCreator(valueEquals) {
    return (selectors, resultFunc = defaultResultFunc) => {
        if (!Array.isArray(selectors)) {
            selectors = [selectors];
        }
        const memoizedResultFunc = memoize(resultFunc, valueEquals);
        return state => {
            const params = selectors.map(selector => selector(state));
            return memoizedResultFunc(params);
        }
    };
}

export function createSelector(...args) {
    return createSelectorCreator(defaultValueEquals)(...args);
}

export function defaultValueEquals(a, b) {
    return a === b;
}

export function composeSelectors( selectors ) {
	 let objectKeys = Object.keys(selectors);
    return createSelector(
       objectKeys.map( (key) => {
           return selectors[key];
		 }),
       (...values) => {
           return values.reduce((composition, value, index) => {
               composition[objectKeys[index]] = value;
               return composition;
           }, {});
       }
    );
}

// the memoize function only caches one set of arguments.  This
// actually good enough, rather surprisingly. This is because during
// calculation of a selector result the arguments won't
// change if called multiple times. If a new state comes in, we *want*
// recalculation if and only if the arguments are different.
function memoize(func, valueEquals) {
    let lastArgs = null;
    let lastResult = null;
    return (args) => {
        if (lastArgs !== null && argsEquals(args, lastArgs, valueEquals)) {
            return lastResult;
        }
        lastArgs = args;
        lastResult = func(...args);
        return lastResult;
    }
}

function argsEquals(a, b, valueEquals) {
    return a.every((value, index) => valueEquals(value, b[index]));
}
