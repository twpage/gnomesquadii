import { ISize } from "./game-components/utils";

//make sure one of these is odd to prevent weird camera issues
//TODO: fix weird camera issue when both are even (probably missing a -1)
export const viewableSize : ISize = { width: 30, height: 30 } 
export const regionSize : ISize = { width: 45, height: 45 }
