import { PromptEditor } from "@/components/prompts/prompt-editor"

export default async function MyPromptEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <PromptEditor type="personal" id={resolvedParams.id} />
}
