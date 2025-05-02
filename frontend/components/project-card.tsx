import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    status: 'deployed' | 'building' | 'failed';
    url: string;
    lastDeployed: string;
    framework: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    deployed: 'bg-green-500/10 text-green-500',
    building: 'bg-yellow-500/10 text-yellow-500',
    failed: 'bg-red-500/10 text-red-500',
  };

  const statusLabels = {
    deployed: 'Deployed',
    building: 'Building',
    failed: 'Failed',
  };

  return (
    <Card className="overflow-hidden border border-border/50 bg-card/30 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 hover:border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium line-clamp-1">{project.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {project.framework}
              </Badge>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  statusColors[project.status]
                }`}
              >
                {statusLabels[project.status]}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Deploy</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
        <span>Updated {project.lastDeployed}</span>
        <Link href={project.url} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}