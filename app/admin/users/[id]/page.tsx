import { getUserById } from "@/lib/actions/user.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import UpdateUserForm from "./update-user-form";

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
        <h1 className="h2-bold">Update user</h1>
        <UpdateUserForm user={user} />
      </div>
    </>
  );
};

export default AdminUsersUpdatePage;
