function parseWhereObj(where={}, op='AND'){
	let whereParams = [];

	// todo: validate the whole object structure
	// todo: validate that value is only array when objOp is In - for preventing errors
	const getParamValueAndOpStr = (key, value)=>{
		let paramValueAndOpStr = '';
		if(value?.constructor === Object){
			let {op: objOp, value: objValue} = value;
			if( !['<','>','!=','<=','>=','IN'].includes(objOp) ){ objOp='='; }
			if(objOp==='IN'){
				paramValueAndOpStr = `${key} IN (${objValue.map(i=>'?').join()})`;
			}
			else{
				paramValueAndOpStr = `${key}${objOp}?`;
			}
		}
		else{
			paramValueAndOpStr = `${key}=?`;
		}
		return paramValueAndOpStr;
	}


	function opConvert(opArray, op='AND'){
		let opStr = ''

		opStr += '(';
		for(let [arrIndex, obj] of opArray.entries()){
			for(let [objIndex, [key,value]] of Object.entries(Object.entries(obj)) ){
				if(key === 'OR' || key === 'AND'){
					opStr += opConvert(value, key);
				}
				else{
					// check if it's last in object and array to remove the AND or OR from last
					if(arrIndex === opArray.length-1 && objIndex == Object.keys(obj).length-1){opStr += `${getParamValueAndOpStr(key, value)}`}
					else{opStr += `${getParamValueAndOpStr(key, value)} ${op} `}
					whereParams.push(value?.value ?? value);
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
			whereStr += `${getParamValueAndOpStr(key, value)}`;
			whereParams.push(value?.value ?? value);
		}
	}

	// to flat any array in case there was an IN (?,?,?) array values
	whereParams = whereParams.flat();
	return {whereStr, whereParams};
}

export {parseWhereObj}