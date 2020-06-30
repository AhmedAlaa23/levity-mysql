import operations from './operations.js'
import {db, getCon} from './db-con.js'

const db = {
	db,
	getCon,
	...operations
}

export default db