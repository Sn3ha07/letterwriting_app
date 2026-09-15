import { jsPDF } from 'jspdf';
import { GeneratedLetter, LetterFormatting, Recipient, SenderProfile } from '../types';

export function exportLetterToPDF(
  letter: GeneratedLetter,
  formatting: LetterFormatting,
  sender: SenderProfile,
  recipient: Recipient
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 54; // 0.75 inch margin
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Typography font selection
  if (formatting.fontFamily === 'serif') {
    doc.setFont('times', 'normal');
  } else if (formatting.fontFamily === 'mono') {
    doc.setFont('courier', 'normal');
  } else {
    doc.setFont('helvetica', 'normal');
  }

  const baseFontSize =
    formatting.fontSize === 'compact' ? 10 : formatting.fontSize === 'spacious' ? 12 : 11;
  const lineHeightMultiplier = 1.45;

  // 1. Header / Letterhead
  if (formatting.showSenderHeader && sender.name) {
    if (formatting.letterheadStyle === 'academic') {
      doc.setFontSize(14);
      doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'bold');
      doc.text(sender.organization.toUpperCase() || 'INSTITUTIONAL CORRESPONDENCE', pageWidth / 2, currentY, {
        align: 'center',
      });
      currentY += 16;

      doc.setFontSize(9);
      doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const sub = [sender.name, sender.title, sender.email, sender.phone].filter(Boolean).join(' • ');
      doc.text(sub, pageWidth / 2, currentY, { align: 'center' });
      currentY += 12;

      // Divider rule
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.75);
      doc.line(margin + 40, currentY, pageWidth - margin - 40, currentY);
      currentY += 24;
    } else if (formatting.letterheadStyle === 'classic') {
      doc.setFontSize(15);
      doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'bold');
      doc.setTextColor(20, 20, 20);
      doc.text(sender.name, margin, currentY);
      currentY += 15;

      doc.setFontSize(9);
      doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'normal');
      doc.setTextColor(90, 90, 90);
      if (sender.title) {
        doc.text(sender.title, margin, currentY);
        currentY += 12;
      }
      if (sender.organization) {
        doc.text(sender.organization, margin, currentY);
        currentY += 12;
      }
      const contactRow = [sender.email, sender.phone].filter(Boolean).join(' | ');
      if (contactRow) {
        doc.text(contactRow, margin, currentY);
        currentY += 12;
      }
      if (sender.address) {
        const addrLines = doc.splitTextToSize(sender.address, contentWidth * 0.6);
        doc.text(addrLines, margin, currentY);
        currentY += addrLines.length * 11;
      }

      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY + 4, pageWidth - margin, currentY + 4);
      currentY += 22;
    } else if (formatting.letterheadStyle === 'corporate') {
      doc.setFillColor(28, 43, 62);
      doc.rect(margin, currentY, 4, 38, 'F');

      doc.setFontSize(13);
      doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'bold');
      doc.setTextColor(28, 43, 62);
      doc.text(sender.name, margin + 12, currentY + 12);

      doc.setFontSize(9);
      doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const meta = [sender.title, sender.organization].filter(Boolean).join(' — ');
      doc.text(meta, margin + 12, currentY + 24);

      const contact = [sender.email, sender.phone].filter(Boolean).join(' • ');
      doc.text(contact, margin + 12, currentY + 35);
      currentY += 50;
    } else {
      // Modern Minimalist
      doc.setFontSize(12);
      doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(sender.name, margin, currentY);
      currentY += 14;

      doc.setFontSize(8.5);
      doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'normal');
      doc.setTextColor(110, 110, 110);
      const line = [sender.title, sender.organization, sender.email, sender.phone].filter(Boolean).join(' • ');
      doc.text(line, margin, currentY);
      currentY += 22;
    }
  }

  // 2. Date
  if (formatting.showDate && formatting.date) {
    doc.setFontSize(baseFontSize);
    doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(formatting.date, margin, currentY);
    currentY += baseFontSize * lineHeightMultiplier + 10;
  }

  // 3. Recipient Block
  if (formatting.showRecipientHeader && (recipient.name || recipient.organization)) {
    doc.setFontSize(baseFontSize);
    doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'normal');
    doc.setTextColor(30, 30, 30);

    if (recipient.name) {
      doc.text(recipient.name, margin, currentY);
      currentY += baseFontSize * lineHeightMultiplier;
    }
    if (recipient.title) {
      doc.text(recipient.title, margin, currentY);
      currentY += baseFontSize * lineHeightMultiplier;
    }
    if (recipient.organization) {
      doc.text(recipient.organization, margin, currentY);
      currentY += baseFontSize * lineHeightMultiplier;
    }
    if (recipient.address) {
      const addrLines = recipient.address.split('\n');
      for (const line of addrLines) {
        doc.text(line, margin, currentY);
        currentY += baseFontSize * lineHeightMultiplier;
      }
    }
    currentY += 12;
  }

  // 4. Subject Line
  if (letter.subject) {
    doc.setFontSize(baseFontSize);
    doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    const subj = `Subject: ${letter.subject}`;
    const subjectLines = doc.splitTextToSize(subj, contentWidth);
    doc.text(subjectLines, margin, currentY);
    currentY += subjectLines.length * (baseFontSize * lineHeightMultiplier) + 8;
  }

  // 5. Salutation
  if (letter.salutation) {
    doc.setFontSize(baseFontSize);
    doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(letter.salutation, margin, currentY);
    currentY += baseFontSize * lineHeightMultiplier + 8;
  }

  // Helper to add paragraph with auto-pagination check
  const addParagraph = (text: string) => {
    if (!text) return;
    doc.setFontSize(baseFontSize);
    doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'normal');
    doc.setTextColor(30, 30, 30);

    const lines = doc.splitTextToSize(text, contentWidth);
    const paragraphHeight = lines.length * (baseFontSize * lineHeightMultiplier);

    if (currentY + paragraphHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }

    doc.text(lines, margin, currentY);
    currentY += paragraphHeight + 10;
  };

  // 6. Opening
  addParagraph(letter.opening);

  // 7. Body Paragraphs
  if (letter.bodyParagraphs && Array.isArray(letter.bodyParagraphs)) {
    for (const para of letter.bodyParagraphs) {
      addParagraph(para);
    }
  }

  // 8. Call to Action / Closing
  addParagraph(letter.callToAction);

  // 9. Sign-off & Sender block
  const signOffBlockHeight = 70;
  if (currentY + signOffBlockHeight > pageHeight - margin) {
    doc.addPage();
    currentY = margin;
  }

  if (letter.signOff) {
    doc.setFontSize(baseFontSize);
    doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'normal');
    doc.text(letter.signOff, margin, currentY);
    currentY += baseFontSize * lineHeightMultiplier + 22; // space for physical signature
  }

  if (letter.senderBlock) {
    doc.setFontSize(baseFontSize);
    doc.setFont(formatting.fontFamily === 'serif' ? 'times' : 'helvetica', 'normal');
    const senderLines = letter.senderBlock.split('\n');
    for (const line of senderLines) {
      doc.text(line, margin, currentY);
      currentY += baseFontSize * lineHeightMultiplier;
    }
  }

  // Sanitize filename
  const cleanSubject = (letter.subject || 'formal_letter')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 35);
  const filename = `${cleanSubject || 'Formal_Letter'}.pdf`;

  doc.save(filename);
}

export function printLetterNative() {
  window.print();
}
