import { latestChampionDDragon } from "./latestChampionDDragon.js";

export async function champByKey(championByIdCache,championJson,key, language = "en_US"){
	if (!championByIdCache[language]) {
		let json = await latestChampionDDragon(championJson,language); 
		
		championByIdCache[language] = {};
		for (var championName in json.data) {
			if (!json.data.hasOwnProperty(championName))
				continue;
          
			const champInfo = json.data[championName];
	
			championByIdCache[language][champInfo.key] = champInfo;
		}
	}

	return championByIdCache[language][key];
}