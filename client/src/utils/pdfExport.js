import jsPDF from 'jspdf';

const TEMPLATES = {
  classic: {
    name: 'Classic',
    headerBg: [26, 58, 95], // navy
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

  // Header block
  doc.setFillColor(...template.headerBg);
  doc.rect(0, 0, pageW, 40, 'F');

  // Room4AI title in header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...template.headerText);
  doc.text('Room', margin, 18);
  const roomW = doc.getTextWidth('Room');
  // "4" in amber
  doc.setTextColor(245, 158, 11);
  doc.text('4', margin + roomW, 18);
  doc.setTextColor(...template.headerText);
  const fourW = doc.getTextWidth('4');
  doc.text('AI', margin + roomW + fourW, 18);

  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...template.headerText);
  doc.text('Lesson planning, elevated.', margin, 26);

  // Teacher info
  doc.setFontSize(9);
  const teacherName = classInfo?.teacher_name || user?.name || 'Teacher';
  const grade = lesson?.grade || classInfo?.grade || '';
  const subject = lesson?.subject || classInfo?.subject || '';
  const dateStr = classInfo?.class_date
    ? new Date(classInfo.class_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  doc.text(`${teacherName}  |  ${grade}  |  ${subject}  |  ${dateStr}`, pageW - margin, 26, { align: 'right' });

  // Accent line for modern template
  if (template === TEMPLATES.modern) {
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 40, pageW, 2, 'F');
  }

  let y = 52;

  // Lesson title
  doc.setFont(template.sectionFont, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...template.bodyColor);
  const title = lesson?.title || 'Lesson Plan';
  const titleLines = doc.splitTextToSize(title, contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7 + 4;

  // Divider
  doc.setDrawColor(...template.accentColor);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  const stepData = lesson?.step_data || {};

  // Section renderer
  function addSection(title, content) {
    if (!content) return;
    if (y > pageH - 30) {
      doc.addPage();
      y = 20;
    }
    doc.setFont(template.sectionFont, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...template.accentColor);
    doc.text(title, margin, y);
    y += 6;

    doc.setFont(template.bodyFont, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...template.bodyColor);
    const lines = doc.splitTextToSize(String(content), contentW);
    lines.forEach((line) => {
      if (y > pageH - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 5.5;
    });
    y += 4;
  }

  addSection('Learning Objectives', stepData.step1?.objectives);
  addSection('Estimated Duration', stepData.step1?.duration);

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
      wrapped.forEach((l) => {
        doc.text(l, margin, y);
        y += 5;
      });
    });
    y += 4;
  }

  addSection('Lesson Content', stepData.step3?.content);

  // Coverage
  if (stepData.step5?.coveragePercent !== undefined) {
    if (y > pageH - 30) { doc.addPage(); y = 20; }
    doc.setFont(template.sectionFont, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...template.accentColor);
    doc.text(`Standards Coverage: ${stepData.step5.coveragePercent}%`, margin, y);
    y += 6;

    // Bar
    const barW = contentW;
    const fillW = (stepData.step5.coveragePercent / 100) * barW;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(margin, y, barW, 5, 2, 2, 'F');
    if (fillW > 0) {
      doc.setFillColor(34, 197, 94);
      doc.roundedRect(margin, y, fillW, 5, 2, 2, 'F');
    }
    y += 12;
  }

  if (stepData.step6?.editedContent) {
    addSection('Finalized Lesson Plan', stepData.step6.editedContent);
  }

  // Footer watermark
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('Generated with Room4AI · room4ai.org', pageW / 2, pageH - 8, { align: 'center' });

  const fileName = `${(lesson?.title || 'lesson').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_room4ai.pdf`;
  doc.save(fileName);
}
