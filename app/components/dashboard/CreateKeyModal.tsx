"use client";

import { sileo } from "sileo";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreateKeyModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !newKey) inputRef.current?.focus();
  }, [open, newKey]);

  async function create() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Default" }),
      });
      const data = await res.json();
      setNewKey(data.key);
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      sileo.success({ title: "Copied to clipboard" });
    });
  }

  function downloadAs(type: "csv" | "json") {
    if (!newKey) return;
    const keyName = name || "Default";
    const filename = `contextforai-key-${keyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.${type}`;
    let content = "";

    if (type === "csv") {
      content = `Name,Key\n"${keyName.replace(/"/g, '""')}","${newKey}"`;
    } else {
      content = JSON.stringify({ name: keyName, key: newKey }, null, 2);
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function close() {
    setOpen(false);
    setName("");
    setNewKey(null);
    setCopied(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && newKey) return; // must use "Done" once a key exists
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          + Create key
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-surface border-border sm:max-w-md p-0 gap-0">
        <DialogHeader className="px-6 py-5 border-b border-border">
          <DialogTitle className="text-base font-semibold text-ink font-mono">
            {newKey ? "Save your API key" : "Create API key"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5">
          {!newKey ? (
            <div className="space-y-4">
              <div>
                <Label className="block text-xs font-mono text-faint mb-1.5">Key name</Label>
                <Input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && create()}
                  placeholder="e.g. Production"
                  maxLength={100}
                  className="font-mono bg-raised border-border text-ink placeholder:text-faint focus-visible:border-ember"
                />
              </div>
              <Button
                onClick={create}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Generating…" : <><span>Generate key</span><ArrowRight size={14} /></>}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-amber/10 border-amber/30">
                <AlertDescription className="text-xs text-amber font-mono">
                  Copy this key now. It will not be shown again.
                </AlertDescription>
              </Alert>
              <div className="bg-raised border border-border rounded-lg p-4">
                <p className="text-xs font-mono text-faint mb-2">API key</p>
                <p className="font-mono text-sm text-go break-all leading-relaxed">
                  {newKey}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => downloadAs("csv")}
                  className="flex-1" size="sm"
                >
                  <Download size={12} /> Save CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadAs("json")}
                  className="flex-1" size="sm"
                >
                  <Download size={12} /> Save JSON
                </Button>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={copy}
                  className="flex-1"
                >
                  {copied ? <span className="inline-flex items-center gap-1.5"><Check size={13} /> Copied</span> : "Copy key"}
                </Button>
                <Button
                  onClick={close}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
