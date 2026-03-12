'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from "sonner"
import { Edit2, Trash2, Plus, Loader2, Upload, X } from 'lucide-react'

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
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  
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
      setFormData({ title: '', description: '', image_url: '', display_order: 0 })
      setImagePreview('')
    }
    setDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    setIsUploading(true)
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('hero-images')
        .getPublicUrl(filePath)

      setFormData({ ...formData, image_url: publicUrl })
      setImagePreview(publicUrl)
      toast.success("Image uploaded successfully!")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload image"
      console.error("Upload Error:", err)
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: '' })
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
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url,
        display_order: formData.display_order,
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

      toast.success(selectedSlide ? "Slide updated!" : "New slide added!")
      setDialogOpen(false)
      fetchSlides()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save slide"
      console.error("Save Error:", err)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return

    const { error } = await supabase.from('hero_slides').delete().eq('id', id)
    if (error) {
      toast.error("Delete failed")
    } else {
      toast.success("Slide removed")
      fetchSlides()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <p className="text-gray-500 font-medium">Loading Carousel Data...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-red-900 px-8 py-10 mb-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 text-white">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Hero Banners</h1>
          <p className="text-red-200 mt-2 font-medium">Manage the main sliding images on your homepage</p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-white text-red-700 hover:bg-gray-100 font-bold px-8 py-6 h-auto text-lg rounded-xl shadow-lg"
        >
          <Plus className="mr-2 h-6 w-6" /> Add New Slide
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((slide) => (
          <Card key={slide.id} className="overflow-hidden border-2 hover:border-red-500 transition-all group">
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              <img 
                src={slide.image_url} 
                alt={slide.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                Order: {slide.display_order}
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold line-clamp-1">{slide.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{slide.description}</p>
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(slide)} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Edit2 className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(slide.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden">
          <div className="bg-black p-6 text-white">
            <DialogTitle className="text-2xl font-bold">
              {selectedSlide ? "Update Slide" : "Create New Slide"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Set the image and text for your homepage banner.
            </DialogDescription>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="font-bold">Slide Title</Label>
              <Input 
                id="title"
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g. Experience OSAKA Smart TV"
                className="h-12 border-2 focus:ring-red-500"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="desc" className="font-bold">Description</Label>
              <Textarea 
                id="desc"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Describe the promotion or product..."
                className="border-2 focus:ring-red-500"
              />
            </div>

            {/* Image Upload Section */}
            <div className="grid gap-2">
              <Label className="font-bold">Hero Image</Label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
                        <p className="text-sm text-gray-600 font-medium">Uploading image...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-400" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Click to upload image</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (max 5MB)</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
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
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              )}
              
              {/* Manual URL Input (Optional) */}
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  Or paste image URL manually
                </summary>
                <Input 
                  value={formData.image_url} 
                  onChange={e => {
                    setFormData({...formData, image_url: e.target.value})
                    setImagePreview(e.target.value)
                  }} 
                  placeholder="https://supabase-url.com/image.jpg"
                  className="mt-2 h-10 border text-xs"
                />
              </details>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="order" className="font-bold">Display Order</Label>
              <Input 
                id="order"
                type="number" 
                value={formData.display_order} 
                onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})} 
                className="h-12 border-2"
              />
            </div>
          </div>

          <DialogFooter className="p-6 bg-gray-50 flex gap-3">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="h-12 px-8">Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isUploading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold h-12 px-10 shadow-lg"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
              {selectedSlide ? "Save Changes" : "Publish Slide"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}