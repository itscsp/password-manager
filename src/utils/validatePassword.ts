const validatePassword = (password: string, confirmPassword?: string): string | null => {
    const minLength = 8;
    const maxLength = 64;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasSpaces = /\s/.test(password);

    if (password.length < minLength) {
        return `For a stronger password, consider using at least ${minLength} characters.`;
    }

    if (password.length > maxLength) {
        return `You might want to keep your password under ${maxLength} characters for better security.`;
    }

    if (!hasUpperCase) {
        return `Including at least one uppercase letter can make your password more secure.`;
    }

    if (!hasLowerCase) {
        return `Adding a lowercase letter can enhance the strength of your password.`;
    }

    if (!hasNumbers) {
        return `Consider including at least one number for a stronger password.`;
    }

    if (!hasSpecialChar) {
        return `A special character (e.g., !@#$%^&*) can improve your password's security.`;
    }

    if (hasSpaces) {
        return `Avoid using spaces in your password for better security.`;
    }

    if (confirmPassword && password !== confirmPassword) {
        return `Make sure both passwords match for confirmation.`;
    }

    return null; // No suggestions
};

export default validatePassword;
