const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const CODE_LENGTH = 6;

export function generateCode() {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    const index = Math.floor(Math.random() * CHARS.length);
    code += CHARS[index];
  }
  return code;
}
