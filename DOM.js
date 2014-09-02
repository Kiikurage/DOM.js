//#include("./Util.js");

/*------------------------------------------------------------------------------
 *
 *  DOM utility modules
 *  (likly jQuery minimal set)
 *
 */

var DOM = (function() {

    //--------------------------------------------------------------------------
    //  core

    function DOM(query, context) {
        if (!(this instanceof DOM)) {
            //handle called without "new"
            return DOM.query.apply(this, arguments);
        }

        this.length = 0;

        return this;
    };

    DOM.prototype.pop = Array.prototype.pop;
    DOM.prototype.shift = Array.prototype.shift;
    DOM.prototype.unshift = Array.prototype.unshift;
    DOM.prototype.each = Array.prototype.forEach;
    DOM.prototype.splice = Array.prototype.splice;
    DOM.prototype.indexOf = Array.prototype.indexOf;

    DOM.prototype.push = function() {
        var list = [],
            el;
        for (var i = 0, max = arguments.length; i < max; i++) {
            el = arguments[i];
            if (!(el instanceof HTMLElement) || this.indexOf(el) !== -1) {
                continue;
            }
            list.push(el);
        }
        Array.prototype.push.apply(this, list);
    };

    DOM.prototype.concat = function(arr) {
        this.push.apply(this, arr);
    };

    //--------------------------------------------------------------------------
    //  selection methods

    DOM.prototype.children = function() {
        var res = DOM();
        this.each(function(el) {
            res.push.apply(res, el.children);
        });
        return res;
    };

    DOM.prototype.parent = function() {
        var res = DOM();
        this.each(function(el) {
            res.push(el.parentNode);
        });
        return res;
    };

    DOM.prototype.next = function() {
        var res = DOM();
        this.each(function(el) {
            res.push(el.nextElementSibling);
        });
        return res;
    };

    DOM.prototype.prev = function() {
        var res = DOM();
        this.each(function(el) {
            res.push(el.previousElementSibling);
        });
        return res;
    };

    DOM.prototype.eq = function(index) {
        return DOM(this[index]);
    };

    DOM.prototype.filter = function(query) {
        if (!query) {
            return this.clone();
        }

        var elements = DOM.find(query),
            res = DOM();

        this.each(function(el) {
            if (elements.indexOf(el) === -1) {
                return
            }
            res.push(el);
        });
        return res;
    };

    DOM.prototype.find = function(query) {
        var res = DOM();
        this.each(function(el) {
            res.concat(DOM.find(query, el));
        });
        return res;
    };

    DOM.prototype.clone = function() {
        var res = [];
        this.each(function(el) {
            res.push(el.cloneNode(true));
        });
        return DOM(res);
    };

    //--------------------------------------------------------------------------
    //  DOMTree operation methods

    DOM.prototype.appendChild = function(children) {
        children = $(children);

        if (this.length !== children.length) {
            children = children.clone();
        }

        this.each(function(parent) {
            children.each(function(child) {
                parent.appendChild(child);
            });
        });
    };

    DOM.prototype.append = DOM.prototype.appendChild;

    DOM.prototype.appendTo = function(parent) {
        $(parent).appendChild(this);
    };

    DOM.prototype.remove = function() {
        this.each(function(child) {
            child.parentNode.removeChild(child);
        });
    };

    DOM.prototype.insertBefore = function(refElements) {
        refElements = $(refElements);
        children = this;

        refElements.each(function(refElement) {
            children.clone().each(function(child) {
                refElement.parentNode.insertBefore(child, refElement);
            });
        });
    };

    DOM.prototype.insertAfter = function(refElements) {
        refElements = $(refElements);
        children = this;

        refElements.each(function(refElement) {
            children.clone().each(function(child) {
                refElement.parentNode.insertBefore(child, refElement);
                refElement.parentNode.insertBefore(refElement, child);
            });
        });
    };

    //--------------------------------------------------------------------------
    //  Property operation methods

    DOM.prototype.getAttr = function(key) {
        var res = [];
        this.each(function(el) {
            res.push(el.getAttribute(key));
        });
        return res;
    };

    DOM.prototype.setAttr = function(key, val) {
        if (isString(key)) {
            this.each(function(el) {
                el.setAttribute(key, val);
            });
        } else if (isObject(key)) {
            var obj = key
            for (var key in obj) {
                this.setAttr(key, obj[key]);
            }
        }
    };

    DOM.prototype.getText = function() {
        var res = [];
        this.each(function(el) {
            res.push(el.innerText);
        });
        return res;
    };

    DOM.prototype.setText = function(text) {
        this.each(function(el) {
            el.innerText = text;
        });
    };

    DOM.prototype.getHTML = function() {
        var res = [];
        this.each(function(el) {
            res.push(el.innerHTML);
        });
        return res;
    };

    DOM.prototype.setHTML = function(html) {
        this.each(function(el) {
            el.innerHTML = html;
        });
    };

    //--------------------------------------------------------------------------
    //  Class operation methods

    DOM.prototype.addClass = function(klass) {
        this.each(function(el) {
            el.classList.add(klass);
        });
    };

    DOM.prototype.removeClass = function(klass) {
        this.each(function(el) {
            el.classList.remove(klass);
        });
    };

    DOM.prototype.hasClass = function(klass) {
        var res = [];
        this.each(function(el) {
            res.push(el.classList.contains(klass));
        });
        return res
    };

    DOM.prototype.toggleClass = function(klass, flag) {
        if (arguments.length == 2) {
            this.each(function(el) {
                el.classList.toggle(klass, flag);
            });
        } else {
            this.each(function(el) {
                el.classList.toggle(klass);
            });
        }
    };

    //--------------------------------------------------------------------------
    //  Event Control methods
    DOM.prototype.on = function(type, fn) {
        this.each(function(el) {
            el.addEventListener(type, fn);
        });
    };

    DOM.prototype.off = function(type, fn) {
        this.each(function(el) {
            el.removeEventListener(type, fn);
        });
    };

    DOM.prototype.one = function(type, fn) {
        this.each(function(el) {
            var proxy = function() {
                fn.apply(this, arguments);
                el.removeEventListener(type, proxy);
                delete proxy;
            }

            el.addEventListener(type, proxy);
        });
    };

    //--------------------------------------------------------------------------
    //  Static methods

    DOM.query = function(query, context) {
        if (query instanceof DOM) {

            return query

        } else if (!query) {

            return new DOM()

        } else if (isString(query)) {

            query = query.trim();
            if (query[0] === "<" && query.substr(-1, 1) === ">") {
                return DOM.parse(query);
            } else {
                return DOM.find(query, context);
            }

        } else if (query instanceof HTMLElement) {

            return new DOM().push(query);

        } else if (isArrayLike(query)) {

            return new DOM().concat(query);

        }
    }

    DOM.parse = function(html) {
        var context = document.createElement("div");

        context.innerHTML = html;

        var res = DOM();
        while (context.firstElementChild) {
            res.push(context.removeChild(context.firstElementChild));
        }

        return res;
    }

    DOM.find = function(query, context) {
        return DOM((context || document).querySelectorAll(query));
    };

    //--------------------------------------------------------------------------
    //  Finalize

    function chainable(fn) {
        return function() {
            var res = fn.apply(this, arguments);
            return (typeof res === "undefined") ? this : res;
        };
    }

    function isString(str) {
        return typeof str === "string";
    }

    function isObject(obj) {
        return typeof obj === "object";
    }

    function isArrayLike(arr) {
        return (arr instanceof Array) || (arr instanceof NodeList);
    }

    Object.keys(DOM.prototype).forEach(function(key) {
        DOM.prototype[key] = chainable(DOM.prototype[key]);
    });

    $ = DOM;

    return DOM;
}());
