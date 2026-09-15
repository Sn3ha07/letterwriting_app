import { GeneratedLetter, LetterFormatting, Recipient, SenderProfile } from '../types';

export function assembleFullPlainText(
  letter: GeneratedLetter,
  formatting: LetterFormatting,
  sender: SenderProfile,
  recipient: Recipient
): string {
  const parts: string[] = [];

  // Sender header
  if (formatting.showSenderHeader && sender.name) {
    const senderHeader = [
      sender.name,
      sender.title,
      sender.organization,
      sender.email,
      sender.phone,
      sender.address,
    ]
      .filter(Boolean)
      .join('\n');
    if (senderHeader) parts.push(senderHeader);
  }

  // Date
  if (formatting.showDate && formatting.date) {
    parts.push(formatting.date);
  }

  // Recipient block
  if (formatting.showRecipientHeader && (recipient.name || recipient.organization)) {
    const recipientHeader = [
      recipient.name,
      recipient.title,
      recipient.organization,
      recipient.address,
    ]
      .filter(Boolean)
      .join('\n');
    if (recipientHeader) parts.push(recipientHeader);
  }

  // Subject line
  if (letter.subject) {
    parts.push(`SUBJECT: ${letter.subject}`);
  }

  // Salutation
  if (letter.salutation) {
    parts.push(letter.salutation);
  }

  // Opening
  if (letter.opening) {
    parts.push(letter.opening);
  }

  // Body paragraphs
  if (letter.bodyParagraphs && Array.isArray(letter.bodyParagraphs)) {
    for (const para of letter.bodyParagraphs) {
      if (para?.trim()) parts.push(para.trim());
    }
  }

  // Call to action
  if (letter.callToAction) {
    parts.push(letter.callToAction);
  }

  // Sign off & sender block
  const closingParts: string[] = [];
  if (letter.signOff) closingParts.push(letter.signOff);
  closingParts.push('\n'); // blank for signature
  if (letter.senderBlock) {
    closingParts.push(letter.senderBlock);
  } else if (sender.name) {
    closingParts.push([sender.name, sender.title, sender.organization].filter(Boolean).join('\n'));
  }

  if (closingParts.length > 0) {
    parts.push(closingParts.join('\n'));
  }

  return parts.join('\n\n');
}

export function downloadLetterTextFile(
  letter: GeneratedLetter,
  formatting: LetterFormatting,
  sender: SenderProfile,
  recipient: Recipient
) {
  const fullText = assembleFullPlainText(letter, formatting, sender, recipient);
  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const cleanSubject = (letter.subject || 'formal_letter')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 35);
  a.href = url;
  a.download = `${cleanSubject || 'Formal_Letter'}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyLetterToClipboard(
  letter: GeneratedLetter,
  formatting: LetterFormatting,
  sender: SenderProfile,
  recipient: Recipient
): Promise<boolean> {
  const fullText = assembleFullPlainText(letter, formatting, sender, recipient);
  try {
    await navigator.clipboard.writeText(fullText);
    return true;
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = fullText;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}

export function createMailtoLink(letter: GeneratedLetter, recipientEmail: string): string {
  const subject = encodeURIComponent(letter.subject || 'Formal Correspondence');
  const body = encodeURIComponent(
    `${letter.salutation}\n\n${letter.opening}\n\n${(letter.bodyParagraphs || []).join(
      '\n\n'
    )}\n\n${letter.callToAction}\n\n${letter.signOff}\n${letter.senderBlock || ''}`
  );
  return `mailto:${recipientEmail || ''}?subject=${subject}&body=${body}`;
}
