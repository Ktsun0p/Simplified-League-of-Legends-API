import fetch from "node-fetch";
import { getVersion } from "./getVersion.js";
import { champByKey } from "./champByKey.js";

const masteries_emojis = 
[
"<:m1:1160313061106782208>",
"<:m2:1160313059001237595>",
"<:m3:1160313056102985881>",
"<:m4:1160313054098104421>",
"<:m5:1160313051489259683>",
"<:m6:1160313049937358868>",
"<:m7:1160313046883897364>"
]

export async function getMasteries(championByIdCache,championJson,summonerId,region,language = "en_US", apiKey){

    let lastver = await getVersion();
    let masteries = await fetch(`https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}?api_key=${apiKey}`);
    masteries = await masteries.json();
    let champEmojis = await fetch('https://ktsun0p.github.io/cakebot-simple-api/champs.json');
    champEmojis = await champEmojis.json();
    let topmasteries = [];

  if(masteries[0]){
    for(let i = 0; i <= masteries.length-1; i++){
        let fm = await champByKey(championByIdCache,championJson,masteries[i].championId,language);
        let fm1 = masteries[i].championLevel;
        let pfm1 = masteries[i].championPoints;
        let champEmj;
        try {
          champEmj = champEmojis[masteries[i].championId].icon;
        } catch (error) {

          champEmj = "<:Toto_Bug:1019280617105522729>"
        }

        topmasteries.push({
            name:fm.name,
            id:fm.id,
            slogan:fm.title,
            level:fm1,
            levelEmoji:masteries_emojis[fm1-1],
            emoji:champEmj,
            points:pfm1,
            full: `http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${fm.id}_0.jpg`,
            square:`http://ddragon.leagueoflegends.com/cdn/${lastver}/img/champion/${fm.id}.png`
        })
    }
 
  }
   
  return topmasteries;

}