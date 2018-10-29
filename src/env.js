/**
 * Base namespace for Skulpt. This is the only symbol that Skulpt adds to the
 * global namespace. Other user accessible symbols are noted and described
 * below.
 */

var Sk = Sk || {}; //jshint ignore:line

/**
 *
 * Set various customizable parts of Skulpt.
 *
 * output: Replacable output redirection (called from print, etc.).
 * read: Replacable function to load modules with (called via import, etc.)
 * sysargv: Setable to emulate arguments to the script. Should be an array of JS
 * strings.
 * syspath: Setable to emulate PYTHONPATH environment variable (for finding
 * modules). Should be an array of JS strings.
 *
 * Any variables that aren't set will be left alone.
 */
Sk.configure = function (options) {
    "use strict";
    Sk.output = options["output"] || Sk.output;
    goog.asserts.assert(typeof Sk.output === "function");

    Sk.debugout = options["debugout"] || Sk.debugout;
    goog.asserts.assert(typeof Sk.debugout === "function");

    Sk.uncaughtException = options["uncaughtException"] || Sk.uncaughtException;
    goog.asserts.assert(typeof Sk.uncaughtException === "function");

    Sk.read = options["read"] || Sk.read;
    goog.asserts.assert(typeof Sk.read === "function");

    Sk.timeoutMsg = options["timeoutMsg"] || Sk.timeoutMsg;
    goog.asserts.assert(typeof Sk.timeoutMsg === "function");
    goog.exportSymbol("Sk.timeoutMsg", Sk.timeoutMsg);

    Sk.sysargv = options["sysargv"] || Sk.sysargv;
    goog.asserts.assert(goog.isArrayLike(Sk.sysargv));

    Sk.python3 = options["python3"] || Sk.python3;
    goog.asserts.assert(typeof Sk.python3 === "boolean");

    Sk.imageProxy = options["imageProxy"] || "http://localhost:8080/320x";
    goog.asserts.assert(typeof Sk.imageProxy === "string");

    Sk.inputfun = options["inputfun"] || Sk.inputfun;
    goog.asserts.assert(typeof Sk.inputfun === "function");
    
    Sk.inputfunTakesPrompt = options["inputfunTakesPrompt"] || false;
    goog.asserts.assert(typeof Sk.inputfunTakesPrompt === "boolean");

    //add turtle_input
    Sk.turtle_textinput = options["turtle_textinput"] || Sk.turtle_textinput;
    goog.asserts.assert(typeof Sk.turtle_textinput === "function");

    Sk.retainGlobals = options["retainglobals"] || false;
    goog.asserts.assert(typeof Sk.retainGlobals === "boolean");

    Sk.debugging = options["debugging"] || false;
    goog.asserts.assert(typeof Sk.debugging === "boolean");

    Sk.breakpoints = options["breakpoints"] || function() { return true; };
    goog.asserts.assert(typeof Sk.breakpoints === "function");

    Sk.setTimeout = options["setTimeout"];
    if (Sk.setTimeout === undefined) {
        if (typeof setTimeout === "function") {
            Sk.setTimeout = function(func, delay) { setTimeout(func, delay); };
        } else {
            Sk.setTimeout = function(func, delay) { func(); };
        }
    }
    goog.asserts.assert(typeof Sk.setTimeout === "function");

    if ("execLimit" in options) {
        Sk.execLimit = options["execLimit"];
    }

    if ("yieldLimit" in options) {
        Sk.yieldLimit = options["yieldLimit"];
    }

    if (options["syspath"]) {
        Sk.syspath = options["syspath"];
        goog.asserts.assert(goog.isArrayLike(Sk.syspath));
        // assume that if we're changing syspath we want to force reimports.
        // not sure how valid this is, perhaps a separate api for that.
        Sk.realsyspath = undefined;
        Sk.sysmodules = new Sk.builtin.dict([]);
    }

    Sk.misceval.softspace_ = false;

    Sk.switch_version(Sk.python3);
};
goog.exportSymbol("Sk.configure", Sk.configure);

/*
 * Replaceable handler for uncaught exceptions
 */
Sk.uncaughtException = function(err) {
    throw err;
};
goog.exportSymbol("Sk.uncaughtException", Sk.uncaughtException);

/*
 *	Replaceable message for message timeouts
 */
Sk.timeoutMsg = function () {
    return "Program exceeded run time limit.";
};
goog.exportSymbol("Sk.timeoutMsg", Sk.timeoutMsg);

/*
 *  Hard execution timeout, throws an error. Set to null to disable
 */
Sk.execLimit = Number.POSITIVE_INFINITY;

/*
 *  Soft execution timeout, returns a Suspension. Set to null to disable
 */
Sk.yieldLimit = Number.POSITIVE_INFINITY;

/*
 * Replacable output redirection (called from print, etc).
 */
Sk.output = function (x) {
};

/*
 * Replacable function to load modules with (called via import, etc.)
 * todo; this should be an async api
 */
Sk.read = function (x) {
    throw "Sk.read has not been implemented";
};

/*
 * Setable to emulate arguments to the script. Should be array of JS strings.
 */
Sk.sysargv = [];

// lame function for sys module
Sk.getSysArgv = function () {
    return Sk.sysargv;
};
goog.exportSymbol("Sk.getSysArgv", Sk.getSysArgv);


/**
 * Setable to emulate PYTHONPATH environment variable (for finding modules).
 * Should be an array of JS strings.
 */
Sk.syspath = [];

Sk.inBrowser = goog.global["document"] !== undefined;

/**
 * Internal function used for debug output.
 * @param {...} args
 */
Sk.debugout = function (args) {
};

(function () {
    // set up some sane defaults based on availability
    if (goog.global["write"] !== undefined) {
        Sk.output = goog.global["write"];
    } else if (goog.global["console"] !== undefined && goog.global["console"]["log"] !== undefined) {
        Sk.output = function (x) {
            goog.global["console"]["log"](x);
        };
    } else if (goog.global["print"] !== undefined) {
        Sk.output = goog.global["print"];
    }
    if (goog.global["print"] !== undefined) {
        Sk.debugout = goog.global["print"];
    }
}());

// override for closure to load stuff from the command line.
if (!Sk.inBrowser) {
    goog.global.CLOSURE_IMPORT_SCRIPT = function (src) {
        goog.global["eval"](goog.global["read"]("support/closure-library/closure/goog/" + src));
        return true;
    };
}

Sk.python3 = false;
Sk.inputfun = function (args) {
    return window.prompt(args);
};
// Sk add function
Sk.turtle_textinput = function(title, prompt){
    return new Promise(function(resolve){
        var cover = document.createElement("div");
        cover.id = "cover";
        cover.style.position = "fixed";
        cover.style.width = "100%";
        cover.style.height = "100%";
        cover.style.top = "0px";
        cover.style.left = "0px";
        cover.style.background = "rgba(0,0,0,0.4)";
        cover.style.display = "flex";
        cover.style.alignItems = "center";
        cover.style.justifyContent = "center";
        cover.style.zIndex = "99";
        document.body.appendChild(cover);
        var inputModal = document.createElement("div");
        inputModal.style.width = "400px";
        inputModal.style.height = "200px";
        inputModal.style.border="1px solid #666";
        inputModal.style.zIndex = "1000";
        inputModal.style.background="#fff";
        cover.appendChild(inputModal);
        var modal_header = document.createElement("div");
        var titleDom = document.createElement("span");
        titleDom.innerHTML = title;
        var closeBtn = document.createElement("button");
        closeBtn.innerHTML = "X";
        closeBtn.style.border = "none";
        closeBtn.style.background = "#cee2ff";
        modal_header.style.display="flex";
        modal_header.style.alignItems="center";
        modal_header.style.justifyContent="space-between";
        modal_header.style.paddingLeft = "10px";
        modal_header.style.paddingRight = "10px";
        modal_header.style.background = "#cee2ff";
        modal_header.style.lineHeight = "40px";
        modal_header.appendChild(titleDom);
        modal_header.appendChild(closeBtn);
        inputModal.appendChild(modal_header);
        var modal_body = document.createElement("div");
        modal_body.style.textAlign="center";
        modal_body.style.marginBottom="20px";
        var content = document.createElement("span");
        content.innerHTML = prompt;
        content.style.display="block";
        content.style.marginBottom="10px";
        content.style.marginTop="10px";
        modal_body.appendChild(content);
        var input = document.createElement("input");
        input.type = "text";
        input.id="text_input";
        input.style.width="180px";
        input.style.height="25px";
        input.style.border="1px solid #cee2ff";
        modal_body.appendChild(input);
        inputModal.appendChild(modal_body);
        var modal_footer = document.createElement("div");
        modal_footer.style.textAlign="center";
        var cancelBtn = document.createElement("button");
        cancelBtn.type="button";
        cancelBtn.id = "cancel";
        cancelBtn.style.border="1px solid #898989";
        cancelBtn.style.width="60px";
        cancelBtn.style.height = "30px";
        cancelBtn.style.fontWeight="bold";
        cancelBtn.innerHTML = "取消";
        var primaryBtn = document.createElement("button");
        primaryBtn.type = "button";
        primaryBtn.id = "confirm";
        primaryBtn.innerHTML = "确定";
        primaryBtn.style.marginLeft="40px";
        primaryBtn.style.width="60px";
        primaryBtn.style.height="30px";
        primaryBtn.style.background="#4d97ff";
        primaryBtn.style.fontWeight="bold";
        modal_footer.appendChild(cancelBtn);
        modal_footer.appendChild(primaryBtn);
        inputModal.appendChild(modal_footer);
        cancelBtn.onclick = function(){
            document.body.removeChild(cover);
        };
        closeBtn.onclick = function(){
            document.body.removeChild(cover);
        };
        primaryBtn.onclick = function(){
            var text_input = input.value;
            document.body.removeChild(cover);
            resolve(text_input);
        };
    });
};

Sk.turtle_numinput = function(title, prompt, defaultVal, minval, maxval){
    return new Promise(function(resolve){
        var cover = document.createElement("div");
        cover.id = "cover";
        cover.style.position = "fixed";
        cover.style.width = "100%";
        cover.style.height = "100%";
        cover.style.top = "0px";
        cover.style.left = "0px";
        cover.style.background = "rgba(0,0,0,0.4)";
        cover.style.display = "flex";
        cover.style.alignItems = "center";
        cover.style.justifyContent = "center";
        cover.style.zIndex = "99";
        document.body.appendChild(cover);
        var inputModal = document.createElement("div");
        inputModal.style.width = "400px";
        inputModal.style.height = "200px";
        inputModal.style.border="1px solid #666";
        inputModal.style.zIndex = "1000";
        inputModal.style.background="#fff";
        cover.appendChild(inputModal);
        var modal_header = document.createElement("div");
        var titleDom = document.createElement("span");
        titleDom.innerHTML = title;
        var closeBtn = document.createElement("button");
        closeBtn.innerHTML = "X";
        closeBtn.style.border = "none";
        closeBtn.style.background = "#cee2ff";
        modal_header.style.display="flex";
        modal_header.style.alignItems="center";
        modal_header.style.justifyContent="space-between";
        modal_header.style.paddingLeft = "10px";
        modal_header.style.paddingRight = "10px";
        modal_header.style.background = "#cee2ff";
        modal_header.style.lineHeight = "40px";
        modal_header.appendChild(titleDom);
        modal_header.appendChild(closeBtn);
        inputModal.appendChild(modal_header);
        var modal_body = document.createElement("div");
        modal_body.style.textAlign="center";
        modal_body.style.marginBottom="10px";
        var content = document.createElement("span");
        content.innerHTML = prompt;
        content.style.display="block";
        content.style.marginBottom="10px";
        content.style.marginTop="10px";
        modal_body.appendChild(content);
        var input = document.createElement("input");
        input.type = "number";
        input.id="text_input";
        input.style.width="180px";
        input.style.height="25px";
        input.style.border="1px solid #cee2ff";
        input.value = defaultVal;
        modal_body.appendChild(input);
        inputModal.appendChild(modal_body);
        var modal_footer = document.createElement("div");
        modal_footer.style.textAlign="center";
        var cancelBtn = document.createElement("button");
        cancelBtn.type="button";
        cancelBtn.id = "cancel";
        cancelBtn.style.border="1px solid #898989";
        cancelBtn.style.width="60px";
        cancelBtn.style.height = "30px";
        cancelBtn.style.fontWeight="bold";
        cancelBtn.innerHTML = "取消";
        var primaryBtn = document.createElement("button");
        primaryBtn.type = "button";
        primaryBtn.id = "confirm";
        primaryBtn.innerHTML = "确定";
        primaryBtn.style.marginLeft="40px";
        primaryBtn.style.width="60px";
        primaryBtn.style.height="30px";
        primaryBtn.style.background="#4d97ff";
        primaryBtn.style.fontWeight="bold";
        modal_footer.appendChild(cancelBtn);
        modal_footer.appendChild(primaryBtn);
        inputModal.appendChild(modal_footer);
        cancelBtn.onclick = function(){
            document.body.removeChild(cover);
        };
        closeBtn.onclick = function(){
            document.body.removeChild(cover);
        };
        primaryBtn.onclick = function(){
            var text_input = input.value;
            var errorDom = document.getElementById("tip");
            if ((text_input < minval || text_input > maxval)){
                if(!errorDom){
                    var errorText = document.createElement("span");
                    errorText.id = "tip";
                    errorText.innerHTML = "输入的数组在"+minval+"~"+maxval+"之间";
                    errorText.style.fontSize="14px";
                    errorText.style.color="red";
                    errorText.style.display = "block";
                    errorText.style.marginTop="5px";
                    modal_body.appendChild(errorText);
                }
                return;
            } else if(text_input > minval && text_input < maxval && errorDom){
                modal_body.removeChild(errorDom);
            }
            document.body.removeChild(cover);
            resolve(text_input);
        };
    });
};



// Information about method names and their internal functions for
// methods that differ (in visibility or name) between Python 2 and 3.
//
// Format:
//   internal function: {
//     "classes" : <array of affected classes>,
//     2 : <visible Python 2 method name> or null if none
//     3 : <visible Python 3 method name> or null if none
//   },
//   ...

Sk.setup_method_mappings = function () {
    Sk.methodMappings = {
        "round$": {
            "classes": [Sk.builtin.float_,
                        Sk.builtin.int_,
                        Sk.builtin.nmber],
            2: null,
            3: "__round__"
        },
        "next$": {
            "classes": [Sk.builtin.dict_iter_,
                        Sk.builtin.list_iter_,
                        Sk.builtin.set_iter_,
                        Sk.builtin.str_iter_,
                        Sk.builtin.tuple_iter_,
                        Sk.builtin.generator,
                        Sk.builtin.enumerate,
                        Sk.builtin.iterator],
            2: "next",
            3: "__next__"
        }
    };
};

Sk.switch_version = function (python3) {
    var internal, klass, classes, idx, len, newmeth, oldmeth;

    if (!Sk.hasOwnProperty("methodMappings")) {
        Sk.setup_method_mappings();
    }

    for (internal in Sk.methodMappings) {
        if (python3) {
            newmeth = Sk.methodMappings[internal][3];
            oldmeth = Sk.methodMappings[internal][2];
        } else {
            newmeth = Sk.methodMappings[internal][2];
            oldmeth = Sk.methodMappings[internal][3];
        }
        classes = Sk.methodMappings[internal]["classes"];
        len = classes.length;
        for (idx = 0; idx < len; idx++) {
            klass = classes[idx];
            if (oldmeth && klass.prototype.hasOwnProperty(oldmeth)) {
                delete klass.prototype[oldmeth];
            }
            if (newmeth) {
                klass.prototype[newmeth] = new Sk.builtin.func(klass.prototype[internal]);
            }
        }
    }
};

goog.exportSymbol("Sk.python3", Sk.python3);
goog.exportSymbol("Sk.inputfun", Sk.inputfun);
goog.exportSymbol("Sk.turtle_textinput", Sk.turtle_textinput);
goog.require("goog.asserts");
