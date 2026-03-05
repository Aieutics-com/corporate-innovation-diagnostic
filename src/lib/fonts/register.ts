import { jsPDF } from "jspdf";
import { Almarai_Regular_BASE64 } from "./Almarai-Regular";
import { Almarai_Bold_BASE64 } from "./Almarai-Bold";
import { LibreBaskerville_Regular_BASE64 } from "./LibreBaskerville-Regular";
import { LibreBaskerville_Bold_BASE64 } from "./LibreBaskerville-Bold";
import { LibreBaskerville_Italic_BASE64 } from "./LibreBaskerville-Italic";

export function registerBrandFonts(doc: jsPDF) {
  doc.addFileToVFS("Almarai-Regular.ttf", Almarai_Regular_BASE64);
  doc.addFont("Almarai-Regular.ttf", "Almarai", "normal");

  doc.addFileToVFS("Almarai-Bold.ttf", Almarai_Bold_BASE64);
  doc.addFont("Almarai-Bold.ttf", "Almarai", "bold");

  doc.addFileToVFS("LibreBaskerville-Regular.ttf", LibreBaskerville_Regular_BASE64);
  doc.addFont("LibreBaskerville-Regular.ttf", "LibreBaskerville", "normal");

  doc.addFileToVFS("LibreBaskerville-Bold.ttf", LibreBaskerville_Bold_BASE64);
  doc.addFont("LibreBaskerville-Bold.ttf", "LibreBaskerville", "bold");

  doc.addFileToVFS("LibreBaskerville-Italic.ttf", LibreBaskerville_Italic_BASE64);
  doc.addFont("LibreBaskerville-Italic.ttf", "LibreBaskerville", "italic");
}
