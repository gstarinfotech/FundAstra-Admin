'use client';
import Link from "next/link";
import { usePathname,useRouter } from "next/navigation";
import { useEffect } from "react";
import { FileText, Search, Inbox, LogOut } from "lucide-react";
const links=[{href:"/pages",label:"Pages & SEO",Icon:Search},{href:"/blogs",label:"Blog Management",Icon:FileText},{href:"/leads",label:"Lead Management",Icon:Inbox}];
export default function AdminShell({children}:{children:React.ReactNode}){
 const path=usePathname();const router=useRouter();
 useEffect(()=>{if(!localStorage.getItem("fundastra_admin_token"))router.replace("/login");},[router]);
 function logout(){localStorage.removeItem("fundastra_admin_token");localStorage.removeItem("fundastra_admin_user");router.replace("/login");}
 return <div className="min-h-screen md:flex"><aside className="md:w-64 bg-[#052e26] text-white p-5 md:min-h-screen flex md:flex-col"><div className="font-semibold tracking-[.18em] text-sm mb-8">FUND ASTRA</div><nav className="flex md:block gap-1 flex-wrap">{links.map(({href,label,Icon})=><Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm mb-1 ${path===href?"bg-white/15 text-white":"text-white/75 hover:bg-white/10"}`}><Icon size={17}/>{label}</Link>)}</nav><button onClick={logout} className="md:mt-auto mt-4 flex items-center gap-3 px-3 py-3 text-sm text-white/75 hover:text-white"><LogOut size={17}/>Sign out</button></aside><section className="flex-1 min-w-0"><header className="h-16 bg-white border-b flex items-center justify-between px-6"><span className="font-medium text-sm">Website administration</span><span className="text-xs text-gray-500">Fund Astra</span></header><main className="p-5 md:p-8 max-w-7xl mx-auto">{children}</main></section></div>
}
