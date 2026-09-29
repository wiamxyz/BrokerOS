import { chatsFor, prepareReply, saveChat } from './assistant-chat';
import { composerLength, composerTags, composerText, normalizeComposer, tagsOnlyComposer, type ComposerPart } from './inline-composer';
import { sampleTagReply } from './value-tags';
import type { CRMState, ComposerSession } from './model';

export function currentSession(data: CRMState): ComposerSession {
  const parts = normalizeComposer(data.composerSession?.parts);
  return { id: data.composerSession?.id ?? null, parts, caret: Math.min(Math.max(0, data.composerSession?.caret ?? composerLength(parts)), composerLength(parts)) };
}

/** Save drafts in place: visiting history must never reorder conversations. */
export function keepDraft(data: CRMState, newId: string): CRMState {
  const session = currentSession(data);
  const existing = chatsFor(data).find(chat => chat.id === session.id);
  if (!existing && !composerText(session.parts).trim()) return data;
  const chat = { ...existing, id: existing?.id ?? newId, title: existing?.title ?? composerText(session.parts).trim().slice(0, 64), messages: existing?.messages ?? [], composerParts: session.parts };
  return { ...data, chats: existing ? chatsFor(data).map(item => item.id === chat.id ? chat : item) : [chat, ...chatsFor(data)] };
}

export function switchConversation(data: CRMState, id: string | null, draftId: string): CRMState {
  const session = currentSession(data);
  if (id !== null && id === session.id) return data;
  const selected = id ? chatsFor(data).find(chat => chat.id === id) : undefined;
  if (id && !selected) return data;
  const parts = normalizeComposer(selected?.composerParts);
  return { ...keepDraft(data, draftId), composerSession: { id, parts, caret: composerLength(parts) } };
}

export function submitConversation(data: CRMState, chatId: string, userId: string, replyId: string, override?: string): CRMState {
  const session = currentSession(data);
  const parts: ComposerPart[] = override === undefined ? session.parts : [{ type: 'text', text: override }];
  if (!composerText(parts, false).trim()) return data;
  const tags = composerTags(parts);
  const text = composerText(parts).trim();
  const current = chatsFor(data).find(chat => chat.id === chatId);
  // Tagged snapshots are context only. Never infer a CRM action from arbitrary values.
  const reply = tags.length ? { id: replyId, role: 'assistant' as const, text: sampleTagReply(tags) } : prepareReply(text, data, replyId);
  const remaining = tagsOnlyComposer(tags);
  return { ...saveChat(data, { ...current, id: chatId, title: current?.title ?? text.slice(0, 64), messages: [...(current?.messages ?? []), { id: userId, role: 'user', text }, reply], composerParts: remaining }), composerSession: { id: chatId, parts: remaining, caret: composerLength(remaining) } };
}
