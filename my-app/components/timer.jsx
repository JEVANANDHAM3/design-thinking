import { Timer } from "@ark-ui/react/timer";
import { Pause, Play, RotateCcw } from "lucide-react";

export default function TimerBasic({ second, fn}) {
  // Ark UI Timer crashes if startMs is exactly 0 in countdown mode without a target.
  // Using Math.max guarantees it will always be strictly > 0 (1ms will just instantly complete resolving the UI accurately).
  const startMs = Math.max(second,1)*1000;

  console.log(`start ${startMs}`)

  return (
    <Timer.Root
      autoStart
      countdown
      startMs={startMs}
      onComplete={fn}
      className="inline-flex items-center justify-center"
    >
      <Timer.Area className="flex items-center gap-0.5 text-3xl font-black font-mono text-slate-800 tracking-tight">
        <Timer.Item type="hours" className="min-w-[2.5ch] text-center" />
        <Timer.Separator className="text-slate-400 font-light mx-0.5 opacity-60">:</Timer.Separator>
        <Timer.Item type="minutes" className="min-w-[2ch] text-center" />
        <Timer.Separator className="text-slate-400 font-light mx-0.5 opacity-60">:</Timer.Separator>
        <Timer.Item type="seconds" className="min-w-[2ch] text-center text-indigo-600" />
      </Timer.Area>
    </Timer.Root>
  );
}
