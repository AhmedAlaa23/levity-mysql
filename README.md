# levity-MySQL
Node SQL Operations

## Installation and Usage

```
$ npm install levity-mysql
```

```
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
	let user = await dbOp.get('users', ['first_name','last_name'], "email=?", ['david@dobrik.com']);
	console.log(user);
	return `${user.first_name} ${user.last_name}`
}

addUser();
getUser();
```

## Documentation

- [Low Operations](README.md#Low-Operations)
- [High Operations](README.md#High-operations)

## Low-Operations

### insert(tableName='', data={})

tableName (string): table name to insert<br>
data (object): data to insert. example: {first_name: 'David', last_name: 'Dobrik'}

**example**
```
dbOp.insert('users', {first_name: 'David', last_name: 'Dobrik'});
// adds a record to the users table with first_name='David' and last_name='Dobrik'
```

<hr>

### select(tableName='', fields=[], where='', params=null, additions='')

tableName (string): table name to select from<br>
fields (array): fields to select<br>
where (string): where condition<br>
params (array || null): parameters to bind<br>
additions (string): additional conditions. example: ORDER BY, LIMIT<br>

**example**
```
dbOp.select('users', ['first_name','last_name'], "email=?", ['test@test.com'], 'LIMIT 1');
// select the user with the email that is equal to 'test@test.com'
```

<hr>

### update(tableName='', fields=[], where='', params=null, additions='')

tableName (string): table name to select from<br>
fields (array): fields to update<br>
where (string): where condition<br>
params (array || null): parameters to bind<br>
additions (string): additional conditions. example: ORDER BY, LIMIT<br>

**example**
```
dbOp.update('users', ['first_name','last_name'], "email=?", ['Felix','shellberg','test@test.com'], 'LIMIT 1');
// update the user with the 'test@test.com' email first and last name to felix shellberg
```

<hr>

### delete(tableName='', where='', params=null, additions='')

tableName (string): table name to select from<br>
where (string): where condition<br>
params (array || null): parameters to bind<br>
additions (string): additional conditions. example: ORDER BY, LIMIT<br>

**example**
```
dbOp.update('users', "email=?", ['test@test.com'], 'LIMIT 1');
// deletes the user with the 'test@test.com' email
```

<hr>

## High-Operations

### get(tableName='', fields=[], where='', params=null)

**gets only one record**

tableName (string): table name to select from<br>
fields (array): fields to select<br>
where (string): where condition<br>
params (array || null): parameters to bind<br>

**example**
```
get('users', ['first_name','last_name'], "email=?", ['test@test.com']);
// return {first_name: 'David', last_name: 'Dobrik'}
```

**To Be Continued...**