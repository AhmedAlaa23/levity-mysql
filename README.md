# levity-MySQL
Node SQL Operations

## Installation and Usage

```
$ npm install levity-mysql
```

```javascript
import mysql from 'mysql';
import {createDBPool, DBEnd, dbOp} from 'levity-validator';

// creating MySql Database Pool
createDBPool({
	connectionLimit : 50,
	host			: 'localhost',
	user			: 'root',
	password	: 'root',
	database	: 'test',
	charset		: 'utf8mb4_unicode_ci',
	timezone	: 'UTC',
	multipleStatements: true
})

async function addUser(){
	// table name, data to insert
	await dbOp.insert('users', {first_name: 'David', last_name: 'Dobrik', email: 'david@dobrik.com'});
}

async function getUserName(){
	// table name, fields to select, where conditions, parameters to assign
	let user = await dbOp.get({
		table: 'users',
		fields: ['first_name','last_name'],
		where: "email=?",
		params: ['david@dobrik.com']
	});
	
	return `${user.first_name} ${user.last_name}`
}

await addUser();
await getUser();

// end database Connection
await DBEnd();
```

## Documentation

- [Low Operations](README.md#Low-Operations)
- [High Operations](README.md#High-operations)

## Low-Operations

### insert(table='', data={})

table (string): table name to insert<br>
data (object): data to insert. example: {first_name: 'David', last_name: 'Dobrik'}

**example**
```javascript
dbOp.insert('users', {first_name: 'David', last_name: 'Dobrik'});
// adds a record to the users table with first_name='David' and last_name='Dobrik'
```

<hr>

### select({table='', fields=[], where='', params=[], additions=''})

table (string): table name to select from<br>
fields (array): fields to select<br>
where (string | object): where condition - [Where Examples](README.md#Where)<br>
params (array): parameters to bind<br>
orderby (Object): ORDER BY, example: {name:'DESC', age:'ASC'}<br>
additions (string): additional conditions. example: ORDER BY, LIMIT<br>

**example**
```javascript
dbOp.select('users', ['first_name','last_name'], "email=?", ['test@test.com'], 'LIMIT 1');
// or with where as object
dbOp.select('users', ['first_name','last_name'], {email: 'test@test.com'}, 'LIMIT 1');
// select the user with the email that is equal to 'test@test.com'
```

<hr>

### update({table='', fields={}, where='', params=[], additions=''})

table (string): table name to select from<br>
fields (object): fields to update {field_name: field_value}<br>
where (string || object): where condition - [Where Examples](README.md#Where)<br>
params (array): parameters to bind<br>
additions (string): additional conditions. example: ORDER BY, LIMIT<br>

**example**
```javascript
dbOp.update({
	table: 'users',
	fields: {first_name:'Felix', last_name:'shellberg'},
	where: {email: 'test@test.com'},
	additions: 'LIMIT 1'
});
// update the user with the 'test@test.com' email first and last name to felix shellberg
```

<hr>

### delete({table='', where='', params=[], additions=''})

table (string): table name to select from<br>
where (string || object): where condition - [Where Examples](README.md#Where)<br>
params (array): parameters to bind<br>
additions (string): additional conditions. example: ORDER BY, LIMIT<br>

**example**
```javascript
dbOp.delete({
	table: 'users',
	where: {email=?},
	params: ['test@test.com'],
	additions: 'LIMIT 1'
});
// deletes the user with the 'test@test.com' email
```

<hr>

## High-Operations

### get({table='', fields=[], where='', params=[], additions""})

**gets only one record, adds 'LIMIT 1' to the end of the query**

table (string): table name to select from<br>
fields (array): fields to select<br>
where (string || object): where condition - [Where Examples](README.md#Where)<br>
params (array): parameters to bind<br>
additions (string): additional conditions. example: ORDER BY (note: get already adds LIMIT 1 to the end of the query)<br>

**example**
```javascript
dpOp.get({
	table: 'users',
	fields: ['first_name','last_name'],
	where: {email: 'test@test.com'},
});
// return {first_name: 'David', last_name: 'Dobrik'}
```

### doesExist({table='', where=''})

**gets only one record**

table (string): table name to select from<br>
where (string || object): where condition - [Where Examples](README.md#Where)<br>

returns: boolean

**example**
```javascript
doesExist({
	table: 'users',
	where: {email: 'test@test.com'}
})
// return true
```
### createTables(dbSchema={}, tablesIgnored)

**Creates Tables in the database based on a schema**

dbSchema (Object): The Database Schema<br>
tablesIgnored (Array): Array of tables names to ignore and will not be added<br>

dbSchema Properties:<br>
{columnName: {type, default, isID, autoIncrement, primaryKey, allowNull, dbIgnore}}<br>

columnName: any valid sql column name<br>

type (string): any valid sql data type, ('INT(11)', 'VARCHAR(255)', 'DOUBLE(12,2)', 'JSON', etc..)<br>

isID (boolean): if true then the column is 'AUTO_INCREMENT PRIMARY KEY NOT NULL', default: false<br>

autoIncrement (boolean): if true then the column is AUTO_INCREMENT, default: false<br>

primaryKey (boolean): if true then the column is primaryKey, default: false<br>

allowNull (boolean): if true then null is now allowed in this column, default: true<br>

dbIgnore (boolean): if true then the column will be ignored and not added to the table, default: false<br>

**example**
```javascript
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

await createTables(dbSchema, tablesIgnored);
```

### Where

**All of the below are examples of valid Where Conditions**

```javascript
let where = 'email=?';
// here you need to add parameter for the ?
// WHERE email=?

let whereObj0 = {
	id: 1
}
// where id=1

let whereObj1 = {
	'AND': [
		{id: 1, email: 'test@test.com'}
	]
}
// WHERE id=1 AND email='test@test.com'

let whereObj2 = {
	'AND': [
		{id: 1},
		{'OR': [ {first_name: ['Casey','Felix']} ]}
	]
}
// WHERE id=1 AND (name='Casey' OR name='Felix')

let whereObj3 = {
	'OR': [
		{id: 1},
		{'AND': [
				{email: 'test@test.com'},
				{'OR': [{first_name: 'Casey', last_name: 'Neistat'}]}
			]
		}
	]
}
// WHERE id=1 OR ( email='test@tes.com' AND ( first_name='Casey' OR last_name='Neistat' ) )

```

**To Be Continued...**