import { Clock, ListTodo, FolderKanban, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { title: "Today's Time", value: "0h 0m", icon: Clock, description: "No time tracked today" },
  { title: "Active Tasks", value: "0", icon: ListTodo, description: "No tasks in progress" },
  { title: "Projects", value: "0", icon: FolderKanban, description: "No projects yet" },
  { title: "This Week", value: "0h", icon: TrendingUp, description: "No time this week" },
];

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground">Here's an overview of your time tracking.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent activity. Start tracking time on a task to see it here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
