/*****************************************************************
 * 青岛雨人软件有限公司©2016版权所有
 *
 * 本软件之所有（包括但不限于）源代码、设计图、效果图、动画、日志、
 * 脚本、数据库、文档均为青岛雨人软件或其附属子公司所有。任何组织
 * 或者个人，未经青岛雨人软件书面授权，不得复制、使用、修改、分发、
 * 公布本软件的任何部分。青岛雨人软件有限公司保留对任何违反本声明
 * 的组织和个人采取法律手段维护合法权益的权利。
 *****************************************************************/

/**
 * 中富用户基础信息模型
 */
modelList.setModel({
    name: "zfBasicUserInfo",
    describe: "中富用户基础信息模型",
    structure: {
        "clientArea": {
            "type": "string",
            "describe": "客户所属区域",
            "mappingName": "clientArea",
            "mappingType": "string",
            "defaultValue": dataType.string("成都")
        },
        "reason": {
            "type": "string",
            "describe": "退回原因",
            "mappingName": "reason",
            "mappingType": "string",
            "defaultValue": dataType.string("退回原因abc")
        },
        "legalRepresentative": {
            "type": "string",
            "describe": "法人代表",
            "mappingName": "legalRepresentative",
            "mappingType": "string",
            "defaultValue": dataType.string("法人代表")
        },
        "registeredCapital": {
            "type": "string",
            "describe": "注册资本",
            "mappingName": "registeredCapital",
            "mappingType": "string",
            "defaultValue": dataType.string("注册资本")
        },
        "businessAddress": {
            "type": "string",
            "describe": "营业地址",
            "mappingName": "businessAddress",
            "mappingType": "string",
            "defaultValue": dataType.string("营业地址")
        },
        "clientName": {
            "type": "string",
            "describe": "客户名称",
            "mappingName": "clientName",
            "mappingType": "string",
            "defaultValue": dataType.string("joy")
        },
        "mobile": {
            "type": "string",
            "describe": "手机号",
            "mappingName": "mobile",
            "mappingType": "string",
            "defaultValue": dataType.string(18000000000)
        },
        "clientCode": {
            "type": "string",
            "describe": "客户编号",
            "mappingName": "clientCode",
            "mappingType": "string",
            "defaultValue": dataType.string(435473767)
        },
        "enabled": {
            "type": "enum|enabled",
            "describe": "禁用标志",
            "mappingName": "enabled",
            "mappingType": "enum|enabled",
            "defaultValue": dataType.enum("enabled").convertToValue("NEEDAPPROVAL")
        },
        "readOnly": {
            "type": "enum|readOnly",
            "describe": "停购标志",
            "mappingName": "readOnly",
            "mappingType": "enum|readOnly",
            "defaultValue": dataType.enum("readOnly").convertToValue(0)
        },
        "status": {
            "type": "string",
            "describe": "禁用停购显示字段",
            "mappingType": function (data) {
                return data.enabled + "/" + data.readOnly
            },
            "defaultValue": dataType.string("成都")
        }
    }
});

/**
 * 中富客户基础数据模型
 */
modelList.setModel({
    name: "zfClientBasic",
    describe: "中富客户基础模型",
    structure: {
        "id": {
            "type": "int",
            "describe": "客户id",
            "key": true,
            "mappingName": "id",
            "mappingType": "int",
            "defaultValue": dataType.int("1")
        },
        "key": {
            "type": "int",
            "describe": "key",
            "mappingType": function (data) {
                return data.id;
            },
            "defaultValue": dataType.int("1")
        }
    }
}).inheritOrganizer([modelList.getModel("zfBasicUserInfo")]);

/**
 * 中富用户GSP数据模型
 */
modelList.setModel({
    name: "zfUserGSP",
    describe: "中富用户GSP模型",
    structure: {
        "businessLicense": {
            "type": "string",
            "describe": "营业执照号",
            "mappingName": "businessLicense",
            "mappingType": "string",
            "defaultValue": dataType.string(434234234)
        },
        "orgCode": {
            "type": "string",
            "describe": "组织机构代码证号",
            "mappingName": "orgCode",
            "mappingType": "string",
            "defaultValue": dataType.string(5454234324)
        },
        "taxRegistrationLicenseNum": {
            "type": "string",
            "describe": "税务登记证",
            "mappingName": "taxRegistrationLicenseNum",
            "mappingType": "string",
            "defaultValue": dataType.string(784354352343)
        },
        "businessLicenseValidateDate": {
            "type": "time",
            "describe": "执照期限",
            "mappingName": "businessLicenseValidateDate",
            "mappingType": "string",
            "defaultValue": dataType.string("2016-01-01")
        },
        "businessLicenseValidateDateLongTime": {
            "type": "time",
            "describe": "执照期限长期显示字段",
            "mappingType": function (data) {
                return data.businessLicenseValidateDate ? false : true;
            },
            "defaultValue": dataType.time("2016-01-01")
        },
        "orgCodeValidateDate": {
            "type": "time",
            "describe": "组织机构代码证期限",
            "mappingName": "orgCodeValidateDate",
            "mappingType": "string",
            "defaultValue": dataType.time("2016-01-02")
        },
        "taxRegistrationLicenseNumValidateDate": {
            "type": "time",
            "describe": "税务登记证期限",
            "mappingName": "taxRegistrationLicenseNumValidateDate",
            "mappingType": "string",
            "defaultValue": dataType.time("2016-01-03")
        }
    }
});


/**
 * 中富客户拓展数据模型
 */
modelList.setModel({
    name: "zfClient",
    describe: "中富客户模型",
    structure: {}
}).inheritOrganizer([modelList.getModel("zfClientBasic"), modelList.getModel("zfUserGSP")]);