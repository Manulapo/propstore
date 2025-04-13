import { DollarSign, Headset, ShoppingBag, WalletCards } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const IconBoxes = () => {
  return (
    <>
      <Card>
        <CardContent className="grid md:grid-cols-4 gap-5 p-4">
          <div className="space-y-2">
            <ShoppingBag />
            <div className="text-sm font-bold">Free Shipping</div>
            <p className="text-sm text-muted-foreground">
              Free shipping on all orders over $100
            </p>
          </div>
          <div className="space-y-2">
            <DollarSign />
            <div className="text-sm font-bold">Money back Guarantees</div>
            <p className="text-sm text-muted-foreground">
              30 days money back guarantee on all orders
            </p>
          </div>
          <div className="space-y-2">
            <WalletCards />
            <div className="text-sm font-bold">Flexible Payment</div>
            <p className="text-sm text-muted-foreground">
              Pay with your credit card, PayPal or COD
            </p>
          </div>
          <div className="space-y-2">
            <Headset />
            <div className="text-sm font-bold">24/7 support</div>
            <p className="text-sm text-muted-foreground">
              We are always here to help you with your orders
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default IconBoxes;
