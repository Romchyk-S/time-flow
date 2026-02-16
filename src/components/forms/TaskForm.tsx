import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, isAfter, isBefore, isSameDay } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Project, Task, TaskStatus } from "@/types";

const taskFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "paused", "in_review", "completed", "on_hold", "blocked"]),
  project_id: z.string().min(1, "Project is required"),
  work_dates: z.array(z.string()).optional().nullable(),
  selectedDates: z.array(z.date()).optional().default([]),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  initialData?: Partial<Task> & { dateRange?: { from: Date; to?: Date } };
  projects: Project[];
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function TaskForm({
  initialData,
  projects,
  onSubmit,
  onCancel,
  isSubmitting,
}: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialData?.work_dates?.length ? {
      ...initialData,
      selectedDates: initialData.work_dates.map(date => new Date(date)),
    } : {
      name: "",
      description: "",
      status: "not_started",
      project_id: "",
      work_dates: [],
      selectedDates: [new Date()],
    },
  });

  const selectedDates = form.watch('selectedDates') || [];

  const handleDateSelect = (date: Date) => {
    const currentDates = form.getValues('selectedDates') || [];
    const dateString = date.toISOString().split('T')[0];
    
    const isDateSelected = currentDates.some(d => 
      d.toISOString().split('T')[0] === dateString
    );

    if (isDateSelected) {
      form.setValue('selectedDates', 
        currentDates.filter(d => d.toISOString().split('T')[0] !== dateString),
        { shouldDirty: true }
      );
    } else {
      form.setValue('selectedDates', 
        [...currentDates, date].sort((a, b) => a.getTime() - b.getTime()),
        { shouldDirty: true }
      );
    }
  };

  const handleSubmit = async (values: TaskFormValues) => {
    // Convert selected dates to work_dates format
    if (values.selectedDates?.length) {
      values.work_dates = values.selectedDates.map(date => 
        date.toISOString().split('T')[0]
      );
    }
    
    delete values.selectedDates; // Remove the selectedDates field before submission
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter task name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter task description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="selectedDates"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Work Dates</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value?.length && "text-muted-foreground"
                      )}
                    >
                      {field.value?.length ? (
                        <span>{field.value.length} date{field.value.length > 1 ? 's' : ''} selected</span>
                      ) : (
                        <span>Select work dates</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Calendar
                      mode="multiple"
                      selected={field.value || []}
                      onSelect={(dates) => {
                        if (dates) {
                          // Handle multiple date selection
                          const newDates = Array.isArray(dates) ? dates : [dates];
                          form.setValue('selectedDates', newDates, { shouldDirty: true });
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="rounded-md border"
                    />
                  </div>
                </PopoverContent>
              </Popover>
              {selectedDates.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedDates.map((date) => (
                    <div 
                      key={date.toISOString()}
                      className="text-xs bg-muted px-2 py-1 rounded-md"
                      onClick={() => handleDateSelect(date)}
                    >
                      {format(date, 'MMM dd, yyyy')}
                      <span className="ml-2 cursor-pointer">×</span>
                    </div>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
