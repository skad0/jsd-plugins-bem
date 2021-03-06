var JSPATH = require('jspath');

module.exports = function(jsdoc) {
    jsdoc
        .registerParser(['class', 'lends'], String)
        .registerParser('member', function(comment) {
            var match = comment.match(/^(?:{([^}]+)}\s*)?(.*?)\s*$/);
            return {
                jsType : require('./util/js-type').parse(match[1]),
                of : match[2]
            };
        })
        .registerBuilder('class', function(tag) {
            return this.currentClass = addClassNode(this, tag.content);
        })
        .registerBuilder('lends', function(tag, curJsdocNode, parentJsdocNode) {
            var matches = tag.content.split('.'),
                classNode = addClassNode(this, matches[0]),
                lendsProp = matches[matches.length - 1] === 'prototype'?
                    'proto' :
                    'static';

            if(curJsdocNode === parentJsdocNode)
                return classNode[lendsProp];
            else  // in case of many @lends on one ast node
                classNode[lendsProp] = curJsdocNode;
        })
        .registerBuilder('member', function(tag, curJsdocNode, parentNode, astNode) {
            var assigmentExpression = '{.type === "AssignmentExpression"}' +
                    '.left{.type === "MemberExpression" && .object.type === "ThisExpression"}' +
                        '.property{.type === "Identifier"}.name',
                name = JSPATH(
                    '.(' +
                        '.{.type === "ExpressionStatement"}' +
                            '.expression' + assigmentExpression +
                        '|' +
                        '.' + assigmentExpression +
                    ')[0]',
                    astNode);

            if(!name) throw Error('Using @member for unsupported statement');

            var className = tag.of || (this.currentClass && this.currentClass.name);
            if(!className) throw Error('Using @member for undetected class');

            var jsdocNode = { jsdocType : 'type', jsType : tag.jsType };
            addClassNode(this, className).members.props.push({ key : name, val : jsdocNode });
            return jsdocNode;
        })
        .registerPostprocessor('class', function(jsdocNode) {
            ['static', 'proto', 'members'].forEach(function(k) {
                if(!jsdocNode[k].props.length) delete jsdocNode[k];
            });
        });
};

function addClassNode(ctx, name) {
    var classes = ctx.classes || (ctx.classes = {});
    return classes[name] || (classes[name] = {
        jsdocType : 'class',
        name : name,
        'static' : { jsdocType : 'type', jsType : 'Object', props : [] },
        proto : { jsdocType : 'type', jsType : 'Object', props : [] },
        members : { jsdocType : 'type', jsType : 'Object', props : [] }
    });
}
