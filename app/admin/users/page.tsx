import { requireAdmin } from "@/lib/auth-guard";

const AdminUserPage = async () => {
  await requireAdmin(); // Ensure the user is an admin

  return <></>;
};

export default AdminUserPage;
