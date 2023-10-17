import fetch from "node-fetch";
import { champByKey } from "./champByKey.js";

export async function getLiveGame(championByIdCache, championJson, region, id, apiKey){

  

    let liveGame = await fetch(`https://${region}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${id}?api_key=${apiKey}`)
    liveGame = await liveGame.json();
    let game;

    if(!liveGame.gameId) return game = false;

    let queuesID = await fetch('https://static.developer.riotgames.com/docs/lol/queues.json');
    queuesID = await queuesID.json()

    const summoner= await liveGame.participants.filter(p => p.summonerId == id);
    const gamemode = await queuesID.filter(w => w.queueId == liveGame.gameQueueConfigId);
  
    let champEmojis = await fetch('https://ktsun0p.github.io/cakebot-simple-api/champs.json');
    champEmojis = await champEmojis.json();


    const lastgamechamp = await champByKey(championByIdCache,championJson,summoner[0].championId);

    let gamemodeDescription = gamemode[0].description.slice(0,-1);
     game = {
        summonerName:summoner[0].summonerName,
        mode: gamemodeDescription,
        champion:{
            name:lastgamechamp.name,
            id:summoner[0].championId,
            emoji: champEmojis[summoner[0].championId]
        }
     }
     return game;

}
