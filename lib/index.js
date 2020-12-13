import operations from './operations.js'
import {createDBPool, DBEnd, getDBCon} from './db-con.js'

const dbOp = {
	...operations
}

export {createDBPool, DBEnd, getDBCon, dbOp}