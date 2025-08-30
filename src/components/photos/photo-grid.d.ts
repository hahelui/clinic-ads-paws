import * as React from "react";
import { Photo } from "./photos-page";

export interface PhotoGridProps {
  photos: Photo[];
  onDelete?: (id: string) => void;
}

export function PhotoGrid(props: PhotoGridProps): React.ReactElement;
