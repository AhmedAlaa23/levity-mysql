import operations from './operations.js'
import {setDB, getDBCon} from './db-con.js'

const dbOp = {
	...operations
}

export {setDB, getDBCon, dbOp}