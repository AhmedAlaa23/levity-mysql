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
	accounts: {
		id: {type: 'INT(11)', isID: true},
		name: {type: 'VARCHAR(255)'},
	},
	accounts_categories: {
		id: {type: 'int(11)', isID: true},
		name: {type: 'VARCHAR(255)'}
	}
}

dbOp.createTables(dbSchema);

async function addUser(){
	// table name, data to insert
	await dbOp.insert('users', {first_name: 'David', last_name: 'Dobrik', email: 'test@test.com'});
}

async function selectUser(){
	// table name, fields to select, where conditions, parameters to assign, additions
	let user = await dbOp.select('users', ['first_name','last_name'], "email=?", ['test@test.com'], 'LIMIT 1');
	console.log(user);
}

async function getUser(){
	// table name, fields to select, where conditions, parameters to assign
	let user = await dbOp.get('users', ['first_name','last_name'], "email=?", ['test@test.com']);
	console.log(user.first_name);
}

// addUser();
// getUser();