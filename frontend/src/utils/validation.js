export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  if (password.length < 6) return 'Password minimal 6 karakter';
  if (!/[a-z]/.test(password)) return 'Password harus mengandung huruf kecil';
  if (!/[A-Z]/.test(password)) return 'Password harus mengandung huruf besar';
  if (!/[0-9]/.test(password)) return 'Password harus mengandung angka';
  return null;
};

export const validateUsername = (username) => {
  if (username.length < 3) return 'Username minimal 3 karakter';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username hanya boleh huruf, angka, dan underscore';
  }
  return null;
};