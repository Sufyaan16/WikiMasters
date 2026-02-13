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
import { z } from "zod";
import { logger } from "@/lib/logger";

const updateUserSchema = z.object({
  role: z.enum(["admin", "customer"]),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/users/[id]
 * Get single user details. Admin-only.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult.error;
  }

  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "moderate");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const { id } = await context.params;

    const user = await stackServerApp.getUser(id);
    if (!user) {
      return createErrorResponse({
        code: ErrorCode.USER_NOT_FOUND,
        message: "User not found",
      });
    }

    const metadata = user.clientReadOnlyMetadata as Record<string, unknown> | string | null;
    let role: "admin" | "customer" = "customer";
    let createdAt: string | null = null;

    if (typeof metadata === "string") {
      if (metadata === "admin") role = "admin";
    } else if (metadata && typeof metadata === "object") {
      if ((metadata as any).role === "admin") role = "admin";
      createdAt = (metadata as any).createdAt || null;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        displayName: user.displayName || null,
        primaryEmail: user.primaryEmail || null,
        profileImageUrl: user.profileImageUrl || null,
        signedUpAt: createdAt,
        role,
      },
    });
  } catch (error) {
    logger.error("Failed to get user", { error });
    return handleUnexpectedError(error, "GET /api/admin/users/[id]");
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update a user's role. Admin-only.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult.error;
  }

  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "strict");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const { id } = await context.params;

    // Prevent admin from demoting themselves
    if (id === authResult.userId) {
      return createErrorResponse({
        code: ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        message: "You cannot change your own role",
      });
    }

    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return createErrorResponse({
        code: ErrorCode.VALIDATION_FAILED,
        message: "Invalid role. Must be 'admin' or 'customer'.",
        details: validation.error.flatten().fieldErrors,
      });
    }

    const { role } = validation.data;

    const user = await stackServerApp.getUser(id);
    if (!user) {
      return createErrorResponse({
        code: ErrorCode.USER_NOT_FOUND,
        message: "User not found",
      });
    }

    // Preserve existing metadata and update role
    const existingMetadata =
      typeof user.clientReadOnlyMetadata === "object" && user.clientReadOnlyMetadata !== null
        ? (user.clientReadOnlyMetadata as Record<string, unknown>)
        : {};

    await user.update({
      clientReadOnlyMetadata: {
        ...existingMetadata,
        role,
      },
    });

    logger.info("User role updated", {
      targetUserId: id,
      newRole: role,
      updatedBy: authResult.userId,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        displayName: user.displayName || null,
        primaryEmail: user.primaryEmail || null,
        role,
      },
    });
  } catch (error) {
    logger.error("Failed to update user role", { error });
    return handleUnexpectedError(error, "PATCH /api/admin/users/[id]");
  }
}
