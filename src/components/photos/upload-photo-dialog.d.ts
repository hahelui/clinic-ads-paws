import * as React from "react";
import { Photo, PhotoType } from "./photos-page";

export interface UploadPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (photo: Omit<Photo, "id">) => void;
  defaultType?: PhotoType;
}

export function UploadPhotoDialog(props: UploadPhotoDialogProps): React.ReactElement;
