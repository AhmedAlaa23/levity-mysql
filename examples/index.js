// import mysql from 'mysql';
import {createDatabase, createDBPool, DBEnd, dbOp} from '../lib/index.js'

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
	const insertedId1 = await dbOp.insert('users', {first_name: 'David', last_name: 'Dobrik', email: 'test@test.com', details: JSON.stringify({city: 'NY', country: 'USA'})});
	const insertedId2 = await dbOp.insert('users', {first_name: 'Felix', last_name: 'shellberg', email: 'felix@test.com', details: JSON.stringify({city: 'London', country: 'UK'})});
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
	
	console.log(user.first_name);
	console.log(user.details.country);
}

async function selectUser(){
	let where0 = {
		id: 1
	}

	let where1 = {
		'AND': [
			{id: 1, email: 'test@test.com'}
		]
	}

	let where2 = {
		'AND': [
			{id: 1},
			{'OR': [ {first_name: ['Casey','Felix']} ]}
		]
	}

	let where3 = {
		'OR': [
			{id: 1},
			{'AND': [
					{email: 'test@test.com'},
					{'OR': [{first_name: 'Casey', last_name: 'Neistat'}]}
				]
			}
		]
	}

	let where4 = {
		'OR': [{first_name: ['Casey','Felix']}]
	}

	// let user = await dbOp.select({
	// 	table: 'users',
	// 	fields: ['first_name','last_name'],
	// 	where: 'email=?',
	// 	params: ['test@test.com'],
	// 	additions: 'LIMIT 1'
	// });
	
	let user = await dbOp.select({
		table: 'users',
		fields: ['id','first_name','last_name'],
		where: where4,
		orderby: {id:'DESC'},
		additions: 'LIMIT 1'
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