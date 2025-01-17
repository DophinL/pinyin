"use strict"; // 解压拼音库。
// @param {Object} dict_combo, 压缩的拼音库。
// @param {Object} 解压的拼音库。

require("core-js/modules/es6.function.bind");

function buildPinyinCache(dict_combo) {
  var hans;
  var uncomboed = {};

  for (var py in dict_combo) {
    hans = dict_combo[py];

    for (var i = 0, han, l = hans.length; i < l; i++) {
      han = hans.charCodeAt(i);

      if (!uncomboed.hasOwnProperty(han)) {
        uncomboed[han] = py;
      } else {
        uncomboed[han] += "," + py;
      }
    }
  }

  return uncomboed;
}

var PINYIN_DICT = buildPinyinCache(require("../data/dict-zi-web"));

var Pinyin = require("./pinyin");

var pinyin = new Pinyin(PINYIN_DICT);
module.exports = pinyin.convert.bind(pinyin);
module.exports.compare = pinyin.compare.bind(pinyin);
module.exports.STYLE_NORMAL = Pinyin.STYLE_NORMAL;
module.exports.STYLE_TONE = Pinyin.STYLE_TONE;
module.exports.STYLE_TONE2 = Pinyin.STYLE_TONE2;
module.exports.STYLE_TO3NE = Pinyin.STYLE_TO3NE;
module.exports.STYLE_INITIALS = Pinyin.STYLE_INITIALS;
module.exports.STYLE_FIRST_LETTER = Pinyin.STYLE_FIRST_LETTER;