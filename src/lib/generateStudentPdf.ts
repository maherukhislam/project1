/**
 * Student PDF Report Generator
 *
 * Generates a rich, branded PDF containing:
 *  - StudyGlobal logo header
 *  - Student photo (page 1, top)
 *  - Full student details
 *  - Applications summary
 *  - Documents inventory
 *  - Each document physically embedded as pages (images or merged PDFs)
 *
 * Uses pdf-lib which runs entirely in the browser — works in dev & production.
 */

import {
  PDFDocument,
  PDFPage,
  rgb,
  StandardFonts,
  PDFFont,
  type RGB,
} from 'pdf-lib';

// ── Brand colours ─────────────────────────────────────────────────────────────
const TEAL      = rgb(0.078, 0.718, 0.647);   // #14b7a5
const TEAL_DARK = rgb(0.043, 0.537, 0.502);   // #0d8980
const SLATE     = rgb(0.22,  0.27,  0.35);    // #384457
const SLATE_LT  = rgb(0.47,  0.54,  0.63);    // #788aa1
const WHITE     = rgb(1, 1, 1);
const BLACK     = rgb(0, 0, 0);
const ACCENT    = rgb(0.95, 0.96, 0.98);      // page-section bg

// ── Page constants ────────────────────────────────────────────────────────────
const W = 612;   // Letter width  (pts)
const H = 792;   // Letter height (pts)
const MARGIN = 48;
const COL_MID = W / 2 + 6;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Fonts {
  regular: PDFFont;
  bold:    PDFFont;
  italic:  PDFFont;
}

export interface StudentDoc {
  id: string;
  document_type: string;
  file_name: string;
  file_url?: string;
  file_path?: string;
  status: string;
  created_at?: string;
}

export interface Application {
  id: string;
  status: string;
  intake?: string;
  created_at?: string;
  programs?: {
    name?: string;
    universities?: { name?: string; country?: string };
  };
}

export interface StudentProfile {
  name?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  role?: string;
  profile_picture_url?: string;
  profile_completion?: number;
  preferred_country?: string;
  preferred_subject?: string;
  study_level?: string;
  intake?: string;
  preferred_intake_name?: string;
  preferred_intake_year?: string | number;
  budget_min?: number;
  budget_max?: number;
  created_at?: string;
  [key: string]: unknown;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function val(v: unknown, fallback = '—'): string {
  if (v === null || v === undefined || String(v).trim() === '') return fallback;
  return String(v);
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatBudget(min?: number, max?: number): string {
  if (!min && !max) return '—';
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return min ? `from ${fmt(min)}` : `up to ${fmt(max!)}`;
}

function formatIntake(student: StudentProfile): string {
  if (student.intake) return student.intake;
  const parts = [student.preferred_intake_name, student.preferred_intake_year].filter(Boolean);
  return parts.length ? parts.join(' ') : '—';
}

function labelStatus(status: string): string {
  const map: Record<string, string> = {
    verified: 'Verified',
    pending: 'Pending review',
    rejected: 'Rejected',
    accepted: 'Accepted',
    under_review: 'Under review',
    submitted: 'Submitted',
    visa_processing: 'Visa processing',
    draft: 'Draft',
    new_lead: 'New lead',
  };
  return map[status] ?? status;
}

// ── File fetching ─────────────────────────────────────────────────────────────

/** Fetch a file for embedding. Tries admin proxy first, then direct URL. */
async function fetchFileBytes(url: string, token: string): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  if (!url || url.startsWith('data:')) return null;

  // Try proxy (works in production on Cloudflare Pages)
  try {
    const proxyRes = await fetch(
      `/api/admin/file-proxy?url=${encodeURIComponent(url)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (proxyRes.ok) {
      const ct = proxyRes.headers.get('content-type') ?? 'application/octet-stream';
      return { bytes: new Uint8Array(await proxyRes.arrayBuffer()), contentType: ct };
    }
  } catch {
    // proxy not available (local dev) — try direct
  }

  // Fallback: direct fetch (works if CORS is open on the bucket)
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const ct = res.headers.get('content-type') ?? 'application/octet-stream';
      return { bytes: new Uint8Array(await res.arrayBuffer()), contentType: ct };
    }
  } catch {
    // CORS blocked — skip this file
  }

  return null;
}

// ── Drawing primitives ────────────────────────────────────────────────────────

function drawRect(page: PDFPage, x: number, y: number, w: number, h: number, color: RGB) {
  page.drawRectangle({ x, y, width: w, height: h, color });
}

function drawHRule(page: PDFPage, y: number, x = MARGIN, width = W - MARGIN * 2, color = rgb(0.86, 0.89, 0.93), thickness = 0.5) {
  page.drawLine({ start: { x, y }, end: { x: x + width, y }, thickness, color });
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color: RGB = BLACK,
) {
  page.drawText(String(text), { x, y, size, font, color });
}

/** Draw a 2-column grid of label: value pairs. Returns the y after the last row. */
function drawGrid(
  page: PDFPage,
  items: Array<{ label: string; value: string }>,
  startY: number,
  fonts: Fonts,
): number {
  const rowH  = 18;
  const labelSize = 7.5;
  const valueSize = 9;
  let y = startY;

  for (let i = 0; i < items.length; i += 2) {
    const left  = items[i];
    const right = items[i + 1];

    // left column
    drawText(page, left.label.toUpperCase(), MARGIN, y, fonts.bold, labelSize, SLATE_LT);
    drawText(page, left.value, MARGIN, y - 11, fonts.regular, valueSize, SLATE);

    // right column (if exists)
    if (right) {
      drawText(page, right.label.toUpperCase(), COL_MID, y, fonts.bold, labelSize, SLATE_LT);
      drawText(page, right.value, COL_MID, y - 11, fonts.regular, valueSize, SLATE);
    }

    y -= rowH + 8;
  }

  return y;
}

// ── Header ────────────────────────────────────────────────────────────────────

function drawHeader(page: PDFPage, fonts: Fonts, generatedAt: string) {
  // Gradient simulation: two rectangles
  drawRect(page, 0, H - 54, W, 54, TEAL);
  drawRect(page, 0, H - 54, W * 0.45, 54, TEAL_DARK);

  // Brand name
  drawText(page, 'StudyGlobal', MARGIN, H - 24, fonts.bold, 20, WHITE);
  drawText(page, 'Admissions & Education Consultancy', MARGIN, H - 40, fonts.regular, 8.5, rgb(0.82, 0.96, 0.94));

  // Right side
  const dateLabel = `Generated: ${generatedAt}`;
  const dateWidth = fonts.regular.widthOfTextAtSize(dateLabel, 8);
  drawText(page, dateLabel, W - MARGIN - dateWidth, H - 24, fonts.regular, 8, WHITE);
  drawText(page, 'Student Profile Report', W - MARGIN - fonts.bold.widthOfTextAtSize('Student Profile Report', 9.5), H - 38, fonts.bold, 9.5, rgb(0.82, 0.96, 0.94));
}

// ── Section heading ───────────────────────────────────────────────────────────

function drawSectionHeading(page: PDFPage, title: string, y: number, fonts: Fonts): number {
  drawRect(page, MARGIN, y - 3, W - MARGIN * 2, 20, ACCENT);
  drawRect(page, MARGIN, y - 3, 3, 20, TEAL);
  drawText(page, title.toUpperCase(), MARGIN + 10, y + 3, fonts.bold, 8.5, TEAL_DARK);
  return y - 28;
}

// ── Main PDF builder ──────────────────────────────────────────────────────────

export async function generateStudentPdf(
  student: StudentProfile,
  documents: StudentDoc[],
  applications: Application[],
  token: string,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`${student.name ?? 'Student'} – StudyGlobal Report`);
  pdfDoc.setAuthor('StudyGlobal Admissions');
  pdfDoc.setCreator('StudyGlobal CMS');

  const [regularFont, boldFont, italicFont] = await Promise.all([
    pdfDoc.embedFont(StandardFonts.Helvetica),
    pdfDoc.embedFont(StandardFonts.HelveticaBold),
    pdfDoc.embedFont(StandardFonts.HelveticaOblique),
  ]);
  const fonts: Fonts = { regular: regularFont, bold: boldFont, italic: italicFont };

  const generatedAt = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date());

  // ── Fetch student photo ──────────────────────────────────────────────────
  let photoImage: Awaited<ReturnType<typeof pdfDoc.embedJpg>> | null = null;
  const photoUrl = student.profile_picture_url;
  if (photoUrl && !photoUrl.startsWith('data:')) {
    const result = await fetchFileBytes(photoUrl, token);
    if (result) {
      try {
        const ct = result.contentType.toLowerCase();
        if (ct.includes('png')) {
          photoImage = await pdfDoc.embedPng(result.bytes);
        } else {
          photoImage = await pdfDoc.embedJpg(result.bytes);
        }
      } catch {
        photoImage = null;
      }
    }
  }

  // ── PAGE 1: Student detail report ─────────────────────────────────────────
  const page1 = pdfDoc.addPage([W, H]);
  drawHeader(page1, fonts, generatedAt);

  let curY = H - 70;

  // ── Student identity block ─────────────────────────────────────────────────
  const photoSize = 80;
  const photoX    = MARGIN;
  const photoY    = curY - photoSize;

  if (photoImage) {
    // Photo border
    page1.drawRectangle({ x: photoX - 2, y: photoY - 2, width: photoSize + 4, height: photoSize + 4, color: TEAL, borderWidth: 0 });
    page1.drawImage(photoImage, { x: photoX, y: photoY, width: photoSize, height: photoSize });
  } else {
    // Placeholder avatar
    page1.drawRectangle({ x: photoX, y: photoY, width: photoSize, height: photoSize, color: ACCENT });
    const initials = (student.name ?? 'S').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
    const initW = boldFont.widthOfTextAtSize(initials, 28);
    drawText(page1, initials, photoX + (photoSize - initW) / 2, photoY + (photoSize / 2) - 10, boldFont, 28, TEAL_DARK);
  }

  // Name, email, meta next to the photo
  const nameX = photoX + photoSize + 16;
  drawText(page1, val(student.name, 'Unknown Student'), nameX, curY - 18, boldFont, 18, SLATE);
  drawText(page1, val(student.email), nameX, curY - 35, regularFont, 9.5, SLATE_LT);
  drawText(page1, val(student.phone), nameX, curY - 49, regularFont, 9.5, SLATE_LT);

  const roleLabel = [student.role, `${student.profile_completion ?? 0}% complete`].filter(Boolean).join('  •  ');
  drawText(page1, roleLabel, nameX, curY - 62, italicFont, 8.5, TEAL_DARK);

  // Completion bar
  const barX = nameX;
  const barY = curY - 76;
  const barW = W - MARGIN - nameX;
  const barH = 6;
  page1.drawRectangle({ x: barX, y: barY, width: barW, height: barH, color: rgb(0.88, 0.91, 0.95) });
  const fillW = barW * Math.min((student.profile_completion ?? 0) / 100, 1);
  if (fillW > 0) page1.drawRectangle({ x: barX, y: barY, width: fillW, height: barH, color: TEAL });

  curY = photoY - 16;
  drawHRule(page1, curY);
  curY -= 14;

  // ── Personal Information ───────────────────────────────────────────────────
  curY = drawSectionHeading(page1, 'Personal Information', curY, fonts);

  const personalFields = [
    { label: 'Nationality',  value: val(student.nationality) },
    { label: 'Phone',        value: val(student.phone) },
    { label: 'Email',        value: val(student.email) },
    { label: 'Member Since', value: formatDate(student.created_at) },
  ];
  curY = drawGrid(page1, personalFields, curY, fonts);

  curY -= 4;
  drawHRule(page1, curY);
  curY -= 14;

  // ── Academic Preferences ──────────────────────────────────────────────────
  curY = drawSectionHeading(page1, 'Academic Preferences', curY, fonts);

  const academicFields = [
    { label: 'Preferred Country',  value: val(student.preferred_country) },
    { label: 'Study Level',        value: val(student.study_level) },
    { label: 'Preferred Subject',  value: val(student.preferred_subject) },
    { label: 'Intake',             value: formatIntake(student) },
    { label: 'Budget',             value: formatBudget(student.budget_min, student.budget_max) },
    { label: 'Profile Completion', value: `${student.profile_completion ?? 0}%` },
  ];
  curY = drawGrid(page1, academicFields, curY, fonts);

  curY -= 4;
  drawHRule(page1, curY);
  curY -= 14;

  // ── Applications ───────────────────────────────────────────────────────────
  curY = drawSectionHeading(page1, `Applications (${applications.length})`, curY, fonts);

  if (!applications.length) {
    drawText(page1, 'No applications on record.', MARGIN, curY, italicFont, 9, SLATE_LT);
    curY -= 18;
  } else {
    for (const app of applications) {
      const progName = app.programs?.name ?? 'Program';
      const uniName  = app.programs?.universities?.name ?? 'University';
      const country  = app.programs?.universities?.country ? ` (${app.programs.universities.country})` : '';
      const line1    = `${progName} — ${uniName}${country}`;
      const line2    = `Status: ${labelStatus(app.status)}   |   Intake: ${val(app.intake)}   |   Date: ${formatDate(app.created_at)}`;

      drawText(page1, line1, MARGIN + 8, curY, boldFont, 9, SLATE);
      curY -= 13;
      drawText(page1, line2, MARGIN + 8, curY, regularFont, 8, SLATE_LT);
      curY -= 16;

      if (curY < MARGIN + 60) break; // don't overflow the page
    }
  }

  curY -= 4;
  drawHRule(page1, curY);
  curY -= 14;

  // ── Documents Inventory ────────────────────────────────────────────────────
  curY = drawSectionHeading(page1, `Documents (${documents.length})`, curY, fonts);

  if (!documents.length) {
    drawText(page1, 'No documents uploaded.', MARGIN, curY, italicFont, 9, SLATE_LT);
    curY -= 18;
  } else {
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const type   = val(doc.document_type, 'Document').replace(/_/g, ' ');
      const name   = val(doc.file_name);
      const status = labelStatus(doc.status ?? 'pending');
      const line   = `${i + 1}. ${type}  —  ${name}  [${status}]`;

      drawText(page1, line, MARGIN + 8, curY, regularFont, 8.5, SLATE);
      curY -= 15;
      if (curY < MARGIN + 30) {
        drawText(page1, `… and ${documents.length - i - 1} more (see following pages)`, MARGIN + 8, curY, italicFont, 8, SLATE_LT);
        break;
      }
    }
  }

  // Footer
  drawHRule(page1, MARGIN - 4);
  drawText(page1, 'StudyGlobal Admissions & Education Consultancy  •  Confidential', MARGIN, MARGIN - 16, italicFont, 7.5, SLATE_LT);
  drawText(page1, 'Page 1', W - MARGIN - regularFont.widthOfTextAtSize('Page 1', 7.5), MARGIN - 16, regularFont, 7.5, SLATE_LT);

  // ── Pages 2+: Embed each document ─────────────────────────────────────────
  let totalPages = 1;

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const fileUrl = doc.file_url || doc.file_path;
    if (!fileUrl) {
      addDocumentPlaceholderPage(pdfDoc, doc, i + 1, fonts, ++totalPages);
      continue;
    }

    const result = await fetchFileBytes(fileUrl, token);

    if (!result) {
      addDocumentPlaceholderPage(pdfDoc, doc, i + 1, fonts, ++totalPages);
      continue;
    }

    const ct = result.contentType.toLowerCase();

    if (ct.includes('pdf')) {
      // Merge PDF pages
      try {
        const srcDoc = await PDFDocument.load(result.bytes, { ignoreEncryption: true });
        const srcPageCount = srcDoc.getPageCount();
        const copiedPages = await pdfDoc.copyPages(srcDoc, Array.from({ length: srcPageCount }, (_, k) => k));

        // Cover page for this document
        const coverPage = pdfDoc.addPage([W, H]);
        ++totalPages;
        drawDocumentCoverPage(coverPage, doc, i + 1, fonts, totalPages, 'PDF Document');

        for (const cp of copiedPages) {
          pdfDoc.addPage(cp);
          ++totalPages;
        }
      } catch {
        addDocumentPlaceholderPage(pdfDoc, doc, i + 1, fonts, ++totalPages);
      }
    } else if (ct.includes('image')) {
      // Embed image
      try {
        let img;
        if (ct.includes('png')) {
          img = await pdfDoc.embedPng(result.bytes);
        } else {
          img = await pdfDoc.embedJpg(result.bytes);
        }

        const imgPage = pdfDoc.addPage([W, H]);
        ++totalPages;
        drawDocumentCoverPage(imgPage, doc, i + 1, fonts, totalPages, 'Image');

        // Draw image centered below the header
        const maxW = W - MARGIN * 2;
        const maxH = H - 200;
        const dims = img.scaleToFit(maxW, maxH);
        const imgX = (W - dims.width) / 2;
        const imgY = (H - 160 - dims.height) / 2;
        imgPage.drawImage(img, { x: imgX, y: Math.max(imgY, MARGIN), width: dims.width, height: dims.height });
      } catch {
        addDocumentPlaceholderPage(pdfDoc, doc, i + 1, fonts, ++totalPages);
      }
    } else {
      addDocumentPlaceholderPage(pdfDoc, doc, i + 1, fonts, ++totalPages);
    }
  }

  return pdfDoc.save();
}

// ── Document cover / placeholder pages ────────────────────────────────────────

function drawDocumentCoverPage(
  page: PDFPage,
  doc: StudentDoc,
  index: number,
  fonts: Fonts,
  pageNum: number,
  typeLabel: string,
) {
  drawRect(page, 0, H - 54, W, 54, TEAL);
  drawRect(page, 0, H - 54, W * 0.45, 54, TEAL_DARK);
  drawText(page, 'StudyGlobal', MARGIN, H - 24, fonts.bold, 20, WHITE);
  drawText(page, 'Admissions & Education Consultancy', MARGIN, H - 40, fonts.regular, 8.5, rgb(0.82, 0.96, 0.94));

  const pageLabel = `Page ${pageNum}`;
  drawText(page, pageLabel, W - MARGIN - fonts.regular.widthOfTextAtSize(pageLabel, 8), H - 24, fonts.regular, 8, WHITE);

  const type  = val(doc.document_type, 'Document').replace(/_/g, ' ');
  const name  = val(doc.file_name);
  const status = labelStatus(doc.status ?? 'pending');

  drawText(page, `Document ${index}: ${type}`, MARGIN, H - 80, fonts.bold, 14, SLATE);
  drawText(page, name, MARGIN, H - 98, fonts.regular, 10, SLATE_LT);
  drawText(page, `Status: ${status}   |   Type: ${typeLabel}   |   Uploaded: ${formatDate(doc.created_at)}`, MARGIN, H - 114, fonts.italic, 8.5, TEAL_DARK);

  drawRect(page, MARGIN - 1, H - 120, W - MARGIN * 2 + 2, 0.5, TEAL);
}

function addDocumentPlaceholderPage(
  pdfDoc: PDFDocument,
  doc: StudentDoc,
  index: number,
  fonts: Fonts,
  pageNum: number,
) {
  const page = pdfDoc.addPage([W, H]);
  drawDocumentCoverPage(page, doc, index, fonts, pageNum, 'Not available');

  const cx = W / 2;
  const cy = H / 2;
  page.drawRectangle({ x: cx - 120, y: cy - 40, width: 240, height: 80, color: ACCENT });
  const msg = 'File unavailable for embedding';
  const msgW = fonts.italic.widthOfTextAtSize(msg, 10);
  drawText(page, msg, cx - msgW / 2, cy + 8, fonts.italic, 10, SLATE_LT);
  const sub = 'The file may not be accessible or the format is unsupported.';
  const subW = fonts.regular.widthOfTextAtSize(sub, 8);
  drawText(page, sub, cx - subW / 2, cy - 8, fonts.regular, 8, SLATE_LT);
}
