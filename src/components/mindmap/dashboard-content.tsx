"use client";

import { Plus, Brain, FileText, Clock, TrendingUp, FolderPlus, Folder, Grid, List, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { QuickActions } from "@/components/mindmap/quick-actions";
import { formatDistanceToNow } from "date-fns";
import type { Tables } from "@/lib/database";

type Mindmap = Tables<"mindmaps">;

interface StatsData {
  totalMindmaps: number;
  totalNodes: number;
  mindmapsThisWeek: number;
  avgNodesPerMindmap: number;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  mindmapCount: number;
  createdAt: string;
}

// Mock folder data - replace with actual data when backend is ready
const mockFolders: Folder[] = [
  { id: "1", name: "Work Projects", color: "bg-blue-500", mindmapCount: 5, createdAt: "2024-01-15" },
  { id: "2", name: "Personal Ideas", color: "bg-green-500", mindmapCount: 3, createdAt: "2024-01-10" },
  { id: "3", name: "Learning Notes", color: "bg-purple-500", mindmapCount: 7, createdAt: "2024-01-05" }
];

function FoldersSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Folders
        </h3>
        <Button variant="outline" size="sm">
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockFolders.map((folder) => (
          <Card key={folder.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${folder.color} flex items-center justify-center`}>
                  <Folder className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground group-hover:text-chart-1 transition-colors">{folder.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {folder.mindmapCount} mindmaps
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(folder.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MindmapGrid({ mindmaps, showAll = false }: { mindmaps: Mindmap[]; showAll?: boolean }) {
  const displayMindmaps = showAll ? mindmaps : mindmaps.slice(0, 6);

  if (!displayMindmaps || displayMindmaps.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No mindmaps yet</h3>
        <p className="text-muted-foreground mb-4">Create your first mindmap to get started</p>
        <Link href="/mindmap/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Mindmap
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayMindmaps.map((mindmap) => (
        <Card key={mindmap.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground group-hover:text-chart-1 transition-colors line-clamp-2">{mindmap.title || "Untitled Mindmap"}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{formatDistanceToNow(new Date(mindmap.created_at), { addSuffix: true })}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Link href={`/mindmap/${mindmap.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="h-3 w-3 mr-1" />
                  Open
                </Button>
              </Link>
              <Link href={`/mindmap/${mindmap.id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function MindmapDashboardContent({ recentMindmaps, allMindmaps }: { recentMindmaps: Mindmap[]; allMindmaps: Mindmap[] }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-chart-1" />
            <h1 className="text-3xl font-bold text-foreground">ThinkPlot Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Visualize your ideas and create meaningful connections</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        <Separator className="my-8" />

        {/* Folders Section */}
        <div className="mb-8">
          <FoldersSection />
        </div>

        <Separator className="my-8" />

        {/* Mindmaps Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Your Mindmaps
          </h2>

          <Tabs defaultValue="recent" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              <MindmapGrid mindmaps={recentMindmaps} />
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search mindmaps..." className="pl-10" />
                  </div>
                </div>

                <MindmapGrid mindmaps={allMindmaps} showAll />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
