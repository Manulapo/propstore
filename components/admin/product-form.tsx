"use client";

import { useToast } from "@/hooks/use-toast";
import { productDefaultValues } from "@/lib/constants";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { ProductType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { ControllerRenderProps, SubmitHandler, useForm } from "react-hook-form";
import slugify from "slugify";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: "Create" | "Update";
  product?: ProductType;
  productId?: string;
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

  const onsubmit: SubmitHandler<z.infer<typeof insertProductSchema>> = async (
    values
  ) => {
    if (type === "Create") {
      const res = await createProduct(values);
      if (!res.success) {
        toast({
          title: "Error",
          description: res.message,
          variant: "destructive",
        });
        return;
      } else {
        toast({
          title: "Success",
          description: "Product created successfully",
          variant: "default",
        });
        router.push("/admin/products");
      }
    } else if (type === "Update") {
      if (!productId) {
        router.push("/admin/products");
        return;
      }

      const res = await updateProduct({ ...values, id: productId });
      if (!res.success) {
        toast({
          title: "Error",
          description: res.message,
          variant: "destructive",
        });
        return;
      } else {
        toast({
          title: "Success",
          description: "Product updated successfully",
          variant: "default",
        });
        router.push("/admin/products");
      }
    }
  };

  return (
    <Form {...form}>
      <form
        className="space-y-8"
        method="POST"
        onSubmit={form.handleSubmit(onsubmit)}
      >
        <div className="flex flex-col md:flex-row gap-5">
          {/* name */}
          <FormField
            control={form.control}
            name="name"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "name"
              >;
            }) => (
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
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "slug"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Product Slug" {...field} />
                    <Button
                      type="button"
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 mt-2"
                      onClick={() => {
                        form.setValue(
                          "slug",
                          slugify(form.getValues("name"), { lower: true })
                        );
                      }}
                    >
                      Generate Slug
                    </Button>
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
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "category"
              >;
            }) => (
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
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "brand"
              >;
            }) => (
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
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "price"
              >;
            }) => (
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
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "stock"
              >;
            }) => (
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
          {/* banner */}
        </div>
        <div className="upload-field">{/* isFeatured */}</div>
        <div>
          {/* description */}
          <FormField
            control={form.control}
            name="description"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "description"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="resize-none"
                    placeholder="Product Description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          {" "}
          {/* submit */}
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full button col-span-2"
          >
            {form.formState.isSubmitting ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              `${type} Product`
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
