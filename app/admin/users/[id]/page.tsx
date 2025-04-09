import { requireAdmin } from "@/lib/auth-guard";
import { notFound } from "next/navigation";
import { getUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import { Select } from "@/components/ui/select";

export const metadata: Metadata = {
  title: "Update User",
};

const AdminUsersUpdatePage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  await requireAdmin(); // Ensure the user is an admin

  const { id } = await props.params;
  const user = await getUserById(id);
  if (!user) notFound();

  return (
    <>
      <div className="space-y-8 max-w-lg mx-auto">
        
      </div>
    </>
  );
};

export default AdminUsersUpdatePage;
