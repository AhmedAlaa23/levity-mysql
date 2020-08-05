import {getDBCon} from './db-con.js'
import {parseWhereObj} from './helpers.js'

function runQuery(query, params=[]){

	return new Promise((resolve, reject)=>{
		getDBCon().then((connection)=>{
			// if(params !== null){
				connection.query(query, params, (err, results, fields)=>{
					if(err){
						console.error(err);
						connection.release();
						reject(err);
					}
					connection.release(); // When done with the connection, release it.

					console.log('connected as id ' + connection.threadId);
					resolve(results);
				});
			// }
			// else{
			// 	connection.query(query, (err, results, fields)=>{
			// 		if(err){
			// 			console.error(err);
			// 			connection.release();
			// 			reject(err);
			// 		}
			// 		connection.release(); // When done with the connection, release it.

			// 		console.log('connected as id ' + connection.threadId);
			// 		resolve(results);
			// 	});
			// }

		}).catch((err)=>{
			reject(err);
		});

	});
}

const lowOperations = {
	run: (query, data)=>{
		return new Promise((resolve,reject)=>{
			runQuery(query, data).then((results)=>{
				resolve({results: results})
			}).catch((err)=>{
				reject(err);
			})
		});
	},

	// data = object {fieldName: value}
	insert: (table='', data)=>{
		let query = `INSERT INTO ${table} SET ?`;
		
		return new Promise((resolve,reject)=>{
			runQuery(query, data).then((results)=>{
				resolve(results.insertId)
			}).catch((err)=>{
				reject(err);
			})
		});
	},

	select: ({table='', fields=[], where="", params=[], additions=""} = {})=>{		
		let query = `SELECT `;

		for(let field of fields){
			query += `${field},`;
		}
		// query = query.replace(/.$/," ");
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
			params = [...whereParams, ...params];
		}

		if(additions != ""){
			query += ` ${additions}`;
		}

		return new Promise((resolve,reject)=>{
			runQuery(query, params).then((results)=>{
				resolve(results)
			}).catch((err)=>{
				reject(err);
			})
		});
	},

	update: ({table='', fields={}, where="", params=[], additions=""} = {})=>{
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

		return new Promise((resolve,reject)=>{
			runQuery(query, params).then((results)=>{
				resolve({affectedRows: results.affectedRows})
			}).catch((err)=>{
				reject(err);
			})
		});
	},

	delete: ({table='', where="", params=[], additions=""} = {})=>{
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

		return new Promise((resolve,reject)=>{
			runQuery(query, params).then((results)=>{
				resolve({affectedRows: results.affectedRows})
			}).catch((err)=>{
				reject(err);
			})
		});
	}
}

//  ============================= Higher Operations

const highOperations = {
	get: async({table="", fields=[], where="", params=[]} = {})=>{
		let results = await lowOperations.select({table, fields, where, params}, "LIMIT 1");
		if(results.length === 0){
			return null;
		}
		else{
			return results[0];
		}
	},

	doesExist: async({table='', field='', where='', params=[]} = {})=>{
		let results = await lowOperations.get({table, field, where, params});
		if(results === null){
			return(false);
		}
		else{
			return(true);
		}
	}

}

// =================================================

const createTables = async (dbSchema)=>{
	let tablesQueries = '';
	for(let tableName in dbSchema){
		let query = `
		CREATE TABLE IF NOT EXISTS \`${tableName}\` (`

			for(let [field, prop] of Object.entries(dbSchema[tableName])){
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
				}
				
				query += ',';
			}

		query = query.slice(0,-1);
		query += `
		) `;
		query += 'COLLATE utf8mb4_unicode_ci ;';

		tablesQueries += query;
	}

	await runQuery(tablesQueries);
	
	return true;
}

const dropTables = async (dbSchema)=>{
	let tablesQueries = '';
	
	for(let tableName in dbSchema){
		let query = `DROP TABLE IF EXISTS ${tableName}; `;
		tablesQueries += query;
	}

	await runQuery(tablesQueries);
	return true;
}

const operations = {...lowOperations, ...highOperations, createTables, dropTables}

export default operations