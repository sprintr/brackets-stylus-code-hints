/*
 * Copyright (c) 2015 Amin Ullah Khan. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, brackets */

define(function (require, exports, module) {
    "use strict";
    
    var TokenUtils = brackets.getModule("utils/TokenUtils");
    
    /**
     * @enum
     *
     * Enums for the types of tokens in stylus
     */
    var TOKEN_KEY      = 1,
        TOKEN_VALUE    = 2;
    
    // Regex to match a valid stylus rule statement
    var regexRule = /^\s+([A-Za-z\-]+)(:?\s*)(.*)$/;
    
    /**
     * Returns an object representation of its own arguments
     *
     * @param {Object} token
     * @param {number} tokenType
     * @param {number} offset
     * @param {string} ruleName
     * @param {string} ruleValue
     * @return {!{token: Object, tokenType: number, offset: number, ruleName: string, ruleValue: string}}
     */
    function _createContextInfo(token, tokenType, offset, ruleName, ruleValue) {
        return {
            token: token || null,
            tokenType: tokenType || null,
            offset: offset || 0,
            ruleName: ruleName || "",
            ruleValue: ruleValue || ""
        };
    }
    
    /**
     * Returns the context info when used to define properties, values in stylus docs
     *
     * @param {Editor} editor
     * @param {!{line: number, ch: number}} pos
     * @return {!{token: Object, tokenType: number, offset: number, ruleName: string, ruleValue: string}}
     */
    function getContextInfo(editor, pos) {
        var line    = editor.document.getRange({ line: pos.line, ch: 0 }, pos),
            match   = regexRule.exec(line),
            ctx     = TokenUtils.getInitialContext(editor._codeMirror, pos),
            offset  = TokenUtils.offsetInToken(ctx);
        
        if (match && !match[2]) {
            return _createContextInfo(ctx.token, TOKEN_KEY, offset, match[1]);
        } else if (match && match[2]) {
            return _createContextInfo(ctx.token, TOKEN_VALUE, offset, match[1], match[3]);
        }
        return null;
    }
    
    function getStylusVariables(editor) {
        // TODO: Should return an array of variables defined.
    }
    
    function getStylusMixins(editor) {
        // TODO: Should return an array of mixins defined.
    }
    
    exports.getContextInfo      = getContextInfo;
    exports.TOKEN_KEY           = TOKEN_KEY;
    exports.TOKEN_VALUE         = TOKEN_VALUE;
});
