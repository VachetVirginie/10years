export function withinRadius(user:{lat:number;lng:number}, target:{lat:number;lng:number}, rMeters:number){
  const R = 6371000
  const toRad = (d:number)=>d*Math.PI/180
  const dLat = toRad(target.lat-user.lat)
  const dLng = toRad(target.lng-user.lng)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(user.lat))*Math.cos(toRad(target.lat))*Math.sin(dLng/2)**2
  const d = 2*R*Math.asin(Math.sqrt(a))
  return d <= rMeters
}
