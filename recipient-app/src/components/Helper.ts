export function subtractHours(date: Date, hours: number) {
    date.setHours(date.getUTCHours() - hours);
    return date;
}