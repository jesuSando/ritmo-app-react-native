export function formatCurrency(amount: number, currency: string): string {
    const formatter = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: currency === 'USD' ? 'USD' : 'CLP',
        minimumFractionDigits: currency === 'USD' ? 2 : 0,
    });

    return formatter.format(amount);
}

export function formatDate(date: string): string {
    const d = parseLocalDate(date);
    return d.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatTime(time: string): string {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function parseLocalDate(date: string) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
}