import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const Reports = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">View your time tracking reports and analytics.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No data yet</h3>
          <p className="text-sm text-muted-foreground">Start tracking time to see reports here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
