import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Plus, Image as ImageIcon, RefreshCw, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { workingPicturesAPI } from "@/lib/api";

interface WorkingPicture {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  deliveryUrl: string;
  photosCount: number;
  videosCount: number;
  createdAt?: string;
}

export default function AdminWorkingPictures() {
  const [pictures, setPictures] = useState<WorkingPicture[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add form state
  const [pName, setPName] = useState("");
  const [pDescription, setPDescription] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pImage, setPImage] = useState("");
  const [pDeliveryUrl, setPDeliveryUrl] = useState("");
  const [pPhotosCount, setPPhotosCount] = useState("");
  const [pVideosCount, setPVideosCount] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPicture, setEditingPicture] = useState<WorkingPicture | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDeliveryUrl, setEditDeliveryUrl] = useState("");
  const [editPhotosCount, setEditPhotosCount] = useState("");
  const [editVideosCount, setEditVideosCount] = useState("");
  const [editInProgress, setEditInProgress] = useState(false);

  useEffect(() => {
    loadPictures();
  }, []);

  const loadPictures = async () => {
    try {
      setLoading(true);
      const data = await workingPicturesAPI.getAll();
      setPictures(data);
    } catch (error) {
      console.error("Error loading working pictures:", error);
      toast.error("Failed to load working pictures");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadPictures();
    toast.success("Working pictures refreshed");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPImage(event.target?.result as string);
      setUploadingImage(false);
      toast.success("Image uploaded");
    };
    reader.onerror = () => {
      toast.error("Failed to upload image");
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const addPicture = async () => {
    if (!pName.trim() || !pDescription.trim()) {
      toast.error("Name & description required");
      return;
    }
    const price = parseFloat(pPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Enter valid price");
      return;
    }
    if (!pImage.trim()) {
      toast.error("Please upload an image");
      return;
    }
    if (!pDeliveryUrl.trim()) {
      toast.error("Please enter a delivery URL");
      return;
    }

    const picture = {
      id: crypto.randomUUID(),
      name: pName.trim(),
      description: pDescription.trim(),
      price,
      image: pImage.trim(),
      deliveryUrl: pDeliveryUrl.trim(),
      photosCount: parseInt(pPhotosCount) || 0,
      videosCount: parseInt(pVideosCount) || 0,
    };

    try {
      const created = await workingPicturesAPI.create(picture);
      setPictures(prev => [created, ...prev]);
      setPName("");
      setPDescription("");
      setPPrice("");
      setPImage("");
      setPDeliveryUrl("");
      setPPhotosCount("");
      setPVideosCount("");
      toast.success("Working picture added");
    } catch (error) {
      console.error("Error adding working picture:", error);
      toast.error("Failed to add working picture");
    }
  };

  const removePicture = async (id: string) => {
    try {
      await workingPicturesAPI.delete(id);
      setPictures(prev => prev.filter(p => p.id !== id));
      toast.info("Working picture removed");
    } catch (error) {
      console.error("Error removing working picture:", error);
      toast.error("Failed to remove working picture");
    }
  };

  const openEditDialog = (picture: WorkingPicture) => {
    setEditingPicture(picture);
    setEditName(picture.name);
    setEditDescription(picture.description);
    setEditPrice(picture.price.toString());
    setEditDeliveryUrl(picture.deliveryUrl);
    setEditPhotosCount((picture.photosCount || 0).toString());
    setEditVideosCount((picture.videosCount || 0).toString());
    setEditDialogOpen(true);
  };

  const handleUpdatePicture = async () => {
    if (!editingPicture) return;
    if (!editName.trim() || !editDescription.trim()) {
      toast.error("Name & description required");
      return;
    }
    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Enter valid price");
      return;
    }
    if (!editDeliveryUrl.trim()) {
      toast.error("Delivery URL required");
      return;
    }

    setEditInProgress(true);
    const updates = {
      name: editName.trim(),
      description: editDescription.trim(),
      price,
      deliveryUrl: editDeliveryUrl.trim(),
      photosCount: parseInt(editPhotosCount) || 0,
      videosCount: parseInt(editVideosCount) || 0,
    };

    try {
      await workingPicturesAPI.update(editingPicture.id, updates);
      setPictures(prev => prev.map(p => p.id === editingPicture.id ? { ...p, ...updates } : p));
      toast.success("Working picture updated");
      setEditDialogOpen(false);
      setEditingPicture(null);
      setEditName("");
      setEditDescription("");
      setEditPrice("");
      setEditDeliveryUrl("");
      setEditPhotosCount("");
      setEditVideosCount("");
    } catch (error) {
      console.error("Error updating working picture:", error);
      toast.error("Failed to update working picture");
    } finally {
      setEditInProgress(false);
    }
  };

  return (
    <div className="space-y-10">
      <section>
        <Card className="bg-white/90 backdrop-blur border-2 border-white/60 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-800">
                    Working Pictures
                  </CardTitle>
                  <CardDescription>Manage downloadable picture and video packs</CardDescription>
                </div>
              </div>
              <Button
                onClick={handleManualRefresh}
                disabled={refreshing || loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Add Working Picture */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-600" /> Add Working Picture
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Name (e.g. Mature Male)" value={pName} onChange={e => setPName(e.target.value)} />
                <Input placeholder="Price" type="number" min="0" step="0.01" value={pPrice} onChange={e => setPPrice(e.target.value)} />
                <Input placeholder="Delivery URL (download link)" value={pDeliveryUrl} onChange={e => setPDeliveryUrl(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Photos" type="number" min="0" value={pPhotosCount} onChange={e => setPPhotosCount(e.target.value)} />
                  <Input placeholder="Videos" type="number" min="0" value={pVideosCount} onChange={e => setPVideosCount(e.target.value)} />
                </div>
                <div className="relative md:col-span-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="cursor-pointer"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-md">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                    </div>
                  )}
                </div>
                {pImage && (
                  <div className="md:col-span-2">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <img src={pImage} alt="Preview" className="w-full h-full object-contain bg-gray-50 dark:bg-[#09090b]" />
                      <button
                        onClick={() => setPImage("")}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="md:col-span-2">
                  <Textarea placeholder="Description (e.g. lg available)" value={pDescription} onChange={e => setPDescription(e.target.value)} className="min-h-[100px]" />
                </div>
              </div>
              <Button onClick={addPicture} disabled={uploadingImage} className="bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700 text-white font-semibold shadow px-8">
                <Plus className="h-4 w-4 mr-2" /> Save Working Picture
              </Button>
            </div>

            {/* Working Pictures List */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-600" /> Working Pictures ({pictures.length})
              </h3>
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : pictures.length === 0 ? (
                <p className="text-sm text-gray-500">No working pictures yet.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pictures.map(picture => (
                    <Card key={picture.id} className="bg-white/90 dark:bg-black/90 backdrop-blur-xl shadow-lg border-2 border-white/60 dark:border-gray-800 overflow-hidden">
                      <div className="relative h-40 overflow-hidden">
                        <img src={picture.image} alt={picture.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full">
                          ₦{picture.price.toLocaleString()}
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-bold text-base mb-0.5 bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-700 dark:from-purple-400 dark:to-purple-400 truncate">
                          {picture.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{picture.description}</p>
                        <div className="flex gap-2 mt-2 text-xs">
                          <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                            {picture.photosCount || 0} Photos
                          </span>
                          <span className="px-2 py-1 rounded-md bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-400">
                            {picture.videosCount || 0} Videos
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => openEditDialog(picture)}
                            className="flex-1 bg-purple-50 dark:bg-purple-950 rounded-lg py-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                          >
                            <Edit2 className="h-4 w-4 inline mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => removePicture(picture.id)}
                            className="flex-1 bg-red-50 dark:bg-red-950 rounded-lg py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 inline mr-1" />
                            Delete
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="text-xs text-gray-500">
            Working pictures are stored securely and shown in the mobile Working Pictures gallery.
          </CardFooter>
        </Card>
      </section>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-purple-600" />
              Edit Working Picture
            </DialogTitle>
            <DialogDescription>
              Update the details for this working picture.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Price (₦)</label>
              <Input type="number" min="0" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Delivery URL</label>
              <Input value={editDeliveryUrl} onChange={e => setEditDeliveryUrl(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Photos</label>
                <Input type="number" min="0" value={editPhotosCount} onChange={e => setEditPhotosCount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Videos</label>
                <Input type="number" min="0" value={editVideosCount} onChange={e => setEditVideosCount(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
              <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} className="min-h-[100px]" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editInProgress}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePicture} disabled={editInProgress} className="bg-purple-600 hover:bg-purple-700">
              {editInProgress ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
