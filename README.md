# levity-MySQL
Node SQL Operations

## Installation and Usage

```
$ npm install levity-mysql
```

```javascript
import mysql from 'mysql';
import {setDB, dbOp} from 'levity-validator';

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

// setting the database
setDB(DB);

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

addUser();
getUser();
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

### get({table='', fields=[], where='', params=[]})

**gets only one record**

table (string): table name to select from<br>
fields (array): fields to select<br>
where (string || object): where condition - [Where Examples](README.md#Where)<br>
params (array): parameters to bind<br>

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