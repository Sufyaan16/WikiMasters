import { NextResponse, NextRequest } from "next/server";
import { stackServerApp } from "@/stack/server";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  getIpAddress,
} from "@/lib/rate-limit";
import {
  createErrorResponse,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * GET /api/admin/users
 * List all users with server-side pagination, search, and role filtering.
 * Admin-only.
 */
export async function GET(request: NextRequest) {
  // Auth: admin only
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit: moderate (60/min)
  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "moderate");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search")?.trim() || "";
    const roleFilter = searchParams.get("role") || "all";

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return createErrorResponse({
        code: ErrorCode.INVALID_QUERY_PARAMS,
        message: "Invalid pagination parameters",
        details: { page: "Must be >= 1", limit: "Must be 1-100" },
      });
    }

    // Fetch all users from StackAuth
    const allUsers = await stackServerApp.listUsers();

    // Transform to serializable format
    const transformed = allUsers.map((user) => {
      const metadata = user.clientReadOnlyMetadata as Record<string, unknown> | string | null;
      let role: "admin" | "customer" = "customer";
      let createdAt: string | null = null;

      if (typeof metadata === "string") {
        if (metadata === "admin") role = "admin";
      } else if (metadata && typeof metadata === "object") {
        if ((metadata as any).role === "admin") role = "admin";
        createdAt = (metadata as any).createdAt || null;
      }

      return {
        id: user.id,
        displayName: user.displayName || null,
        primaryEmail: user.primaryEmail || null,
        profileImageUrl: user.profileImageUrl || null,
        signedUpAt: createdAt,
        role,
      };
    });

    // Apply search filter (name or email)
    let filtered = transformed;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.displayName && u.displayName.toLowerCase().includes(q)) ||
          (u.primaryEmail && u.primaryEmail.toLowerCase().includes(q))
      );
    }

    // Apply role filter
    if (roleFilter === "admin" || roleFilter === "customer") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Sort: newest first
    filtered.sort((a, b) => {
      const aTime = a.signedUpAt ? new Date(a.signedUpAt).getTime() : 0;
      const bTime = b.signedUpAt ? new Date(b.signedUpAt).getTime() : 0;
      return bTime - aTime;
    });

    // Pagination
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit);
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      users: paginated,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    logger.error("Failed to list users", { error });
    return handleUnexpectedError(error, "GET /api/admin/users");
  }
}
