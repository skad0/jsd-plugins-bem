/**
 * @module my-module
 */

modules.define('my-module', function(provide) {

/**
 * @class ModuleClass
 * @exports my-module
 */
var ModuleClass = inherit(/** @lends ModuleClass.prototype */{
    /**
     * Description of method1
     * @returns {ModuleClass}
     */
    method1 : function() {

    }
});

provide(ModuleClass);

});