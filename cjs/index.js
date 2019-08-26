"use strict";

require("core-js/modules/es6.function.bind");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.define-property");

require("core-js/modules/es6.reflect.get");

require("core-js/modules/es6.object.create");

require("core-js/modules/es6.object.set-prototype-of");

require("core-js/modules/es6.array.for-each");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var assign = require("object-assign");

var PINYIN_DICT = require("../data/dict-zi");

var Pinyin = require("./pinyin");

var jieba;
var PHRASES_DICT;

var NodePinyin =
/*#__PURE__*/
function (_Pinyin) {
  _inherits(NodePinyin, _Pinyin);

  function NodePinyin() {
    _classCallCheck(this, NodePinyin);

    return _possibleConstructorReturn(this, _getPrototypeOf(NodePinyin).apply(this, arguments));
  }

  _createClass(NodePinyin, [{
    key: "convert",
    // @param {String} hans 要转为拼音的目标字符串（汉字）。
    // @param {Object} options, 可选，用于指定拼音风格，是否启用多音字。
    // @return {Array} 返回的拼音列表。
    value: function convert(hans, options) {
      if (typeof hans !== "string") {
        return [];
      }

      options = assign({}, Pinyin.DEFAULT_OPTIONS, options);
      var phrases = options && options.segment ? segment(hans) : hans;
      var pys = [];
      var nohans = "";

      for (var i = 0, firstCharCode, words, l = phrases.length; i < l; i++) {
        words = phrases[i];
        firstCharCode = words.charCodeAt(0);

        if (PINYIN_DICT[firstCharCode]) {
          // ends of non-chinese words.
          if (nohans.length > 0) {
            pys.push([nohans]);
            nohans = ""; // reset non-chinese words.
          }

          if (words.length === 1) {
            pys = pys.concat(_get(_getPrototypeOf(NodePinyin.prototype), "convert", this).call(this, words, options));
          } else {
            pys = pys.concat(this.phrases_pinyin(words, options));
          }
        } else {
          nohans += words;
        }
      } // 清理最后的非中文字符串。


      if (nohans.length > 0) {
        pys.push([nohans]);
        nohans = ""; // reset non-chinese words.
      }

      return pys;
    } // 词语注音
    // @param {String} phrases, 指定的词组。
    // @param {Object} options, 选项。
    // @return {Array}

  }, {
    key: "phrases_pinyin",
    value: function phrases_pinyin(phrases, options) {
      var py = [];

      if (PHRASES_DICT.hasOwnProperty(phrases)) {
        //! copy pinyin result.
        PHRASES_DICT[phrases].forEach(function (item, idx) {
          py[idx] = [];

          if (options.heteronym) {
            item.forEach(function (py_item, py_index) {
              py[idx][py_index] = Pinyin.toFixed(py_item, options.style);
            });
          } else {
            py[idx][0] = Pinyin.toFixed(item[0], options.style);
          }
        });
      } else {
        for (var i = 0, l = phrases.length; i < l; i++) {
          py = py.concat(_get(_getPrototypeOf(NodePinyin.prototype), "convert", this).call(this, phrases[i], options));
        }
      }

      return py;
    }
  }]);

  return NodePinyin;
}(Pinyin);

function segment(hans) {
  try {
    jieba = jieba || require("nodejieba");
  } catch (ex) {
    console.error();
    console.error("    Segment need nodejieba, please run '$ npm install nodejieba'.");
    console.error("    分词需要使用 nodejieba 模块，请运行 '$ npm install nodejieba' 并确保安装完成。");
    console.error();
    throw ex;
  } // 词语拼音库。


  PHRASES_DICT = PHRASES_DICT || require("../data/phrases-dict");
  return jieba.cutSmall(hans, 4);
}

var pinyin = new NodePinyin(PINYIN_DICT);
module.exports = pinyin.convert.bind(pinyin);
module.exports.compare = pinyin.compare.bind(pinyin);
module.exports.STYLE_NORMAL = Pinyin.STYLE_NORMAL;
module.exports.STYLE_TONE = Pinyin.STYLE_TONE;
module.exports.STYLE_TONE2 = Pinyin.STYLE_TONE2;
module.exports.STYLE_TO3NE = Pinyin.STYLE_TO3NE;
module.exports.STYLE_INITIALS = Pinyin.STYLE_INITIALS;
module.exports.STYLE_FIRST_LETTER = Pinyin.STYLE_FIRST_LETTER;