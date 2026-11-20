import {createHash, timingSafeEqual} from 'node:crypto';
import {rateLimit, storeReady} from './store.ts';
const digest=(s:string)=>createHash('sha256').update(s).digest();
export function adminReady(){return /^[a-f0-9]{64}$/i.test(process.env.ADMIN_PASSWORD_SHA256||'')||(process.env.ADMIN_TOKEN||'').length>=16;}
export function matchesAdminPassword(value:string){
 if(!value||value.length>200)return false;
 const hash=process.env.ADMIN_PASSWORD_SHA256||'';
 if(/^[a-f0-9]{64}$/i.test(hash)&&timingSafeEqual(digest(value),Buffer.from(hash,'hex')))return true;
 const token=process.env.ADMIN_TOKEN||'';
 return token.length>=16&&timingSafeEqual(digest(value),digest(token));
}
export async function authorizeAdmin(req:Request){
 if(!adminReady()||!storeReady())return 503;
 const origin=req.headers.get('origin');
 if(origin&&origin!==new URL(req.url).origin)return 403;
 try{
 const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
 if(!await rateLimit(`admin:${ip}`,30,900))return 429;
 return matchesAdminPassword((req.headers.get('authorization')||'').replace(/^Bearer\s+/i,''))?200:401;
 }catch{return 503;}
}
