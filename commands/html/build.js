module.exports = async function(changed = []){
	console.log("THE BUILD CHANGED FILES:");
	console.log(changed);
	
	if(changed.length === 0){
		console.log("BUILDING ALL FILES");
	} else {
		console.log("BUILDING CHANGED FILES");
	}
}