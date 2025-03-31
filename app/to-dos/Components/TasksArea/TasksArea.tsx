import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ComboboxDemo } from "./PriorityCombobox";
import { TasksOptions } from "./TasksOptions";
import { useTasksStore } from "@/app/stores/useTasksStore";
import { Task } from "@/app/data/Tasks";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import CircularProgress from "@mui/material/CircularProgress";
import { FaUmbrellaBeach } from "react-icons/fa6";
import { useUserStore } from "@/app/stores/useUserStore";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper<Task>();

const columns = [
  columnHelper.accessor("status", {
    header: "",
    cell: (info) => {
      const task = info.row.original;
      const { updateTaskFunction } = useTasksStore();
      const [loading, setLoading] = useState(false);

      async function handleCheckboxChange() {
        setLoading(true);
        const updateTaskObject: Task = {
          ...task,
          status: task.status === "completed" ? "in_progress" : "completed",
        };

        const result = await updateTaskFunction(updateTaskObject);

        if (!result.success) {
          toast({ title: "error" });
        }

        setLoading(false);
      }

      return (
        <div className="flex items-center">
          {loading ? (
            <CircularProgress size={"18px"} color="inherit" />
          ) : (
            <Checkbox
              id={`task-${task.id}`}
              className="w-5 h-5"
              checked={task.status === "completed"}
              onCheckedChange={handleCheckboxChange}
            />
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor("name", {
    header: "",
    cell: (info) => {
      const task = info.row.original;
      const { setTaskSelected, setIsTaskDialogOpened } = useTasksStore();
      const lowerOpacity = task.status === "completed" && "opacity-65";

      return (
        <div className={`flex flex-col gap-1 ${lowerOpacity}`}>
          <label
            onClick={() => {
              setTaskSelected(task);
              setIsTaskDialogOpened(true);
            }}
            htmlFor="task"
            className="text-lg font-semibold cursor-pointer hover:text-primary"
          >
            {task.name}
          </label>
          <Badge variant="outline" className="text-[10px] opacity-55">
            {task.status}
          </Badge>
        </div>
      );
    },
  }),
  columnHelper.accessor("priority", {
    header: "",
    cell: (info) => {
      const task = info.row.original;
      return <ComboboxDemo singleTask={task} />;
    },
  }),
  columnHelper.accessor("id", {
    header: "",
    cell: (info) => {
      const task = info.row.original;
      return <TasksOptions singleTask={task} />;
    },
  }),
];

export function TasksArea() {
  const { tasks, fetchTasks } = useTasksStore();
  const { user } = useUserStore();

  useEffect(() => {
    getTasksData(user);
  }, [user]);

  async function getTasksData(user: { id: string; email: string } | null) {
    await fetchTasks(user);
  }

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <ScrollArea className="h-60 flex flex-col gap-4">
      {tasks.length === 0 ? (
        <div className="h-full w-full flex items-center justify-center flex-col gap-6">
          <FaUmbrellaBeach className="text-[79px] text-slate-500 opacity-85" />
          <span className="text-sm text-slate-400 opacity-85 text-center">
            It looks like there are no tasks available. <br /> Click above to
            add a new task
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="border flex items-center p-3 rounded-md w-full justify-between"
            >
              <div className="flex items-center gap-4">
                {row.getVisibleCells().slice(0, 2).map((cell) => (
                  <div key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {row.getVisibleCells().slice(2).map((cell) => (
                  <div key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
