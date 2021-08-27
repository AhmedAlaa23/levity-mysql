import {getDBCon, isDebuggingEnabled, debuggingOptions} from './db-con.js'
import {parseWhereObj} from './helpers.js'

//todo: feat: add operation to START TRANSACTION

function runQuery({con, query, params=[], database}){
	return new Promise((resolve, reject)=>{
		if(database!=="" && database!==undefined){
			query = `USE \`${database}\`; ${query}`
		}
		
		con.query(query, params, function(err, results, fields){
			if(err){
				console.error(this.sql);
				console.trace(err);
				con.release();
				reject(err);
			}
			// console.log('connected as id ' + con.threadId);
			con.release(); // When done with the connection, release it.

			// for debugging
			if(isDebuggingEnabled && debuggingOptions.showSqlQuery){
				console.log(this.sql);
			}

			// if USE Database then it's multiple statement then return the second results only
			if(database!=="" && database!==undefined){
				resolve(results[1]);
			}

			resolve(results);
		});
	});
}

const lowOperations = {
	run: async(query, params, database, poolName)=>{
		const con = await getDBCon(poolName);

		const results = await runQuery({con, query, params, database})
		return results;
	},

	//todo: update insert in all projects to work with the object paramter
	//todo: refactor insert to be able to insert multiple rows in the same query
	// data: {name: 'John', age: 30} OR data: [ ['John', 30], ['Jane', 25] ]
	// fields: ['name', 'age']
	insert: async({table='', fields, data, database, poolName} = {})=>{
		const con = await getDBCon(poolName);

		let query = '';

		if(data?.constructor === Object){
			query = `INSERT INTO ${table} SET ?;`;
		}
		else if(Array.isArray(data)){
			fields = fields.join();
			query = `INSERT INTO ${table} (${fields}) VALUES ?;`;
		}
		else{
			console.trace('data is not an object or array');
			throw new Error('data must be an object or an array');
		}
		
		const results = await runQuery({con, query, params: [data], database})
		return results.insertId;
	},

	select: async({table='', fields=[], where="", params=[], orderby={}, additions="", database, poolName} = {})=>{
		const con = await getDBCon(poolName);
		let paramsAll = [...params];
		let query = `SELECT `;

		for(let field of fields){
			query += `${field},`;
		}
		query = query.slice(0,-1);

		query += ` FROM ${table}`;

		if(typeof(where) === 'string'){
			if(where != ""){
				query += ` WHERE ${where}`;
			}
		}
		else{
			// object
			let {whereStr, whereParams} = parseWhereObj(where);
			query += ` WHERE ${whereStr}`;
			paramsAll = [...whereParams, ...params];
		}

		// orderby is object and not empty
		if( !(orderby && Object.keys(orderby).length === 0 && orderby.constructor === Object) ){
			let orderbyStr = "ORDER BY";
			for(const [orderItem, orderDirection] of Object.entries(orderby)){
				orderDirection ??= 'ASC';
				orderbyStr += ` ${con.escapeId(orderItem)} ${orderDirection.toUpperCase()},`;
			}
			orderbyStr = orderbyStr.slice(0,-1);
			query += ` ${orderbyStr}`;
		}

		if(additions != ""){
			query += ` ${additions}`;
		}

		query += ';';

		const results = await runQuery({con, query, params: paramsAll, database})
		return results;
	},

	update: async({table='', fields={}, where="", params=[], additions="", database, poolName} = {})=>{
		const con = await getDBCon(poolName);

		let query = `UPDATE ${table} SET `;
		
		let fieldsParams = [];
		for(let [field, value] of Object.entries(fields)) {
			query += `${field}=?,`;
			fieldsParams.push(value);
		}
		query = query.slice(0,-1);
		// params = [...fieldsParams, ...params];

		if(typeof(where) === 'string'){
			if(where != ""){
				query += ` WHERE ${where}`;
				params = [...fieldsParams, ...params];
			}
		}
		else{
			// object
			let {whereStr, whereParams} = parseWhereObj(where);
			query += ` WHERE ${whereStr}`;
			params = [...fieldsParams, ...whereParams, ...params];
		}

		if(additions != ""){
			query += ` ${additions}`;
		}

		query += ';';

		const results = await runQuery({con, query, params, database})
		return results.affectedRows;
	},

	delete: async({table='', where="", params=[], additions="", database, poolName} = {})=>{
		const con = await getDBCon(poolName);

		let query = `DELETE FROM ${table}`;
		
		if(typeof(where) === 'string' && where != ""){
			query += ` WHERE ${where}`;
		}
		else if(typeof(where) === 'object'){
			let {whereStr, whereParams} = parseWhereObj(where);
			query += ` WHERE ${whereStr}`;
			params = [...whereParams, ...params];
		}
		else{
			return new Promise((resolve, reject)=>{reject("Delete with no Where Condition!")});
		}

		if(additions != ""){
			query += ` ${additions}`;
		}

		query += ';';

		const results = await runQuery({con, query, params, database})
		return results.affectedRows;
	},

	// lock: async({table='', lockType="", database} = {})=>{
	// 	const con = await getDBCon();

	// 	let query = `LOCK TABLES ${table} ${lockType};`;

	// 	const results = await runQuery({con, query, database})
	// 	return results;
	// },

	// unlock: async({database} = {})=>{
	// 	const con = await getDBCon();

	// 	let query = `UNLOCK TABLES;`;

	// 	const results = await runQuery({con, query, database})
	// 	return results;
	// }
}

//  ============================= Higher Operations

const highOperations = {
	get: async({table="", fields=[], where="", params=[], additions="", database, poolName} = {})=>{
		let results = await lowOperations.select({table, fields, where, params, additions, database, poolName}, "LIMIT 1");
		if(results.length === 0){
			return null;
		}
		else{
			return results[0];
		}
	},

	doesExist: async({table='', where='', database, poolName} = {})=>{
		let results = await highOperations.get({table, fields: ['id'], where, database, poolName});
		if(results === null){
			return(false);
		}
		else{
			return(true);
		}
	}

}

// =================================================

const createTables = async (dbSchema, tablesIgnored=[], database, poolName)=>{
	const con = await getDBCon(poolName);

	let tablesQueries = '';
	for(let tableName in dbSchema){
		if(!tablesIgnored.includes(tableName)){
			let query = `
			CREATE TABLE IF NOT EXISTS \`${tableName}\` (`

				for(let [field, prop] of Object.entries(dbSchema[tableName])){
					if(prop.dbIgnore !== true){
						query += ` ${field} ${prop.type}`;
						if(prop.isID === true){
							query += ' AUTO_INCREMENT PRIMARY KEY NOT NULL';
						}
						else{
							if(prop.autoIncrement === true){
								query += ' AUTO_INCREMENT';
							}
							if(prop.primaryKey === true){
								query += ' PRIMARY KEY';
							}
							if(prop.allowNull !== false){
								query += ' NOT NULL';
							}
							if(prop.default !== undefined){
								query += ` DEFAULT ('${prop.default}')`;
							}
						}
						
						query += ',';
					}
				}

			query = query.slice(0,-1);
			query += `
			) `;
			query += 'COLLATE utf8mb4_unicode_ci; ';

			tablesQueries += query;
		}
	}

	await runQuery({con, query: tablesQueries, database});
	
	return true;
}

const dropTables = async (dbSchema, database, poolName)=>{
	const con = await getDBCon(poolName);

	let tablesQueries = '';
	
	for(let tableName in dbSchema){
		let query = `DROP TABLE IF EXISTS \`${tableName}\`; `;
		tablesQueries += query;
	}

	await runQuery({con, query: tablesQueries, database});
	return true;
}

const disableStrictMode = async(poolName)=>{
	const con = await getDBCon(poolName);
	let query = `SET GLOBAL sql_mode = 'NO_ENGINE_SUBSTITUTION'; SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION';`;
	
	await runQuery({con, query});

	return true;
}

const operations = {...lowOperations, ...highOperations, createTables, dropTables, disableStrictMode}

export default operations