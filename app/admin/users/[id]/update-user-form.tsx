"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { USER_ROLES } from "@/lib/constants";
import { updateUserSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { z } from "zod";

const UpdateUserForm = ({
  user,
}: {
  user: z.infer<typeof updateUserSchema>;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  const handleSubmit = async () => {};

  return (
    <Form {...form}>
      <form method="POST" onSubmit={handleSubmit}>
        {/* Email */}
        <div>
          <FormField
            control={form.control}
            name="email"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof updateUserSchema>,
                "email"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    disabled={true}
                    placeholder="Enter user email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Name */}
        <div>
          <FormField
            control={form.control}
            name="name"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof updateUserSchema>,
                "name"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter user name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Role */}
        <div>
          <FormField
            control={form.control}
            name="role"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof updateUserSchema>,
                "role"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex-between mt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              "Update User"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UpdateUserForm;
