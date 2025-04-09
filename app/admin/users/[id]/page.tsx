import { requireAdmin } from "@/lib/auth-guard";
import { notFound } from "next/navigation";

const AdminUsersUpdatePage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  await requireAdmin(); // Ensure the user is an admin
  const { id } = await props.params;
  if (!id) {
    notFound(); 
  }

  return <>Hello {id}</>;
};

export default AdminUsersUpdatePage;
