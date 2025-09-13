import { getIsAdmin } from "@/actions/userActions";

export async function GET() {
    try {
      const isAdmin = await getIsAdmin();
      return Response.json({ isAdmin });
    } catch {
      return Response.json({ isAdmin: false }, { status: 500 });
    }
  }