'use strict';
var enumMaker = require('./enum');

module.exports = {
    "string": function (string) {
        return string && string.toString();
    },
    "int": function (int) {
        return parseInt(int);
    },
    "float": function (float) {
        return Number(float).toFixed(2);
    },
    "boolean": function (boolean) {
        return !!boolean;
    },
    "time": function (time) {
        if (typeof time == "string") {
            time = new Date(time);
            if (time.toString() == "Invalid Date") {
                return undefined;
            }
            return time;
        }
        else return time
    },
    "enum": function (type) {
        return enumMaker(type);
    },
    "enumExtend": enumMaker.fn.extendEnumList,
    "encode": function (value) {
        return encodeURI(value);
    },
    "createUUID": function () {
        const newSingleNumber = function () {
            return Math.floor(Math.random() * 16).toString(16);
        };
        const numberGroup = function () {
            return newSingleNumber() + newSingleNumber() + newSingleNumber() + newSingleNumber();
        }
        let GUIDString = "";
        GUIDString += (numberGroup() + numberGroup());
        GUIDString += ('-' + numberGroup());
        GUIDString += ('-' + numberGroup());
        GUIDString += ('-' + numberGroup());
        GUIDString += ('-' + numberGroup());
        GUIDString += ('-' + numberGroup()+numberGroup());
        return GUIDString;
    }
};