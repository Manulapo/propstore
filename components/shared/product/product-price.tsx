import { cn } from "@/lib/utils";

const ProductPrice = ({ price, className, currency = '€' }: { price: number, className?: string, currency?:string }) => {
    const stringValue = price.toFixed(2);
    const [intValue, floatValue] = stringValue.split('.');
    return (
        <p className={cn('text-2xl', className)}>
            <span className="text-xs align-super">{currency}</span>
            {intValue}
            <span className="text-xs align-super">.</span>
            <span className="text-xs align-super">{`${floatValue}`}</span>
        </p>
    );
}

export default ProductPrice;