const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254; // RFC 5321 limit

/**
 * Validates and sanitizes the signup request body.
 * Returns `{ errors, sanitized }` — `errors` is null when valid.
 */
function validateSignupInput({ name, email, password }) {
  const errors = [];

  // Name
  const trimmedName = (name || "").trim();
  if (!trimmedName) {
    errors.push("Name is required");
  } else if (trimmedName.length > MAX_NAME_LENGTH) {
    errors.push(`Name must be ${MAX_NAME_LENGTH} characters or fewer`);
  }

  // Email
  const trimmedEmail = (email || "").trim().toLowerCase();
  if (!trimmedEmail) {
    errors.push("Email is required");
  } else if (trimmedEmail.length > MAX_EMAIL_LENGTH) {
    errors.push("Email address is too long");
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.push("Please enter a valid email address");
  }

  // Password
  if (!password) {
    errors.push("Password is required");
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (errors.length > 0) {
    return { errors, sanitized: null };
  }

  return {
    errors: null,
    sanitized: { name: trimmedName, email: trimmedEmail, password },
  };
}

/**
 * Validates and sanitizes the login request body.
 * Returns `{ errors, sanitized }`.
 */
function validateLoginInput({ email, password }) {
  const errors = [];

  const trimmedEmail = (email || "").trim().toLowerCase();
  if (!trimmedEmail) {
    errors.push("Email is required");
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.push("Please enter a valid email address");
  }

  if (!password) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return { errors, sanitized: null };
  }

  return {
    errors: null,
    sanitized: { email: trimmedEmail, password },
  };
}

module.exports = { validateSignupInput, validateLoginInput };
