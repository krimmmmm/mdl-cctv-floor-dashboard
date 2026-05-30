```tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface CameraStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  camera: any;
  onUpdate?: () => void;
}

const CameraStatusModal = ({
  open,
  onOpenChange,
  camera,
  onUpdate,
}: CameraStatusModalProps) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];

      if (!file || !camera?.id) return;

      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName =   camera.id + "-" + Date.now() + "." + fileExt;

      const { error: uploadError } = await supabase.storage
        .from('camera-photos')
        .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from('camera-photos')
        .getPublicUrl(fileName);

      const photoUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('cameras')
        .update({
          photo1: photoUrl,
        })
        .eq('id', camera.id);

      if (updateError) {
        console.error(updateError);
        alert(updateError.message);
        return;
      }

      alert('Upload success');

      if (onUpdate) {
        onUpdate();
      }

    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const photos = [
    camera?.photo1,
    camera?.photo2,
    camera?.photo3,
    camera?.photo4,
  ].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-black text-white border border-gray-800">
        <DialogHeader>
          <DialogTitle>
            Camera Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">
              รูปหน้างาน ({photos.length}/4)
            </h3>

            <label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />

              <Button asChild>
                <span>
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </span>
              </Button>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`photo-${index}`}
                className="w-full h-52 object-cover rounded-lg border border-gray-700"
              />
            ))}
          </div>

          {photos.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              ยังไม่มีรูปหน้างาน
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
            >
              Edit Position
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraStatusModal;
```
