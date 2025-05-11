'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { ArrowRight, Plus, Rocket, Server } from 'lucide-react';
import Link from 'next/link';
import { ProjectCard } from '@/components/project-card';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import dotenv from 'dotenv';

dotenv.config({ path: '../../../../../.env' });

export default function DashboardPage() {
  const router = useRouter();
  const [totalDeployments, setTotalDeployments] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication");
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      const token = cookies.token;

      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/verify`, {}, {
          headers: {
            'token': token,
          }
        });

        if (res.status === 401) {
          router.push('/login');
        }
        else {
          console.log("Authenticated successfully");
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/dashboard`, {
            headers: {
              'token': token,
            }
          });
          console.log("res.data from dashboard_get", res.data);
          setTotalDeployments(res.data.totalDeployments.length);
          setActiveProjects(res.data.projects.length);
          // setTotalDeployments(res.data.length);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        router.push('/login');
      }
    }

    let isMounted = true;
    if (isMounted) {
      checkAuth();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Mock data for demonstration
  const recentProjects: any[] = [
    // {
    //   id: '1',
    //   name: 'Landing Page',
    //   status: 'deployed',
    //   url: 'https://landing-page.vercel.app',
    //   lastDeployed: '2 hours ago',
    //   framework: 'Next.js',
    // },
    // {
    //   id: '2',
    //   name: 'E-commerce App',
    //   status: 'building',
    //   url: 'https://ecommerce-app.vercel.app',
    //   lastDeployed: '5 days ago',
    //   framework: 'React',
    // },
    // {
    //   id: '3',
    //   name: 'Portfolio',
    //   status: 'deployed',
    //   url: 'https://portfolio.vercel.app',
    //   lastDeployed: '1 month ago',
    //   framework: 'Astro',
    // },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/deploy">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Deployment
          </Button>
        </Link>
      </div>

      <div className=" grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Deployments</CardTitle>
            <CardDescription>Across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold">{totalDeployments}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Active Projects</CardTitle>
            <CardDescription>Currently deployed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold">{activeProjects}</p>
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                3 updated today
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Visits</CardTitle>
            <CardDescription>Across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold">24.5K</p>
              <span className="text-xs px-2 py-1 rounded-full bg-chart-2/10 text-chart-2">
                +8% from last week
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card className="cursor-pointerbg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your recently deployed projects</CardDescription>
            </div>
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="cursor-pointer grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>


    </>
  );
}