import { PromptEditor } from "@/components/prompts/prompt-editor"

export default async function AppPromptEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <PromptEditor type="app" id={resolvedParams.id} />
}
