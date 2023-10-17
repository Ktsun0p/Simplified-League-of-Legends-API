import fetch from "node-fetch";
import { getVersion } from "./getVersion.js";

export async function latestChampionDDragon(championJson, language = "en_US") {
    if (championJson[language]) return championJson[language];

    let response;
    
    do {
        const version = await getVersion(); 
        response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${language}/champion.json`);
    } while (!response.ok);
    
    championJson[language] = await response.json();
    return championJson[language];
}