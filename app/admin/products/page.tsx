import { requireAdmin } from "@/lib/auth-guard";

const AdminProductPage = async () => {
      await requireAdmin(); // Ensure the user is an admin
    
    return ( <></> );
}
 
export default AdminProductPage;