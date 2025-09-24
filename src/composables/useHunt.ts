import hunt from '../data/hunt.example.json'

export type Base = { id:string; title:string; prompt:string; success?:string; hint?:string }
export type HuntStep =
  | (Base & { type:'riddle'; answer:string })
  | (Base & { type:'choice'; choices:string[]; correctIndex:number })

export function useHunt() {
  return {
    title: hunt.title,
    steps: hunt.steps as HuntStep[]
  }
}
