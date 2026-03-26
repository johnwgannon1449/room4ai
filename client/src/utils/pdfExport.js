import jsPDF from 'jspdf';

const TEMPLATES = {
  classic: {
    name: 'Classic',
    headerBg: [26, 58, 95],
    headerText: [255, 255, 255],
    accentColor: [26, 58, 95],
    bodyFont: 'times',
    bodyColor: [30, 41, 59],
    sectionFont: 'times',
  },
  modern: {
    name: 'Modern',
    headerBg: [30, 58, 95],
    headerText: [255, 255, 255],
    accentColor: [245, 158, 11],
    bodyFont: 'helvetica',
    bodyColor: [30, 41, 59],
    sectionFont: 'helvetica',
    accentLine: true,
  },
  structured: {
    name: 'Structured',
    headerBg: [71, 85, 105],
    headerText: [255, 255, 255],
    accentColor: [71, 85, 105],
    bodyFont: 'helvetica',
    bodyColor: [30, 41, 59],
    sectionFont: 'helvetica',
  },
  chalkboard: {
    name: 'Chalkboard',
    headerBg: [30, 41, 59],
    headerText: [248, 250, 252],
    accentColor: [245, 158, 11],
    bodyFont: 'helvetica',
    bodyColor: [30, 41, 59],
    sectionFont: 'helvetica',
    darkBg: true,
  },
  bright: {
    name: 'Bright',
    headerBg: [239, 68, 68],
    headerText: [255, 255, 255],
    accentColor: [20, 184, 166],
    bodyFont: 'helvetica',
    bodyColor: [30, 41, 59],
    sectionFont: 'helvetica',
  },
  storybook: {
    name: 'Storybook',
    headerBg: [255, 251, 240],
    headerText: [30, 41, 59],
    accentColor: [217, 119, 6],
    bodyFont: 'times',
    bodyColor: [30, 41, 59],
    sectionFont: 'times',
    lightHeader: true,
  },
};

export function exportLessonToPDF(lesson, user, classInfo) {
  const template = TEMPLATES[user?.template_choice || 'classic'];
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;

  // Header — always green/amber brand bar regardless of template
  // Green badge area (left 52mm)
  doc.setFillColor(26, 122, 85);       // #1A7A55 brand green
  doc.rect(0, 0, 52, 44, 'F');
  // Darker green main band
  doc.setFillColor(26, 46, 37);        // #1A2E25
  doc.rect(52, 0, pageW - 52, 44, 'F');

  // "R" in white inside green badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('R', 6, 30);
  // "4" in amber inside green badge
  doc.setTextColor(245, 158, 11);
  doc.text('4', 26, 30);

  // "Room4AI" wordmark
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Room4', 58, 22);
  const room4W = doc.getTextWidth('Room4');
  doc.setTextColor(245, 158, 11);
  doc.text('AI', 58 + room4W, 22);

  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.6 }));
  doc.text('Lesson planning, elevated.', 58, 32);
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Teacher / grade / subject / date — right aligned
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.75 }));
  const teacherName = classInfo?.teacher_name || user?.name || 'Teacher';
  const grade = lesson?.grade || classInfo?.grade || '';
  const subject = lesson?.subject || classInfo?.subject || '';
  const dateStr = classInfo?.class_date
    ? new Date(classInfo.class_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  doc.text(`${teacherName}  ·  ${grade}  ·  ${subject}  ·  ${dateStr}`, pageW - margin, 32, { align: 'right' });
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Amber accent line below header
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 44, pageW, 2, 'F');

  let y = 56;

  const stepData = lesson?.step_data || {};

  // Section renderer — skips if content is blank/empty
  function addSection(sectionTitle, content) {
    const str = String(content || '').trim();
    if (!str) return;
    if (y > pageH - 30) { doc.addPage(); y = 20; }

    doc.setFont(template.sectionFont, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...template.accentColor);
    doc.text(sectionTitle, margin, y);
    y += 6;

    doc.setFont(template.bodyFont, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...template.bodyColor);
    const lines = doc.splitTextToSize(str, contentW);
    lines.forEach((line) => {
      if (y > pageH - 20) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += 5.5;
    });
    y += 4;
  }

  // Lesson title
  doc.setFont(template.sectionFont, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...template.bodyColor);
  const title = lesson?.title || 'Lesson Plan';
  const titleLines = doc.splitTextToSize(title, contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7 + 4;

  doc.setDrawColor(...template.accentColor);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // Warm-up (only if filled)
  const details = stepData.step6 || {};
  if (details.warmup_activity) {
    const warmupTitle = details.warmup_duration
      ? `Warm-Up Activity (${details.warmup_duration} min)`
      : 'Warm-Up Activity';
    addSection(warmupTitle, details.warmup_activity);
  }

  // Objectives — only if filled
  if (stepData.step1?.objectives?.trim()) {
    addSection('Learning Objectives', stepData.step1.objectives);
  }

  // Duration — only if filled
  if (stepData.step1?.duration) {
    addSection('Estimated Duration', `${stepData.step1.duration} minutes`);
  }

  // Standards
  if (stepData.step2?.selectedStandards?.length > 0) {
    if (y > pageH - 30) { doc.addPage(); y = 20; }
    doc.setFont(template.sectionFont, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...template.accentColor);
    doc.text('California State Standards', margin, y);
    y += 6;
    doc.setFont(template.bodyFont, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...template.bodyColor);
    stepData.step2.selectedStandards.forEach((s) => {
      if (y > pageH - 20) { doc.addPage(); y = 20; }
      const line = `• ${s.code}: ${s.description}`;
      const wrapped = doc.splitTextToSize(line, contentW);
      wrapped.forEach((l) => { doc.text(l, margin, y); y += 5; });
    });
    y += 4;
  }

  // Lesson content (edited > original)
  const lessonContent = stepData.step5?.editedContent || stepData.step3?.content;
  addSection('Lesson Content', lessonContent);

  // Coverage bar
  const coverage = stepData.step5?.coveragePercent ?? stepData.step4?.analysis?.coveragePercent;
  if (coverage !== undefined && coverage !== null) {
    if (y > pageH - 30) { doc.addPage(); y = 20; }
    doc.setFont(template.sectionFont, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...template.accentColor);
    doc.text(`Standards Coverage: ${coverage}%`, margin, y);
    y += 6;
    const barW = contentW;
    const fillW = (coverage / 100) * barW;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(margin, y, barW, 5, 2, 2, 'F');
    if (fillW > 0) {
      doc.setFillColor(34, 197, 94);
      doc.roundedRect(margin, y, fillW, 5, 2, 2, 'F');
    }
    y += 12;
  }

  // Lesson details fields — only rendered if filled
  addSection('Exit Ticket / Closing Routine', details.exit_ticket);
  addSection('Differentiation / Accommodations', details.differentiation_notes);
  addSection('Materials & Supplies', details.materials);
  addSection('Homework / Assignment', details.homework_reminder);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('Generated with Room4AI · room4ai.org', pageW / 2, pageH - 8, { align: 'center' });

  const fileName = `${(lesson?.title || 'lesson').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_room4ai.pdf`;
  doc.save(fileName);
}

// ─── TPE Analysis PDF Export ──────────────────────────────────────────────────
export function exportTpeToPDF({ result, lessonTitle, grade, subject, user }) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;

  // Header bar — same brand as lesson PDF
  doc.setFillColor(26, 122, 85);
  doc.rect(0, 0, 52, 44, 'F');
  doc.setFillColor(26, 46, 37);
  doc.rect(52, 0, pageW - 52, 44, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('R', 6, 30);
  doc.setTextColor(245, 158, 11);
  doc.text('4', 26, 30);

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Room4', 58, 22);
  const rw = doc.getTextWidth('Room4');
  doc.setTextColor(245, 158, 11);
  doc.text('AI', 58 + rw, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.6 }));
  doc.text('TPE Analysis Report', 58, 32);
  doc.setGState(new doc.GState({ opacity: 1 }));

  const teacherName = user?.name || 'Teacher';
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.75 }));
  doc.text(`${teacherName}  ·  ${grade}  ·  ${subject}  ·  ${dateStr}`, pageW - margin, 32, { align: 'right' });
  doc.setGState(new doc.GState({ opacity: 1 }));

  doc.setFillColor(245, 158, 11);
  doc.rect(0, 44, pageW, 2, 'F');

  let y = 56;

  // Lesson title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(26, 46, 37);
  const titleLines = doc.splitTextToSize(lessonTitle || 'TPE Analysis', contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7 + 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 125, 110);
  doc.text(`${grade} · ${subject} · Generated by Room4AI`, margin, y);
  y += 8;

  // Summary bar
  const { summary, tpe_results } = result;
  const pct = summary.percentage;
  const barFill = pct >= 70 ? [26, 122, 85] : pct >= 40 ? [245, 158, 11] : [239, 68, 68];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 46, 37);
  doc.text(`Overall TPE Coverage: ${pct}%  (${summary.addressed} of ${summary.total_elements} elements addressed)`, margin, y);
  y += 5;
  doc.setFillColor(212, 232, 223);
  doc.roundedRect(margin, y, contentW, 5, 2, 2, 'F');
  const fillW = (pct / 100) * contentW;
  if (fillW > 0) {
    doc.setFillColor(...barFill);
    doc.roundedRect(margin, y, fillW, 5, 2, 2, 'F');
  }
  y += 12;

  const COVERAGE_LABELS = { strong: 'Strong Evidence', partial: 'Partial Evidence', not_evident: 'Not Evident' };
  const COVERAGE_COLORS = {
    strong: [26, 122, 85],
    partial: [217, 119, 6],
    not_evident: [156, 163, 175],
  };

  // TPE sections
  for (const tpeResult of tpe_results) {
    if (y > pageH - 40) { doc.addPage(); y = 20; }

    // Section header
    const covLabel = COVERAGE_LABELS[tpeResult.overall_coverage] || 'Not Evident';
    const covColor = COVERAGE_COLORS[tpeResult.overall_coverage] || COVERAGE_COLORS.not_evident;

    doc.setFillColor(232, 245, 239);
    doc.roundedRect(margin, y - 2, contentW, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(26, 46, 37);
    doc.text(`TPE ${tpeResult.tpe_id}: ${tpeResult.tpe_title}`, margin + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...covColor);
    doc.text(`— ${covLabel}`, margin + 3 + doc.getTextWidth(`TPE ${tpeResult.tpe_id}: ${tpeResult.tpe_title}`) + 2, y + 5);
    y += 14;

    for (const el of tpeResult.elements) {
      if (y > pageH - 30) { doc.addPage(); y = 20; }
      const elColor = COVERAGE_COLORS[el.coverage] || COVERAGE_COLORS.not_evident;

      // Element ID badge
      doc.setFillColor(...elColor);
      doc.roundedRect(margin, y - 1, 12, 6, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(el.element_id, margin + 1, y + 3.5);

      // Coverage label
      const elLabel = COVERAGE_LABELS[el.coverage] || 'Not Evident';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...elColor);
      doc.text(elLabel, margin + 14, y + 3.5);
      y += 8;

      // Evidence quotes
      if (el.evidence && el.evidence.length > 0) {
        for (const quote of el.evidence) {
          if (y > pageH - 20) { doc.addPage(); y = 20; }
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(90, 125, 110);
          const qLines = doc.splitTextToSize(`"${quote}"`, contentW - 8);
          doc.text(qLines, margin + 6, y);
          y += qLines.length * 4.5 + 2;
        }
      }

      // Strength or suggestion
      const note = el.strength || el.suggestion;
      if (note) {
        if (y > pageH - 20) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(el.strength ? 26 : 180, el.strength ? 122 : 120, el.strength ? 85 : 6);
        const nLines = doc.splitTextToSize((el.strength ? '✓ ' : '→ ') + note, contentW - 6);
        doc.text(nLines, margin + 4, y);
        y += nLines.length * 4.5 + 2;
      }
      y += 3;
    }
    y += 4;
  }

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('Generated by Room4AI · room4ai.org', pageW / 2, pageH - 8, { align: 'center' });

  const fileName = `tpe_analysis_${(lessonTitle || 'report').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_room4ai.pdf`;
  doc.save(fileName);
}
