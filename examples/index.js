// import mysql from 'mysql';
import {dropDatabase, createDatabase, createDBPool, DBEnd, dbOp, enableDebugging} from '../lib/index.js'

createDBPool({
	connectionLimit : 50,
	host			: 'localhost',
	user			: 'root',
	password	: 'root',
	database	: 'test',
	charset		: 'utf8mb4_unicode_ci',
	timezone	: '+00:00',
	multipleStatements: true
})

createDBPool({
	connectionLimit : 50,
	host			: 'localhost',
	user			: 'root',
	password	: 'root',
	database	: 'test',
	charset		: 'utf8mb4_unicode_ci',
	timezone	: '+00:00',
	multipleStatements: true
}, 'secondPool')

const dbSchema = {
	users: {
		id: {type: 'INT(11)', isID: true},
		first_name: {type: 'VARCHAR(255)'},
		last_name: {type: 'VARCHAR(255)'},
		email: {type: 'VARCHAR(255)'},
		money: {type: 'INT(11)', default: 0},
		details: {type: 'JSON', default: '[]'},
		extra: {type: 'INT(11)', dbIgnore: true},
	},
	users_categories: {
		id: {type: 'int(11)', isID: true},
		name: {type: 'VARCHAR(255)'}
	},
	stats: {
		id: {type: 'int(11)', isID: true},
		name: {type: 'VARCHAR(255)'}
	}
}

const tablesIgnored = ['stats'];

async function addUser(){
	const insertedId1 = await dbOp.insert('users', {first_name: 'David', last_name: 'Dobrik', email: 'test@test.com', money: 1000, details: JSON.stringify({city: 'NY', country: 'USA'})});
	const insertedId2 = await dbOp.insert('users', {first_name: 'Felix', last_name: 'shellberg', email: 'felix@test.com', money: 2000, details: JSON.stringify({city: 'London', country: 'UK'})});
	console.log(`InsertedId1: ${insertedId1}`, `InsertedId2: ${insertedId2}`);
}

async function updateUser(){
	// table name, fields to select, where conditions, parameters to assign
	
	// await dbOp.update({
	// 	table: 'users',
	// 	fields: {first_name: 'Casey', last_name: 'Neistat'},
	// 	where: "email=?",
	// 	params: ['test@test.com']
	// });
	
	await dbOp.update({
		table: 'users',
		fields: {first_name: 'Casey', last_name: 'Neistat'},
		where: {email: 'test@test.com'},
	});

}

async function getUser(){
	// table name, fields to select, where conditions, parameters to assign
	
	let user = await dbOp.get({
		table: 'users',
		fields: ['first_name','last_name','details'],
		where: "email=?",
		params: ['test@test.com']
	});
	
	console.log('get_user_name', user.first_name);
	console.log('get_user_country', user.details.country);

	//* get the same user but from the second pool
	// let user2 = await dbOp.get({
	// 	table: 'users',
	// 	fields: ['first_name','last_name','details'],
	// 	where: "email=?",
	// 	params: ['test@test.com'],
	// 	poolName: 'secondPool'
	// });
	
	// console.log('get_user_name2', user2.first_name);
	// console.log('get_user_country2', user2.details.country);
}

async function selectUser(){
	const where0 = {
		id: 1
	}
	// where id=1


	const where1 = {
		'AND': [
			{id: 1, email: 'test@test.com'}
		]
	}
	// WHERE id=1 AND email='test@test.com'


	//======= deprecated
	// const where2 = {
	// 	'AND': [
	// 		{id: 1},
	// 		{'OR': [ {first_name: ['Casey','Felix']} ]}
	// 	]
	// }
	//==================

	const where2 = {
		'AND': [
			{id: 1},
			{first_name: {op:'IN', value:['Casey','Felix']} }
		]
	}
	// where: id=1 AND first_name IN ('Casey','Felix')

	const where3 = {
		'OR': [
			{id: 1},
			{'AND': [
					{email: 'test@test.com'},
					{money: {op:'<', value:2000} },
					{'OR': [{first_name: 'Casey', last_name: 'Neistat'}]}
				]
			}
		]
	}
	// WHERE id=1 OR ( email='test@tes.com' AND money<2000 AND ( first_name='Casey' OR last_name='Neistat' ) )


	// ============ deprecated
	// const where4 = {
	// 	'OR': [{first_name: ['Casey','Felix']}]
	// }
	// ==============

	const where4 = {
		first_name: {op:'IN', value:['Casey','Felix']}
	}
	// where: first_name IN ('Casey','Felix')

	const where5 = {
		money: {op:'<', value: 1500}
		// money: {op:'>', value: 1500}
		// money: {op:'<=', value: 2000}
		// money: {op:'>=', value: 1500}
		// money: {op:'!=', value: 2000}
		// money: {op:'IN', value: [1000,2000]}
	}
	// where: money < 1500

	// let user = await dbOp.select({
	// 	table: 'users',
	// 	fields: ['first_name','last_name'],
	// 	where: 'email=?',
	// 	params: ['test@test.com'],
	// 	additions: 'LIMIT 1'
	// });
	
	let user = await dbOp.select({
		table: 'users',
		// fields: ['*'],
		fields: ['id','first_name','last_name','money'],
		where: where3,
		orderBy: {id:'DESC'},
		// additions: 'LIMIT 1'
	});

	console.log(user);
}

const doesUserExist = async()=>{
	let status = await dbOp.doesExist({
		table: 'users',
		where: {email: 'test@test.com'}
	})

	return status;
}

const deleteUser = async()=>{

	// await dbOp.delete({
	// 	table: 'users',
	// 	where: 'email=?',
	// 	params: ['test@test.com'],
	// 	additions: 'LIMIT 1'
	// })

	await dbOp.delete({
		table: 'users',
		where: {email: 'test@test.com'},
		additions: 'LIMIT 1'
	})

}

(async()=>{
	// await dbOp.disableStrictMode();
	
	enableDebugging({showConnectionId: true, showSqlQuery: false});
	
	await dropDatabase({
		connectionData: {
			host			: 'localhost',
			user			: 'root',
			password	: 'root'
		},
		databaseName: 'test'
	});
	
	await createDatabase({
		connectionData: {
			host			: 'localhost',
			user			: 'root',
			password	: 'root'
		},
		databaseName: 'test'
	});
	
	await dbOp.dropTables(dbSchema);
	await dbOp.createTables(dbSchema, tablesIgnored);

	await addUser();
	await updateUser();
	await getUser();
	let doesExist = await doesUserExist();
	console.log(`Does user Exist: ${doesExist}`);
	// await deleteUser();
	await selectUser();
	await DBEnd();
})()