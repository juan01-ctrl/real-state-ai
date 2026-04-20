import { UserRole } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { hasPermission } from "@/lib/server/rbac";

describe("rbac permissions", () => {
  it("allows agents to operate leads but not admin surfaces", () => {
    expect(hasPermission(UserRole.AGENT, "leads.read")).toBe(true);
    expect(hasPermission(UserRole.AGENT, "leads.write")).toBe(true);
    expect(hasPermission(UserRole.AGENT, "team.manage")).toBe(false);
    expect(hasPermission(UserRole.AGENT, "billing.manage")).toBe(false);
  });

  it("allows admins to access backoffice and manage billing/jobs", () => {
    expect(hasPermission(UserRole.AGENCY_ADMIN, "backoffice.read")).toBe(true);
    expect(hasPermission(UserRole.AGENCY_ADMIN, "billing.manage")).toBe(true);
    expect(hasPermission(UserRole.AGENCY_ADMIN, "jobs.manage")).toBe(true);
  });
});
