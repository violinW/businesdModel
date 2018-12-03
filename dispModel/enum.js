'use strict';
const log4js = require('log4js');
const logger = log4js.getLogger();
const _ = require('lodash');

let enumList = {};
/**
 * 开起和关闭log
 * @type {boolean}
 */
const consoleSwitch = true;
const log = function (log) {
  consoleSwitch ? logger.info(log) : null;
};

/**
 * 枚举类型
 * @param obj 枚举类型的定义对象
 */
const enumType = function (obj) {
  /**
   * 枚举类型的结构
   */
  this.structure = ()=> {
    return obj;
  };
  /**
   * 通过value获取相应的key
   * @param value
   * @returns {*}
   */
  this.convertToKey = function (value) {
    if (typeof obj == "undefined") {
      log("传入的枚举类型定义对象有误");
      return value;
    }
    if (typeof obj.value != "object") {
      log("枚举类型" + obj.name + "定义错误!");
      return value;
    }
    var key = _.findKey(obj.value, function (item) {
      return item == value;
    });
    if (typeof key == "undefined") {
      log("在枚举类型" + obj.name + "(" + obj.describe + ")中,【" + value + "】找不到对应的键值");
      return value;
    }
    return key;
  };
  /**
   * 通过key获取相应的value
   * @param key
   * @returns {*}
   */
  this.convertToValue = function (key) {
    if (typeof obj == "undefined") {
      log("传入的枚举类型定义对象有误");
      return key;
    }
    if (typeof obj.value != "object") {
      log("枚举类型" + obj.name + "定义错误!");
      return key;
    }
    var value = obj.value[key];
    if (typeof value == "undefined") {
      log("在枚举类型" + obj.name + "(" + obj.describe + ")中,使用了未定义的键值【" + key + "】");
      return key;
    }
    return value;
  };
  this.getList = function () {
    if (typeof obj == "undefined") {
      log("传入的枚举类型定义对象有误");
      return key;
    }
    if (typeof obj.value != "object") {
      log("枚举类型" + obj.name + "定义错误!");
      return key;
    }
    var list = [];
    _.each(obj.value, function (value, key) {
      list.push({key: key, value: value});
    });
    return list;
  };
  this.getKeyList = function () {
    if (typeof obj == "undefined") {
      log("传入的枚举类型定义对象有误");
      return key;
    }
    if (typeof obj.value != "object") {
      log("枚举类型" + obj.name + "定义错误!");
      return key;
    }
    var list = [];
    _.each(obj.value, function (value, key) {
      list.push(key);
    });
    return list;
  };
  this.getValueList = function () {
    if (typeof obj == "undefined") {
      log("传入的枚举类型定义对象有误");
      return key;
    }
    if (typeof obj.value != "object") {
      log("枚举类型" + obj.name + "定义错误!");
      return key;
    }
    var list = [];
    _.each(obj.value, function (value) {
      list.push(value);
    });
    return list;
  };
};
/**
 * 实例化一个枚举类型
 * @param type 枚举类型名称
 */
let enumMaker = function (type) {
  //获取枚举类型的定义对象
  var obj = enumList[type];
  if (typeof obj == "undefined") {
    log("找不到枚举类型" + type + ",请先定义该枚举类型");
  }
  return function (obj) {
    return new enumType(obj);
  }(obj)
};

enumMaker.fn = enumMaker.prototype;
/**
 * 拓展枚举类型列表
 * @param name 枚举类型名称
 * @param obj 枚举类型定义对象
 */
enumMaker.fn.extendEnumList = function (name, obj) {
  enumList[name] = obj;
};

module.exports = enumMaker;