import PlaygroundClient from "@/app/components/PlaygroundClient";

export const metadata = {
  title: "Playground - contextforai",
};

export default function DashboardPlaygroundPage() {
  return (
    <div className="w-full">
      <div className="px-4 md:px-8 pt-4 md:pt-8 pb-2">
        <p className="text-xs font-mono text-faint mb-1">Playground</p>
        <h1 className="text-2xl font-semibold text-ink">API Playground</h1>
        <p className="text-sm text-muted mt-0.5">Test endpoints with your API key and a live URL.</p>
      </div>
      <PlaygroundClient embedded />
    </div>
  );
}
