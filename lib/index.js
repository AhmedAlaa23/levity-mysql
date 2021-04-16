import operations from './operations.js'
import {createDatabase, createDBPool, DBEnd, getDBCon} from './db-con.js'

const dbOp = {
	...operations
}

export {createDatabase, createDBPool, DBEnd, getDBCon, dbOp}