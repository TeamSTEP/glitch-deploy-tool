export const addNumbers = (...numbers: number[]) => {
    return numbers.reduce((a, b) => a + b);
};
