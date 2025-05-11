import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { ProjectCard } from '@/components/project-card';

export default function ProjectsPage() {
  // Mock data for demonstration
  const projects = [
    {
      id: '1',
      name: 'Landing Page',
      status: 'deployed',
      url: 'https://landing-page.vercel.app',
      lastDeployed: '2 hours ago',
      framework: 'Next.js',
    },
    {
      id: '2',
      name: 'E-commerce App',
      status: 'building',
      url: 'https://ecommerce-app.vercel.app',
      lastDeployed: '5 days ago',
      framework: 'React',
    },
    {
      id: '3',
      name: 'Portfolio',
      status: 'deployed',
      url: 'https://portfolio.vercel.app',
      lastDeployed: '1 month ago',
      framework: 'Astro',
    },
    {
      id: '4',
      name: 'Blog',
      status: 'deployed',
      url: 'https://blog.vercel.app',
      lastDeployed: '3 weeks ago',
      framework: 'Gatsby',
    },
    {
      id: '5',
      name: 'Admin Dashboard',
      status: 'failed',
      url: 'https://admin.vercel.app',
      lastDeployed: '2 days ago',
      framework: 'Vue',
    },
    {
      id: '6',
      name: 'API Documentation',
      status: 'deployed',
      url: 'https://docs.vercel.app',
      lastDeployed: '1 week ago',
      framework: 'Docusaurus',
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <Link href="/dashboard/deploy">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            View and manage all your deployed projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}