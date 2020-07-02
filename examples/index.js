import mysql from 'mysql';
import {setDB, dbOp} from '../lib/index.js'

// creating MySql Pool
let DB = mysql.createPool({
	connectionLimit : 50,
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'test',
	timezone: 'UTC',
	multipleStatements: true
});

setDB(DB);

async function addUser(){
	// table name, data to insert
	await dbOp.insert('users', {first_name: 'David', last_name: 'Dobrik', email: 'david@dobrik.com'});
}

async function selectUser(){
	// table name, fields to select, where conditions, parameters to assign, additions
	let user = await dbOp.select('users', ['first_name','last_name'], "email=?", ['david@dobrik.com'], 'LIMIT 1');
	console.log(user);
}

async function getUser(){
	// table name, fields to select, where conditions, parameters to assign
	let user = await dbOp.get('users', ['first_name','last_name'], "email=?", ['david@dobrik.com']);
	console.log(user.first_name);
}

// addUser();
getUser();