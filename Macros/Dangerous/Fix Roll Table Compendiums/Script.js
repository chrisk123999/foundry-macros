//Chrome ran out of memory when running this on more than 300 tables.

for (let i = 0; game.tables.size > i; i++) {
	let tableID = game.tables._source[i]._id;
	console.log('[' + i + '] Updating: ' + tableID);
	const key = "world.ddb-homebrew-ddb-items";
	const table = game.tables.get(tableID);
	const docs = await game.packs.get(key).getDocuments();
	const updates = table.results.filter(r => {
	  return r.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM;
	}).map(r => {
	  const doc = docs.find(d => d.name === r.text);
	  if(!doc) return {_id: r.id};
	  return {_id: r.id, documentCollection: key, documentId: doc.id, img: doc.img};
	});
	await table.updateEmbeddedDocuments("TableResult", updates);
}