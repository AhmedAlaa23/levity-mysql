import operations from './operations.js'
import {dropDatabase, createDatabase, createDBPool, DBEnd, getDBCon} from './db-con.js'

const dbOp = {
	...operations
}

export {dropDatabase, createDatabase, createDBPool, DBEnd, getDBCon, dbOp}