export function formatCurrency(amount: number, currency: string): string {
    const formatter = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: currency === 'USD' ? 'USD' : 'CLP',
        minimumFractionDigits: currency === 'USD' ? 2 : 0,
    });

    return formatter.format(amount);
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CL', {
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