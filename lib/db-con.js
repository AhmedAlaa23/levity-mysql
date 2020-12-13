import mysql from 'mysql';

let DB = null;

// const setDB = (db)=>{
// 	DB = db;
// };

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

export {createDBPool, DBEnd, getDBCon}