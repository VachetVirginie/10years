import hunt from '../data/hunt.example.json'

export type Base = { id:string; title:string; prompt:string; success?:string; hint?:string }
export type HuntStep =
  | (Base & { type:'riddle'; answer:string })
  | (Base & { type:'choice'; choices:string[]; correctIndex:number })
  | (Base & { type:'bonus'; bonusType:string; targetColor?:string; targetTheme?:string; targetElement?:string; targetMemory?:string; targetAction?:string; targetConcept?:string })

export function useHunt() {
  return {
    title: hunt.title,
    steps: hunt.steps as HuntStep[]
  }
}
