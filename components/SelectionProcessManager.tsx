"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, X, Save, Mail } from "lucide-react";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ROUND_TYPES = ['screening', 'technical', 'interview', 'assessment', 'final'];
const MAX_ROUNDS = 3;

interface Round {
  number: number;
  type: string;
  title: string;
  description: string;
  duration_minutes: number;
  is_online: boolean;
  location_or_link: string;
}

interface Props {
  jobId: string;
  processId?: string;           // if already saved
  existingRounds?: Round[];
  existingInstructions?: string;
  onSaved?: (processId: string) => void;
}

export default function SelectionProcessManager({
  jobId,
  processId: initialProcessId,
  existingRounds,
  existingInstructions = '',
  onSaved,
}: Props) {
  const dispatch = useAppDispatch();
  const [rounds, setRounds] = useState<Round[]>(
    existingRounds ?? [
      { number: 1, type: 'screening', title: '', description: '', duration_minutes: 60, is_online: false, location_or_link: '' },
    ]
  );
  const [instructions, setInstructions] = useState(existingInstructions);
  const [processId, setProcessId] = useState(initialProcessId ?? '');
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState(false);

  function updateRound(index: number, key: keyof Round, value: any) {
    setRounds(rounds.map((r, i) => i === index ? { ...r, [key]: value } : r));
  }

  function addRound() {
    if (rounds.length >= MAX_ROUNDS) return;
    setRounds([...rounds, {
      number: rounds.length + 1,
      type: 'technical',
      title: '',
      description: '',
      duration_minutes: 60,
      is_online: false,
      location_or_link: '',
    }]);
  }

  function removeRound(index: number) {
    setRounds(
      rounds
        .filter((_, i) => i !== index)
        .map((r, i) => ({ ...r, number: i + 1 }))
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const method = processId ? 'PUT' : 'POST';
      const url = processId
        ? `${API_BASE}/selection/${processId}`
        : `${API_BASE}/selection/`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ job_id: jobId, rounds, instructions }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setProcessId(data.id);
      onSaved?.(data.id);
      dispatch(showAlert({
        title: "Success",
        message: "Selection process saved!",
        type: "success"
      }));
    } catch {
      dispatch(showAlert({
        title: "Error",
        message: "Failed to save selection process",
        type: "error"
      }));
    } finally {
      setSaving(false);
    }
  }

  async function handleNotify() {
    if (!processId) {
      dispatch(showAlert({
        title: "Action Required",
        message: "Save the selection process first",
        type: "error"
      }));
      return;
    }
    setNotifying(true);
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${API_BASE}/selection/${processId}/notify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      dispatch(showAlert({
        title: "Success",
        message: "Shortlisted applicants notified!",
        type: "success"
      }));
    } catch {
      dispatch(showAlert({
        title: "Error",
        message: "Failed to notify applicants",
        type: "error"
      }));
    } finally {
      setNotifying(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Selection Rounds</h3>
        <Badge variant="outline">{rounds.length} / {MAX_ROUNDS} rounds</Badge>
      </div>

      {/* Rounds */}
      {rounds.map((round, i) => (
        <Card key={i} className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-purple-700">Round {round.number}</span>
              {rounds.length > 1 && (
                <button
                  onClick={() => removeRound(i)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select value={round.type} onValueChange={(v) => updateRound(i, 'type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROUND_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Round title (e.g. HR Screening)"
                value={round.title}
                onChange={(e) => updateRound(i, 'title', e.target.value)}
              />
            </div>

            <Textarea
              placeholder="What should the candidate expect?"
              value={round.description}
              onChange={(e) => updateRound(i, 'description', e.target.value)}
              rows={2}
            />

            <div className="flex gap-3 items-center flex-wrap">
              <Input
                type="number"
                placeholder="Duration (min)"
                value={round.duration_minutes}
                onChange={(e) => updateRound(i, 'duration_minutes', +e.target.value)}
                className="w-36"
              />
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={round.is_online}
                  onChange={(e) => updateRound(i, 'is_online', e.target.checked)}
                  className="accent-purple-600"
                />
                Online
              </label>
              <Input
                placeholder={round.is_online ? 'Meeting link' : 'Location'}
                value={round.location_or_link}
                onChange={(e) => updateRound(i, 'location_or_link', e.target.value)}
                className="flex-1 min-w-0"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add round button */}
      {rounds.length < MAX_ROUNDS && (
        <Button variant="outline" onClick={addRound} className="w-full border-dashed">
          <Plus className="h-4 w-4 mr-2" />
          Add Round ({MAX_ROUNDS - rounds.length} remaining)
        </Button>
      )}

      {/* General instructions */}
      <Textarea
        placeholder="General instructions for applicants (optional)..."
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={3}
      />

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Process'}
        </Button>
        <Button
          onClick={handleNotify}
          disabled={notifying || !processId}
          variant="outline"
        >
          <Mail className="h-4 w-4 mr-2" />
          {notifying ? 'Notifying...' : 'Notify Shortlisted Applicants'}
        </Button>
      </div>
    </div>
  );
}