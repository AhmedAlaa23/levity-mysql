import mysql from 'mysql';
import {setDB, dbOp} from '../lib/index.js'

// creating MySql Pool
let DB = mysql.createPool({
	connectionLimit : 50,
	host			: 'localhost',
	user			: 'root',
	password	: '',
	database	: 'test',
	timezone	: 'UTC',
	charset		: 'UTF8_GENERAL_CI',
	multipleStatements: true
});

setDB(DB);

// accounts: {
// 	id: {type: 'INT(11)', autoIncrement: true, primaryKey: true, unique: true, allowNull: false},
// 	name: {type: 'VARCHAR(255)', allowNull: false},
// },
// accounts_categories: {
// 	id: {type: 'int(11)', isID: true},
// 	name: {type: 'VARCHAR(255)'}
// }

const dbSchema = {
	users: {
		id: {type: 'INT(11)', isID: true},
		first_name: {type: 'VARCHAR(255)'},
		last_name: {type: 'VARCHAR(255)'},
		email: {type: 'VARCHAR(255)'},
		money: {type: 'INT(11)'},
	},
	users_categories: {
		id: {type: 'int(11)', isID: true},
		name: {type: 'VARCHAR(255)'}
	},
}

async function addUser(){
	// table name, data to insert
	await dbOp.insert('users', {first_name: 'David', last_name: 'Dobrik', email: 'test@test.com'});
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
		fields: ['first_name','last_name'],
		where: "email=?",
		params: ['test@test.com']
	});
	
	console.log(user.first_name);
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

	// let user = await dbOp.select({
	// 	table: 'users',
	// 	fields: ['first_name','last_name'],
	// 	where: 'email=?',
	// 	params: ['test@test.com'],
	// 	additions: 'LIMIT 1'
	// });
	
	let user = await dbOp.select({
		table: 'users',
		fields: ['first_name','last_name'],
		where: where2,
		additions: 'LIMIT 1'
	});

	console.log(user);
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
	await dbOp.dropTables(dbSchema);
	await dbOp.createTables(dbSchema);

	await addUser();
	await updateUser();
	await getUser();
	// await deleteUser();
	// await selectUser();
})()