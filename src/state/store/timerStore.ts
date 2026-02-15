import { create } from "zustand";

export interface RunningTimerState {
  entryId: string | null;
  taskId: string | null;
  taskName: string | null;
  projectId: string | null;
  projectName: string | null;
  projectColor: string | null;
  startTime: string | null;
}

interface TimerStore extends RunningTimerState {
  setRunning: (state: RunningTimerState) => void;
  clearRunning: () => void;
}

const initialState: RunningTimerState = {
  entryId: null,
  taskId: null,
  taskName: null,
  projectId: null,
  projectName: null,
  projectColor: null,
  startTime: null,
};

export const useTimerStore = create<TimerStore>((set) => ({
  ...initialState,
  setRunning: (state) => set(state),
  clearRunning: () => set(initialState),
}));
