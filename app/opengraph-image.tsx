import {ImageResponse} from 'next/og';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
export const alt='COZ COS CLOSET — Cosplay rental and shared wardrobe';
export const size={width:1200,height:630};
export const contentType='image/png';
export default async function Image(){
 const logo=await readFile(path.join(process.cwd(),'public/coz-logo-transparent.png'));
 return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',background:'#17141f',padding:'70px',color:'#f6f3ff',fontFamily:'sans-serif'}}><div style={{display:'flex',width:300,height:370,alignItems:'center',justifyContent:'center'}}><img src={'data:image/png;base64,'+logo.toString('base64')} width={255} height={310} alt="" style={{objectFit:'contain'}}/></div><div style={{display:'flex',flexDirection:'column',paddingLeft:60,width:690}}><div style={{fontSize:19,letterSpacing:5,color:'#d7ff77'}}>COSPLAY • ANIME • GAME</div><div style={{display:'flex',flexDirection:'column',fontSize:69,fontWeight:800,lineHeight:1.12,marginTop:32}}><span>COZ COS</span><span>CLOSET</span></div><div style={{fontSize:26,color:'#c1b5d0',marginTop:28}}>Rent a character. Share your wardrobe.</div><div style={{display:'flex',fontSize:18,color:'#d7ff77',marginTop:36}}>REAL CLOTHES. ANOTHER YOU.</div></div></div>,size)
}
