"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { formUrlQuery } from "@/lib/utils";

type PaginationProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
};

const Pagination = ({ page, totalPages, urlParamName }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = (btnType: "prev" | "next") => {
    const pageValue = btnType === "prev" ? Number(page) - 1 : Number(page) + 1;

    const newUrlQuery = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || "page", // default to "page" but can be overridden by urlParamName prop
      value: pageValue.toString(),
    });

    router.push(newUrlQuery); // push the new URL to the router
  };

  return (
    <div className="flex gap-2">
      <Button
        size={"lg"}
        variant={"outline"}
        disabled={Number(page) <= 1}
        onClick={() => handleClick("prev")}
      >
        Prev
      </Button>
      <Button
        size={"lg"}
        variant={"outline"}
        disabled={Number(page) >= totalPages}
        onClick={() => handleClick("next")}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
