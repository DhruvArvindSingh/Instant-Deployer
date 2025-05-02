'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { CodeBlock } from "@/components/ui/code-block";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ChangeEvent } from 'react';

import { Textarea } from '@/components/ui/textarea';
export default function DeployPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isStaticSite, setIsStaticSite] = useState(true);
  const [exposePorts, setExposePorts] = useState('');
  const [customSubdomain, setCustomSubdomain] = useState('');
  const [buildScript, setBuildScript] = useState('npm install\nnpm run build');
  const [runScript, setRunScript] = useState('npm run start');
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  let token = '';
  useEffect(() => {
    return () => {
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    console.log("Checking authentication");
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    token = cookies.token;

    try {
      const res = await axios.post('http://localhost:9000/verify', {}, {
        headers: {
          'token': token,
        }
      });

      if (res.status === 401) {
        router.push('/login');
      }

    } catch (error) {
      console.error("Authentication error:", error);
      router.push('/login');
    }
  }


  const handleDeploy = async () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    token = cookies.token;
    console.log("handleDeploy called", repoUrl, isStaticSite, exposePorts, customSubdomain, buildScript, runScript)
    if (!repoUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a repository URL',
      });
      return;
    }
    if (!repoUrl.startsWith("https://github.com/")) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid GitHub repository URL',
      });
      return;
    }
    if (isStaticSite == false && exposePorts == '') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid port',
      });
      return;
    }
    if (!/^\d+(,\d+)*$/.test(exposePorts) && exposePorts != '') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter valid port numbers separated by commas',
      });
      return;
    }
    const buildCommands = buildScript.split('\n').map(line => line.trim());
    const runCommands = runScript.split('\n').map(line => line.trim());

    const ports = exposePorts.split(',').map(port => parseInt(port.trim()));
    setIsDeploying(true);
    // Simulate deployment
    const res = await axios.post('http://localhost:9000/deploy', {
      repoUrl: repoUrl,
      isStaticSite: isStaticSite,
      exposePorts: ports,
      customSubdomain: customSubdomain,
      buildCommands: buildCommands,
      runCommands: runCommands,
    }, {
      headers: {
        'token': token,
      }
    });
    if (res.status === 200) {
      toast({
        title: 'Deployment started',
        description: 'Your project is now being deployed',
      });
      console.log("Deployment started", res.data);
    }
    else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to deploy project',
      });
      setIsDeploying(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Deploy Your Project</h1>
      </div>

      <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Deploy from Github</CardTitle>
          <CardDescription>
            Enter your GitHub repository URL to deploy your project instantly with
            zero configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="relative">
              <Input
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="pr-32 bg-background/50"
              />
              <Button
                onClick={handleDeploy}
                disabled={isDeploying || !repoUrl}
                className="absolute right-1 top-1 gap-2"
              >
                {isDeploying ? 'Deploying...' : 'Deploy Now'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm ">
          <CardHeader>
            <div className="w-50 h-30 bg-chart-1/10 rounded-lg flex items-center justify-center mb-3">
              <RadioGroup defaultValue="instant" className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instant" id="instant" onClick={() => setIsStaticSite(true)} />
                  <Label htmlFor="instant">Static Site</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scheduled" id="scheduled" onClick={() => setIsStaticSite(false)} />
                  <Label htmlFor="scheduled">Dynamic Site</Label>
                </div>
              </RadioGroup>
            </div>
            <CardTitle className="text-lg">Nodejs backend</CardTitle>
            <CardDescription>
              If your website have a backend, you can deploy it here using Dynamic Site option.
              Dynamic site will automatically deploy your backend code for 3 hours.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="w-50 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center mb-3">
              <Input type="string" placeholder="Expose Ports" value={exposePorts} onChange={(e) => {
                if (isStaticSite == false) {
                  console.log("Expose ports", e.target.value);
                  setExposePorts(e.target.value);
                } else {
                  console.log("Static site, not exposing ports");
                  setExposePorts('');
                }
              }} />
            </div>
            <CardTitle className="text-lg">Expose Ports</CardTitle>
            <CardDescription>
              If you want to expose ports, you can do it here. Example: 3000, 3001, 3002
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="w-50 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center mb-3">
              <Input type="string" placeholder="Custom Subdomain" value={customSubdomain} onChange={(e) => setCustomSubdomain(e.target.value)} />
            </div>
            <CardTitle className="text-lg">Custom Subdomain</CardTitle>
            <CardDescription>
              If you want to use a custom subdomain, you can add it here.
            </CardDescription>
          </CardHeader>
        </Card>
      </div >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>

            <CardTitle className="text-lg">Build Script</CardTitle>
            <div className="max-w-3xl mx-auto w-full">
              <Textarea
                value={buildScript}
                onChange={(e) => setBuildScript(e.target.value)}
              />
            </div>
            <CardDescription>
              This script will be executed to build your project.The project already have node and npm installed in root directory.
            </CardDescription>

          </CardHeader>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="max-w-3xl mx-auto w-full">
              <CardTitle className="text-lg">Run Script</CardTitle>
              <Textarea
                value={runScript}
                onChange={(e) => setRunScript(e.target.value)}
              />
            </div>
            <CardDescription>
              This script will be executed to run your project.The project already have node and npm installed in root directory.
            </CardDescription>
          </CardHeader>

        </Card>
      </div >
    </>
  );

} 