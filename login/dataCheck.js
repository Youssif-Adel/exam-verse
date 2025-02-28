//validate email, password, name

//validate email using regex
export function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}
//validate pass length
export function isValidPassword(password) {
  const minLength = 8;
  return password.length >= minLength;
}
//check if contains any letters
export function isValidName(name) {
  return Boolean(name);
}
