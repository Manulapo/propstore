"use client";

import { useToast } from "@/hooks/use-toast";
import { productDefaultValues } from "@/lib/constants";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { ProductType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import slugify from 'slugify';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Loader } from "lucide-react";

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: "Create" | "Update";
  product?: ProductType;
  ProductId?: string;
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const productSchema =
    type === "Update" ? updateProductSchema : insertProductSchema;

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });

  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="flex flex-col md:flex-row gap-5">
          {/* name */}
          <FormField
          control={form.control}
            name="name"
            render={({field}:{field:ControllerRenderProps<z.infer<typeof insertProductSchema>,'name'>}) => (
                <FormItem className="w-full">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Product Name" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
          {/* slug */}
            <FormField
            control={form.control}
            name="slug"
            render={({field}:{field:ControllerRenderProps<z.infer<typeof insertProductSchema>,'slug'>}) => (
                <FormItem className="w-full">
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                        <div className="relative">
                        <Input placeholder="Product Slug" {...field} />
                        <Button type="button" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 mt-2" onClick={() => {form.setValue('slug', slugify(form.getValues('name'), {lower: true}))}}>Generate Slug</Button>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          {/* category */}
            <FormField
            control={form.control}
            name="category"
            render={({field}:{field:ControllerRenderProps<z.infer<typeof insertProductSchema>,'category'>}) => (
                <FormItem className="w-full">
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                        <Input placeholder="Product Category" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
          {/* brand */}
            <FormField
            control={form.control}
            name="brand"
            render={({field}:{field:ControllerRenderProps<z.infer<typeof insertProductSchema>,'brand'>}) => (
                <FormItem className="w-full">
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                        <Input placeholder="Product Brand" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />  
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          {/* price */}
            <FormField
                control={form.control}
                name="price"
                render={({field}:{field:ControllerRenderProps<z.infer<typeof insertProductSchema>,'price'>}) => (
                    <FormItem className="w-full">
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                            <Input placeholder="Product Price" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />  
          {/* stock */}
            <FormField
                control={form.control}
                name="stock"
                render={({field}:{field:ControllerRenderProps<z.infer<typeof insertProductSchema>,'stock'>}) => (
                    <FormItem className="w-full">
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                            <Input placeholder="Product Stock" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <div className="upload-field flex flex-col md:flex-row gap-5">
          {/* images */}
            <FormField
                control={form.control}
                name="images"
                render={({field}:{field:ControllerRenderProps<z.infer<typeof insertProductSchema>,'images'>}) => (
                    <FormItem className="w-full">
                        <FormLabel>Images</FormLabel>
                        <FormControl>
                            <Input placeholder="Product Images" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />  
          {/* banner */}
            <FormField
                control={form.control}
                name="banner"
                render={({field}:{field:ControllerRenderProps<z.infer<typeof insertProductSchema>,'banner'>}) => (
                    <FormItem className="w-full">
                        <FormLabel>Banner</FormLabel>
                        <FormControl>
                            <Input placeholder="Product Banner" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <div className="upload-field">{/* isFeatured */}</div>
        <div>{/* description */} 
            <FormField
                    control={form.control}
                    name="description"
                    render={({field}:{field:ControllerRenderProps<z.infer<typeof insertProductSchema>,'description'>}) => (
                        <FormItem className="w-full">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea className="resize-none" placeholder="Product Description" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
        </div>

        <div> {/* submit */}
            <Button
                type="submit"
                size="lg"
                disabled={form.formState.isSubmitting}
                className="w-full button col-span-2"
            >
                {form.formState.isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : `${type} Product`}
            </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
