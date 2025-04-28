"use client";

import AppLogo from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { cn, formatCurrency } from "@/lib/utils";
import { Cart } from "@/types";
import { ArrowRight, Loader, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <div
        className={cn(
          "flex items-center mt-6 gap-6",
          !cart || (cart.items.length === 0 && "justify-center")
        )}
      >
        <AppLogo size={60}/>
        <div>
          <h1 className="pt-4 py-1 h2-bold">Shopping Cart</h1>
          {!cart || cart.items.length === 0 ? (
            <div>
              Cart is Empty <Link href={"/"}>Go Shopping</Link>
            </div>
          ) : null}
        </div>
      </div>
      {cart && cart.items.length > 0 && (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">quantity</TableHead>
                  <TableHead className="text-right">price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className="flex items-center"
                      >
                        <Image
                          src={item.image}
                          width={100}
                          height={100}
                          alt={item.name}
                        />
                        <span>{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="flex-center gap-2">
                      <Button
                        disabled={isPending}
                        variant={"outline"}
                        type={"button"}
                        onClick={() => {
                          startTransition(async () => {
                            const res = await removeItemFromCart(
                              item.productId
                            );

                            if (!res.success) {
                              toast({
                                variant: "destructive",
                                description: res.message,
                              });
                            }
                          });
                        }}
                      >
                        {isPending ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                      </Button>
                      <span className="align-text-top">{item.qty}</span>
                      <Button
                        disabled={isPending}
                        variant={"outline"}
                        type={"button"}
                        onClick={() => {
                          startTransition(async () => {
                            const res = await addItemToCart(item);

                            if (!res.success) {
                              toast({
                                variant: "destructive",
                                description: res.message,
                              });
                            }
                          });
                        }}
                      >
                        {isPending ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">${item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Card>
            <CardContent className="p-4 gap-4">
              <div className="pb-3 text-xl">
                Subtotal ({cart.items.reduce((acc, item) => acc + item.qty, 0)})
                :
                <span className="font-bold">
                  {formatCurrency(cart.itemsPrice)}
                </span>
              </div>
              <Button
                className="w-full"
                disabled={isPending}
                onClick={() => {
                  startTransition(() => {
                    router.push("/shipping-address");
                  });
                }}
              >
                {isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CartTable;
