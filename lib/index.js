import operations from './operations.js'
import {dropDatabase, createDatabase, createDBPool, DBEnd, getDBCon, enableDebugging} from './db-con.js'

const dbOp = {
	...operations
}

export {dropDatabase, createDatabase, createDBPool, DBEnd, getDBCon, enableDebugging, dbOp}