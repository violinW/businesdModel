'use strict';
const _ = require('lodash');
const log4js = require('log4js');
const logger = log4js.getLogger();

module.exports = (dataType)=>{
    /**
     * 开起和关闭log
     * @type {boolean}
     */
    var consoleSwitch = true;
    var log = function (log, type) {
        consoleSwitch ? logger[type||'error']("[dataStructure]" + log) : null;
    };
    /**
     * 模型创建器
     * @param model
     */
    var modelCreator = function (model) {
        this.model = model;
        /**
         * 当前模型的key字段名称
         */
        this.key = _.findKey(model.structure, function (item) {
            return item.key
        });
        /**
         * 暂存显示数据
         * @type {{}}
         */
        this.displayData = {};
        /**
         * 暂存源数据
         * @type {{}}
         */
        this.sourceData = {};
        /**
         * 设置模型的继承属性
         * @param inheritModel Array
         */
        this.inheritOrganizer = function (inheritModel) {
            var me = this;
            _.each(inheritModel, function (item) {
                me.model.structure = _.extend({}, model.structure, item.getStructure());
            })
        };
        /**
         * 元数据映射为显示数据
         * @param displayData
         * @param changeDisplay
         * @returns {{}}
         */
        this.displayToSource = function (displayData, changeDisplay) {
            var me = this;
            !changeDisplay ? this.displayData = displayData : null;
            //如果displayData是一个数组则单独处理每一个子元素
            if (displayData instanceof Array) {
                var sourceArray = [];
                _.each(displayData, function (item) {
                  var source = me.displayToSource(item, true);
                    sourceArray.push(JSON.parse(JSON.stringify(source)));
                });
                this.sourceData = sourceArray;
                return sourceArray;
            }
            var sourceData = {};//显示数据
            //将源数据遍历,映射到显示模型
            _.each(displayData, function (value, key) {
                var sourceFieldName = _.findKey(me.model.structure, function (item) {
                    return item.mappingName == key;
                });
                if (typeof sourceFieldName != "undefined") {
                    var sourceModel = me.model.structure[sourceFieldName];
                    sourceData[sourceFieldName] = me.dataOfSource(value, sourceModel.type);
                }
            });
            this.sourceData = this.sourceDataCheck(sourceData);
            return sourceData;
        };
        /**
         * 检查需要处理的字段
         * @param sourceData
         * @returns {*}
         */
        this.sourceDataCheck = function (sourceData) {
            _.each(this.model.structure, function (value, key) {
                //mappingName不存在时通过mappingType处理数据
                if (typeof value.mappingName == "undefined") {
                    sourceData[key] = value.mappingType(sourceData);
                }
                if (typeof sourceData[key] == "undefined") {
                    log("在源数据中找不到" + key + "(" + value.describe + ")对应的字段", 'warn');
                    //displayData[key] = undefined;
                }
            });
            return sourceData;
        };
        /**
         * 显示数据映射为源数据
         * @param sourceData
         * @returns {{}}
         */
        this.sourceToDisplay = function (sourceData) {
            var me = this;
            this.sourceData = sourceData;
            if (sourceData instanceof Array) {
                var displayArray = [];
                _.each(sourceData, function (item) {
                    var disp = me.sourceToDisplay(item);
                    displayArray.push(JSON.parse(JSON.stringify(disp)));
                });
                this.sourceData = sourceData;
                return displayArray;
            }
            var displayData = {};
            _.each(sourceData, function (value, key) {
                var dispFieldName = me.model.structure[key] && me.model.structure[key].mappingName;
                if (typeof dispFieldName != "undefined") {
                    displayData[dispFieldName] = me.dataOfDisplay(value, me.model.structure[key].mappingType);
                }else{
                    displayData[key] = value;
                }
            });
            if (this.displayData instanceof Array) {
                var oldDisplayData = this.displayData[_.findIndex(this.displayData, function (chr) {
                    return chr.id == displayData.id
                })];
                displayData = _.assign(oldDisplayData, displayData);
            } else
                displayData = _.assign(this.displayData, displayData);
            return displayData;
        };
        /**
         * 改变源模型某个字段的值
         * @param key 当数据是一个数组时传入数据的下标
         * @param field 字段名称
         * @param value 改变后的值
         * @returns {{}}
         */
        this.changeSourceDataField = function (key, field, value) {
            var me = this;
            var CorrectValue = this.dataOfSource(value, this.model.structure[field].type);
            var sourceData = this.sourceData;
            if (sourceData instanceof Array) {
                var index = _.findIndex(sourceData, function (item) {
                    return item[me.key] == key;
                });
                if (index != -1) {
                    sourceData[index][field] = CorrectValue;
                    sourceData[index] = this.sourceDataCheck(sourceData[index]);
                }
            } else {
                sourceData[field] = CorrectValue;
                sourceData = this.sourceDataCheck(sourceData);
            }
            this.sourceData = sourceData;
            return this.sourceData;
        };
        this.countForField = function (fieldName) {
            var count = 0;
            _.each(this.sourceData, function (item) {
                count += (+item[fieldName]);
            });
            return count
        };
        /**
         * 将某源数据字段转换成显示数据字段
         * @param value
         * @param type
         * @returns {*}
         */
        this.dataOfSource = function (value, type) {
            var newValue;
            switch (type) {
                case "string":
                    newValue = dataType.string(value);
                    break;
                case "int":
                    newValue = dataType.int(value);
                    break;
                case "float":
                    newValue = dataType.float(value);
                    break;
                case "boolean":
                    newValue = dataType.boolean(value);
                    break;
                case "time":
                    newValue = dataType.time(value);
                    break;
                case "encode":
                    newValue = dataType.encode(value);
                    break;
                default:
                    if (/^enum/.test(type)) {
                        var enumType = type.split('|')[1];
                        if (typeof enumType == "undefined")
                            log("找不到枚举类型" + type);
                        newValue = dataType.enum(enumType).convertToValue(value);
                    }
                    else
                        newValue = value;
            }
            return newValue;
        };
        /**
         * 将某显示数据字段转换成源数据字段
         * @param value
         * @param type
         * @returns {*}
         */
        this.dataOfDisplay = function (value, type) {
            var newValue;
            switch (type) {
                case "string":
                    if (value instanceof Date)
                        newValue = value.toLocaleTimeString();
                    else
                        newValue = dataType.string(value);
                    break;
                case "int":
                    newValue = dataType.int(value);
                    break;
                case "float":
                    newValue = dataType.float(value);
                    break;
                case "boolean":
                    newValue = dataType.boolean(value);
                    break;
                case "time":
                    newValue = dataType.time(value);
                    break;
                case "encode":
                    newValue = dataType.encode(value);
                    break;
                default:
                    if (/^enum/.test(type)) {
                        var enumType = type.split('|')[1];
                        if (typeof enumType == "undefined")
                            log("找不到枚举类型" + type);
                        newValue = dataType.enum(enumType).convertToKey(value);
                    }
                    else
                        newValue = value;
            }
            return newValue;
        };
        /**
         * 获取默认数据
         * @returns {{}}
         */
        this.getDefaultData = function () {
            var data = {};
            _.each(this.model.structure, function (value, key) {
                data[value.mappingName] = value.defaultValue;
            });
            return data;
        };
        /**
         * 获取列字段数组
         */
        this.getColumnsList = function () {
            var columns = [];
            _.each(this.model.structure, function (value, key) {
                columns.push(key)
            });
            return columns;

        },
        /**
         * 获取模型的结构
         * @returns {*}
         */
          this.getStructure = function () {
              return this.model.structure;
          };
        /**
         * 获取源数据
         * @returns {{}}
         */
        this.getSourceData = function () {
            return this.sourceData;
        };
        /**
         * 获取显示数据
         * @returns {{}}
         */
        this.getDisplayData = function () {
            return this.displayData;
        };
    };

    /**
     * 模型图书馆
     */
    var modelLibrary = function () {
        this.list = {};
        this.getModel = function (name) {
            var model = this.list[name];
            if (typeof model == "undefined"){
                log("找不到数据结构模型" + name,'fatal');
                return undefined;
            }
            return this.list[name];
        };
        this.setModel = function (model) {
            this.list[model.name] = new modelCreator(model);
            return this.list[model.name];
        }
    };

    /**
     * 模型列表
     */
    return new modelLibrary();
}