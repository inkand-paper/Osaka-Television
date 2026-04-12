'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Camera, Edit2, Grid3x3, ImageIcon, Loader2, Plus, RefreshCw, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from "sonner"
import xss from 'xss'
import { extractStorageFilename } from '@/lib/utils'

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
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [pendingImageToDelete, setPendingImageToDelete] = useState<string | null>(null)

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
    } catch (err: unknown) {
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
      if (imagePreview) {
        setPendingImageToDelete(imagePreview)
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `gallery-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('gallery-images').getPublicUrl(fileName)

      setFormData(prev => ({ ...prev, image_url: publicUrl }))
      setImagePreview(publicUrl)
      toast.success("Image uploaded successfully!")
    } catch (err: unknown) {
      toast.error("Upload failed. Make sure 'gallery-images' bucket exists in Supabase Storage.")
      console.error(err)
    } finally {
      setIsUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }))
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
        caption: xss(formData.caption),
        image_url: xss(formData.image_url),
        display_order: Number(formData.display_order),
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

      // Cleanup old file if it was replaced
      if (pendingImageToDelete) {
        const fileName = extractStorageFilename(pendingImageToDelete)
        if (fileName) {
          await supabase.storage.from('gallery-images').remove([fileName])
        }
        setPendingImageToDelete(null)
      }

      toast.success(selectedItem ? "Image updated!" : "Added to gallery!")
      setDialogOpen(false)
      fetchGallery()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save gallery item"
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    
    // Track url for cleanup
    const urlToDelete = selectedItem.image_url
    
    const { error } = await supabase.from('gallery').delete().eq('id', selectedItem.id)
    if (error) {
      toast.error("Delete failed")
    } else {
      // Cleanup file from storage
      if (urlToDelete) {
        const fileName = extractStorageFilename(urlToDelete)
        if (fileName) {
          await supabase.storage.from('gallery-images').remove([fileName])
        }
      }
      toast.success("Image removed from gallery")
      setDeleteDialog(false)
      setSelectedItem(null)
      fetchGallery()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-800 flex items-center justify-center animate-pulse">
          <ImageIcon className="w-7 h-7 text-white" />
        </div>
        <p className="text-gray-400 font-semibold text-sm">Loading gallery...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-8 md:px-8 md:py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0c1a3a 50%, #0a2240 100%)' }}
      >
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="w-5 h-5 text-sky-400" />
            <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">Media Library</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Photo Gallery</h1>
          <p className="text-sky-200/60 mt-1.5 font-medium text-sm">
            {items.length} photo{items.length !== 1 ? 's' : ''} in your showroom gallery
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto relative z-10">
          <button
            onClick={fetchGallery}
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-white text-sky-700 hover:bg-gray-100 font-black px-6 py-3 h-auto text-base rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 flex-1 md:flex-none justify-center"
          >
            <Plus className="h-5 w-5" />
            Add Photo
          </Button>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Photos', value: items.length, color: 'text-gray-800', bg: 'bg-gray-50', border: 'border-gray-200' },
          { label: 'Active', value: items.filter(i => i.is_active).length, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Display Slots', value: Math.max(...items.map(i => i.display_order), 0), color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl border ${s.border} px-5 py-4 shadow-sm`}>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs font-bold text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Gallery Grid ── */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Grid3x3 className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-gray-400">Your gallery is empty</h3>
          <p className="text-gray-300 mt-2 text-sm">Upload showroom and factory photos to display on the website.</p>
          <Button
            onClick={() => handleOpenDialog()}
            className="mt-6 bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-3 h-auto rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload First Photo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-sky-400 hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.caption || "Gallery Image"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Order Badge */}
                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px] font-black tracking-wider">
                  #{item.display_order}
                </div>
                {/* Action Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 gap-2">
                  <button
                    onClick={() => handleOpenDialog(item)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-900 text-xs font-black rounded-xl shadow-lg hover:bg-gray-100 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => { setSelectedItem(item); setDeleteDialog(true); }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-xs font-black rounded-xl shadow-lg hover:bg-red-700 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Caption */}
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-700 line-clamp-1 flex-1 min-w-0">
                  {item.caption || <span className="text-gray-300 italic text-xs">No caption</span>}
                </p>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenDialog(item)}
                    className="p-1.5 rounded-lg text-sky-500 hover:bg-sky-50 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { setSelectedItem(item); setDeleteDialog(true); }}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-none shadow-2xl">
          {/* Header */}
          <div
            className="p-6 text-white"
            style={{ background: 'linear-gradient(135deg, #0a0a0a, #0c1a3a)' }}
          >
            <DialogTitle className="text-2xl font-black">
              {selectedItem ? "Edit Gallery Photo" : "Add Gallery Photo"}
            </DialogTitle>
            <DialogDescription className="text-sky-300/70 mt-1 text-sm">
              Photos appear in the gallery section of the website.
            </DialogDescription>
          </div>

          <div className="p-6 space-y-6">
            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption" className="text-xs font-black text-gray-500 uppercase tracking-wider">Caption (Optional)</Label>
              <Input
                id="caption"
                value={formData.caption}
                onChange={e => setFormData({ ...formData, caption: e.target.value })}
                placeholder="e.g. Our Main Showroom"
                className="h-12 border-2 border-gray-200 focus:border-sky-500 rounded-xl font-medium"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-gray-500 uppercase tracking-wider">Gallery Image *</Label>

              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-sky-400 transition-colors bg-gray-50/50 group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="gallery-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="gallery-upload" className="cursor-pointer flex flex-col items-center gap-3">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-12 w-12 animate-spin text-sky-600" />
                        <p className="text-sm text-gray-600 font-semibold">Uploading to storage...</p>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow-md transition">
                          <Upload className="h-8 w-8 text-sky-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700">Click to upload photo</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · Max 5MB</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <div className="relative border-2 border-gray-100 rounded-2xl overflow-hidden group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                    <label
                      htmlFor="gallery-upload-change"
                      className={`cursor-pointer flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-xs font-black rounded-xl shadow-lg hover:bg-gray-100 transition ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      {isUploading ? 'Uploading...' : 'Change Photo'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="gallery-upload-change"
                      disabled={isUploading}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-black rounded-xl shadow-lg hover:bg-red-700 transition"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                  {/* Always-visible corner buttons */}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <label
                      htmlFor="gallery-upload-change-sm"
                      className={`cursor-pointer p-2 bg-black/60 text-white rounded-lg hover:bg-black/80 transition ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      title="Change photo"
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="gallery-upload-change-sm"
                      disabled={isUploading}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 bg-red-600/80 text-white rounded-lg hover:bg-red-600 transition"
                      title="Remove photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="order" className="text-xs font-black text-gray-500 uppercase tracking-wider">
                Display Order
              </Label>
              <Input
                id="order"
                type="number"
                value={formData.display_order}
                onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="h-12 border-2 border-gray-200 rounded-xl font-medium w-32"
              />
              <p className="text-xs text-gray-400">Lower numbers appear first in the gallery</p>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="h-12 px-8 font-bold rounded-xl order-2 sm:order-1 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isUploading}
              className="bg-sky-600 hover:bg-sky-700 text-white font-black h-12 px-10 shadow-lg rounded-xl order-1 sm:order-2 w-full sm:w-auto"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              {selectedItem ? "Save Changes" : "Post to Gallery"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="bg-white rounded-2xl max-w-md border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-red-600 p-6">
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Remove Photo?
            </DialogTitle>
            <DialogDescription className="text-red-200 mt-1 text-sm">
              This will permanently remove the photo from your gallery.
            </DialogDescription>
          </div>
          <div className="p-6">
            {selectedItem?.caption && (
              <p className="text-gray-600 text-sm">
                Photo: <span className="font-black text-gray-900">&quot;{selectedItem.caption}&quot;</span>
              </p>
            )}
            {selectedItem?.image_url && (
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 h-32">
                <img src={selectedItem.image_url} alt="To delete" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <DialogFooter className="px-6 pb-6 gap-3 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              className="rounded-xl h-11 px-6 font-bold border-2 w-full sm:w-auto"
            >
              Keep Photo
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 rounded-xl h-11 px-6 font-black w-full sm:w-auto"
            >
              Yes, Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
