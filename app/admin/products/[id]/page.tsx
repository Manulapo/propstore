import { requireAdmin } from "@/lib/auth-guard";

const AdminProductUpdatePage = async () => {
  await requireAdmin(); // Ensure the user is an admin

  return <></>;
};

export default AdminProductUpdatePage;
