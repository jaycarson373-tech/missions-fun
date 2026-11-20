import {NextResponse} from 'next/server';
import {authorizeAdmin} from '@/lib/admin';
import {listSubmissions} from '@/lib/store';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const auth=await authorizeAdmin(req);
 if(auth!==200)return NextResponse.json({error:auth===503?'Admin storage is unavailable.':auth===429?'Too many attempts. Try again later.':'Incorrect admin password.'},{status:auth,headers:{'Cache-Control':'no-store'}});
 try{return NextResponse.json({submissions:await listSubmissions(),storage:'connected',review:'manual'},{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({error:'Could not load submissions.'},{status:503})}
}
