import mysql from 'mysql2';

let DB = null;

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

const createDBPool = ({...poolOptions})=>{
	DB = mysql.createPool({
		...poolOptions,
		typeCast: function (field, next) {
			if (field.type == 'JSON') {
				return (JSON.parse(field.string()));
			}
			return next();
		}
	});

	// DB.on('release', function (connection) {
	// 	console.log('Connection %d released', connection.threadId);
	// });
}

const getDBCon = ()=>{
	return new Promise((resolve, reject)=>{
		DB.getConnection((err, connection)=>{
			if(err){
				console.error(err);
				reject(err);
			}
			resolve(connection);
		});
	});
}

const DBEnd = ()=>{
	return new Promise((resolve, reject)=>{
		DB.end(()=>{
			resolve(true);
		});
	})
}

export {dropDatabase, createDatabase, createDBPool, DBEnd, getDBCon}