import {ImageResponse} from 'next/og';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
export const dynamic='force-static';
export async function GET(){
 const logo=await readFile(path.join(process.cwd(),'public/coz-watermark.png'));
 return new ImageResponse(<div style={{width:512,height:512,display:'flex',alignItems:'center',justifyContent:'center'}}><img src={'data:image/png;base64,'+logo.toString('base64')} width={430} height={480} style={{objectFit:'contain'}} alt=""/></div>,{width:512,height:512});
}
