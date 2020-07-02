import {getDBCon} from './db-con.js'

function runQuery(query, params){

	return new Promise((resolve, reject)=>{
		getDBCon().then((connection)=>{
			if(params != null){
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
			}
			else{
				connection.query(query, (err, results, fields)=>{
					if(err){
						connection.release();
						reject(err);
					}
					connection.release(); // When done with the connection, release it.

					console.log('connected as id ' + connection.threadId);
					resolve(results);
				});
			}

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
	insert: (tableName='', data)=>{
		let query = `INSERT INTO ${tableName} SET ?`;
		
		return new Promise((resolve,reject)=>{
			runQuery(query, data).then((results)=>{
				resolve({insertId: results.insertId})
			}).catch((err)=>{
				reject(err);
			})
		});
	},

	select: (tableName='', fields=[], where="", params=null, additions="")=>{
		let query = `SELECT `;

		for(let field of fields){
			query += field+",";
		}
		query = query.replace(/.$/," ");
		query += "FROM "+tableName;

		if(where != ""){
			query += " WHERE ";
			query += where;
		}

		if(additions != ""){
			query += " "+additions;
		}

		return new Promise((resolve,reject)=>{
			runQuery(query, params).then((results)=>{
				resolve(results)
			}).catch((err)=>{
				reject(err);
			})
		});
	},

	update: (tableName='', fields=[], where="", params=null, additions="")=>{
		let query = `UPDATE ${tableName} SET `;
		
		for(let field of fields) {
			query += field+"=?,";
		}
		query = query.replace(/.$/," ");

		if(where != ""){
			query += " WHERE ";
			query += where;
		}

		if(additions != ""){
			query += " "+additions;
		}

		return new Promise((resolve,reject)=>{
			runQuery(query, params).then((results)=>{
				resolve({affectedRows: results.affectedRows})
			}).catch((err)=>{
				reject(err);
			})
		});
	},

	delete: (tableName='', where="", params=null, additions="")=>{
		let query = `DELETE FROM ${tableName}`;
		
		if(where != ""){
			query += " WHERE ";
			query += where;
		}
		else{
			return new Promise((resolve, reject)=>{reject("Delete with no Where Condition!")});
		}

		if(additions != ""){
			query += " "+additions;
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
	get: async(tableName="", fields=[], where="", params=null)=>{
		let results = await lowOperations.select(tableName, fields, where, params, "LIMIT 1");
		if(results.length === 0){
			return null;
		}
		else{
			return results[0];
		}
	},

	doesExist: async(tableName='', field='', where='', params)=>{
		let results = await lowOperations.get(tableName, field, where, params);
		if(results === null){
			return(false);
		}
		else{
			return(true);
		}
	}

}

const operations = {...lowOperations, ...highOperations}

export default operations