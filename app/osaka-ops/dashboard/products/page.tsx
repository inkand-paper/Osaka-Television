'use client'

import { useEffect, useState, useRef } from 'react'
import xss from 'xss'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from "sonner"
import { extractStorageFilename } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Edit2, Trash2, Package, ShieldCheck, ShieldAlert,
  Plus, Upload, X, Loader2, ImageIcon, Settings2, RefreshCw, Camera
} from 'lucide-react'

const PRODUCT_MAPPING = {
  "24 inch": { label: "24 inch (TV)", size: "24\"", models: ["Basic Frameless", "Basic Double Glass", "Smart Frameless", "Smart Double Glass", "Regular Series", "Gold Series", "Google TV"], hasTypes: true },
  "32 inch": { label: "32 inch (TV)", size: "32\"", models: ["Regular Series", "Gold Series", "Google TV"], hasTypes: true },
  "43 inch": { label: "43 inch (TV)", size: "43\"", models: ["Regular Series", "Gold Series", "Google TV"], hasTypes: true },
  "50 inch": { label: "50 inch (TV)", size: "50\"", models: ["Regular Series", "Gold Series", "Google TV"], hasTypes: true },
  "65 inch": { label: "65 inch (TV)", size: "65\"", models: ["Regular Series", "Gold Series", "Google TV"], hasTypes: true },
  "12 inch": { label: "12 inch (Fan)", size: "12\"", models: ["Table Fan - Rechargeable"], hasTypes: false },
  "16 inch": { label: "16 inch (Fan)", size: "16\"", models: ["Table Fan - Rechargeable", "Stand Fan - Rechargeable"], hasTypes: false },
  "18 inch": { label: "18 inch (Fan)", size: "18\"", models: ["Stand Fan - Rechargeable"], hasTypes: false },
  "Cooker": { label: "Cooker", size: "Cooker", models: ["Cooker"], hasTypes: false },
}

type CategoryKey = keyof typeof PRODUCT_MAPPING;

interface Product {
  id: string;
  name: string;
  category: string;
  size: string;
  price: number;
  description: string;
  image_url: string | null;
  is_active: boolean;
  original_price?: number | null;
  discount_percentage?: string | null;
}

interface ProductType {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [addDialog, setAddDialog] = useState(false)
  const [manageTypesDialog, setManageTypesDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [newTypeName, setNewTypeName] = useState('')
  const [isAddingType, setIsAddingType] = useState(false)
  const [deletingTypeId, setDeletingTypeId] = useState<string | null>(null)
  const [pendingImageToDelete, setPendingImageToDelete] = useState<string | null>(null)
  const editImageInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '' as CategoryKey | '',
    size: '',
    price: 0,
    description: '',
    image_url: '',
    selectedModel: '',
    selectedType: '',
    original_price: '' as string | number,
    discount_percentage: '',
  })

  useEffect(() => {
    fetchProducts()
    fetchProductTypes()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category', { ascending: true })

    if (error) toast.error("Failed to load inventory")
    else setProducts(data || [])
    setLoading(false)
  }

  const fetchProductTypes = async () => {
    const { data, error } = await supabase
      .from('product_types')
      .select('*')
      .order('name', { ascending: true })

    if (error) toast.error("Failed to load product types")
    else setProductTypes(data || [])
  }

  const handleAddType = async () => {
    const trimmed = newTypeName.trim()
    if (!trimmed) { toast.error("Type name cannot be empty"); return }
    if (productTypes.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("This type already exists"); return
    }
    setIsAddingType(true)
    const { error } = await supabase.from('product_types').insert([{ name: trimmed }])
    if (!error) {
      toast.success(`"${trimmed}" added successfully`)
      setNewTypeName('')
      fetchProductTypes()
    } else {
      toast.error("Failed to add type")
    }
    setIsAddingType(false)
  }

  const handleDeleteType = async (id: string, name: string) => {
    setDeletingTypeId(id)
    const { error } = await supabase.from('product_types').delete().eq('id', id)
    if (!error) {
      toast.success(`"${name}" removed`)
      fetchProductTypes()
    } else {
      toast.error("Failed to delete type")
    }
    setDeletingTypeId(null)
  }

  const hasTypes = (category: CategoryKey | '') => {
    if (!category) return false
    return PRODUCT_MAPPING[category as CategoryKey].hasTypes
  }

  const buildProductName = (model: string, type: string, category: CategoryKey | '') => {
    if (!hasTypes(category) || !type) return model
    return `${model} - ${type}`
  }

  const validateForm = () => {
    if (!formData.category) { toast.error("Please select a size category"); return false; }
    if (!formData.selectedModel) { toast.error("Please select a model name"); return false; }
    if (hasTypes(formData.category) && !formData.selectedType && productTypes.length > 0) { toast.error("Please select a type"); return false; }
    if (formData.price <= 0) { toast.error("Price must be greater than 0"); return false; }
    return true;
  }

  const handleCategoryChange = (value: CategoryKey) => {
    setFormData({
      ...formData,
      category: value,
      size: PRODUCT_MAPPING[value].size,
      name: '',
      selectedModel: '',
      selectedType: '',
    })
  }

  const handleModelChange = (model: string) => {
    const newName = buildProductName(model, formData.selectedType, formData.category)
    setFormData({ ...formData, selectedModel: model, name: newName })
  }

  const handleTypeChange = (type: string) => {
    const newName = buildProductName(formData.selectedModel, type, formData.category)
    setFormData({ ...formData, selectedType: type, name: newName })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error("Please upload an image file"); return }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image size should be less than 5MB"); return }

    setIsUploading(true)
    try {
      // If we are replacing an existing image, track it for deletion
      if (imagePreview) {
        setPendingImageToDelete(imagePreview)
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `product-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file, { cacheControl: '3600', upsert: false })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
      setFormData({ ...formData, image_url: publicUrl })
      setImagePreview(publicUrl)
      toast.success("Image uploaded successfully!")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload image"
      toast.error(message)
    } finally {
      setIsUploading(false)
      // Reset file input so same file can be re-selected
      if (e.target) e.target.value = ''
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: '' })
    setImagePreview('')
  }

  const openAddDialog = () => {
    setFormData({ name: '', category: '', size: '', price: 0, description: '', image_url: '', selectedModel: '', selectedType: '', original_price: '', discount_percentage: '' })
    setImagePreview('')
    setAddDialog(true)
  }

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    const category = product.category as CategoryKey
    const hasType = PRODUCT_MAPPING[category]?.hasTypes
    let selectedModel = product.name
    let selectedType = ''
    if (hasType && product.name.includes(' - ')) {
      const parts = product.name.split(' - ')
      selectedModel = parts[0]
      selectedType = parts.slice(1).join(' - ')
    }
    setFormData({
      name: product.name,
      category,
      size: product.size,
      price: product.price,
      description: product.description || '',
      image_url: product.image_url || '',
      selectedModel,
      selectedType,
      original_price: product.original_price || '',
      discount_percentage: product.discount_percentage || '',
    })
    setImagePreview(product.image_url || '')
    setEditDialog(true)
  }

  const handleAdd = async () => {
    if (!validateForm()) return

    const dbData = {
      name: xss(formData.name),
      category: xss(formData.category),
      size: xss(formData.size),
      price: Number(formData.price),
      description: xss(formData.description),
      image_url: xss(formData.image_url),
      original_price: formData.original_price ? Number(formData.original_price) : null,
      discount_percentage: formData.discount_percentage ? xss(formData.discount_percentage) : null,
      is_active: true
    }

    const { error } = await supabase.from('products').insert([dbData])
    if (!error) {
      toast.success(`${formData.name} added to catalog`)
      setAddDialog(false)
      fetchProducts()
    } else toast.error(`Failed to add product: ${error.message || "Unknown error"}`)
  }

  const handleEdit = async () => {
    if (!selectedProduct || !validateForm()) return

    const dbData = {
      name: xss(formData.name),
      category: xss(formData.category),
      size: xss(formData.size),
      price: Number(formData.price),
      description: xss(formData.description),
      image_url: xss(formData.image_url),
      original_price: formData.original_price ? Number(formData.original_price) : null,
      discount_percentage: formData.discount_percentage ? xss(formData.discount_percentage) : null
    }

    const { error } = await supabase.from('products').update(dbData).eq('id', selectedProduct.id)
    if (!error) {
      // Successfully updated DB, now safe to delete old image from storage
      if (pendingImageToDelete) {
        const fileName = extractStorageFilename(pendingImageToDelete)
        if (fileName) {
          await supabase.storage.from('product-images').remove([fileName])
        }
        setPendingImageToDelete(null)
      }

      toast.success("Changes saved successfully")
      setEditDialog(false)
      fetchProducts()
    } else toast.error(`Failed to update product: ${error.message || "Unknown error"}`)
  }

  const handleDelete = async () => {
    if (!selectedProduct) return

    // 1. First track the image to delete
    const urlToDelete = selectedProduct.image_url

    // 2. Delete from DB
    const { error } = await supabase.from('products').delete().eq('id', selectedProduct.id)
    if (!error) {
      // 3. Delete from Storage if DB delete succeeded
      if (urlToDelete) {
        const fileName = extractStorageFilename(urlToDelete)
        if (fileName) {
          await supabase.storage.from('product-images').remove([fileName])
        }
      }
      toast.success("Product deleted permanently")
      setDeleteDialog(false)
      fetchProducts()
    } else toast.error("Delete failed")
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id)
    if (!error) {
      toast.info(currentStatus ? "Product hidden from site" : "Product is now live")
      fetchProducts()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center animate-pulse">
          <Package className="w-7 h-7 text-white" />
        </div>
        <p className="text-gray-400 font-semibold text-sm">Loading inventory...</p>
      </div>
    )
  }

  // ── Image Upload Block (shared between add & edit) ──
  const ImageUploadBlock = () => (
    <div className="space-y-3">
      <Label className="text-xs font-black text-gray-500 uppercase tracking-wider">
        Product Image
      </Label>

      {!imagePreview ? (
        /* ── Empty state — Upload zone ── */
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-red-400 transition-colors bg-gray-50/50 group cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="product-image-upload"
            disabled={isUploading}
          />
          <label htmlFor="product-image-upload" className="cursor-pointer flex flex-col items-center gap-3">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-red-600" />
                <span className="text-sm font-semibold text-gray-600">Uploading...</span>
              </>
            ) : (
              <>
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition">
                  <Upload className="h-7 w-7 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Click to upload image</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · Max 5MB</p>
                </div>
              </>
            )}
          </label>
        </div>
      ) : (
        /* ── Preview state — Show image + change / remove buttons ── */
        <div className="relative border-2 border-gray-100 rounded-2xl overflow-hidden bg-gray-50 h-52 flex items-center justify-center group">
          <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3">
            {/* Change image button */}
            <label
              htmlFor="product-image-upload-change"
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-xl shadow-lg hover:bg-gray-100 transition ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {isUploading ? 'Uploading...' : 'Change Photo'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="product-image-upload-change"
              disabled={isUploading}
            />

            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemoveImage}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-red-700 transition"
            >
              <X className="h-4 w-4" />
              Remove
            </button>
          </div>

          {/* Always-visible small change button */}
          <div className="absolute top-2 right-2 flex gap-1.5">
            <label
              htmlFor="product-image-upload-change-sm"
              className={`cursor-pointer p-2 bg-black/60 text-white rounded-lg hover:bg-black/80 transition ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              title="Change image"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="product-image-upload-change-sm"
              disabled={isUploading}
              ref={editImageInputRef}
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
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-8 md:px-8 md:py-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0000 45%, #2d0505 100%)' }}
      >
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Inventory</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Products Management</h1>
          <p className="text-red-200/70 mt-1.5 font-medium text-sm">Add, update, and control your product catalog</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto relative z-10">
          <Button
            onClick={() => setManageTypesDialog(true)}
            className="bg-white/10 border border-white/20 text-white hover:bg-white/20 font-bold px-5 py-3 h-auto text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Settings2 className="h-4 w-4" />
            Manage Types
          </Button>
          <Button
            onClick={openAddDialog}
            className="bg-white text-red-700 hover:bg-gray-100 font-black px-6 py-3 h-auto text-base rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Inventory', value: products.length, icon: Package, color: 'text-gray-800', bg: 'bg-gray-100', border: 'border-gray-200' },
          { label: 'Live Online', value: products.filter(p => p.is_active).length, icon: ShieldCheck, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Hidden', value: products.filter(p => !p.is_active).length, icon: ShieldAlert, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
        ].map((s, i) => (
          <Card key={i} className={`border ${s.border} shadow-sm overflow-hidden`}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-5">
              <CardTitle className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider">{s.label}</CardTitle>
              <div className={`p-1.5 rounded-lg ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Product Table / Cards ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Table Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <h2 className="font-black text-gray-800 text-sm uppercase tracking-wide">
            All Products ({products.length})
          </h2>
          <button
            onClick={fetchProducts}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {products.map((product) => (
            <div key={`mobile-${product.id}`} className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-[72px] h-[72px] bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    : <ImageIcon className="w-7 h-7 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-gray-900 text-sm leading-snug line-clamp-2">{product.name}</div>
                  <div className="text-xs text-gray-400 line-clamp-1 mt-1">{product.description}</div>
                  <div className="mt-2 font-black text-red-700 text-base">৳{product.price.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] font-black uppercase tracking-tight">
                    {PRODUCT_MAPPING[product.category as CategoryKey]?.label || product.category}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold">
                    {product.size}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Live</span>
                    <Switch
                      checked={product.is_active}
                      onCheckedChange={() => toggleActive(product.id, product.is_active)}
                      className="scale-75 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-red-500"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(product)}
                      className="h-8 w-8 text-sky-600 hover:bg-sky-50 rounded-lg"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setSelectedProduct(product); setDeleteDialog(true); }}
                      className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold">No products found</p>
              <p className="text-xs text-gray-300 mt-1">Add your first product using the button above</p>
            </div>
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Image</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3.5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-red-50/20 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="w-[64px] h-[64px] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 flex-shrink-0">
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <ImageIcon className="w-7 h-7 text-gray-300" />}
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <div className="font-black text-gray-900 text-sm leading-snug">{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{product.description}</div>
                    )}
                    {product.discount_percentage && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase">
                        {product.discount_percentage}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-tight inline-block">
                        {PRODUCT_MAPPING[product.category as CategoryKey]?.label || product.category}
                      </span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold inline-block">
                        {product.size}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-black text-red-700 text-base">৳{product.price.toLocaleString()}</div>
                    {product.original_price && (
                      <div className="text-xs text-gray-400 line-through">৳{Number(product.original_price).toLocaleString()}</div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.is_active}
                        onCheckedChange={() => toggleActive(product.id, product.is_active)}
                        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-red-500"
                      />
                      <span className={`text-xs font-bold ${product.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                        {product.is_active ? 'Live' : 'Hidden'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(product)}
                        className="h-9 w-9 text-sky-600 hover:bg-sky-50 hover:text-sky-700 rounded-xl"
                        title="Edit product"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setSelectedProduct(product); setDeleteDialog(true); }}
                        className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-semibold">No products yet</p>
                    <p className="text-xs text-gray-300 mt-1">Click "Add Product" to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Manage Types Dialog ── */}
      <Dialog open={manageTypesDialog} onOpenChange={setManageTypesDialog}>
        <DialogContent className="max-w-lg bg-white border-none shadow-2xl p-0 overflow-hidden">
          <div
            className="p-6 text-white"
            style={{ background: 'linear-gradient(135deg, #0a0a0a, #2d0505)' }}
          >
            <DialogTitle className="text-2xl font-black text-white">Manage Product Types</DialogTitle>
            <DialogDescription className="text-red-300/80 mt-1 text-sm">
              Types apply to 24&quot;, 32&quot;, 43&quot;, 50&quot; and 65&quot; TV products
            </DialogDescription>
          </div>

          <div className="p-6 space-y-5">
            {/* Add new type */}
            <div className="flex gap-2">
              <Input
                value={newTypeName}
                onChange={e => setNewTypeName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddType()}
                placeholder="e.g. Smart Frameless Voice"
                className="h-11 border-2 flex-1 rounded-xl"
              />
              <Button
                onClick={handleAddType}
                disabled={isAddingType || !newTypeName.trim()}
                className="bg-red-700 hover:bg-red-800 text-white h-11 px-5 font-bold rounded-xl shrink-0"
              >
                {isAddingType ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" />Add</>}
              </Button>
            </div>

            {/* Types list */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {productTypes.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Settings2 className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">No types yet. Add one above.</p>
                </div>
              ) : (
                productTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-red-200 transition-colors">
                    <span className="font-semibold text-gray-800 text-sm">{type.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteType(type.id, type.name)}
                      disabled={deletingTypeId === type.id}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all h-8 w-8"
                    >
                      {deletingTypeId === type.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => setManageTypesDialog(false)} className="rounded-xl h-11 px-6 font-bold border-2 w-full sm:w-auto">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Product Dialog ── */}
      <Dialog
        open={addDialog || editDialog}
        onOpenChange={(open: boolean) => { if (!open) { setAddDialog(false); setEditDialog(false); } }}
      >
        <DialogContent className="max-w-4xl bg-white p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[95vh]">

          {/* Header */}
          <div
            className="p-6 shrink-0 flex items-start justify-between"
            style={{ background: 'linear-gradient(135deg, #0a0a0a, #2d0505)' }}
          >
            <div>
              <DialogTitle className="text-2xl font-black text-white">
                {addDialog ? "Create New Listing" : "Update Product"}
              </DialogTitle>
              <p className="text-red-300/70 text-sm mt-1">
                {addDialog ? "Add a new product to your catalog" : `Editing: ${selectedProduct?.name}`}
              </p>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-7">

            {/* Top: Image + Live Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadBlock />

              {/* Live name preview */}
              <div className="flex flex-col justify-end">
                <div className="p-5 bg-red-50/80 border border-red-100 rounded-2xl">
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Live Listing Title</p>
                  <p className="text-lg font-black text-gray-900 leading-snug">
                    {formData.name || <span className="text-gray-300 font-medium italic text-base">Product name will appear here...</span>}
                  </p>
                  {formData.discount_percentage && (
                    <span className="inline-block mt-3 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black rounded-full uppercase">
                      🏷️ {formData.discount_percentage}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {/* 1. Category */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">1. Size Category *</Label>
                <Select onValueChange={handleCategoryChange} value={formData.category}>
                  <SelectTrigger className="h-12 bg-white border-2 border-gray-200 focus:border-red-500 rounded-xl font-semibold">
                    <SelectValue placeholder="Pick size category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-xl border border-gray-200 z-[300] rounded-xl">
                    {Object.keys(PRODUCT_MAPPING).map((cat) => (
                      <SelectItem key={cat} value={cat} className="focus:bg-red-50 font-medium">
                        {PRODUCT_MAPPING[cat as CategoryKey].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Model */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">2. Base Model *</Label>
                <Select onValueChange={handleModelChange} value={formData.selectedModel} disabled={!formData.category}>
                  <SelectTrigger className="h-12 bg-white border-2 border-gray-200 rounded-xl font-semibold disabled:opacity-50">
                    <SelectValue placeholder="Pick model" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-xl border border-gray-200 z-[300] rounded-xl">
                    {formData.category && PRODUCT_MAPPING[formData.category as CategoryKey].models.map((model) => (
                      <SelectItem key={model} value={model} className="focus:bg-red-50 font-medium">{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. Type */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">3. Variation Type</Label>
                {hasTypes(formData.category) ? (
                  <Select onValueChange={handleTypeChange} value={formData.selectedType} disabled={!formData.selectedModel}>
                    <SelectTrigger className="h-12 bg-white border-2 border-gray-200 rounded-xl font-semibold disabled:opacity-50">
                      <SelectValue placeholder="Pick type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-xl border border-gray-200 z-[300] rounded-xl">
                      {productTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name} className="focus:bg-red-50 font-medium">{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-12 flex items-center px-4 bg-gray-50 text-gray-400 text-xs italic rounded-xl border border-dashed border-gray-200">
                    Not required for this size
                  </div>
                )}
              </div>

              {/* 4. Price */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Regular Price (BDT) *</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">৳</span>
                  <Input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className="h-12 pl-8 border-2 border-emerald-200 focus:border-emerald-500 font-black text-lg bg-emerald-50/30 rounded-xl"
                  />
                </div>
              </div>

              {/* 5. Original Price */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Discounted Price (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">৳</span>
                  <Input
                    type="number"
                    value={formData.original_price || ''}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="h-12 pl-8 border-2 border-gray-200 font-bold text-gray-700 rounded-xl"
                    placeholder="Leave blank if no discount"
                  />
                </div>
              </div>

              {/* 6. Discount Badge */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Discount Badge (Optional)</Label>
                <Input
                  type="text"
                  value={formData.discount_percentage || ''}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  placeholder="e.g. 20% OFF or Save ৳5000"
                  className="h-12 border-2 border-gray-200 font-medium rounded-xl"
                />
              </div>

              {/* 7. Description — full width */}
              <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Features & Specs</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-2 border-gray-200 min-h-[80px] resize-y rounded-xl font-medium"
                  placeholder="e.g. Bluetooth, Voice Control, 4K, HDR, Dolby Audio..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 bg-gray-50 border-t shrink-0 flex flex-col sm:flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => { setAddDialog(false); setEditDialog(false); }}
              className="px-6 h-12 font-bold rounded-xl border-2 order-2 sm:order-1"
            >
              Discard
            </Button>
            <Button
              onClick={addDialog ? handleAdd : handleEdit}
              disabled={isUploading}
              className="bg-red-700 hover:bg-red-800 text-white px-10 h-12 font-black shadow-lg rounded-xl order-1 sm:order-2"
            >
              {isUploading
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading...</>
                : addDialog ? "Publish Listing" : "Save Changes"
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="bg-white rounded-2xl max-w-md border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-red-600 p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete Product?
              </DialogTitle>
              <DialogDescription className="text-red-200 mt-1 text-sm">
                This action is permanent and cannot be reversed.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              You are about to permanently delete{' '}
              <span className="font-black text-gray-900">&quot;{selectedProduct?.name}&quot;</span>{' '}
              from your database. The product listing will disappear from the website immediately.
            </p>
          </div>
          <DialogFooter className="px-6 pb-6 gap-3 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              className="rounded-xl h-11 px-6 font-bold border-2 w-full sm:w-auto"
            >
              Keep Product
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 rounded-xl h-11 px-6 font-black w-full sm:w-auto"
            >
              Yes, Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}