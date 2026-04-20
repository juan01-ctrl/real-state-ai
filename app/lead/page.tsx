import { redirect } from "next/navigation";

interface LeadCommandCenterPageProps {
  searchParams: Promise<{ agencyId?: string }>;
}

export default async function LeadCommandCenterPage({ searchParams }: LeadCommandCenterPageProps) {
  const params = await searchParams;
  const agencyId = params.agencyId ?? "agency_demo_001";
  redirect(`/team?agencyId=${agencyId}`);
}
