import type { Metadata } from "next";
import { UsersClient } from "./users-client";

export const metadata: Metadata = {
  title: "Users Management",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold p-4">Users Management</h1>
        <p className="text-muted-foreground pl-5">
          View and manage all registered users
        </p>
      </div>

      <UsersClient />
    </div>
  );
}
