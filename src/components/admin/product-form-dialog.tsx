/* FILE: src/components/admin/product-form-dialog.tsx */

"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product, Category } from "@/lib/types";
// Import from the correct validation file
import { productFormSchema } from "@/lib/validation/product";
import { Switch } from "@/components/ui/switch";
import { ImageUploadZone } from "@/components/admin/ImageUploadZone";
import { Separator } from "@/components/ui/separator";

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  product: Product | null;
  categories: Category[];
  onSave: (product: Product) => void;
}

const renderArrayField = (
  label: string,
  fields: any[],
  remove: (index: number) => void,
  append: any,
  form: UseFormReturn<ProductFormValues>
) => (
  <div className="space-y-2">
    <FormLabel>{label}</FormLabel>
    {fields.map((field, index) => (
      <div key={field.id} className="flex items-center gap-2">
        <FormField
          control={form.control}
          name={`${label.toLowerCase() as "sizes" | "colors"}.${index}.value` as any}
          render={({ field }) => (
            <Input {...field} placeholder={`${label.slice(0, -1)} ${index + 1}`} />
          )}
        />
        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ))}
    <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
      <PlusCircle className="mr-2 h-4 w-4" /> Add {label.slice(0, -1)}
    </Button>
     <FormMessage>
        {form.formState.errors[label.toLowerCase() as "sizes" | "colors"]?.root?.message}
    </FormMessage>
  </div>
);

export function ProductFormDialog({
  isOpen,
  onOpenChange,
  product,
  categories,
  onSave,
}: ProductFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: "",
      images: [],
      sizes: [{value: ""}],
      colors: [{value: ""}],
      featured: false,
    },
  });
  
  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control: form.control,
    name: "sizes",
  });
  
  const { fields: colorFields, append: appendColor, remove: removeColor } = useFieldArray({
    control: form.control,
    name: "colors",
  });


  useEffect(() => {
    if (isOpen && product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        images: product.images.map(img => ({ value: img })),
        sizes: product.sizes.map(size => ({ value: size })),
        colors: product.colors.map(color => ({ value: color })),
        featured: product.featured,
      });
    } else if (isOpen && !product) {
      form.reset({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        categoryId: "",
        images: [],
        sizes: [{value: ""}],
        colors: [{value: ""}],
        featured: false,
      });
    }
  }, [isOpen, product, form]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    // The API expects arrays of strings, not arrays of objects.
    // We map the form data to the correct format here.
    const apiPayload = {
      ...data,
      images: data.images.map(img => img.value),
      sizes: data.sizes.map(s => s.value),
      colors: data.colors.map(c => c.value),
    };
    
    const url = isEditing ? `/api/products/${product?.id}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      toast.loading(`${isEditing ? 'Updating' : 'Creating'} product...`, { id: 'product-save' });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} product.`);
      }

      const savedProduct = await res.json();
      
      toast.dismiss('product-save');
      toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully!`, {
        description: `${savedProduct.name} has been ${isEditing ? 'updated' : 'added to your store'}.`
      });
      
      onSave(savedProduct);
      onOpenChange(false);
    } catch (error: any) {
      toast.dismiss('product-save');
      toast.error("Operation Failed", { 
        description: error.message || 'Something went wrong. Please check the console for details.' 
      });
      console.error('Error in onSubmit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of your product." : "Fill in the details for the new product."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        value={field.value || ''} 
                        onChange={e => {
                          const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }} 
                      />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value || ''} 
                        onChange={e => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                          field.onChange(isNaN(value) ? 0 : value);
                        }} 
                      />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Featured Product</FormLabel>
                    <FormDescription>This product will appear on the homepage.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Separator />

            {/* Image Upload Section */}
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                  <FormControl>
                    <ImageUploadZone
                      images={field.value?.map(img => img.value) || []}
                      onChange={(urls) => {
                        // Transform the string array from ImageUploadZone 
                        // into an array of objects for react-hook-form
                        field.onChange(urls.map(url => ({ value: url })));
                      }}
                      maxImages={6}
                      maxSizeMB={5}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />
            
            {renderArrayField("Sizes", sizeFields, removeSize, () => appendSize({ value: "" }), form)}
            
            <Separator />

            {renderArrayField("Colors", colorFields, removeColor, () => appendColor({ value: "" }), form)}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}