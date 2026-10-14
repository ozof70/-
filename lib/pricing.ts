import type {Item} from './catalog';
import {parseDetails} from './listing-details';
export function rentalTotal(item:Pick<Item,'price'|'details'>,days:number):number{const d=parseDetails(item.details);return item.price*(d.pricingMode==='rental'?1:days)}
