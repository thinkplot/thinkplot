import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { MindmapDashboardContent } from "@/components/mindmap/dashboard-content";
import type { Tables } from "@/lib/database";

type Mindmap = Tables<"mindmaps">;

async function getRecentMindmaps(): Promise<Mindmap[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("mindmaps").select("*").order("created_at", { ascending: false }).limit(6);

  if (error) {
    console.error("Error fetching mindmaps:", error);
    return [];
  }

  return data || [];
}

async function getAllMindmaps(): Promise<Mindmap[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("mindmaps").select("*").order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching mindmaps:", error);
    return [];
  }

  return data || [];
}

// Server component that fetches data
async function MindmapDashboard() {
  const [recentMindmaps, allMindmaps] = await Promise.all([getRecentMindmaps(), getAllMindmaps()]);

  return (
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      <MindmapDashboardContent recentMindmaps={recentMindmaps} allMindmaps={allMindmaps} />
    </Suspense>
  );
}

// Loading skeletons
function RecentMindmapsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-6 w-32 mb-3" />
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-4 w-20" />
        </Card>
      ))}
    </div>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="mb-8">
          <Skeleton className="h-20 w-full" />
        </div>

        <Separator className="my-8" />

        <Separator className="my-8" />

        <div className="mb-8">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="h-6 w-40 mb-6" />
          <RecentMindmapsSkeleton />
        </div>
      </div>
    </div>
  );
}

export default MindmapDashboard;
