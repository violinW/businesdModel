/*****************************************************************
 * 青岛雨人软件有限公司©2016版权所有
 *
 * 本软件之所有（包括但不限于）源代码、设计图、效果图、动画、日志、
 * 脚本、数据库、文档均为青岛雨人软件或其附属子公司所有。任何组织
 * 或者个人，未经青岛雨人软件书面授权，不得复制、使用、修改、分发、
 * 公布本软件的任何部分。青岛雨人软件有限公司保留对任何违反本声明
 * 的组织和个人采取法律手段维护合法权益的权利。
 *****************************************************************/
'use strict';
const Logger = require('logger-romens');
const logger = new Logger();
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
  }
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