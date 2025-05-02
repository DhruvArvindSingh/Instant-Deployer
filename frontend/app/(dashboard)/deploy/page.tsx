'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Globe, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DeployPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  const handleDeploy = () => {
    if (!repoUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a repository URL',
      });
      return;
    }

    setIsDeploying(true);
    
    // Simulate deployment
    setTimeout(() => {
      setIsDeploying(false);
      toast({
        title: 'Deployment started',
        description: 'Your project is now being deployed',
      });
    }, 2000);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Deploy Your Project</h1>
      </div>

      <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Deploy from Git</CardTitle>
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
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Instant Deployment</CardTitle>
            <CardDescription>
              Deploy directly from Git with zero configuration and no vendor lock-in.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center mb-3">
              <Globe className="h-5 w-5 text-chart-2" />
            </div>
            <CardTitle className="text-lg">Global CDN</CardTitle>
            <CardDescription>
              Your projects are automatically distributed to our global edge network.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center mb-3">
              <Database className="h-5 w-5 text-chart-3" />
            </div>
            <CardTitle className="text-lg">Serverless Functions</CardTitle>
            <CardDescription>
              Deploy backend code without managing servers or infrastructure.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}