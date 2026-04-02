'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Edit2, Trash2, Package, ShieldCheck, ShieldAlert, Plus, Upload, X, Loader2, ImageIcon, Settings2 } from 'lucide-react'

const PRODUCT_MAPPING = {
  "24 inch": { label: "24 inch (TV)", size: "24\"", models: ["Basic Frameless", "Basic Double Glass", "Smart Frameless", "Smart Double Glass"], hasTypes: false },
  "32 inch": { label: "32 inch (TV)", size: "32\"", models: ["Regular Series", "Gold Series", "Google TV"], hasTypes: true },
  "43 inch": { label: "43 inch (TV)", size: "43\"", models: ["Regular Series", "Gold Series", "Google TV"], hasTypes: true },
  "50 inch": { label: "50 inch (TV)", size: "50\"", models: ["Regular Series", "Gold Series", "Google TV"], hasTypes: true },
  "65 inch": { label: "65 inch (TV)", size: "65\"", models: ["Regular Series", "Gold Series", "Google TV"], hasTypes: true },
  "12 inch": { label: "12 inch (Fan)", size: "12\"", models: ["Table Fan - Rechargeable"], hasTypes: false },
  "16 inch": { label: "16 inch (Fan)", size: "16\"", models: ["Table Fan - Rechargeable", "Stand Fan - Rechargeable"], hasTypes: false },
  "18 inch": { label: "18 inch (Fan)", size: "18\"", models: ["Stand Fan - Rechargeable"], hasTypes: false },
  "Cooker": { label: "Rice Cooker", size: "Cooker", models: ["Rice Cooker"], hasTypes: false },
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
    if (hasTypes(formData.category) && !formData.selectedType) { toast.error("Please select a type"); return false; }
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
      ...formData, 
      original_price: formData.original_price ? Number(formData.original_price) : null,
      discount_percentage: formData.discount_percentage || null,
      is_active: true
    }
    delete (dbData as any).selectedModel
    delete (dbData as any).selectedType

    const { error } = await supabase.from('products').insert([dbData])
    if (!error) {
      toast.success(`${formData.name} added to catalog`)
      setAddDialog(false)
      fetchProducts()
    } else toast.error("Failed to add product")
  }

  const handleEdit = async () => {
    if (!selectedProduct || !validateForm()) return
    const dbData = { 
      ...formData, 
      original_price: formData.original_price ? Number(formData.original_price) : null,
      discount_percentage: formData.discount_percentage || null
    }
    delete (dbData as any).selectedModel
    delete (dbData as any).selectedType

    const { error } = await supabase.from('products').update(dbData).eq('id', selectedProduct.id)
    if (!error) {
      toast.success("Changes saved successfully")
      setEditDialog(false)
      fetchProducts()
    } else toast.error("Failed to update product")
  }

  const handleDelete = async () => {
    if (!selectedProduct) return
    const { error } = await supabase.from('products').delete().eq('id', selectedProduct.id)
    if (!error) {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-red-600 border-r-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-black via-red-950 to-red-900 px-8 py-10 mb-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Products Management</h1>
          <p className="text-red-200 mt-2 font-medium">Add, update, and manage your product inventory</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setManageTypesDialog(true)}
            className="bg-white/10 border border-white/20 text-white hover:bg-white/20 font-bold px-6 py-6 h-auto text-base rounded-xl transition-transform active:scale-95"
          >
            <Settings2 className="mr-2 h-5 w-5" /> Manage Types
          </Button>
          <Button
            onClick={openAddDialog}
            className="bg-white text-red-700 hover:bg-gray-100 font-bold px-8 py-6 h-auto text-lg rounded-xl shadow-lg transition-transform active:scale-95"
          >
            <Plus className="mr-2 h-6 w-6" /> Add New Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-black overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Inventory</CardTitle>
            <Package className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-3xl font-black">{products.length}</div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Online</CardTitle>
            <ShieldCheck className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-3xl font-black text-green-600">{products.filter(p => p.is_active).length}</div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Out of Stock</CardTitle>
            <ShieldAlert className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-3xl font-black text-red-600">{products.filter(p => !p.is_active).length}</div></CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="p-5 font-bold text-gray-600">Image</th>
                <th className="p-5 font-bold text-gray-600">Product Details</th>
                <th className="p-5 font-bold text-gray-600">Category & Size</th>
                <th className="p-5 font-bold text-gray-600">Price</th>
                <th className="p-5 font-bold text-gray-600">Active Status</th>
                <th className="p-5 font-bold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-red-50/30 transition-colors">
                  <td className="p-5">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        : <ImageIcon className="w-8 h-8 text-gray-300" />}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-gray-900 text-lg">{product.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                  </td>
                  <td className="p-5">
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-tighter">
                        {PRODUCT_MAPPING[product.category as CategoryKey]?.label || product.category}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">{product.size}</span>
                    </div>
                  </td>
                  <td className="p-5 font-mono font-bold text-red-700 text-lg">৳{product.price.toLocaleString()}</td>
                  <td className="p-5">
                    <Switch checked={product.is_active} onCheckedChange={() => toggleActive(product.id, product.is_active)} className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-600" />
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)} className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-full">
                        <Edit2 className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedProduct(product); setDeleteDialog(true); }} className="text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Manage Types Dialog ── */}
      <Dialog open={manageTypesDialog} onOpenChange={setManageTypesDialog}>
        <DialogContent className="max-w-lg bg-white border-none shadow-2xl">
          <div className="bg-gradient-to-r from-black to-red-900 p-6 rounded-t-lg -mx-6 -mt-6 mb-6">
            <DialogTitle className="text-2xl font-black text-white">Manage Product Types</DialogTitle>
            <DialogDescription className="text-red-200 mt-1">
              Types are shared across 32&quot;, 43&quot;, 50&quot; and 65&quot; products
            </DialogDescription>
          </div>

          {/* Add new type input */}
          <div className="flex gap-3 mb-6">
            <Input
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddType()}
              placeholder='e.g. Smart Frameless Voice'
              className="h-11 border-2 flex-1"
            />
            <Button
              onClick={handleAddType}
              disabled={isAddingType || !newTypeName.trim()}
              className="bg-red-700 hover:bg-red-800 text-white h-11 px-5 font-bold rounded-lg shrink-0"
            >
              {isAddingType ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" />Add</>}
            </Button>
          </div>

          {/* Types list */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {productTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Settings2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No types yet. Add your first one above.</p>
              </div>
            ) : (
              productTypes.map((type) => (
                <div key={type.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 group">
                  <span className="font-medium text-gray-800">{type.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteType(type.id, type.name)}
                    disabled={deletingTypeId === type.id}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {deletingTypeId === type.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setManageTypesDialog(false)} className="rounded-lg h-11 px-6 font-bold border-2">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

   {/* ── Add/Edit Product Dialog ── */}
<Dialog open={addDialog || editDialog} onOpenChange={(open: boolean) => { if (!open) { setAddDialog(false); setEditDialog(false); } }}>
  <DialogContent className="max-w-4xl bg-white p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[95vh]">
    
    {/* Header - Fixed */}
    <div className="bg-gradient-to-r from-black to-red-900 p-6 shrink-0">
      <DialogTitle className="text-2xl font-black text-white">
        {addDialog ? "Create New Listing" : "Update Product Info"}
      </DialogTitle>
    </div>

    {/* Scrollable Body */}
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
      
      {/* Top Section: Image and Basic Identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Image Upload Area */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Image</Label>
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-red-500 transition-colors bg-gray-50/50">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="product-image-upload" disabled={isUploading} />
              <label htmlFor="product-image-upload" className="cursor-pointer flex flex-col items-center gap-3">
                {isUploading 
                  ? <Loader2 className="h-10 w-10 animate-spin text-red-600" />
                  : <Upload className="h-10 w-10 text-gray-400" />
                }
                <div className="text-sm font-semibold text-gray-600">Click to upload image</div>
              </label>
            </div>
          ) : (
            <div className="relative border-2 border-gray-100 rounded-2xl overflow-hidden bg-gray-50 h-48 flex items-center justify-center">
              <img src={imagePreview} alt="Preview" className="max-h-full object-contain" />
              <Button type="button" variant="destructive" size="icon" onClick={handleRemoveImage} className="absolute top-2 right-2 rounded-full h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Dynamic Name Preview */}
        <div className="flex flex-col justify-end">
          <div className="p-5 bg-red-50 border border-red-100 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-2">Live Listing Title</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">
              {formData.name || "Product Name will appear here..."}
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Category */}
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase">1. Size Category</Label>
          <Select onValueChange={handleCategoryChange} value={formData.category}>
            <SelectTrigger className="h-12 bg-white border-2 border-gray-100 focus:border-red-500">
              <SelectValue placeholder="Pick size" />
            </SelectTrigger>
            <SelectContent className="bg-white opacity-100 shadow-xl border border-gray-200 z-[150]">
              {Object.keys(PRODUCT_MAPPING).map((cat) => (
                <SelectItem key={cat} value={cat} className="focus:bg-red-50">
                  {PRODUCT_MAPPING[cat as CategoryKey].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 2. Model */}
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase">2. Base Model</Label>
          <Select onValueChange={handleModelChange} value={formData.selectedModel} disabled={!formData.category}>
            <SelectTrigger className="h-12 bg-white border-2 border-gray-100">
              <SelectValue placeholder="Pick model" />
            </SelectTrigger>
            <SelectContent className="bg-white opacity-100 shadow-xl border border-gray-200 z-[150]">
              {formData.category && PRODUCT_MAPPING[formData.category as CategoryKey].models.map((model) => (
                <SelectItem key={model} value={model} className="focus:bg-red-50">{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Type (Conditional) */}
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase">3. Variation Type</Label>
          {hasTypes(formData.category) ? (
            <Select onValueChange={handleTypeChange} value={formData.selectedType} disabled={!formData.selectedModel}>
              <SelectTrigger className="h-12 bg-white border-2 border-gray-100">
                <SelectValue placeholder="Pick type" />
              </SelectTrigger>
              <SelectContent className="bg-white opacity-100 shadow-xl border border-gray-200 z-[150]">
                {productTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name} className="focus:bg-red-50">{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-12 flex items-center px-4 bg-gray-50 text-gray-400 text-xs italic rounded-lg border border-dashed border-gray-200">
              Not required for this size
            </div>
          )}
        </div>

        {/* Price Input */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-black text-gray-400 uppercase">Regular / Old Price (BDT) *</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">৳</span>
              <Input 
                type="number" 
                value={formData.price || ''} 
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} 
                className="h-12 pl-8 border-2 border-green-200 focus:border-green-500 font-bold text-lg bg-green-50/30" 
              />
            </div>
          </div>
        </div>

        {/* Original Price */}
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase">New Discounted Price (Optional)</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">৳</span>
            <Input 
              type="number" 
              value={formData.original_price || ''} 
              onChange={(e) => setFormData({ ...formData, original_price: e.target.value })} 
              className="h-12 pl-8 border-2 border-gray-100 font-bold text-gray-500" 
            />
          </div>
        </div>

        {/* Discount Tag */}
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase">Discount Tag / Badge (Optional)</Label>
          <Input 
            type="text" 
            value={formData.discount_percentage || ''} 
            onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })} 
            placeholder="e.g. 20% OFF or Save ৳5000"
            className="h-12 border-2 border-gray-100 font-bold" 
          />
        </div>

        {/* Description - Spans full width on large screens */}
        <div className="md:col-span-2 lg:col-span-3 space-y-2 mt-4">
          <Label className="text-xs font-black text-gray-400 uppercase">Features & Specs</Label>
          <Textarea 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            className="border-2 border-gray-100 h-12 min-h-[48px] resize-none focus:min-h-[100px] transition-all" 
            placeholder="Bluetooth, Voice Control, 4K..." 
          />
        </div>
      </div>
    </div>

    {/* Footer - Fixed */}
    <div className="p-6 bg-gray-50 border-t shrink-0 flex justify-end gap-3">
      <Button variant="outline" onClick={() => { setAddDialog(false); setEditDialog(false); }} className="px-6 h-12 font-bold rounded-xl">
        Discard
      </Button>
      <Button 
        onClick={addDialog ? handleAdd : handleEdit} 
        disabled={isUploading} 
        className="bg-red-700 hover:bg-red-800 text-white px-10 h-12 font-black shadow-lg rounded-xl"
      >
        {addDialog ? "Publish Listing" : "Update Product"}
      </Button>
    </div>
  </DialogContent>
</Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Delete Product?</DialogTitle>
            <DialogDescription className="py-4 text-gray-600 text-base">
              This will permanently remove <span className="font-bold text-red-600">&quot;{selectedProduct?.name}&quot;</span> from your database. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setDeleteDialog(false)} className="rounded-lg h-12 px-6">Keep Product</Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-lg h-12 px-6 font-bold">Yes, Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}