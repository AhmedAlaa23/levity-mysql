import mysql from 'mysql2';

let DBPools = {};

let isDebuggingEnabled = false;
let debuggingOptions = {}

// const setDB = (db)=>{
// 	DB = db;
// };

const dropDatabase = ({connectionData={}, databaseName})=>{
	const connection = mysql.createConnection({
		...connectionData
	});
	
	return new Promise((resolve, reject)=>{
		connection.query(`DROP DATABASE IF EXISTS ${databaseName};`, function (err, result) {
			if (err) throw err;
			console.log(`Database Dropped IF EXISTS: ${databaseName}`);
			connection.end();
			resolve(result);
		})
	});
}

const createDatabase = ({connectionData={}, databaseName})=>{
	const connection = mysql.createConnection({
		...connectionData
	});
	
	return new Promise((resolve, reject)=>{
		connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;`, function (err, result) {
			if (err) throw err;
			console.log(`Database Created IF NOT EXISTS: ${databaseName}`);
			connection.end();
			resolve(result);
		})
	});
}

const createDBPool = (poolOptions={}, poolName='default')=>{
	const DBPool = mysql.createPool({
		...poolOptions,
		typeCast: function (field, next) {
			if (field.type == 'JSON') {
				return (JSON.parse(field.string()));
			}
			return next();
		}
	});

	DBPools[poolName] = DBPool;

	// DB.on('release', function (connection) {
	// 	console.log('Connection %d released', connection.threadId);
	// });
}

const getDBCon = (poolName='default')=>{
	return new Promise((resolve, reject)=>{
		const DBPool = DBPools[poolName];
		if(!DBPool){
			console.trace('Pool Not Found');
			throw new Error('Pool Not Found, no Pool with this name!');
		}

		DBPool.getConnection((err, connection)=>{
			if(err){
				console.error(err);
				reject(err);
			}
			if(isDebuggingEnabled && debuggingOptions.showConnectionId){
				console.log(`connection id: ${connection.threadId}`);
			}

			resolve(connection);
		});
	});
}

const DBEnd = (poolName='default')=>{
	const DBPool = DBPools[poolName];
	if(!DBPool){
		console.trace('Pool Not Found');
		throw new Error('Pool Not Found, no Pool with this name!');
	}
	
	return new Promise((resolve, reject)=>{
		DBPool.end(()=>{
			resolve(true);
		});
	})
}

const enableDebugging = ({showConnectionId=true, showSqlQuery=true}={})=>{
	isDebuggingEnabled = true;
	debuggingOptions = {showConnectionId, showSqlQuery};
}

export {
	dropDatabase, createDatabase, createDBPool, DBEnd, getDBCon,
	enableDebugging, isDebuggingEnabled, debuggingOptions
}