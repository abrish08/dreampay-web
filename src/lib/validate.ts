// Simple checks for sign-up fields (the API checks again).
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) && v.trim().length <= 254;

/** Ethiopian mobile: 09…, 07…, +2519…, +2517… (spaces allowed). */
export const isEthiopianPhone = (v: string) => /^(?:\+251|251|0)?[79]\d{8}$/.test(v.replace(/[\s-]/g, ""));

export const isName = (v: string) => v.trim().length >= 2 && v.trim().length <= 100;
