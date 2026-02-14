export function extractPsaGradeAndCert(title: string): { psaGrade?: string; psaCert?: string } {
  const t = title.toUpperCase();

  // Grade: "PSA 10", "PSA10", "PSA GEM MINT 10"
  const gradeMatch =
    t.match(/\bPSA\s*([0-9](?:\.[0-9])?|10)\b/) ||
    t.match(/\bPSA\s*(GEM\s*MINT\s*)?(10)\b/);
  const psaGrade = gradeMatch ? (gradeMatch[1] === "GEM MINT " ? "10" : gradeMatch[1] ?? gradeMatch[2]) : undefined;

  // Cert: many listings use "Cert", "Cert#", "Cert No", or just a 7–10 digit number near PSA
  const certMatch =
    t.match(/\bCERT\s*(#|NO\.?|NUMBER)?\s*[:#-]?\s*([0-9]{6,12})\b/) ||
    t.match(/\bPSA\s*CERT\s*[:#-]?\s*([0-9]{6,12})\b/);
  const psaCert = certMatch ? (certMatch[2] ?? certMatch[1]) : undefined;

  return { psaGrade, psaCert };
}
