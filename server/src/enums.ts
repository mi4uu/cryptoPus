import { PairEnumType} from "@prisma/client";

export enum PriceType {
    open = 'open',
    close = 'close',
    high = 'high',
    low = 'low'
}
export enum Indicators {
    macd = 'Macd',
}
export {PairEnumType}