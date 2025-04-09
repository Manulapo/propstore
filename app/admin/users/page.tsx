import DeleteDialog from "@/components/shared/deleteDialog";
import Pagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table,
} from "@/components/ui/table";
import { deleteUserById, getAllUsers } from "@/lib/actions/user.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { formatId } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Users",
};

const AdminUserPage = async (props: {
  searchParams: Promise<{ page: string }>;
}) => {
  await requireAdmin(); // Ensure the user is an admin
  const { page = "1" } = await props.searchParams;
  const users = await getAllUsers({ page: Number(page) });

  return (
    <div className="space-y-2">
      <h2 className="h2-bold">Users</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {formatId(user.id)}
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === "admin" ? (
                    <Badge className="text-xs">Admin</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      User
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button asChild variant={"outline"} size={"sm"}>
                    <Link href={`/admin/users/${user.id}`}>Edit</Link>
                  </Button>
                  <DeleteDialog id={user.id} action={deleteUserById} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end mt-4">
          {users.totalPages > 1 && (
            <Pagination
              page={Number(page) || 1}
              totalPages={users?.totalPages}
            ></Pagination>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserPage;
