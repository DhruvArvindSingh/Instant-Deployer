'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { ProjectCard } from '@/components/project-card';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('http://localhost:9000/projects', {
          withCredentials: true,
        });
        if (res.status === 200) {
          console.log("res.data = ", res.data);
          // Map the projects to the expected format
          const formattedProjects = res.data.map((project: any) => {
            let url = project.github_url.replace("https://github.com/", "");
            let redirect_url;
            if (project.custom_domain) {
              redirect_url = project.custom_domain;
            } else {
              redirect_url = `http://${project.subdomain}.localhost:8000/`;
            }
            return {
              id: project.id,
              name: url.split("/")[1],
              status: "Running",
              url: redirect_url,
              lastDeployed: project.updated_at,
            };
          });
          setProjects(formattedProjects);
        } else {
          console.log("Error fetching projects", res.data);
          toast.error("Error fetching projects", {
            description: res.data.error,
          });
        }
      } catch (error: any) {
        console.log("Error fetching projects", error);
        toast.error("Error fetching projects", {
          description: error?.response?.data?.error || error.message,
        });
      }
    };
    fetchProjects();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <Link href="/deploy">
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
            {projects.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}