export const REQUIRED_TOKENS = 2_550_000n;
export const categories = ['All', 'Exploration', 'Driving', 'Photography', 'Research'] as const;
export type Category = typeof categories[number];
export type Mission = {id:string;title:string;category:Exclude<Category,'All'>;area:string;description:string;proof:string[];color:string;kind:'map'|'road'|'camera'|'file';timing:string};
export const missions:Mission[] = [
 {id:'001',title:'Find the frame.',category:'Exploration',area:'VICE CITY',description:'Match a location from an official GTA VI trailer to the same spot in your own gameplay. Show the reference and the route you took.',proof:['Official trailer link and timestamp','Your continuous gameplay clip','Side-by-side reference and matching frame'],color:'#ff7648',kind:'map',timing:'After game release'},
 {id:'002',title:'The clean getaway.',category:'Driving',area:'ROUTE TO BE SET',description:'Drive a published checkpoint route without a collision. The final route, vehicle rules and time limit will be fixed before the bounty opens.',proof:['One uncut gameplay clip','Start and finish checkpoints visible','Vehicle and route match the published brief'],color:'#b5adf2',kind:'road',timing:'After game release'},
 {id:'003',title:'Postcards after dark.',category:'Photography',area:'LEONIDA',description:'Capture an original nighttime scene in GTA VI. Bring a composition worth putting on the wall, plus evidence that you took it.',proof:['Original screenshot','Short clip showing the capture location','No stolen images or generated game footage'],color:'#e8c778',kind:'camera',timing:'After game release'},
 {id:'004',title:'Build the evidence file.',category:'Research',area:'OFFICIAL SOURCES',description:'Catalog businesses visible in official GTA VI trailers. Every entry needs a source and timestamp. Leave speculation out of the evidence column.',proof:['Official source URL for every entry','Timestamp or screenshot reference','Separate confirmed observations from interpretation'],color:'#92b9b0',kind:'file',timing:'Pre-release research'},
 {id:'005',title:'Off the main road.',category:'Exploration',area:'LEONIDA',description:'Document an overlooked place with a reproducible route and original gameplay. Exact location criteria will be published with the funded brief.',proof:['Continuous route clip','Clear starting landmark','Original footage with no edits hiding the route'],color:'#b5adf2',kind:'map',timing:'After game release'},
 {id:'006',title:'The location ledger.',category:'Research',area:'OFFICIAL SOURCES',description:'Build a source-linked list of places officially named by Rockstar. Cite the exact page or trailer and keep community guesses separate.',proof:['Official Rockstar URL','Exact name and source reference','No claimed access to unreleased game content'],color:'#ff7648',kind:'file',timing:'Pre-release research'}
];
// UI estimator only. Live authorization must come from a signed wallet session + finalized onchain holdings.
export function parseTokenAmount(value:string,decimals=6):bigint {
 if(!Number.isInteger(decimals)||decimals<0||decimals>18)throw new Error('Invalid decimals');
 const v=value.trim();if(!/^\d+(\.\d+)?$/.test(v))throw new Error('Enter a positive token amount without commas.');
 const [whole,fraction='']=v.split('.');if(fraction.length>decimals)throw new Error(`Use at most ${decimals} decimal places.`);
 if(whole.length>30)throw new Error('Amount is too large.');
 return BigInt(whole)*10n**BigInt(decimals)+BigInt(fraction.padEnd(decimals,'0')||'0');
}
export function calculateEligibility(amount:string){const balance=parseTokenAmount(amount);const threshold=REQUIRED_TOKENS*1_000_000n;return {meetsThreshold:balance>=threshold,shortfall:balance>=threshold?0n:threshold-balance,verified:false as const};}
export function makeProofDraft(missionId:string,url:string,notes:string){
 if(!missions.some(m=>m.id===missionId))throw new Error('Unknown mission.');
 let parsed:URL;try{parsed=new URL(url)}catch{throw new Error('Add a valid HTTPS evidence link.')}
 if(parsed.protocol!=='https:'||parsed.username||parsed.password)throw new Error('Use a public HTTPS evidence link without credentials.');
 if(url.length>2000)throw new Error('Evidence link is too long.');
 if(notes.trim().length<20||notes.length>2000)throw new Error('Add between 20 and 2,000 characters describing your evidence.');
 return {schemaVersion:1,project:'Missions',missionId,evidenceUrl:parsed.href,notes:notes.trim(),status:'local-draft',eligibilityVerified:false,requiredTokens:REQUIRED_TOKENS.toString(),tokenMint:null,submitted:false,payment:null};
}
