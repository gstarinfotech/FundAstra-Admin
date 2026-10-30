const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export function getToken(){ if(typeof window==="undefined") return ""; return localStorage.getItem("fundastra_admin_token") || ""; }
export async function api(path:string, options:RequestInit={}) {
 const token=getToken();const headers:Record<string,string>={...(token?{Authorization:`Bearer ${token}`}:{})};
 if(options.body && !(options.body instanceof FormData))headers["Content-Type"]="application/json";
 Object.assign(headers,options.headers||{});
 const response=await fetch(`${API}${path}`,{...options,headers,cache:"no-store"});
 const data=await response.json().catch(()=>({message:"Unexpected server response"}));
 if(!response.ok)throw new Error(data.message||"Request failed");return data;
}
export async function uploadFile(file:File):Promise<{url:string}>{const body=new FormData();body.append("image",file);return api("/uploads",{method:"POST",body});}
