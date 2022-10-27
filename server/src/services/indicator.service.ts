import { indicators } from "tulind";

export interface GetMacdParams {
    prices: number[],
    options?:number[]
}


export const getMacd = async ({prices, options}:GetMacdParams)=>{
    const results =await indicators.macd.indicator([prices], options?options:[12, 26, 9])
    const histogram = results[2]
    return histogram
};