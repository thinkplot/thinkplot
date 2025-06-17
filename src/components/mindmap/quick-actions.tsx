import { Plus, Brain, FileText, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      title: "Create New Mindmap",
      description: "Start a fresh mindmap from scratch",
      icon: Plus,
      href: "/mindmap/new",
      color: "text-chart-2",
      bgColor: "bg-accent"
    },
    {
      title: "Browse Templates",
      description: "Use pre-built templates to get started quickly",
      icon: FileText,
      href: "/templates",
      color: "text-chart-1",
      bgColor: "bg-accent"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {actions.map((action) => {
        const IconComponent = action.icon;
        return (
          <Card key={action.title} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
            <Link href={action.href}>
              <CardContent className="p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${action.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`h-6 w-6 ${action.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
