import type {Metadata} from 'next';
import './globals.css';
const origin=process.env.NEXT_PUBLIC_SITE_URL||(process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:'http://localhost:4537');
export const metadata:Metadata={metadataBase:new URL(origin),title:'BOUNTY — Player-created GTA VI challenges',description:'Create GTA VI challenges, record your run and prepare clip evidence for AI-assisted review. Community reward pools, without player wagers. Frontend preview.',icons:{icon:[{url:'/mark.svg',type:'image/svg+xml'},{url:'/mark.svg',type:'image/svg+xml'}]},robots:{index:false,follow:false},openGraph:{title:'BOUNTY — Player-created GTA VI challenges',description:'Your challenge. Their best shot. Player-created GTA VI bounties.',images:[{url:'/brand/bounty-banner.png',width:1500,height:500}]},twitter:{card:'summary_large_image'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
