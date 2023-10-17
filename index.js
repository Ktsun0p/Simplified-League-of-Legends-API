import { byName } from "./functions/ByName.js";
export class lolApi {
    /**
     * 
     * @param {String} apiKey
     */
    constructor(apiKey) {
      this.apiKey = apiKey;
   
    }
  
    getSummonerByName(name, region, lang = "en_US"){
      return byName(name,region,lang,this);
    }

  }


