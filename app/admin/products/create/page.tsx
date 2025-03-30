import { requireAdmin } from "@/lib/auth-guard";

const CreateProductPage = async () => {
  await requireAdmin(); // Ensure the user is an admin

  return <></>;
};

export default CreateProductPage;
