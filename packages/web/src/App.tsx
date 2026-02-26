import { Button } from "@/components/ui/button";

export function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">stream-note</h1>
        <p className="text-muted-foreground text-lg">每日笔记 · GTD 任务 · 日程管理</p>
      </div>
      <Button>开始使用</Button>
    </div>
  );
}
