"use strict";

require("core-js/modules/es6.object.define-property");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.array.index-of");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.split");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var assign = require("object-assign"); // XXX: Symbol when web support.


var PINYIN_STYLE = {
  NORMAL: 0,
  // 普通风格，不带声调。
  TONE: 1,
  // 标准风格，声调在韵母的第一个字母上。
  TONE2: 2,
  // 声调以数字形式在拼音之后，使用数字 0~4 标识。
  TO3NE: 5,
  // 声调以数字形式在声母之后，使用数字 0~4 标识。
  INITIALS: 3,
  // 仅需要声母部分。
  FIRST_LETTER: 4 // 仅保留首字母。

};
var DEFAULT_OPTIONS = {
  style: PINYIN_STYLE.TONE,
  // 风格
  segment: false,
  // 分词。
  heteronym: false // 多音字

}; // 声母表。

var INITIALS = "b,p,m,f,d,t,n,l,g,k,h,j,q,x,r,zh,ch,sh,z,c,s".split(","); // 韵母表。
//const FINALS = "ang,eng,ing,ong,an,en,in,un,er,ai,ei,ui,ao,ou,iu,ie,ve,a,o,e,i,u,v".split(",");
// 带声调字符。

var PHONETIC_SYMBOL = require("./phonetic-symbol");

var RE_PHONETIC_SYMBOL = new RegExp("([" + Object.keys(PHONETIC_SYMBOL).join("") + "])", "g");
var RE_TONE2 = /([aeoiuvnm])([0-4])$/;
/*
 * 格式化拼音为声母（Initials）形式。
 * @param {String}
 * @return {String}
 */

function initials(pinyin) {
  for (var i = 0, l = INITIALS.length; i < l; i++) {
    if (pinyin.indexOf(INITIALS[i]) === 0) {
      return INITIALS[i];
    }
  }

  return "";
}

var Pinyin =
/*#__PURE__*/
function () {
  function Pinyin(dict) {
    _classCallCheck(this, Pinyin);

    this._dict = dict;
  } // @param {String} hans 要转为拼音的目标字符串（汉字）。
  // @param {Object} options, 可选，用于指定拼音风格，是否启用多音字。
  // @return {Array} 返回的拼音列表。


  _createClass(Pinyin, [{
    key: "convert",
    value: function convert(hans, options) {
      if (typeof hans !== "string") {
        return [];
      }

      options = assign({}, DEFAULT_OPTIONS, options);
      var pys = [];
      var nohans = "";

      for (var i = 0, firstCharCode, words, l = hans.length; i < l; i++) {
        words = hans[i];
        firstCharCode = words.charCodeAt(0);

        if (this._dict[firstCharCode]) {
          // ends of non-chinese words.
          if (nohans.length > 0) {
            pys.push([nohans]);
            nohans = ""; // reset non-chinese words.
          }

          pys.push(this.single_pinyin(words, options));
        } else {
          nohans += words;
        }
      } // 清理最后的非中文字符串。


      if (nohans.length > 0) {
        pys.push([nohans]);
        nohans = ""; // reset non-chinese words.
      }

      return pys;
    } // 单字拼音转换。
    // @param {String} han, 单个汉字
    // @return {Array} 返回拼音列表，多音字会有多个拼音项。

  }, {
    key: "single_pinyin",
    value: function single_pinyin(han, options) {
      if (typeof han !== "string") {
        return [];
      }

      if (han.length !== 1) {
        return this.single_pinyin(han.charAt(0), options);
      }

      var hanCode = han.charCodeAt(0);

      if (!this._dict[hanCode]) {
        return [han];
      }

      var pys = this._dict[hanCode].split(",");

      if (!options.heteronym) {
        return [Pinyin.toFixed(pys[0], options.style)];
      } // 临时存储已存在的拼音，避免多音字拼音转换为非注音风格出现重复。


      var py_cached = {};
      var pinyins = [];

      for (var i = 0, py, l = pys.length; i < l; i++) {
        py = Pinyin.toFixed(pys[i], options.style);

        if (py_cached.hasOwnProperty(py)) {
          continue;
        }

        py_cached[py] = py;
        pinyins.push(py);
      }

      return pinyins;
    }
    /**
     * 格式化拼音风格。
     *
     * @param {String} pinyin TONE 风格的拼音。
     * @param {ENUM} style 目标转换的拼音风格。
     * @return {String} 转换后的拼音。
     */

  }, {
    key: "compare",

    /**
     * 比较两个汉字转成拼音后的排序顺序，可以用作默认的拼音排序算法。
     *
     * @param {String} hanA 汉字字符串 A。
     * @return {String} hanB 汉字字符串 B。
     * @return {Number} 返回 -1，0，或 1。
     */
    value: function compare(hanA, hanB) {
      var pinyinA = this.convert(hanA, DEFAULT_OPTIONS);
      var pinyinB = this.convert(hanB, DEFAULT_OPTIONS);
      return String(pinyinA).localeCompare(String(pinyinB));
    }
  }], [{
    key: "toFixed",
    value: function toFixed(pinyin, style) {
      var tone = ""; // 声调。

      var first_letter;
      var py;

      switch (style) {
        case PINYIN_STYLE.INITIALS:
          return initials(pinyin);

        case PINYIN_STYLE.FIRST_LETTER:
          first_letter = pinyin.charAt(0);

          if (PHONETIC_SYMBOL.hasOwnProperty(first_letter)) {
            first_letter = PHONETIC_SYMBOL[first_letter].charAt(0);
          }

          return first_letter;

        case PINYIN_STYLE.NORMAL:
          return pinyin.replace(RE_PHONETIC_SYMBOL, function ($0, $1_phonetic) {
            return PHONETIC_SYMBOL[$1_phonetic].replace(RE_TONE2, "$1");
          });

        case PINYIN_STYLE.TO3NE:
          return pinyin.replace(RE_PHONETIC_SYMBOL, function ($0, $1_phonetic) {
            return PHONETIC_SYMBOL[$1_phonetic];
          });

        case PINYIN_STYLE.TONE2:
          py = pinyin.replace(RE_PHONETIC_SYMBOL, function ($0, $1) {
            // 声调数值。
            tone = PHONETIC_SYMBOL[$1].replace(RE_TONE2, "$2");
            return PHONETIC_SYMBOL[$1].replace(RE_TONE2, "$1");
          });
          return py + tone;

        case PINYIN_STYLE.TONE:
        default:
          return pinyin;
      }
    }
  }, {
    key: "STYLE_NORMAL",
    get: function get() {
      return PINYIN_STYLE.NORMAL;
    }
  }, {
    key: "STYLE_TONE",
    get: function get() {
      return PINYIN_STYLE.TONE;
    }
  }, {
    key: "STYLE_TONE2",
    get: function get() {
      return PINYIN_STYLE.TONE2;
    }
  }, {
    key: "STYLE_TO3NE",
    get: function get() {
      return PINYIN_STYLE.TO3NE;
    }
  }, {
    key: "STYLE_INITIALS",
    get: function get() {
      return PINYIN_STYLE.INITIALS;
    }
  }, {
    key: "STYLE_FIRST_LETTER",
    get: function get() {
      return PINYIN_STYLE.FIRST_LETTER;
    }
  }, {
    key: "DEFAULT_OPTIONS",
    get: function get() {
      return DEFAULT_OPTIONS;
    }
  }]);

  return Pinyin;
}();

module.exports = Pinyin;