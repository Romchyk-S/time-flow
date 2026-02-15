import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your application preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="text-sm text-muted-foreground mb-3 block">Theme</Label>
          {mounted && (
            <RadioGroup
              value={theme ?? "system"}
              onValueChange={(v) => setTheme(v)}
              className="flex flex-wrap gap-4"
            >
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  htmlFor={`theme-${value}`}
                  className="flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <RadioGroupItem value={value} id={`theme-${value}`} />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{label}</span>
                </label>
              ))}
            </RadioGroup>
          )}
          {!mounted && (
            <div className="flex gap-4">
              {themeOptions.map(({ label }) => (
                <div key={label} className="h-12 w-24 rounded-lg border bg-muted animate-pulse" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
