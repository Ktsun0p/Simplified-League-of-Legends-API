import fetch from "node-fetch"
export async function getVersion() {
    let lastVer = await fetch(`https://ddragon.leagueoflegends.com/api/versions.json`);
    lastVer = await lastVer.json();
    lastVer = lastVer[0];
    return lastVer;
}
