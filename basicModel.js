'use strict';
const Logger = require('log4js');
const logger = new Logger();
const _ = require('lodash');

module.exports = (knex)=> {
  return (dbName, tableName, extMethods)=> {
    const basicMethods = {
      /**
       * 获取全部数据列表(不包含外键关系)
       * @param orderby 排序字段
       * @param orderDesc 排序规则 desc或者asc
       * @param columns 字段列表
       * @returns {Promise.<T>}
       */
      getAllList(orderby, orderDesc, columns){
        logger.trace("[BASIC EVENT] get all list data." +
            "\ntip: with this method, you can get all the data of a table." +
            "\n     but you can not associate foreign key relationships." +
            `\ntable name: ${tableName}`);

        return knex.withSchema(dbName)
            .table(tableName)
            .select(columns || "*")
            .orderBy(orderby || 'updatedOn', orderDesc || 'desc')
            .then((result)=> {
              logger.debug(`[END BASIC EVENT] ${dbName} ${tableName} getAllList result:` + JSON.stringify(result));
              return result;
            })
      },
      /**
       * 获取简单列表(不包含外键关系)
       * @param fieldFilter 字段筛选条件 例：{"sex": "male", "age": "18"}
       * @param keywords 关键字
       * @param keywordsField 关键字匹配字段
       * @param pagesize 单页数据条数
       * @param page 当前查询页码
       * @param orderby 排序字段
       * @param orderDesc 排序规则 desc或者asc
       * @param columns 字段列表
       * @returns {*} knex promise
       */
      getSimpleList(fieldFilter, keywords, keywordsField, page, pagesize, orderby, orderDesc, columns){
        logger.trace("[BASIC EVENT] get simple list data." +
            "\ntip: with this method, you can get a list that meets the filter criteria." +
            "\n     but you can not associate foreign key relationships." +
            `\ntable name: ${tableName}`);
        logger.debug(`keywordsField: ${keywordsField}, keywords: ${keywords}, pageSize: ${pagesize}, page: ${page}`);

        let sql = knex.withSchema(dbName)
            .table(tableName)
            .select(columns || "*")
            .where(fieldFilter)
        if (keywords && keywordsField) {
          sql = sql
              .andWhere(keywordsField, 'like', `%${keywords || ""}%`)
        }
        sql = sql.orderBy(orderby || 'updatedOn', orderDesc || 'desc')
        if (pagesize && page) {
          sql = sql
              .limit(pagesize)
              .offset((page - 1) * pagesize)
        }
        return sql
            .then((result)=> {
              logger.debug(`[END BASIC EVENT] ${dbName} ${tableName} getSimpleList result:` + JSON.stringify(result));
              return result;
            })
      },
      /**
       * 获取简单详情(不包含外键关系)
       * @param conditionField 条件字段(必须是具有唯一性的字段)
       * @param value 条件值
       * @param columns 字段列表
       * @returns {*} knex promise
       */
      getSimpleDetail(conditionField, value, columns){
        logger.trace("[BASIC EVENT] get simple detail data." +
            "\ntip:with this method, you can get simple detail data by condition." +
            "\n     but you can not associate foreign key relationships." +
            `\ntable name: ${tableName}`);

        return knex.withSchema(dbName)
            .table(tableName)
            .select(columns || "*")
            .where(conditionField, value)
            .then((result)=> {
              logger.debug(`[END BASIC EVENT] ${dbName} ${tableName} getSimpleDetail result:` + JSON.stringify(result));
              return result;
            })
      },
      /**
       * 获取某字段的值
       * @param conditionField 条件字段(必须是具有唯一性的字段)
       * @param value 条件值
       * @param queryField 查询字段
       * @returns {*}  knex promise
       */
      getFieldValue(conditionField, value, queryField){
        logger.trace("[BASIC EVENT] get field value data." +
            "\ntip:with this method, you can get a field value by condition." +
            `\ntable name: ${tableName}`);

        return knex.withSchema(dbName)
            .table(tableName)
            .select(queryField)
            .where(conditionField, value)
            .then((result)=> {
              logger.debug(`[END BASIC EVENT] ${dbName} ${tableName} getFieldValue result:` + JSON.stringify(result));
              return result;
            })
      },
      /**
       * 获取某字段列表
       * @param conditionField 条件字段(必须是具有唯一性的字段)
       * @param value 条件值
       * @param queryField 查询字段
       * @returns {*}
       */
      getFieldListByCondition(conditionField, value, queryField){
        logger.trace("[BASIC EVENT] get ids by condition." +
            "\ntip:with this method, you can get a list of field value by condition." +
            `\ntable name: ${tableName}`);

        return knex.withSchema(dbName)
            .table(tableName)
            .select(queryField)
            .where(conditionField, value)
            .then((result)=> {
              logger.debug(`[END BASIC EVENT] ${dbName} ${tableName} getFieldListByCondition result:` + JSON.stringify(result));
              return result;
            })
      },
      /**
       * 插入单条数据
       * @param data 数据
       * @param trx 事务对象
       * @returns {*}  knex promise
       */
      addData(data, trx){
        logger.trace("[BASIC EVENT] add data.TABLE:" + tableName +
            "\ntip:with this method, you can add a data to the table." +
            `\ntable name: ${tableName}`);

        //如果事务对象不为空，则采用事务模式
        if (trx) {
          return trx.withSchema(dbName)
              .table(tableName)
              .insert(data)
              .then(function (result) {
                logger.debug(`[END BASIC EVENT] ${dbName} ${tableName} addData result:` + JSON.stringify(result));
                return Promise.resolve({
                  type: 'add',
                  tableName: tableName,
                  result: result
                })
              })
        } else {
          return knex.withSchema(dbName)
              .table(tableName)
              .insert(data)
              .then((result)=> {
                logger.debug(`[END BASIC EVENT] ${dbName} ${tableName} addData result:` + JSON.stringify(result));
                return result;
              })
        }
      },
      /**
       * 更新单条数据
       * @param data 更新的数据
       * @param conditionField 条件字段(必须是具有唯一性的字段)
       * @param value 条件值
       * @param trx 事务（选传）
       * @returns {*}  knex promise
       */
      updateData(data, conditionField, value, trx){
        logger.trace("[BASIC EVENT] update data." +
            "\ntip:with this method, you can update a data by condition." +
            `\ntable name: ${tableName}`);

        //如果事务对象不为空，则采用事务模式
        if (trx) {
          return trx.withSchema(dbName)
              .table(tableName)
              .update(data)
              .where(conditionField, value)
              .then(function (result) {
                logger.debug(`[END BASIC EVENT] ${dbName} ${tableName} updateData result:` + JSON.stringify(result));
                Promise.resolve({
                  type: 'update',
                  tableName: tableName,
                  result: result
                })
              })
        } else {
          return knex.withSchema(dbName)
              .table(tableName)
              .update(data)
              .where(conditionField, value)
              .then((result)=> {
                logger.debug(`[END BASIC EVENT] ${dbName} ${tableName} updateData result:` + JSON.stringify(result));
                return result;
              })
        }
      },
      /**
       * 删除数据
       * @param conditionField 条件字段
       * @param value 条件值
       * @param trx 事务（选传）
       * @returns {*}  knex promise
       */
      deleteData(conditionField, value, trx){
        logger.trace("[BASIC EVENT] delete data." +
            "\ntip:with this method, you can delete data by condition." +
            `\ntable name: ${tableName}`);

        //如果事务对象不为空，则采用事务模式
        if (trx) {
          return trx.withSchema(dbName)
              .table(tableName)
              .where(conditionField, value)
              .del()
              .then(function (result) {
                logger.debug(`[END BASIC EVENT] ${dbName} ${tableName} deleteData result:` + JSON.stringify(result));
                Promise.resolve({
                  type: 'del',
                  tableName: tableName,
                  result: result
                })
              })
        } else {
          return knex.withSchema(dbName)
              .table(tableName)
              .where(conditionField, value)
              .del()
              .then((result)=> {
                logger.debug(`[END BASIC EVENT] ${dbName} ${tableName} deleteData result:` + JSON.stringify(result));
                return result;
              })
        }
      },
      /**
       * 批量删除数据
       * @param conditionField 条件字段
       * @param list 条件值列表
       * @param trx 事务（选传）
       * @returns {*}  knex promise
       */
      deleteBatchData(conditionField, list, trx){
        logger.trace("[BASIC EVENT] delete batch data." +
            "\ntip:with this method, you can delete batch data by condition." +
            `\ntable name: ${tableName}`);

        //如果事务对象不为空，则采用事务模式
        if (trx) {
          return trx.withSchema(dbName)
              .table(tableName)
              .whereIn(conditionField, list)
              .del()
              .then(function (result) {
                return Promise.resolve({
                  type: 'del',
                  tableName: tableName,
                  result: result
                })
              })
        } else {
          return knex.withSchema(dbName)
              .table(tableName)
              .whereIn(conditionField, list)
              .del()
        }
      }
    };
    //非单表查询基础方法
    const mixMethods = {
      /**
       * 获取具有映射关系的详情(当前表只是映射表，需要连接到另外一张表获取部分信息)
       * @param conditionField 条件字段(必须是具有唯一性的字段)
       * @param value 条件值
       * @param mappingTableName 映射关系表名
       * @param key 本表连接字段
       * @param mappingKey 映射表连接字段
       * @returns {*}
       */
      getDetailWithMappingTable(conditionField, value, mappingTableName, key, mappingKey, columns){
        logger.trace("[BASIC EVENT] [mapping] get detail with mapping table data." +
            "\ntip:with this method, you can get detail with mapping table info data by condition." +
            `\nmapping table name: ${mappingTableName}, middle table name: ${tableName}`);

        const allColumns = [`${tableName}.*`];
        _.each(columns, (col)=> {
          allColumns.push(`${mappingTableName}.${col}`)
        });
        return knex.withSchema(dbName)
            .table(tableName)
            .leftJoin(mappingTableName, `${tableName}.${key}`, `${mappingTableName}.${mappingKey}`)
            .select(allColumns)
            .where(conditionField, value)
            .then((result)=> {
              logger.debug(`[END BASIC EVENT] ${dbName} ${tableName} getDetailWithMappingTable result:` + JSON.stringify(result));
              return result;
            })
      }
    };
    return _.assign({}, basicMethods, mixMethods, extMethods);
  };
}




