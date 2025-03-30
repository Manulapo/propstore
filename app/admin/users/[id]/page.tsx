import { requireAdmin } from "@/lib/auth-guard";

const AdminUsersUpdatePage = async () => {
  await requireAdmin(); // Ensure the user is an admin

  return <></>;
};

export default AdminUsersUpdatePage;
