/* ************ 0. Other Module Imports ************ */

import { $win } from './basic.js'

/* ************** 1. Classes/Objects/Variables: ************** */

const selectText = setupSelectText();
const lazyLoad = setupLazyLoad();

/* ************** 2. Actions/Events: ************** */

$win.scroll(throttle(e => lazyLoad.run()));

/* ************** 3. Exports: ************** */

export {
    selectText,
    lazyLoad,
    memoize,
    throttle,
    debounce
}

/* ************** 4. Functions: ************** */

/**
 * $.memoize(task[, options]) 
 * => returns a new function which caches return values for given args. Mostly used to cache REST API ajax.
 * @param {function} task -> Task to be memoized with a promise return value. (pass function's promise).
 * @param {object} options: {
 *   @param {number} cacheLimit -> max no. of results that can be stored in cache.
 * }
 * @return {function} memoizedTask
 */
function memoize(task, options) {
    var memoizeCache = memoize._cache_ || {},
        cacheLimit = options && options.cacheLimit,
        resultTask;

    memoizeCache[task.toString()] = { "queries": [], "results": [] };
    resultTask = _memoizedTask;
    return resultTask;

    /* Inner Functions: */
    function _memoizedTask() {
        return new Promise(function(resolve, reject) {
            var cache = memoizeCache[task.toString()],
                query = JSON.stringify(arguments),
                result;

            if (cache.queries.indexOf(query) !== -1) {
                result = cache.results[cache.queries.indexOf(query)];
                resolve(result);
            } else {
                task.apply(this, arguments).then(function(result) {
                    cache.queries.push(query);
                    cache.results.push(result);
                    if (cacheLimit) {
                        if (cache.queries.length > cacheLimit) {
                            cache.queries.shift();
                            cache.results.shift();
                        }
                    }
                    resolve(result);
                });
            }
        });
    }
}

/**
 * $.throttle(task, timeout[, context])
 * => restricts execution of continuosly asks tasks to interval spaced executions.
 * => generally used to to make continuosly fired event handler callbacks performant.
 * 
 * @param {function} task -> task to be throttled.
 * @param {number:milliseconds} timeout: -> interval between two task executions.
 * @param {object} context -> task will be exected as a method of this object.
 *
 * @return {function} debouncedTask
 */
function throttle(task, timeout, context) {
    var timer, args, needInvoke;
    return function() {
        args = arguments;
        needInvoke = true;
        context = context || this;
        if (!timer) {
            (function timedFunc() {
                if (needInvoke) {
                    task.apply(context, args);
                    needInvoke = false;
                    timer = setTimeout(timedFunc, timeout);
                } else {
                    timer = null;
                }
            }());
        }
    };
}

/**
 * $.debounce(task, timeout[, invokeAsap[, context]])
 * => returns a new function which memoizes return values for given args.
 * => used to to make continuosly fired event handler callbacks run once.
 *
 * @param {function} task -> task to be debounced.
 * @param {number: seconds} timeout: -> interval between two task executions.
 * @param {boolean} invokeAsap -> task to be executed after first call of the event or not.
 * @param {object} context -> task will be exected as a method of this object.
 *
 * @return {function} debouncedTask
 */
function debounce(task, timeout, invokeAsap, context) {
    var timer;

    if (arguments.length == 3 && typeof invokeAsap != 'boolean') {
        context = invokeAsap;
        invokeAsap = false;
    }

    return function() {
        var args = arguments;
        context = context || this;
        invokeAsap && !timer && task.apply(context, args);
        clearTimeout(timer);
        timer = setTimeout(function() {
            !invokeAsap && task.apply(context, args);
            timer = null;
        }, timeout);
    };
}

function setupSelectText(targetSelector) { /* generally, targetSelector = ".js-slct-trgt" */
    var _range, _selection;
    var _is = function(o, type) {
        return typeof o === type;
    };

    if (_is(document.getSelection, 'function')) {
        _selection = document.getSelection();

        if (_is(_selection.setBaseAndExtent, 'function')) {

            // Chrome, Safari
            return function _selectText($triggerNode) {
                var selection = _selection;
                var targetNode = $triggerNode.find(targetSelector).length ? $triggerNode.find(targetSelector).get(0) : $triggerNode.get(0);

                selection.setBaseAndExtent(targetNode, 0, targetNode, $(targetNode).contents().size());

                // Chainable
                return this;
            };
        } else if (_is(document.createRange, 'function')) {
            _range = document.createRange();

            if (_is(_range.selectNodeContents, 'function') &&
                _is(_selection.removeAllRanges, 'function') &&
                _is(_selection.addRange, 'function')) {

                // Mozilla
                return function _selectText($triggerNode) {
                    var range = _range;
                    var selection = _selection;
                    var targetNode = $triggerNode.find(targetSelector).length ? $triggerNode.find(targetSelector).get(0) : $triggerNode.get(0);

                    range.selectNodeContents(targetNode);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    // Chainable
                    return this;
                };
            }
        }
    } else if (_is(document.body.createTextRange, 'object')) {

        _range = document.body.createTextRange();

        if (_is(_range.moveToElementText, 'object') && _is(_range.select, 'object')) {

            // IE11- most likely
            return function _selectText($triggerNode) {
                var range = document.body.createTextRange();
                var targetNode = $triggerNode.find(targetSelector).length ? $triggerNode.find(targetSelector).get(0) : $triggerNode.get(0);

                range.moveToElementText(targetNode);
                range.select();

                // Chainable
                return this;
            };
        }
    }
}

function setupLazyLoad() {
    var _queue = [];

    return {
        /** MSP.utils.lazyLoad.run()
         * => runs each task pushed to the lazyload queue when their corresponding scroll condition is statisfied.
         * => used to load on demand images, widgets which slow down page load times.
         */
        run: function() {
            for (let i = 0; i < _queue.length; i++) {
                (function() {
                    if (_queue[i].node.length > 0) {
                        var callback = _queue[i].callback,
                            position = _queue[i].position,
                            triggerPoint = (position || (_queue[i].node.offset() && _queue[i].node.offset().top)) - $(window).height();

                        if ($win.scrollTop() > triggerPoint) {
                            callback.definition.apply(callback.context, callback.arguments);
                            _queue.splice(i, 1);
                            i--;
                        }
                    }
                }());
            }
        },
        /**
         * MSP.utils.lazyLoad.assign => accepts a task to be executed on reaching scroll position of given node.
         * 
         * @param {object} task -> {
         *   @param {$node} "node" : $node, // jquery node
         *   @param {function} "callback" : {
         *     "definition" : callbackFunction, // defintion of the task to be run
         *     "context" : this,
         *     "arguments" : [args,...] // arguments of the task if any.
         *   }
         * }
         *
         * @return {object} lazyload -> to enable chaining -> .run() for immediate invocation.
         */
        assign: function(task) {
            _queue.push(task);
            return this; 
        }
    };
}