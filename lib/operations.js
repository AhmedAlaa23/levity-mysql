import {getCon} from './db-con.js'

function runQuery(query, params){

	return new Promise((resolve, reject)=>{
		getCon().then((connection)=>{
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

	// data = object {key: value}
	insert: (tableName, data)=>{
		let query = `INSERT INTO ${tableName} SET ?`;
		
		return new Promise((resolve,reject)=>{
			runQuery(query, data).then((results)=>{
				resolve({insertId: results.insertId})
			}).catch((err)=>{
				reject(err);
			})
		});
	},

	// fields = array
	select: (tableName, fields, where="", params=null, additionals="")=>{
		let query = `SELECT `;

		for(let field of fields) {
			query += field+",";
		}
		query = query.replace(/.$/," ");
		query += "FROM "+tableName;

		if(where != ""){
			query += " WHERE ";
			query += where;
		}

		if(additionals != ""){
			query += " "+additionals;
		}

		return new Promise((resolve,reject)=>{
			runQuery(query, params).then((results)=>{
				resolve(results)
			}).catch((err)=>{
				reject(err);
			})
		});
	},

	update: (tableName, fields, where="", params=null, additionals="")=>{
		let query = `UPDATE ${tableName} SET `;
		
		for(let field of fields) {
			query += field+"=?,";
		}
		query = query.replace(/.$/," ");

		if(where != ""){
			query += " WHERE ";
			query += where;
		}

		if(additionals != ""){
			query += " "+additionals;
		}

		return new Promise((resolve,reject)=>{
			runQuery(query, params).then((results)=>{
				resolve({affectedRows: results.affectedRows})
			}).catch((err)=>{
				reject(err);
			})
		});
	},

	delete: (tableName, where="", params=null, additionals="")=>{
		let query = `DELETE FROM ${tableName}`;
		
		if(where != ""){
			query += " WHERE ";
			query += where;
		}
		else{
			return new Promise((resolve, reject)=>{reject("Delete with no Where Condition!")});
		}

		if(additionals != ""){
			query += " "+additionals;
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

const operations = {...lowOperations}

export default operations