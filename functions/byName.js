import fetch from "node-fetch";
import { getVersion } from "./getVersion.js";
import { getLiveGame } from "./LiveGame.js";
import { getMasteries } from "./masteries.js";
import { champByKey } from "./champByKey.js";
import fs from "fs";
import regions from "../data/regions.json" assert { type: "json"};
import emblems from "../data/emblems.json" assert { type: "json"};
import {lolApi} from "../index.js";

let championByIdCache = {};
let championJson = {};


/**
 * 
 * @param {String} name 
 * @param {String} region 
 * @param {String} lang 
 * @param {lolApi} apiInstance 
 */
export async function byName(name,region, lang = "en_US", apiInstance){

    region = region.toUpperCase();
    name = name.toLowerCase();
    const apiKey = apiInstance.apiKey;
    if(!regions[region]) throw new Error(`Region "${region}" does not exist.`)

     const lastVer = await getVersion();

     const region_routing_value = regions[region][1]
     const region_name = regions[region][0]

     try {
          let summonerURL = await fetch(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${apiKey}`);
     summonerURL = await summonerURL.json();
     if(summonerURL.status) return handleAPIError(summonerURL.status.status_code);

     let lastGameId = await fetch(`https://${region_routing_value}.api.riotgames.com/lol/match/v5/matches/by-puuid/${summonerURL.puuid}/ids?start=0&count=1&api_key=${apiKey}`);
     lastGameId = await lastGameId.json();
     if(lastGameId.status) return handleAPIError(lastGameId.status.status_code);
     lastGameId = lastGameId[0];

     let lastGame = await fetch(`https://${region_routing_value}.api.riotgames.com/lol/match/v5/matches/${lastGameId}?api_key=${apiKey}`)
     lastGame = await lastGame.json();
     if(lastGame.status) return handleAPIError(lastGame.status.status_code);
     let lastGameInfo = lastGame.info.participants.filter(p => p.puuid == summonerURL.puuid);

     let queuesID = await fetch('https://static.developer.riotgames.com/docs/lol/queues.json');
     queuesID = await queuesID.json()
     let champEmojis = await fetch('https://ktsun0p.github.io/cakebot-simple-api/champs.json');
     champEmojis = await champEmojis.json();
     const liveGame = await getLiveGame(championByIdCache,championJson, region, summonerURL.id, apiKey);

     let iconURL = `https://ddragon.leagueoflegends.com/cdn/${lastVer}/img/profileicon/${summonerURL.profileIconId}.png?width=256&height=256`;

     const topmasteries = await  getMasteries(championByIdCache,championJson,summonerURL.id,region, lang, apiKey);
     let bground; 

     if(topmasteries[0]) bground =`http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${topmasteries[0].id}_0.jpg`; 
     else bground = "https://logodownload.org/wp-content/uploads/2014/09/lol-league-of-Legends-logo.png";
   
       let rankedStats = await fetch(`https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerURL.id}?api_key=${apiKey}`);
           rankedStats = await rankedStats.json()
          rankedStats = await rankedStats.filter(w => w.queueType != "RANKED_TFT_PAIRS")
          

          let soloQ = rankedStats.filter(w => w.queueType == "RANKED_SOLO_5x5")[0];
          let flexQ = rankedStats.filter(w => w.queueType == "RANKED_FLEX_SR")[0];
          let ranked = [];
        
          if(soloQ){

              soloQ = {
                queueType: "Solo/Duo",
                tier: capitalizeFirstLetter(String(soloQ.tier).toLowerCase()),
                rank:soloQ.rank,
                emblem:emblems[soloQ.tier.toLowerCase()],
                leaguePoints:soloQ.leaguePoints,
                wins: soloQ.wins,
                losses: soloQ.losses,
                hotStreak:soloQ.hotStreak,

              }
              ranked.push(soloQ)
          }
          if(flexQ){

            flexQ = {
              queueType: "Flex",
              tier: capitalizeFirstLetter(String(flexQ.tier).toLowerCase()),
              rank: flexQ.rank,
              emblem:emblems[flexQ.tier.toLowerCase()],
              leaguePoints: flexQ.leaguePoints,
              wins: flexQ.wins,
              losses: flexQ.losses,
              hotStreak:flexQ.hotStreak,

            }
            ranked.push(flexQ)
        }

        const gamemode = await queuesID.filter(w => w.queueId == lastGame.info.queueId);
        let gamemodeDescription = gamemode[0].description.slice(0,-1);
        let kd = (lastGameInfo[0].kills+lastGameInfo[0].assists)/lastGameInfo[0].deaths;
         if(lastGameInfo[0].deaths == 0) kd = (lastGameInfo[0].kills+lastGameInfo[0].assists)/1;

        const kda = Math.round((kd+Number.EPSILON)*100)/100;
      const lastgamechamp = await champByKey(championByIdCache,championJson,lastGameInfo[0].championId,lang);
      const lastgamechampemoji = champEmojis[lastGameInfo[0].championId].icon;

     let  laneEMJ = "<:UNKNOWN_ROLE:980425992873066526>";
      switch (lastGameInfo[0].lane) {
        case "TOP":
          laneEMJ = "<:TOP:977294915841187922>";
          break;
         case "JUNGLE":
           laneEMJ = "<:JUNGLE:977294894169210891>";
           break;
         case "MIDDLE":
           laneEMJ = "<:MID:977294933453049956>";
           break;
         case "BOTTOM":
           laneEMJ= "<:ADC:977294965870829658><:SUPPORT:977294998217318471>";
          break;
      }

         const lastgame = {
             mode:gamemodeDescription,
             win:lastGameInfo[0].win,
             champion:lastgamechamp.name,
             emoji:lastgamechampemoji,
             kills:lastGameInfo[0].kills,
             deaths:lastGameInfo[0].deaths,
             assists:lastGameInfo[0].assists,
             lane:lastGameInfo[0].lane,
             id:lastGame.info.gameId,
             laneEmoji:laneEMJ,
             visionscore:lastGameInfo[0].visionScore,
             kda:kda
         }
     
   const summoner ={
       name: summonerURL.name,
       iconURL: iconURL,
       level: summonerURL.summonerLevel,
       region: region_name,
       background:bground,
       id: summonerURL.id,
       accountID: summonerURL.accountId,
       puuid: summonerURL.puuid,
       masteries:topmasteries,
       rankedInfo:ranked,
       lastgame:lastgame,
       liveGame:liveGame,
   }
   const summonerJSON = JSON.stringify(summoner, null, 2); // El segundo argumento (null, 2) hace que la salida JSON sea más legible

   // Escribe el objeto JSON en un archivo llamado "summoner.json"
   fs.writeFileSync('summoner.json', summonerJSON);

   return summoner;
     } catch (error) {
         throw new Error(error);
     }
     
}


function capitalizeFirstLetter(text){
     return text.charAt(0).toUpperCase() + text.slice(1);
}

function handleAPIError(statusCode) {
     let errorMessage;
     switch (statusCode) {
         case 400:
             errorMessage = "Bad request";
             break;
         case 401:
             errorMessage = "Unauthorized";
             break;
         case 403:
             errorMessage = "Forbidden";
             break;
         case 404:
             errorMessage = "Data not found";
             break;
         case 405:
             errorMessage = "Method not allowed";
             break;
         case 415:
             errorMessage = "Unsupported media type";
             break;
         case 429:
             errorMessage = "Rate limit exceeded";
             break;
         case 500:
             errorMessage = "Internal server error";
             break;
         case 502:
             errorMessage = "Bad gateway";
             break;
         case 503:
             errorMessage = "Service unavailable";
             break;
         case 504:
             errorMessage = "Gateway timeout";
             break;
         default:
             errorMessage = `Unknown error with status code: ${statusCode}`;
     }
     
     throw new Error(errorMessage);
 }