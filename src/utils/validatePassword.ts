const validatePassword = (password: string, confirmPassword?: string): string | null => {
    const minLength = 8;
    const maxLength = 64;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasSpaces = /\s/.test(password);

    if (password.length < minLength) {
        return `Password must be at least ${minLength} characters long.`;
    }
    
    if (password.length > maxLength) {
        return `Password cannot exceed ${maxLength} characters.`;
    }

    if (!hasUpperCase) {
        return "Password must contain at least one uppercase letter.";
    }

    if (!hasLowerCase) {
        return "Password must contain at least one lowercase letter.";
    }

    if (!hasNumbers) {
        return "Password must contain at least one number.";
    }

    if (!hasSpecialChar) {
        return "Password must contain at least one special character (e.g., !@#$%^&*).";
    }

    if (hasSpaces) {
        return "Password cannot contain spaces.";
    }

    if (confirmPassword && password !== confirmPassword) {
        return "Passwords do not match.";
    }

    return null; // No errors
};

export default validatePassword