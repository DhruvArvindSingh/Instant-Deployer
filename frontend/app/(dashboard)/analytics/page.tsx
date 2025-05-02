'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AnalyticsPage() {
  // Mock data for charts
  const visitData = [
    { date: 'Mon', value: 1200 },
    { date: 'Tue', value: 1900 },
    { date: 'Wed', value: 2400 },
    { date: 'Thu', value: 1800 },
    { date: 'Fri', value: 2800 },
    { date: 'Sat', value: 2200 },
    { date: 'Sun', value: 2000 },
  ];

  const deploymentData = [
    { date: 'Jan', successful: 45, failed: 4 },
    { date: 'Feb', successful: 52, failed: 6 },
    { date: 'Mar', successful: 48, failed: 2 },
    { date: 'Apr', successful: 61, failed: 7 },
    { date: 'May', successful: 55, failed: 5 },
    { date: 'Jun', successful: 67, failed: 3 },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Total Visits</CardTitle>
                  <CardDescription>Last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold">24.5K</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      +12% from last week
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Deployments</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold">58</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-chart-2/10 text-chart-2">
                      +8% from last month
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Uptime</CardTitle>
                  <CardDescription>All projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold">99.9%</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                      Excellent
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Website Traffic</CardTitle>
                <CardDescription>Daily visits across all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={visitData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          color: 'hsl(var(--foreground))'
                        }} 
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="deployments">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Deployment Statistics</CardTitle>
                <CardDescription>Monthly deployment success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deploymentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          color: 'hsl(var(--foreground))'
                        }} 
                      />
                      <Bar dataKey="successful" fill="hsl(var(--chart-2))" />
                      <Bar dataKey="failed" fill="hsl(var(--destructive))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Server response times and page load metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-60">
                  <p className="text-muted-foreground">
                    Performance data will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}