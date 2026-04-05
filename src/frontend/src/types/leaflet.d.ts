declare module "leaflet" {
  const L: any;
  export = L;
  export as namespace L;
}

declare module "leaflet/dist/leaflet.css" {
  const content: string;
  export default content;
}

declare module "leaflet/dist/images/marker-icon-2x.png" {
  const src: string;
  export default src;
}

declare module "leaflet/dist/images/marker-icon.png" {
  const src: string;
  export default src;
}

declare module "leaflet/dist/images/marker-shadow.png" {
  const src: string;
  export default src;
}
