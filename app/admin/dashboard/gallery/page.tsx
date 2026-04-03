'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from "sonner"
import { Edit2, Trash2, Plus, Loader2, Upload, X, ImageIcon } from 'lucide-react'

interface GalleryItem {
  id: string;
  caption: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export default function GalleryManagement() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  
  const [formData, setFormData] = useState({
    caption: '',
    image_url: '',
    display_order: 0
  })

  useEffect(() => {
    fetchGallery()
  }, [])

  const fetchGallery = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('display_order', { ascending: true })
      
      if (error) throw error
      setItems(data || [])
    } catch (err: any) {
      toast.error("Could not load gallery. Make sure the 'gallery' table exists.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (item?: GalleryItem) => {
    if (item) {
      setSelectedItem(item)
      setFormData({
        caption: item.caption || '',
        image_url: item.image_url,
        display_order: item.display_order
      })
      setImagePreview(item.image_url)
    } else {
      setSelectedItem(null)
      setFormData({ caption: '', image_url: '', display_order: items.length + 1 })
      setImagePreview('')
    }
    setDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `gallery-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      
      // Try 'gallery-images' bucket, fallback to 'product-images' if it fails
      const bucketName = 'gallery-images'
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)

      setFormData({ ...formData, image_url: publicUrl })
      setImagePreview(publicUrl)
      toast.success("Image uploaded successfully!")
    } catch (err: any) {
      toast.error("Upload failed. Make sure 'gallery-images' bucket exists in Supabase Storage.")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: '' })
    setImagePreview('')
  }

  const handleSave = async () => {
    if (!formData.image_url) {
      toast.error("Image is required")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        caption: formData.caption,
        image_url: formData.image_url,
        display_order: formData.display_order,
        is_active: true
      }

      let error;
      if (selectedItem) {
        const result = await supabase.from('gallery').update(payload).eq('id', selectedItem.id)
        error = result.error
      } else {
        const result = await supabase.from('gallery').insert([payload])
        error = result.error
      }

      if (error) throw error

      toast.success(selectedItem ? "Item updated!" : "Added to gallery!")
      setDialogOpen(false)
      fetchGallery()
    } catch (err: any) {
      toast.error(err.message || "Failed to save gallery item")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this image from gallery?")) return

    const { error } = await supabase.from('gallery').delete().eq('id', id)
    if (error) {
      toast.error("Delete failed")
    } else {
      toast.success("Image removed")
      fetchGallery()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <p className="text-gray-500 font-medium">Loading Gallery...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-red-900 px-6 py-8 md:px-8 md:py-10 mb-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 text-white">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Image Gallery</h1>
          <p className="text-red-200 mt-2 font-medium">Manage the showroom and factory images</p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-white text-red-700 hover:bg-gray-100 font-bold px-8 py-6 h-auto text-lg rounded-xl shadow-lg w-full md:w-auto"
        >
          <Plus className="mr-2 h-6 w-6" /> Add Image
        </Button>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
          <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400">Your gallery is empty</h3>
          <p className="text-gray-400 mt-2">Upload showroom photos to show customers your facility.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden border-2 hover:border-red-500 transition-all group rounded-2xl shadow-sm">
              <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt={item.caption || "Gallery Image"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-[10px] font-bold">
                  Order: {item.display_order}
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-gray-700 line-clamp-1 mb-4 h-5">
                  {item.caption || 'No caption'}
                </p>
                <div className="flex justify-between gap-2 border-t pt-4">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(item)} className="text-blue-600 hover:bg-blue-50 flex-1">
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 flex-1">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-black p-6 text-white">
            <DialogTitle className="text-2xl font-bold">
              {selectedItem ? "Edit Gallery Image" : "Add Gallery Image"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Photos appear in the gallery section of the website.
            </DialogDescription>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="caption" className="font-bold text-gray-700">Caption (Optional)</Label>
              <Input 
                id="caption"
                value={formData.caption} 
                onChange={e => setFormData({...formData, caption: e.target.value})} 
                placeholder="e.g. Our Main Showroom"
                className="h-12 border-2 focus:ring-red-500 rounded-xl"
              />
            </div>

            {/* Image Upload Section */}
            <div className="grid gap-2">
              <Label className="font-bold text-gray-700">Gallery Image</Label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-red-500 transition-colors bg-gray-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="gallery-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="gallery-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
                        <p className="text-sm text-gray-600 font-medium">Uploading to storage...</p>
                      </>
                    ) : (
                      <>
                        <div className="bg-white p-4 rounded-full shadow-sm">
                          <Upload className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700">Click to upload photo</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (max 5MB)</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <div className="relative border-2 border-gray-100 rounded-2xl overflow-hidden shadow-inner">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 rounded-full shadow-xl"
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="order" className="font-bold text-gray-700">Display Order</Label>
              <Input 
                id="order"
                type="number" 
                value={formData.display_order} 
                onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})} 
                className="h-12 border-2 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row gap-3">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="h-12 px-8 font-bold rounded-xl order-2 sm:order-1">Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isUploading}
              className="bg-red-600 hover:bg-red-700 text-white font-black h-12 px-10 shadow-lg rounded-xl order-1 sm:order-2"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
              {selectedItem ? "Save Changes" : "Post to Gallery"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
