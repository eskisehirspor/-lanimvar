/**
 * Turkish case mapping. NEVER use String#toUpperCase / textTransform for UI
 * text: i→I is wrong in Turkish (must be i→İ, ı→I). Engines differ in locale
 * support, so the mapping is explicit.
 */
export function trUpper(input: string): string {
  return input.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
}

export function trLower(input: string): string {
  return input.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
}

export function trCapitalize(input: string): string {
  return input ? trUpper(input.charAt(0)) + input.slice(1) : input;
}
