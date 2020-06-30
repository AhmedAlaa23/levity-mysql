const db;

const getCon = ()=>{
	return new Promise((resolve, reject)=>{
		db.getConnection((err, connection)=>{
			if(err){
				console.error(err);
				reject(err);
			}
			resolve(connection);
		});
	});
}

export {db, getCon}