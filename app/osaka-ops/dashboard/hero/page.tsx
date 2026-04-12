'use client'

import { useEffect, useState } from 'react'
import xss from 'xss'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from "sonner"
import { extractStorageFilename } from '@/lib/utils'
import { Edit2, Trash2, Plus, Loader2, Upload, X, Sparkles, RefreshCw, Camera, LayoutTemplate } from 'lucide-react'

interface Slide {
  id: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export default function HeroManagement() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [pendingImageToDelete, setPendingImageToDelete] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    display_order: 0
  })

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      toast.error("Could not load slides")
      console.error(error)
    } else {
      setSlides(data || [])
    }
    setLoading(false)
  }

  const handleOpenDialog = (slide?: Slide) => {
    if (slide) {
      setSelectedSlide(slide)
      setFormData({
        title: slide.title,
        description: slide.description || '',
        image_url: slide.image_url,
        display_order: slide.display_order
      })
      setImagePreview(slide.image_url)
    } else {
      setSelectedSlide(null)
      setFormData({ title: '', description: '', image_url: '', display_order: slides.length + 1 })
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
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('hero-images').getPublicUrl(fileName)

      setFormData(prev => ({ ...prev, image_url: publicUrl }))
      setImagePreview(publicUrl)
      toast.success("Image uploaded successfully!")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload image"
      console.error("Upload Error:", err)
      toast.error(message)
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
    if (!formData.title || !formData.image_url) {
      toast.error("Title and Image are required")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        title: xss(formData.title),
        description: xss(formData.description),
        image_url: xss(formData.image_url),
        display_order: Number(formData.display_order),
        is_active: true
      }

      let error;
      if (selectedSlide) {
        const result = await supabase.from('hero_slides').update(payload).eq('id', selectedSlide.id)
        error = result.error
      } else {
        const result = await supabase.from('hero_slides').insert([payload])
        error = result.error
      }

      if (error) throw error

      // Cleanup if replaced
      if (pendingImageToDelete) {
        const fileName = extractStorageFilename(pendingImageToDelete)
        if (fileName) {
          await supabase.storage.from('hero-images').remove([fileName])
        }
        setPendingImageToDelete(null)
      }

      toast.success(selectedSlide ? "Slide updated!" : "New slide published!")
      setDialogOpen(false)
      fetchSlides()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save slide"
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedSlide) return

    const urlToDelete = selectedSlide.image_url
    const { error } = await supabase.from('hero_slides').delete().eq('id', selectedSlide.id)
    if (error) {
      toast.error("Delete failed")
    } else {
      if (urlToDelete) {
        const fileName = extractStorageFilename(urlToDelete)
        if (fileName) {
          await supabase.storage.from('hero-images').remove([fileName])
        }
      }
      toast.success("Slide removed")
      setDeleteDialog(false)
      setSelectedSlide(null)
      fetchSlides()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-800 flex items-center justify-center animate-pulse">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <p className="text-gray-400 font-semibold text-sm">Loading banner slides...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-8 md:px-8 md:py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #2a0a40 100%)' }}
      >
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="text-violet-400 text-xs font-bold uppercase tracking-widest">Homepage Carousel</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Hero Banners</h1>
          <p className="text-violet-200/60 mt-1.5 font-medium text-sm">
            {slides.length} slide{slides.length !== 1 ? 's' : ''} · Displayed on homepage in order
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto relative z-10">
          <button
            onClick={fetchSlides}
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-white text-violet-700 hover:bg-gray-100 font-black px-6 py-3 h-auto text-base rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 flex-1 md:flex-none justify-center"
          >
            <Plus className="h-5 w-5" />
            Add Slide
          </Button>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Slides', value: slides.length, color: 'text-gray-800', border: 'border-gray-200' },
          { label: 'Active', value: slides.filter(s => s.is_active).length, color: 'text-emerald-700', border: 'border-emerald-200' },
          { label: 'Max Order', value: Math.max(...slides.map(s => s.display_order), 0), color: 'text-violet-700', border: 'border-violet-200' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl border ${s.border} px-5 py-4 shadow-sm`}>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs font-bold text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Slides Grid ── */}
      {slides.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <LayoutTemplate className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-gray-400">No slides yet</h3>
          <p className="text-gray-300 mt-2 text-sm">Create your first hero banner to display on the homepage carousel.</p>
          <Button
            onClick={() => handleOpenDialog()}
            className="mt-6 bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 h-auto rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Slide
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-violet-400 hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Order badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <div className="bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider">
                    Slide #{index + 1}
                  </div>
                  <div className="bg-black/70 backdrop-blur-sm text-violet-300 px-2.5 py-1 rounded-lg text-[10px] font-black">
                    Order: {slide.display_order}
                  </div>
                </div>
                {/* Hover action overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 gap-2">
                  <button
                    onClick={() => handleOpenDialog(slide)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-900 text-xs font-black rounded-xl shadow-lg hover:bg-gray-100 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit Slide
                  </button>
                  <button
                    onClick={() => { setSelectedSlide(slide); setDeleteDialog(true); }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-xs font-black rounded-xl shadow-lg hover:bg-red-700 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-black text-gray-900 text-base line-clamp-1 mb-1">{slide.title}</h3>
                {slide.description ? (
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4 min-h-[3rem]">{slide.description}</p>
                ) : (
                  <p className="text-xs text-gray-200 italic mb-4 min-h-[3rem]">No description</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${slide.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {slide.is_active ? '● Active' : '○ Inactive'}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenDialog(slide)}
                      className="p-1.5 rounded-lg text-violet-500 hover:bg-violet-50 transition-colors"
                      title="Edit slide"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setSelectedSlide(slide); setDeleteDialog(true); }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete slide"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[95vh]">
          {/* Header */}
          <div
            className="p-6 text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #0a0a0a, #1a0a2e)' }}
          >
            <DialogTitle className="text-2xl font-black">
              {selectedSlide ? "Update Slide" : "Create New Slide"}
            </DialogTitle>
            <DialogDescription className="text-violet-300/70 mt-1 text-sm">
              Set the image and text for your homepage carousel banner.
            </DialogDescription>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-black text-gray-500 uppercase tracking-wider">
                Slide Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Experience OSAKA Smart TV"
                className="h-12 border-2 border-gray-200 focus:border-violet-500 rounded-xl font-semibold"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="desc" className="text-xs font-black text-gray-500 uppercase tracking-wider">
                Description (Optional)
              </Label>
              <Textarea
                id="desc"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the promotion or featured product..."
                className="border-2 border-gray-200 focus:border-violet-500 rounded-xl font-medium min-h-[80px] resize-none"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                Banner Image *
              </Label>

              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-violet-400 transition-colors bg-gray-50/50 group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="hero-image-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="hero-image-upload" className="cursor-pointer flex flex-col items-center gap-3">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
                        <p className="text-sm text-gray-600 font-semibold">Uploading image...</p>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow-md transition">
                          <Upload className="h-8 w-8 text-violet-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700">Click to upload banner image</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · Max 5MB · Recommended: 1920×600px</p>
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
                    className="w-full h-52 object-cover"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                    <label
                      htmlFor="hero-image-change"
                      className={`cursor-pointer flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-xs font-black rounded-xl shadow-lg hover:bg-gray-100 transition ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      {isUploading ? 'Uploading...' : 'Change Image'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="hero-image-change"
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
                      htmlFor="hero-image-change-sm"
                      className={`cursor-pointer p-2 bg-black/60 text-white rounded-lg hover:bg-black/80 transition ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      title="Change banner image"
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="hero-image-change-sm"
                      disabled={isUploading}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 bg-red-600/80 text-white rounded-lg hover:bg-red-600 transition"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Aspect ratio hint */}
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                    Banner preview
                  </div>
                </div>
              )}

              {/* Manual URL fallback */}
              <details className="mt-1">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none w-fit">
                  Or paste image URL manually
                </summary>
                <Input
                  value={formData.image_url}
                  onChange={e => {
                    setFormData({ ...formData, image_url: e.target.value })
                    setImagePreview(e.target.value)
                  }}
                  placeholder="https://..."
                  className="mt-2 h-10 border text-xs rounded-xl"
                />
              </details>
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
              <p className="text-xs text-gray-400">Lower numbers appear first in the carousel</p>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 flex flex-col sm:flex-row gap-3 shrink-0 border-t bg-gray-50 pt-4">
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
              className="bg-violet-600 hover:bg-violet-700 text-white font-black h-12 px-10 shadow-lg rounded-xl order-1 sm:order-2 w-full sm:w-auto"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              {selectedSlide ? "Save Changes" : "Publish Slide"}
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
              Delete Slide?
            </DialogTitle>
            <DialogDescription className="text-red-200 mt-1 text-sm">
              This slide will be permanently removed from the carousel.
            </DialogDescription>
          </div>
          <div className="p-6">
            {selectedSlide && (
              <>
                <p className="text-gray-600 text-sm mb-3">
                  Deleting: <span className="font-black text-gray-900">&quot;{selectedSlide.title}&quot;</span>
                </p>
                <div className="rounded-xl overflow-hidden border border-gray-200 h-32">
                  <img src={selectedSlide.image_url} alt={selectedSlide.title} className="w-full h-full object-cover" />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="px-6 pb-6 gap-3 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              className="rounded-xl h-11 px-6 font-bold border-2 w-full sm:w-auto"
            >
              Keep Slide
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 rounded-xl h-11 px-6 font-black w-full sm:w-auto"
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}