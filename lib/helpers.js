function parseWhereObj(where={}, op='AND'){

	let whereParams = [];

	function opConvert(opArray, op='AND'){
		let opStr = ''

		opStr += '(';
		for(let [arrIndex, obj] of opArray.entries()){
			for(let [objIndex, [key,value]] of Object.entries(Object.entries(obj)) ){
				if(key === 'OR' || key === 'AND'){
					opStr += opConvert(value, key);
				}
				else if(Array.isArray(value)){
					// common key with multiple values
					for(let singleValue of value){
						opStr += `${key}=? ${op} `;
						whereParams.push(singleValue);
					}
					opStr = opStr.slice(0,-(op.length+2))
				}
				else{
					// check if it's last in object and array to remove the AND or OR from last
					if(arrIndex === opArray.length-1 && objIndex == Object.keys(obj).length-1){opStr += `${key}=?`}
					else{opStr += `${key}=? ${op} `}
					whereParams.push(value);
				}
			}
		}
		opStr += ')'

		return opStr;
	}

	let whereStr = '';

	for(let [key, value] of Object.entries(where)){
		if(Array.isArray(value)){
			let opStr = opConvert(value, key)

			whereStr += opStr;

			whereStr = whereStr.slice(1)
			whereStr = whereStr.slice(0,-1)
		}
		else{
			whereStr += `${key}=?`;
			whereParams.push(value);
		}
	}

	return {whereStr, whereParams};
}

export {parseWhereObj}