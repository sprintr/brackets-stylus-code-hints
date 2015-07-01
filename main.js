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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $*/

define(function (require, exports, module) {
    "use strict";
    
    // Load dependencies
    var CodeHintManager = brackets.getModule("editor/CodeHintManager"),
        AppInit         = brackets.getModule("utils/AppInit"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        StringMatch     = brackets.getModule("utils/StringMatch"),
        ColorUtils      = brackets.getModule("utils/ColorUtils"),
        StylusUtils     = require("StylusUtils"),
        CSSProperties   = JSON.parse(require("text!CSSProperties.json"));
    
    // StringMatcher options
    var stringMatcherOptions = {
        preferPrefixMatches: true
    };
    
    /**
     * Returns a sorted and formatted list of hints with the query substring
     * highlighted.
     * 
     * @param {Array.<Object>} hints - the list of hints to format
     * @param {string} query - querystring used for highlighting matched
     *      portions of each hint
     * @return {Array.jQuery} sorted Array of jQuery DOM elements to insert
     */
    function formatHints(hints, query) {
        var hasColorSwatches = hints.some(function (token) {
            return token.color;
        });
        
        StringMatch.basicMatchSort(hints);
        return hints.map(function (token) {
            var $hintObj = $("<span>").addClass("brackets-stylus-hints");

            // highlight the matched portion of each hint
            if (token.stringRanges) {
                token.stringRanges.forEach(function (item) {
                    if (item.matched) {
                        $hintObj.append($("<span>")
                            .text(item.text)
                            .addClass("matched-hint"));
                    } else {
                        $hintObj.append(item.text);
                    }
                });
            } else {
                $hintObj.text(token.value);
            }
            
            if (hasColorSwatches) {
                $hintObj = ColorUtils.formatColorHint($hintObj, token.color);
            }
            
            return $hintObj;
        });
    }
    
    function StylusCodeHints() {
        this.contextInfo = null;
    }
    
    StylusCodeHints.prototype.hasHints = function (editor, implicitChar) {
        if (editor.getModeForSelection() === "text/x-styl") {
            this.contextInfo = StylusUtils.getContextInfo(editor, editor.getCursorPos());
            if (this.contextInfo && this.contextInfo.tokenType) {
                this.editor = editor;
                return true;
            }
            return false;
        }
        return false;
    };
    
    StylusCodeHints.prototype.getHints = function (implicitChar) {
        var hints = [], query, contextInfo, valueArray, type;
        
        contextInfo = this.contextInfo = StylusUtils.getContextInfo(this.editor, this.editor.getCursorPos());
        
        if (this.contextInfo && this.contextInfo.tokenType) {
            query = this.contextInfo.token.string.substr(0, this.contextInfo.offset).trimRight();
            
            console.log(this.contextInfo.tokenType);
            if (this.contextInfo.tokenType === StylusUtils.TOKEN_KEY) {
                hints = $.map(Object.keys(CSSProperties), function (prop) {
                    var match = StringMatch.stringMatch(prop, query, stringMatcherOptions);
                    if (match) {
                        return match;
                    }
                });
            } else if (this.contextInfo.tokenType === StylusUtils.TOKEN_VALUE) {
                if (!CSSProperties[this.contextInfo.ruleName]) {
                    return null;
                }
                valueArray = CSSProperties[this.contextInfo.ruleName].values;
                type = CSSProperties[this.contextInfo.ruleName].type;
                
                if (type === "color") {
                    valueArray = valueArray.concat(ColorUtils.COLOR_NAMES.map(function (color) {
                        return {
                            text: color,
                            color: color
                        };
                    }));
                    valueArray.push("transparent", "currentColor");
                }
                
                hints = $.map(valueArray, function (value) {
                    var match = StringMatch.stringMatch(value.text || value, query, stringMatcherOptions);
                    if (match) {
                        if (value.color) {
                            match.color = value.color;
                        }
                        return match;
                    }
                });
            }
            return {
                hints: formatHints(hints, query),
                match: null,
                selectInitial: true,
                handleWideResults: false
            };
        }
        return null;
    };
    
    StylusCodeHints.prototype.insertHint = function (completion) {
        var contextInfo = StylusUtils.getContextInfo(this.editor, this.editor.getCursorPos()),
            pos         = this.editor.getCursorPos(),
            start       = { line: -1, ch: -1 },
            end         = { line: -1, ch: -1 };

        if (completion.jquery) {
            completion = completion.text();
        }
        start.line = end.line = pos.line;
        start.ch = contextInfo.token.start;
        end.ch = contextInfo.token.end;
        
        if (contextInfo.tokenType === StylusUtils.TOKEN_KEY) {
            completion += " ";
            this.editor.document.replaceRange(completion, start, end);
            return true;
        } else if (contextInfo.tokenType === StylusUtils.TOKEN_VALUE) {
            if (contextInfo.ruleValue.length === 0) {
                start.ch = pos.ch;
            }
            this.editor.document.replaceRange(completion, start, end);
            return false;
        }
        return false;
    };
    
    AppInit.appReady(function () {
        CodeHintManager.registerHintProvider(new StylusCodeHints(), ["stylus"], 0);
        ExtensionUtils.loadStyleSheet(module, "styles/brackets-stylus-hints.css");
    });
    
});
