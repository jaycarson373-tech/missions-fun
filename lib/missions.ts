export const REQUIRED_TOKENS = 2_550_000n;
export const categories = ['All', 'Getaway', 'Driving', 'Stunts'] as const;
export type Category = typeof categories[number];
export type Rules = {vehicle:string;limit:string;fail:string};
export type Mission = {id:string;title:string;category:Exclude<Category,'All'>;area:string;description:string;proof:string[];color:string;kind:'map'|'road'|'camera'|'file';timing:string;difficulty:1|2|3;rules:Rules};
export const difficultyLabel = {1:'Warm-up',2:'Skilled',3:'Elite'} as const;
export const missions:Mission[] = [
 {id:'001',title:'Lose the heat.',category:'Getaway',area:'ROUTE TO BE CONFIRMED',description:'Escape a pursuit in a stolen police car. Keep the camera rolling from the theft until the wanted level clears. Vehicle and pursuit rules need gameplay validation.',proof:['One continuous gameplay clip','Police vehicle acquisition visible','HUD visible throughout the pursuit and escape'],color:'#ff5a1f',kind:'map',timing:'Gameplay concept',difficulty:2,rules:{vehicle:'Police vehicle, taken on camera',limit:'Until the wanted level clears',fail:'Leaving the vehicle, a cut or a reload'}},
 {id:'002',title:'Five minutes under pressure.',category:'Getaway',area:'WANTED LEVEL TO BE CONFIRMED',description:'Survive five minutes at the highest confirmed wanted level. The proposed six-star version depends on what GTA VI actually supports.',proof:['Wanted HUD and uninterrupted timer visible','No respawns or cuts','Published wanted-level requirement sustained'],color:'#ffb000',kind:'road',timing:'Gameplay concept',difficulty:3,rules:{vehicle:'Any',limit:'5:00 on a visible timer',fail:'Death, respawn or the wanted level dropping'}},
 {id:'003',title:'Stick the landing.',category:'Stunts',area:'JUMP TO BE CONFIRMED',description:'Land a creator-selected stunt in the specified vehicle. The approach, landing zone and damage rules are fixed before entries open.',proof:['Approach, jump and landing in one clip','Specified vehicle identifiable','Landing zone and final vehicle condition visible'],color:'#ffb000',kind:'camera',timing:'Gameplay concept',difficulty:2,rules:{vehicle:'Creator-specified vehicle',limit:'One attempt per clip',fail:'Landing outside the zone or a wrecked vehicle'}},
 {id:'004',title:'Not a scratch.',category:'Driving',area:'ROUTE TO BE CONFIRMED',description:'Complete a published city route without a collision. Creators set the checkpoints, vehicle and time limit before funding the bounty.',proof:['Entire route recorded without cuts','All checkpoints visible','No collision or vehicle substitution'],color:'#f4efe4',kind:'road',timing:'Gameplay concept',difficulty:2,rules:{vehicle:'Creator-specified vehicle',limit:'Creator-set time limit',fail:'Any collision or a vehicle swap'}},
 {id:'005',title:'One way out.',category:'Getaway',area:'BOUNDARY TO BE CONFIRMED',description:'Escape a pursuit while staying inside a creator-defined district. The allowed area and exit condition must be measurable from gameplay.',proof:['Map boundary and HUD visible','Continuous pursuit footage','Published escape condition satisfied'],color:'#5ce1c6',kind:'map',timing:'Gameplay concept',difficulty:3,rules:{vehicle:'Any road vehicle',limit:'Until the escape condition is met',fail:'Crossing the district boundary'}},
 {id:'006',title:'Beat the run.',category:'Driving',area:'ROUTE TO BE CONFIRMED',description:'Set a faster time on a community route. Every entrant uses the same vehicle class, checkpoints and timing rules.',proof:['Start and finish visible','Uncut route with all checkpoints','Vehicle class and elapsed time verifiable'],color:'#ff5a1f',kind:'road',timing:'Gameplay concept',difficulty:1,rules:{vehicle:'Published vehicle class',limit:'Fastest uncut time',fail:'A missed checkpoint or the wrong class'}}
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
 return {schemaVersion:1,project:'BOUNTY',missionId,evidenceUrl:parsed.href,notes:notes.trim(),status:'local-draft',eligibilityVerified:false,requiredTokens:REQUIRED_TOKENS.toString(),tokenMint:null,submitted:false,payment:null};
}

export type BriefDraft = {title:string;objective:string;evidence:string;rewardNotes:string};
// Local writing aid only: it scores how measurable a brief reads, never approves, publishes or funds it.
export function briefChecks(d:BriefDraft){
 const o=d.objective,e=d.evidence;
 return [
  {id:'title',label:'Short, specific title',ok:d.title.trim().length>=4&&d.title.length<=100},
  {id:'limit',label:'A measurable limit (time, laps, checkpoints or stars)',ok:/\d+\s*(:\d\d|s\b|sec|second|min|minute|lap|checkpoint|star|km|mile|meter|metre)/i.test(o)},
  {id:'vehicle',label:'Vehicle or loadout named',ok:/\b(car|vehicle|bike|motorcycle|boat|truck|van|heli|helicopter|plane|on foot|class|any vehicle)\b/i.test(o)},
  {id:'fail',label:'A clear fail condition',ok:/\b(fail|fails|disqualif\w*|without|must not|no (collision|crash|cuts?|respawn|death)|if you|crash|collision|respawn)\b/i.test(o)},
  {id:'continuous',label:'Continuous footage required',ok:/\b(continuous|uncut|unedited|one clip|single clip|no cuts?|one take)\b/i.test(e)},
  {id:'hud',label:'HUD, timer or map visible',ok:/\b(hud|timer|wanted|minimap|map|speedometer)\b/i.test(e)},
  {id:'nowager',label:'No entry fees or player wagers',ok:!/\b(entry fee|buy-?in|winner takes all|pay to (enter|play)|stake to enter)\b/i.test(d.rewardNotes)},
 ];
}
export function briefLink(origin:string,id:string){return `${origin.replace(/\/$/,'')}/#brief-${id}`}
export function shareText(title:string){return `"${title.trim().replace(/\.$/,'')}." A player-created GTA VI challenge on BOUNTY. Think you can beat it?`}
export function xIntent(text:string,url:string){return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
export function briefIdFromHash(hash:string){const m=/^#brief-(\d{3})$/.exec(hash);return m&&missions.some(x=>x.id===m[1])?m[1]:null}
