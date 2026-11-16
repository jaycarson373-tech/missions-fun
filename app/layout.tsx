import type {Metadata} from 'next';
import './globals.css';
const origin=process.env.NEXT_PUBLIC_SITE_URL||(process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:'http://localhost:4537');
export const metadata:Metadata={metadataBase:new URL(origin),title:'Missions — Find the job. Bring the proof.',description:'A community mission board for GTA VI. Explore briefs, prepare your evidence and see the 2.55M-token participation requirement.',icons:{icon:[{url:'/mark.svg',type:'image/svg+xml'},{url:'/favicon.png',sizes:'48x48',type:'image/png'}]},robots:{index:false,follow:false},openGraph:{title:'Missions — Find the job. Bring the proof.',description:'GTA VI community bounties. A brief. Your run. The proof.',images:[{url:'/brand/banner.png',width:1500,height:500}]},twitter:{card:'summary_large_image'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
