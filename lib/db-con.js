let DB = null;

const setDB = (db)=>{
	DB = db;
};

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

export {setDB, getDBCon}