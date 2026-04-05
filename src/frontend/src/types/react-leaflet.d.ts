declare module "react-leaflet" {
  import type { ReactNode } from "react";

  export interface MapContainerProps {
    center: [number, number];
    zoom: number;
    style?: React.CSSProperties;
    scrollWheelZoom?: boolean;
    className?: string;
    children?: ReactNode;
    [key: string]: any;
  }

  export interface TileLayerProps {
    attribution?: string;
    url: string;
    [key: string]: any;
  }

  export interface MarkerProps {
    position: [number, number];
    icon?: any;
    eventHandlers?: Record<string, (...args: any[]) => void>;
    children?: ReactNode;
    [key: string]: any;
  }

  export interface PopupProps {
    children?: ReactNode;
    [key: string]: any;
  }

  export function MapContainer(props: MapContainerProps): JSX.Element;
  export function TileLayer(props: TileLayerProps): JSX.Element;
  export function Marker(props: MarkerProps): JSX.Element;
  export function Popup(props: PopupProps): JSX.Element;
  export function useMap(): any;
}
